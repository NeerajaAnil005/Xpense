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

const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');

// Serve static frontend assets if built
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'P12 Expense Management System',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend SPA or fallback info page
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  if (fs.existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
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
          .status { display: inline-block; background: #10b981; color: #047857; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚡ Xpense AI API Server</h2>
          <div style="margin-bottom: 1rem;"><span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem;">● API Online</span></div>
          <p>The REST API backend is fully operational and ready to process requests.</p>
          <p style="font-size: 0.8125rem; color: #64748b; margin-top: 1.5rem;">API Health Endpoint: <code>/api/health</code></p>
        </div>
      </body>
    </html>
  `);
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
