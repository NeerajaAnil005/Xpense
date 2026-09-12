const { getDb } = require('../database/db');
const { generateAIInsights } = require('../services/aiService');

async function getInsights(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    // 1. Fetch summary stats
    const incRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'income'`,
      [userId]
    );
    const expRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'expense'`,
      [userId]
    );

    const totalIncome = incRow ? incRow.total : 0;
    const totalExpenses = expRow ? expRow.total : 0;

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${y}-${m}-01`;
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

    const mIncRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    const mExpRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );

    const summaryStats = {
      totalBalance: totalIncome - totalExpenses,
      monthlyIncome: mIncRow ? mIncRow.total : 0,
      monthlyExpenses: mExpRow ? mExpRow.total : 0
    };

    // 2. Category Breakdown
    const categoryRows = await db.all(
      `SELECT category AS name, SUM(amount) AS value
       FROM transactions
       WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ?
       GROUP BY category`,
      [userId, startDate, endDate]
    );

    const currentTotalExp = summaryStats.monthlyExpenses;
    const categoryBreakdown = categoryRows.map(r => ({
      name: r.name,
      value: r.value,
      percentage: currentTotalExp > 0 ? Math.round((r.value / currentTotalExp) * 100) : 0
    }));

    // 3. Budgets
    const monthInt = now.getMonth() + 1;
    const rawBudgets = await db.all(
      `SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?`,
      [userId, monthInt, y]
    );

    const spentMap = {};
    categoryRows.forEach(r => { spentMap[r.name] = r.value; });

    const enrichedBudgets = rawBudgets.map(b => {
      const spent = spentMap[b.category] || 0;
      return {
        category: b.category,
        amount: b.amount,
        spent,
        percentage: Math.round((spent / b.amount) * 100)
      };
    });

    // 4. Recent transactions
    const recentTx = await db.all(
      `SELECT type, amount, category, description, transaction_date FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 5`,
      [userId]
    );

    const insights = await generateAIInsights(summaryStats, categoryBreakdown, enrichedBudgets, recentTx);

    res.json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
}

async function getMonthlySummary(req, res, next) {
  try {
    // Reuse insights endpoint logic which includes monthlyReport
    return getInsights(req, res, next);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInsights,
  getMonthlySummary
};
