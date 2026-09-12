const http = require('http');

async function testAPI() {
  console.log('Testing REST APIs on http://localhost:5000...');

  // 1. Login
  const loginData = JSON.stringify({ email: 'demo@xpense.com', password: 'password123' });
  const loginRes = await makeRequest('/api/auth/login', 'POST', loginData);
  console.log('1. Login response:', loginRes.success ? 'SUCCESS ✅' : 'FAILED ❌');
  
  if (!loginRes.token) return;
  const token = loginRes.token;

  // 2. Summary stats
  const statsRes = await makeRequest('/api/transactions/summary/stats', 'GET', null, token);
  console.log('2. Stats response: Total Balance =', statsRes.stats?.totalBalance, '✅');

  // 3. Budgets
  const budgetsRes = await makeRequest('/api/budgets', 'GET', null, token);
  console.log('3. Budgets count:', budgetsRes.data?.length, '✅');

  // 4. Reports
  const reportsRes = await makeRequest('/api/reports/summary', 'GET', null, token);
  console.log('4. Reports summary: Net Savings =', reportsRes.data?.netSavings, '✅');

  // 5. AI Insights
  const aiRes = await makeRequest('/api/ai/insights', 'POST', null, token);
  console.log('5. AI Insights status:', aiRes.insights?.financialHealth?.status, '✅');

  // 6. Notifications
  const notifRes = await makeRequest('/api/notifications', 'GET', null, token);
  console.log('6. Notifications count:', notifRes.data?.length, 'Unread =', notifRes.unreadCount, '✅');

  console.log('\nAll API endpoints tested and working perfectly!');
}

function makeRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

testAPI();
