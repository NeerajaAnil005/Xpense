const { getDb } = require('../database/db');

// Helper to filter dates
function buildDateFilter(startDate, endDate) {
  let where = '';
  let params = [];
  if (startDate) {
    where += ' AND transaction_date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    where += ' AND transaction_date <= ?';
    params.push(endDate);
  }
  return { where, params };
}

// GET /api/reports/summary
async function getReportSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, type } = req.query;

    const db = await getDb();
    let whereClauses = ['user_id = ?'];
    let queryParams = [userId];

    if (startDate) {
      whereClauses.push('transaction_date >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClauses.push('transaction_date <= ?');
      queryParams.push(endDate);
    }
    if (category && category.toLowerCase() !== 'all') {
      whereClauses.push('category = ?');
      queryParams.push(category);
    }
    if (type && type.toLowerCase() !== 'all') {
      whereClauses.push('type = ?');
      queryParams.push(type.toLowerCase());
    }

    const whereSql = whereClauses.join(' AND ');

    // Total Income & Expense
    const incRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE ${whereSql} AND type = 'income'`,
      queryParams
    );
    const expRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE ${whereSql} AND type = 'expense'`,
      queryParams
    );

    const totalIncome = incRow ? incRow.total : 0;
    const totalExpenses = expRow ? expRow.total : 0;
    const netSavings = totalIncome - totalExpenses;

    // Highest expense category
    const topCategoryRow = await db.get(
      `SELECT category, SUM(amount) AS total_amount 
       FROM transactions 
       WHERE ${whereSql} AND type = 'expense' 
       GROUP BY category 
       ORDER BY total_amount DESC LIMIT 1`,
      queryParams
    );

    // Average daily spending
    const dateRangeRow = await db.get(
      `SELECT MIN(transaction_date) as min_date, MAX(transaction_date) as max_date, COUNT(*) as count 
       FROM transactions WHERE ${whereSql} AND type = 'expense'`,
      queryParams
    );

    let avgDailySpending = 0;
    if (dateRangeRow && dateRangeRow.min_date && dateRangeRow.max_date) {
      const start = new Date(dateRangeRow.min_date);
      const end = new Date(dateRangeRow.max_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      avgDailySpending = Math.round(totalExpenses / diffDays);
    } else if (totalExpenses > 0) {
      avgDailySpending = totalExpenses;
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netSavings,
        avgDailySpending,
        highestExpenseCategory: topCategoryRow ? topCategoryRow.category : 'N/A',
        highestExpenseAmount: topCategoryRow ? topCategoryRow.total_amount : 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/monthly
async function getMonthlyComparison(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    // Query last 6-12 months grouped by YYYY-MM
    const rows = await db.all(
      `SELECT 
         strftime('%Y-%m', transaction_date) AS month_key,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE user_id = ?
       GROUP BY month_key
       ORDER BY month_key ASC
       LIMIT 12`,
      [userId]
    );

    const formatted = rows.map(r => {
      const [year, monthNum] = (r.month_key || '').split('-');
      const dateObj = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, 1);
      const monthLabel = dateObj.toLocaleString('en-US', { month: 'short' });

      return {
        month: `${monthLabel} ${year ? year.slice(2) : ''}`,
        rawMonth: r.month_key,
        income: r.income || 0,
        expense: r.expense || 0,
        net: (r.income || 0) - (r.expense || 0)
      };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/categories
async function getCategoryBreakdown(req, res, next) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type = 'expense' } = req.query;

    const db = await getDb();
    let whereClauses = ['user_id = ?', 'type = ?'];
    let queryParams = [userId, type];

    if (startDate) {
      whereClauses.push('transaction_date >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClauses.push('transaction_date <= ?');
      queryParams.push(endDate);
    }

    const whereSql = whereClauses.join(' AND ');

    const rows = await db.all(
      `SELECT category, SUM(amount) AS value
       FROM transactions
       WHERE ${whereSql}
       GROUP BY category
       ORDER BY value DESC`,
      queryParams
    );

    const totalSum = rows.reduce((acc, r) => acc + r.value, 0);

    const data = rows.map(r => ({
      name: r.category,
      value: r.value,
      percentage: totalSum > 0 ? Math.round((r.value / totalSum) * 100) : 0
    }));

    res.json({
      success: true,
      totalSum,
      data
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/trends
async function getSpendingTrends(req, res, next) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const db = await getDb();
    let whereClauses = ['user_id = ?', "type = 'expense'"];
    let queryParams = [userId];

    if (startDate) {
      whereClauses.push('transaction_date >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClauses.push('transaction_date <= ?');
      queryParams.push(endDate);
    }

    const whereSql = whereClauses.join(' AND ');

    const rows = await db.all(
      `SELECT transaction_date AS date, SUM(amount) AS expense, COUNT(*) AS count
       FROM transactions
       WHERE ${whereSql}
       GROUP BY transaction_date
       ORDER BY transaction_date ASC`,
      queryParams
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/budget-vs-actual
async function getBudgetVsActual(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const db = await getDb();

    const budgets = await db.all(
      `SELECT category, amount AS budget FROM budgets WHERE user_id = ? AND month = ? AND year = ?`,
      [userId, month, year]
    );

    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    const spentRows = await db.all(
      `SELECT category, SUM(amount) AS actual
       FROM transactions
       WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ?
       GROUP BY category`,
      [userId, startDate, endDate]
    );

    const spentMap = {};
    spentRows.forEach(r => {
      spentMap[r.category] = r.actual;
    });

    const categorySet = new Set([
      ...budgets.map(b => b.category),
      ...spentRows.map(s => s.category)
    ]);

    const budgetMap = {};
    budgets.forEach(b => { budgetMap[b.category] = b.budget; });

    const result = Array.from(categorySet).map(category => {
      const budget = budgetMap[category] || 0;
      const actual = spentMap[category] || 0;
      return {
        category,
        budget,
        actual,
        variance: budget - actual
      };
    });

    res.json({
      success: true,
      month,
      year,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReportSummary,
  getMonthlyComparison,
  getCategoryBreakdown,
  getSpendingTrends,
  getBudgetVsActual
};
