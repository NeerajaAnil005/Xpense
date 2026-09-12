const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { initDb } = require('./database/db');
const seedData = require('./database/seed');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route redirect/info page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Xpense AI - Backend API Server</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h2 { color: #818cf8; margin-top: 0; }
          p { color: #94a3b8; line-height: 1.6; }
          .btn { display: inline-block; background: #4f46e5; color: #fff; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: bold; margin-top: 1rem; }
          .btn:hover { background: #4338ca; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚡ Xpense AI Backend API Server</h2>
          <p>You are viewing the backend REST API server running on <strong>Port 5000</strong>.</p>
          <p>To view and interact with the full web application interface, please open the frontend client at <strong>Port 3000</strong>.</p>
          <a href="http://localhost:3000" class="btn">👉 Open Frontend UI (http://localhost:3000)</a>
        </div>
      </body>
    </html>
  `);
});

// Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'P12 Expense Management System',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize DB & Start Server
async function startServer() {
  try {
    await initDb();
    // Auto seed demo user if database is freshly created
    await seedData().catch(err => console.error('Auto-seed check:', err.message));

    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`  Xpense Server running on http://localhost:${PORT}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
