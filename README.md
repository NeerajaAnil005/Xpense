# P12 — Expense Management System (Xpense AI)

[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build-Vite%206-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Express.js-green.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://www.sqlite.org/)
[![Google Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E44AD.svg)](https://ai.google.dev/)

A modern, full-stack, production-ready finance management web application featuring income/expense tracking, budget monitoring with automated alert warnings, interactive visual reports, CSV export, dark mode, and personalized AI spending insights powered by Google Gemini.

---

## Key Features

- **🔐 Secure Authentication**: JWT token authentication, bcrypt password hashing, and user-isolated data access.
- **📊 Interactive Dashboard**:
  - 6 Dynamically calculated summary cards: Total Balance, Total Income, Total Expenses, Monthly Income, Monthly Expenses, Net Savings.
  - Interactive Recharts visualizations: Income vs Expense comparison bar chart, Category expense pie chart, Spending trend line chart, and Budget progress bars.
  - Recent transactions overview with quick action buttons.
- **💸 Transaction Management**:
  - Complete CRUD for Income and Expense transactions.
  - Powerful Search, Filter by Category, Payment Method (Cash, Bank Transfer, UPI, Credit/Debit Card), Date Range / Shortcuts (Today, This Week, This Month, Last Month).
  - Multi-column Sorting (Newest, Oldest, Amount High/Low) and Pagination.
  - One-click CSV Data Export.
- **🎯 Budget Management & Automated Alerts**:
  - Category budget setup per month/year.
  - Real-time progress bars calculating spent amount, remaining balance, and usage percentage.
  - Automated backend notification alerts triggered at 80%, 90%, and 100%+ spent limits.
- **📈 Advanced Financial Reports**:
  - Comprehensive metrics: Total Income, Total Expenses, Net Savings, Average Daily Spending, Highest Expense Category.
  - 5 Interactive visualizations updating dynamically with date/category filters.
- **✨ Google Gemini AI Insights**:
  - Real-time financial analysis evaluating spending patterns, attention-required areas, budget recommendations, and saving opportunities.
  - Financial Health status badge (Healthy / Moderate / Needs Attention).
  - Printable ✨ Monthly AI Financial Report modal.
  - Robust rule-based fallback analyzer if Gemini API key is not configured.
- **🔔 Notifications Center**: Real-time notifications for budget alerts, system updates, and AI reports with read/unread tracking.
- **⚙️ Profile & Theme Settings**: User name/email updates, default currency selection (INR ₹ / USD $), and persistent Light / Dark Mode toggles.

---

## Technology Stack

- **Frontend**: React 18, JavaScript, Vite 6, React Router DOM v6, Recharts, Lucide Icons, Axios, Vanilla CSS Variables Design System.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, CORS, dotenv.
- **Database**: SQLite (via `sqlite` / `sqlite3`).
- **AI Engine**: Google Gemini API (`@google/generative-ai`) with local heuristic fallback.

---

## Project Structure

```
Xpense/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, StatCard, Modals, etc.
│   │   ├── context/           # AuthContext, ThemeContext, NotificationContext
│   │   ├── layouts/           # MainLayout shell
│   │   ├── pages/             # Login, Register, Dashboard, Transactions, Budgets, Reports, AIInsights, Notifications, Settings
│   │   ├── services/          # Axios API Client
│   │   ├── App.jsx            # Router setup
│   │   └── index.css          # Design system & dark mode tokens
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express REST API Backend
│   ├── controllers/           # Auth, Transactions, Budgets, Reports, AI, Notifications
│   ├── database/              # SQLite connection, schema, seed script
│   ├── middleware/           # JWT auth & error handler
│   ├── routes/                # Express API routes
│   ├── services/              # Gemini AI service & fallback engine
│   ├── utils/                 # Budget alert helpers
│   ├── server.js
│   └── package.json
├── API_DOCUMENTATION.md        # Complete REST API reference
├── ARCHITECTURE.md            # Technical architecture & Mermaid diagram
├── PRESENTATION_CONTENT.md    # Presentation slides content
├── .env.example
└── README.md
```

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 2. Installation

Clone the repository and install dependencies for both server and client:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create `.env` file inside `server/` directory:

```env
PORT=5000
JWT_SECRET=xpense_jwt_secret_key_2026_super_secure
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```

*(Note: If `GEMINI_API_KEY` is omitted, the application automatically uses the built-in financial analysis fallback engine).*

### 4. Database Initialization & Demo Seeding

Run the seed script to populate realistic test data:

```bash
cd server
node database/seed.js
```

This creates a pre-populated demo user:
- **Email**: `demo@xpense.com`
- **Password**: `password123`

### 5. Running the Application

In separate terminal windows:

**Start Backend Server:**
```bash
cd server
npm start
# Runs on http://localhost:5000
```

**Start Frontend Client:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

Open `http://localhost:3000` in your browser and click **⚡ 1-Click Demo Account Login** to test immediately!

---

## Render Frontend Deployment (Render Static Site)

To deploy the React frontend on Render as a Static Site:

1. **New Static Site on Render**:
   - **Name**: `xpense-frontend`
   - **Root Directory**: `client` (or root if using root scripts)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist` (or `client/dist`)

2. **Environment Variables**:
   Add the environment variable in Render Dashboard under **Environment**:
   ```
   VITE_API_URL=https://xpense-nk8g.onrender.com
   ```

3. **SPA Redirect / Rewrite Rule**:
   Add a Redirect / Rewrite rule under **Redirects/Rewrites**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
   *(Note: The included `client/public/_redirects` and `render.yaml` automatically handle this configuration for Render).*

---

## Documentation Links

- [API Documentation](file:///c:/Users/NEERAJA%20ANIL/OneDrive/Desktop/Xpense/API_DOCUMENTATION.md)
- [Architecture Documentation & Diagrams](file:///c:/Users/NEERAJA%20ANIL/OneDrive/Desktop/Xpense/ARCHITECTURE.md)
- [Database Schema & ER Diagram](file:///c:/Users/NEERAJA%20ANIL/OneDrive/Desktop/Xpense/DATABASE.md)
- [Presentation Slides Content](file:///c:/Users/NEERAJA%20ANIL/OneDrive/Desktop/Xpense/PRESENTATION_CONTENT.md)

---

## License

MIT License. Developed for P12 Expense Management System.
