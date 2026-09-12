const { getDb } = require('../database/db');

// GET /api/budgets
async function getBudgets(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const db = await getDb();

    // Fetch user budgets for this month/year
    const budgets = await db.all(
      `SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ? ORDER BY category ASC`,
      [userId, month, year]
    );

    // Calculate spent amount per category for this month
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    const spentRows = await db.all(
      `SELECT category, COALESCE(SUM(amount), 0) AS total_spent 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ?
       GROUP BY category`,
      [userId, startDate, endDate]
    );

    const spentMap = {};
    spentRows.forEach(r => {
      spentMap[r.category] = r.total_spent;
    });

    const enrichedBudgets = budgets.map(b => {
      const spent = spentMap[b.category] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentage = Math.min(100, Math.round((spent / b.amount) * 100));
      const status = spent > b.amount ? 'exceeded' : (percentage >= 80 ? 'warning' : 'healthy');

      return {
        ...b,
        spent,
        remaining,
        percentage,
        status
      };
    });

    // Summary calculations
    const totalBudget = enrichedBudgets.reduce((acc, b) => acc + b.amount, 0);
    const totalSpent = enrichedBudgets.reduce((acc, b) => acc + b.spent, 0);
    const totalRemaining = Math.max(0, totalBudget - totalSpent);

    res.json({
      success: true,
      month,
      year,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
      },
      data: enrichedBudgets
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/budgets
async function createOrUpdateBudget(req, res, next) {
  try {
    const userId = req.user.id;
    const { category, amount, month, year } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be a positive number.' });
    }

    const now = new Date();
    const bMonth = parseInt(month, 10) || (now.getMonth() + 1);
    const bYear = parseInt(year, 10) || now.getFullYear();

    if (bMonth < 1 || bMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month (must be 1-12).' });
    }

    const db = await getDb();

    // Check if budget exists for this user, category, month, year
    const existing = await db.get(
      `SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?`,
      [userId, category.trim(), bMonth, bYear]
    );

    let budgetId;
    if (existing) {
      await db.run(
        `UPDATE budgets SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [numAmount, existing.id]
      );
      budgetId = existing.id;
    } else {
      const result = await db.run(
        `INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)`,
        [userId, category.trim(), numAmount, bMonth, bYear]
      );
      budgetId = result.lastID;
    }

    const savedBudget = await db.get(`SELECT * FROM budgets WHERE id = ?`, [budgetId]);

    res.status(201).json({
      success: true,
      message: 'Budget saved successfully.',
      data: savedBudget
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/budgets/:id
async function updateBudget(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    await db.run(
      `UPDATE budgets SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [numAmount, id, userId]
    );

    const updated = await db.get('SELECT * FROM budgets WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Budget updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/budgets/:id
async function deleteBudget(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    await db.run('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBudgets,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget
};
