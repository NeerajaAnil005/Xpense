const { getDb } = require('../database/db');
const { checkBudgetAlerts } = require('../utils/budgetHelper');

// GET /api/transactions
async function getTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      type,
      category,
      paymentMethod,
      search,
      startDate,
      endDate,
      datePreset,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    const db = await getDb();
    let whereClauses = ['user_id = ?'];
    let queryParams = [userId];

    if (type && type.toLowerCase() !== 'all') {
      whereClauses.push('type = ?');
      queryParams.push(type.toLowerCase());
    }

    if (category && category.toLowerCase() !== 'all') {
      whereClauses.push('category = ?');
      queryParams.push(category);
    }

    if (paymentMethod && paymentMethod.toLowerCase() !== 'all') {
      whereClauses.push('payment_method = ?');
      queryParams.push(paymentMethod);
    }

    if (search) {
      whereClauses.push('(description LIKE ? OR category LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Date filtering
    let filterStart = startDate;
    let filterEnd = endDate;

    if (datePreset) {
      const now = new Date();
      if (datePreset === 'today') {
        filterStart = now.toISOString().split('T')[0];
        filterEnd = filterStart;
      } else if (datePreset === 'this_week') {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        filterStart = firstDay.toISOString().split('T')[0];
        filterEnd = new Date().toISOString().split('T')[0];
      } else if (datePreset === 'this_month') {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        filterStart = `${y}-${m}-01`;
        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
        filterEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      } else if (datePreset === 'last_month') {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const y = prev.getFullYear();
        const m = String(prev.getMonth() + 1).padStart(2, '0');
        filterStart = `${y}-${m}-01`;
        const lastDay = new Date(y, prev.getMonth() + 1, 0).getDate();
        filterEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      }
    }

    if (filterStart) {
      whereClauses.push('transaction_date >= ?');
      queryParams.push(filterStart);
    }

    if (filterEnd) {
      whereClauses.push('transaction_date <= ?');
      queryParams.push(filterEnd);
    }

    const whereSql = whereClauses.join(' AND ');

    // Order SQL
    let orderSql = 'ORDER BY transaction_date DESC, id DESC';
    if (sortBy === 'oldest') {
      orderSql = 'ORDER BY transaction_date ASC, id ASC';
    } else if (sortBy === 'amount_high') {
      orderSql = 'ORDER BY amount DESC';
    } else if (sortBy === 'amount_low') {
      orderSql = 'ORDER BY amount ASC';
    }

    // Get total count for pagination
    const countRow = await db.get(`SELECT COUNT(*) AS total FROM transactions WHERE ${whereSql}`, queryParams);
    const totalItems = countRow ? countRow.total : 0;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const items = await db.all(
      `SELECT * FROM transactions WHERE ${whereSql} ${orderSql} LIMIT ? OFFSET ?`,
      [...queryParams, limitNum, offset]
    );

    res.json({
      success: true,
      data: items,
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/transactions/:id
async function getTransactionById(req, res, next) {
  try {
    const db = await getDb();
    const item = await db.get(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

// POST /api/transactions
async function createTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { type, amount, category, description, payment_method, transaction_date } = req.body;

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction type. Must be income or expense.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }

    if (!payment_method || !payment_method.trim()) {
      return res.status(400).json({ success: false, message: 'Payment method is required.' });
    }

    if (!transaction_date) {
      return res.status(400).json({ success: false, message: 'Transaction date is required.' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO transactions (user_id, type, amount, category, description, payment_method, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, numAmount, category.trim(), description.trim(), payment_method.trim(), transaction_date]
    );

    const createdItem = await db.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);

    // If expense, check budget alerts asynchronously
    if (type === 'expense') {
      await checkBudgetAlerts(userId, category.trim(), transaction_date);
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: createdItem
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/transactions/:id
async function updateTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { type, amount, category, description, payment_method, transaction_date } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const numAmount = amount ? parseFloat(amount) : existing.amount;
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    const updatedType = type || existing.type;
    const updatedCategory = category ? category.trim() : existing.category;
    const updatedDesc = description ? description.trim() : existing.description;
    const updatedPayment = payment_method ? payment_method.trim() : existing.payment_method;
    const updatedDate = transaction_date || existing.transaction_date;

    await db.run(
      `UPDATE transactions 
       SET type = ?, amount = ?, category = ?, description = ?, payment_method = ?, transaction_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [updatedType, numAmount, updatedCategory, updatedDesc, updatedPayment, updatedDate, id, userId]
    );

    const updatedItem = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (updatedType === 'expense') {
      await checkBudgetAlerts(userId, updatedCategory, updatedDate);
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully.',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/transactions/summary/stats
async function getSummaryStats(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    // Total Income
    const incRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'income'`,
      [userId]
    );
    const totalIncome = incRow ? incRow.total : 0;

    // Total Expenses
    const expRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'expense'`,
      [userId]
    );
    const totalExpenses = expRow ? expRow.total : 0;

    const totalBalance = totalIncome - totalExpenses;
    const savings = totalIncome > 0 ? (totalBalance > 0 ? totalBalance : 0) : 0;

    // Monthly Income & Expenses for current month
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${y}-${m}-01`;
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

    const mIncRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total 
       FROM transactions 
       WHERE user_id = ? AND type = 'income' AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    const monthlyIncome = mIncRow ? mIncRow.total : 0;

    const mExpRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    const monthlyExpenses = mExpRow ? mExpRow.total : 0;

    res.json({
      success: true,
      stats: {
        totalBalance,
        totalIncome,
        totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        savings
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/transactions/export/csv
async function exportCSV(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const transactions = await db.all(
      `SELECT id, type, amount, category, description, payment_method, transaction_date, created_at 
       FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC`,
      [userId]
    );

    let csvHeader = 'ID,Type,Amount (INR),Category,Description,Payment Method,Date\n';
    let csvRows = transactions.map(t => {
      const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const cat = `"${(t.category || '').replace(/"/g, '""')}"`;
      return `${t.id},${t.type},${t.amount},${cat},${desc},${t.payment_method},${t.transaction_date}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=xpense_transactions_${Date.now()}.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummaryStats,
  exportCSV
};
