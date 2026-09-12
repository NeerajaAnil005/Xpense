const { getDb } = require('../database/db');

/**
 * Checks budget utilization for a given user, category, and date,
 * creating notification alerts if spending reaches 80%, 90%, or 100%+.
 */
async function checkBudgetAlerts(userId, category, dateString) {
  try {
    const db = await getDb();
    const dateObj = new Date(dateString);
    const month = dateObj.getMonth() + 1; // 1-12
    const year = dateObj.getFullYear();

    // Fetch budget for this user, category, month, year
    const budget = await db.get(
      `SELECT * FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?`,
      [userId, category, month, year]
    );

    if (!budget) return;

    // Calculate total spent in this category for this month
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const startDate = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`;

    const spentResult = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total_spent 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND category = ? AND transaction_date BETWEEN ? AND ?`,
      [userId, category, startDate, endDate]
    );

    const spent = spentResult ? spentResult.total_spent : 0;
    const percentage = Math.round((spent / budget.amount) * 100);

    let alertType = null;
    let title = '';
    let message = '';

    if (percentage >= 100) {
      alertType = 'budget_exceeded';
      title = `🚨 Budget Exceeded: ${category}`;
      message = `You have spent ₹${spent.toLocaleString('en-IN')} on ${category}, exceeding your limit of ₹${budget.amount.toLocaleString('en-IN')} (${percentage}% used).`;
    } else if (percentage >= 90) {
      alertType = 'budget_warning';
      title = `⚠️ High Budget Usage: ${category}`;
      message = `You have reached ${percentage}% of your ${category} budget (₹${spent.toLocaleString('en-IN')} / ₹${budget.amount.toLocaleString('en-IN')}).`;
    } else if (percentage >= 80) {
      alertType = 'budget_warning';
      title = `🔔 Budget Alert: ${category}`;
      message = `You have used ${percentage}% of your ${category} budget (₹${spent.toLocaleString('en-IN')} / ₹${budget.amount.toLocaleString('en-IN')}).`;
    }

    if (alertType) {
      // Check if similar notification was already created today to avoid spam
      const today = new Date().toISOString().split('T')[0];
      const existing = await db.get(
        `SELECT id FROM notifications 
         WHERE user_id = ? AND title = ? AND DATE(created_at) = ?`,
        [userId, title, today]
      );

      if (!existing) {
        await db.run(
          `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
          [userId, title, message, alertType]
        );
      }
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
}

module.exports = {
  checkBudgetAlerts
};
