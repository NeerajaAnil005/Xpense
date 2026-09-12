const bcrypt = require('bcryptjs');
const { initDb, getDb } = require('./db');

async function seedData() {
  console.log('Seeding demo data...');
  await initDb();
  const db = await getDb();

  // 1. Create or get demo user
  const email = 'demo@xpense.com';
  let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const res = await db.run(
      `INSERT INTO users (name, email, password_hash, currency, theme) VALUES (?, ?, ?, ?, ?)`,
      ['Alex Morgan', email, passwordHash, 'INR', 'light']
    );
    user = await db.get('SELECT * FROM users WHERE id = ?', [res.lastID]);
    console.log(`Created demo user: ${email} (Password: password123)`);
  } else {
    console.log(`Demo user already exists: ${email}`);
  }

  const userId = user.id;

  // Clear existing transactions, budgets, notifications for seed user to ensure clean state
  await db.run('DELETE FROM transactions WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM budgets WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM notifications WHERE user_id = ?', [userId]);

  // Current dates setup
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = String(month).padStart(2, '0');

  // Helper date function
  const getDateStr = (day) => `${year}-${monthStr}-${String(day).padStart(2, '0')}`;

  // 2. Add realistic Income transactions
  const incomes = [
    { type: 'income', amount: 40000, category: 'Salary', description: 'Monthly Tech Corp Salary', payment_method: 'Bank Transfer', date: getDateStr(1) },
    { type: 'income', amount: 5000, category: 'Freelance', description: 'Web Design Project Client Pay', payment_method: 'UPI', date: getDateStr(10) },
    { type: 'income', amount: 2500, category: 'Scholarship', description: 'Academic Excellence Grant', payment_method: 'Bank Transfer', date: getDateStr(15) }
  ];

  // 3. Add realistic Expense transactions
  const expenses = [
    { type: 'expense', amount: 4500, category: 'Food', description: 'Weekly Groceries & Dining', payment_method: 'UPI', date: getDateStr(3) },
    { type: 'expense', amount: 2000, category: 'Transport', description: 'Fuel & Metro Pass', payment_method: 'Debit Card', date: getDateStr(5) },
    { type: 'expense', amount: 3200, category: 'Shopping', description: 'Clothing & Accessories', payment_method: 'Credit Card', date: getDateStr(8) },
    { type: 'expense', amount: 2500, category: 'Bills', description: 'Electricity & High-Speed Internet', payment_method: 'UPI', date: getDateStr(12) },
    { type: 'expense', amount: 1500, category: 'Entertainment', description: 'Movie Tickets & Streaming Services', payment_method: 'Credit Card', date: getDateStr(14) },
    { type: 'expense', amount: 2000, category: 'Education', description: 'Online Course Certification', payment_method: 'Credit Card', date: getDateStr(18) },
    { type: 'expense', amount: 1200, category: 'Healthcare', description: 'Pharmacy & Monthly Checkup', payment_method: 'Cash', date: getDateStr(20) },
    { type: 'expense', amount: 1800, category: 'Food', description: 'Restaurant Dinner with Friends', payment_method: 'UPI', date: getDateStr(22) }
  ];

  for (const t of [...incomes, ...expenses]) {
    await db.run(
      `INSERT INTO transactions (user_id, type, amount, category, description, payment_method, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, t.type, t.amount, t.category, t.description, t.payment_method, t.date]
    );
  }

  // 4. Add Budgets for current month
  const budgets = [
    { category: 'Food', amount: 7000 },
    { category: 'Shopping', amount: 4000 },
    { category: 'Transport', amount: 3000 },
    { category: 'Bills', amount: 3000 },
    { category: 'Entertainment', amount: 2000 },
    { category: 'Healthcare', amount: 2000 }
  ];

  for (const b of budgets) {
    await db.run(
      `INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)`,
      [userId, b.category, b.amount, month, year]
    );
  }

  // 5. Add initial Notifications
  const notifications = [
    { title: 'Welcome to Xpense AI', message: 'Your financial tracking dashboard is fully ready.', type: 'system', is_read: 1 },
    { title: '🔔 Budget Alert: Shopping', message: 'Shopping budget has reached 80% usage (₹3,200 / ₹4,000).', type: 'budget_warning', is_read: 0 },
    { title: '✨ AI Insight Generated', message: 'Your monthly AI Spending Insights report is available.', type: 'ai', is_read: 0 }
  ];

  for (const n of notifications) {
    await db.run(
      `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)`,
      [userId, n.title, n.message, n.type, n.is_read]
    );
  }

  console.log('Seed data inserted successfully!');
}

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seedData;
