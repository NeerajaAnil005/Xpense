const http = require('http');

const BASE_HOST = 'localhost';
const BASE_PORT = 5000;

let testToken = '';
let createdTxId = null;
let createdBudgetId = null;
let testNotificationId = null;

const results = [];

function recordResult(endpoint, method, status, expectedStatus, details = '') {
  const passed = status === expectedStatus;
  results.push({
    endpoint,
    method,
    status,
    expectedStatus,
    passed,
    details
  });
  console.log(`${passed ? '✅ PASSED' : '❌ FAILED'} [${method}] ${endpoint} (HTTP ${status}) ${details ? '- ' + details : ''}`);
}

function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(responseData);
        } catch (e) {
          parsed = { raw: responseData };
        }
        resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      resolve({ statusCode: 500, error: err.message });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

async function runFullTestSuite() {
  console.log('===========================================================');
  console.log('  STARTING COMPLETE END-TO-END BACKEND API AUDIT SUITE');
  console.log('===========================================================\n');

  // --- 1. AUTH MODULE ---
  console.log('--- 1. Testing Authentication Endpoints ---');
  
  // Register Test User
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const regRes = await request('/api/auth/register', 'POST', {
    name: 'Test Audit User',
    email: uniqueEmail,
    password: 'password123',
    confirmPassword: 'password123'
  });
  recordResult('/api/auth/register', 'POST', regRes.statusCode, 201, regRes.data?.message || '');
  if (regRes.data?.token) testToken = regRes.data.token;

  // Login Test User
  const loginRes = await request('/api/auth/login', 'POST', {
    email: uniqueEmail,
    password: 'password123'
  });
  recordResult('/api/auth/login', 'POST', loginRes.statusCode, 200, 'User logged in successfully');
  if (loginRes.data?.token) testToken = loginRes.data.token;

  // GET Profile /me
  const meRes = await request('/api/auth/me', 'GET', null, testToken);
  recordResult('/api/auth/me', 'GET', meRes.statusCode, 200, `User: ${meRes.data?.user?.email}`);

  // PUT Update Profile
  const profRes = await request('/api/auth/profile', 'PUT', {
    name: 'Updated Audit User',
    currency: 'INR',
    theme: 'dark'
  }, testToken);
  recordResult('/api/auth/profile', 'PUT', profRes.statusCode, 200, 'Profile updated');

  // --- 2. TRANSACTIONS MODULE ---
  console.log('\n--- 2. Testing Transaction Endpoints ---');

  // Create Income Transaction
  const incRes = await request('/api/transactions', 'POST', {
    type: 'income',
    amount: 50000,
    category: 'Salary',
    description: 'Monthly Salary Pay',
    payment_method: 'Bank Transfer',
    transaction_date: '2026-09-01'
  }, testToken);
  recordResult('/api/transactions (Income)', 'POST', incRes.statusCode, 201, `ID: ${incRes.data?.data?.id}`);

  // Create Expense Transaction
  const expRes = await request('/api/transactions', 'POST', {
    type: 'expense',
    amount: 4500,
    category: 'Food',
    description: 'Weekly Supermarket Shopping',
    payment_method: 'UPI',
    transaction_date: '2026-09-05'
  }, testToken);
  recordResult('/api/transactions (Expense)', 'POST', expRes.statusCode, 201, `ID: ${expRes.data?.data?.id}`);
  if (expRes.data?.data?.id) createdTxId = expRes.data.data.id;

  // GET Transactions List with Filters
  const listRes = await request('/api/transactions?type=expense&category=Food&paymentMethod=All', 'GET', null, testToken);
  recordResult('/api/transactions (Filtered)', 'GET', listRes.statusCode, 200, `Total Items: ${listRes.data?.data?.length}`);

  // GET Summary Stats
  const statsRes = await request('/api/transactions/summary/stats', 'GET', null, testToken);
  recordResult('/api/transactions/summary/stats', 'GET', statsRes.statusCode, 200, `Balance: ${statsRes.data?.stats?.totalBalance}`);

  // GET Transaction By ID
  if (createdTxId) {
    const txById = await request(`/api/transactions/${createdTxId}`, 'GET', null, testToken);
    recordResult(`/api/transactions/${createdTxId}`, 'GET', txById.statusCode, 200, `Found: ${txById.data?.data?.description}`);

    // PUT Update Transaction
    const txUpdate = await request(`/api/transactions/${createdTxId}`, 'PUT', {
      amount: 4800,
      description: 'Weekly Supermarket Shopping (Updated)'
    }, testToken);
    recordResult(`/api/transactions/${createdTxId}`, 'PUT', txUpdate.statusCode, 200, 'Transaction updated');
  }

  // GET Export CSV
  const csvRes = await request('/api/transactions/export/csv', 'GET', null, testToken);
  recordResult('/api/transactions/export/csv', 'GET', csvRes.statusCode, 200, `Content-Type: ${csvRes.headers['content-type']}`);

  // --- 3. BUDGETS MODULE ---
  console.log('\n--- 3. Testing Budget Endpoints ---');

  // Create Budget Target
  const budgetRes = await request('/api/budgets', 'POST', {
    category: 'Food',
    amount: 5000,
    month: 9,
    year: 2026
  }, testToken);
  recordResult('/api/budgets', 'POST', budgetRes.statusCode, 201, `ID: ${budgetRes.data?.data?.id}`);
  if (budgetRes.data?.data?.id) createdBudgetId = budgetRes.data.data.id;

  // GET Budgets List
  const bListRes = await request('/api/budgets?month=9&year=2026', 'GET', null, testToken);
  recordResult('/api/budgets', 'GET', bListRes.statusCode, 200, `Count: ${bListRes.data?.data?.length}, Usage: ${bListRes.data?.summary?.overallPercentage}%`);

  // PUT Update Budget
  if (createdBudgetId) {
    const bUpdate = await request(`/api/budgets/${createdBudgetId}`, 'PUT', { amount: 5500 }, testToken);
    recordResult(`/api/budgets/${createdBudgetId}`, 'PUT', bUpdate.statusCode, 200, 'Budget updated');
  }

  // --- 4. REPORTS MODULE ---
  console.log('\n--- 4. Testing Reports Endpoints ---');

  const repSum = await request('/api/reports/summary', 'GET', null, testToken);
  recordResult('/api/reports/summary', 'GET', repSum.statusCode, 200, `Net Savings: ${repSum.data?.data?.netSavings}`);

  const repMonth = await request('/api/reports/monthly', 'GET', null, testToken);
  recordResult('/api/reports/monthly', 'GET', repMonth.statusCode, 200, `Months returned: ${repMonth.data?.data?.length}`);

  const repCat = await request('/api/reports/categories', 'GET', null, testToken);
  recordResult('/api/reports/categories', 'GET', repCat.statusCode, 200, `Category groups: ${repCat.data?.data?.length}`);

  const repTrend = await request('/api/reports/trends', 'GET', null, testToken);
  recordResult('/api/reports/trends', 'GET', repTrend.statusCode, 200, `Trend dates: ${repTrend.data?.data?.length}`);

  const repBvsA = await request('/api/reports/budget-vs-actual', 'GET', null, testToken);
  recordResult('/api/reports/budget-vs-actual', 'GET', repBvsA.statusCode, 200, `Comparison items: ${repBvsA.data?.data?.length}`);

  // --- 5. AI MODULE ---
  console.log('\n--- 5. Testing AI Insight Endpoints ---');

  const aiInsights = await request('/api/ai/insights', 'POST', null, testToken);
  recordResult('/api/ai/insights', 'POST', aiInsights.statusCode, 200, `Health: ${aiInsights.data?.insights?.financialHealth?.status}`);

  const aiSummary = await request('/api/ai/monthly-summary', 'POST', null, testToken);
  recordResult('/api/ai/monthly-summary', 'POST', aiSummary.statusCode, 200, `Report status: ${aiSummary.data?.insights?.monthlyReport ? 'Valid' : 'Invalid'}`);

  // --- 6. NOTIFICATIONS MODULE ---
  console.log('\n--- 6. Testing Notifications Endpoints ---');

  const notifList = await request('/api/notifications', 'GET', null, testToken);
  recordResult('/api/notifications', 'GET', notifList.statusCode, 200, `Total: ${notifList.data?.data?.length}, Unread: ${notifList.data?.unreadCount}`);
  if (notifList.data?.data?.length > 0) testNotificationId = notifList.data.data[0].id;

  if (testNotificationId) {
    const markReadRes = await request(`/api/notifications/${testNotificationId}/read`, 'PUT', null, testToken);
    recordResult(`/api/notifications/${testNotificationId}/read`, 'PUT', markReadRes.statusCode, 200, 'Notification marked as read');
  }

  const markAllRes = await request('/api/notifications/read-all', 'PUT', null, testToken);
  recordResult('/api/notifications/read-all', 'PUT', markAllRes.statusCode, 200, 'All notifications marked read');

  // --- CLEANUP TEST DATA ---
  console.log('\n--- 7. Testing Deletion Endpoints ---');
  if (createdTxId) {
    const delTx = await request(`/api/transactions/${createdTxId}`, 'DELETE', null, testToken);
    recordResult(`/api/transactions/${createdTxId}`, 'DELETE', delTx.statusCode, 200, 'Transaction deleted');
  }

  if (createdBudgetId) {
    const delB = await request(`/api/budgets/${createdBudgetId}`, 'DELETE', null, testToken);
    recordResult(`/api/budgets/${createdBudgetId}`, 'DELETE', delB.statusCode, 200, 'Budget deleted');
  }

  const clearNotif = await request('/api/notifications/clear-all', 'DELETE', null, testToken);
  recordResult('/api/notifications/clear-all', 'DELETE', clearNotif.statusCode, 200, 'Notifications cleared');

  // --- AUDIT SUMMARY ---
  console.log('\n===========================================================');
  console.log('                  FINAL AUDIT RESULTS SUMMARY');
  console.log('===========================================================');
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed);

  console.log(`Total Endpoints Tested : ${totalTests}`);
  console.log(`Passed                 : ${passedTests}`);
  console.log(`Failed                 : ${failedTests.length}`);

  if (failedTests.length > 0) {
    console.log('\n❌ FAILING ENDPOINTS:');
    failedTests.forEach(f => console.log(` - [${f.method}] ${f.endpoint} (HTTP ${f.status}, Expected: ${f.expectedStatus})`));
  } else {
    console.log('\n🎉 ALL BACKEND API ENDPOINTS PASSED WITH 100% SUCCESS!');
  }
}

runFullTestSuite();
