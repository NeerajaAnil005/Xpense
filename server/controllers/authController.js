const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'xpense_jwt_secret_key_2026_super_secure';

// Helper to validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), passwordHash]
    );

    const userId = result.lastID;
    const token = jwt.sign({ id: userId, email: email.toLowerCase(), name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });

    // Create welcome notification
    await db.run(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [userId, 'Welcome to Xpense AI!', 'Start tracking your financial transactions and setting budgets to get personalized AI insights.', 'system']
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase(),
        currency: 'INR',
        theme: 'light'
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR',
        theme: user.theme || 'light'
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, currency, theme, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, email, currency, theme } = req.body;
    const db = await getDb();

    const currentUser = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let updatedName = name !== undefined ? name.trim() : currentUser.name;
    let updatedEmail = email !== undefined ? email.toLowerCase().trim() : currentUser.email;
    let updatedCurrency = currency || currentUser.currency || 'INR';
    let updatedTheme = theme || currentUser.theme || 'light';

    if (email && email.toLowerCase() !== currentUser.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
      }
      const existing = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [updatedEmail, req.user.id]);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already taken by another user.' });
      }
    }

    await db.run(
      'UPDATE users SET name = ?, email = ?, currency = ?, theme = ? WHERE id = ?',
      [updatedName, updatedEmail, updatedCurrency, updatedTheme, req.user.id]
    );

    const token = jwt.sign({ id: req.user.id, email: updatedEmail, name: updatedName }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      token,
      user: {
        id: req.user.id,
        name: updatedName,
        email: updatedEmail,
        currency: updatedCurrency,
        theme: updatedTheme
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me,
  updateProfile
};
