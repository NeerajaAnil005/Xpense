# Architecture Documentation — P12 Expense Management System

## 1. System Architecture Overview

The **P12 Expense Management System** follows a clean, decoupled 3-tier architecture:

1. **Presentation Layer (Frontend)**: Built with React, Vite, Recharts, and Vanilla CSS with CSS custom property tokens. Communicates asynchronously via REST APIs using Axios.
2. **Application Layer (Backend)**: Built with Express.js on Node.js. Enforces JWT authentication middleware, input validation, automated budget threshold alert triggers, and Google Gemini AI prompt generation.
3. **Data Layer (Database & External Services)**: SQLite embedded database for fast relational storage, coupled with Google Gemini Generative AI API for personalized financial insight analysis.

---

## 2. System Architecture Diagram

```mermaid
graph TD
    User["👤 User Client Browser"] -->|HTTP / HTTPS| ReactApp["📱 React Single Page App (Vite + Recharts)"]
    
    subgraph ClientLayer ["Client Layer"]
        ReactApp --> AuthContext["Authentication Context"]
        ReactApp --> ThemeContext["Theme System (Light/Dark)"]
        ReactApp --> NotificationContext["Notification Poller"]
    end
    
    ReactApp -->|REST API Requests w/ JWT Bearer| ExpressServer["⚡ Express.js REST API Backend"]
    
    subgraph ServerLayer ["Backend Layer"]
        ExpressServer --> AuthMw["JWT Auth Middleware"]
        AuthMw --> AuthCtrl["Auth Controller"]
        AuthMw --> TxCtrl["Transaction Controller"]
        AuthMw --> BudgetCtrl["Budget Controller"]
        AuthMw --> ReportCtrl["Report Controller"]
        AuthMw --> NotificationCtrl["Notification Controller"]
        AuthMw --> AICtrl["AI Insight Controller"]
        
        TxCtrl --> BudgetHelper["Budget Threshold Alert Engine"]
        BudgetHelper --> NotificationCtrl
        
        AICtrl --> AIService["Gemini AI Prompt Engine"]
    end
    
    subgraph DataLayer ["Data & AI Services"]
        AuthCtrl --> SQLite["DB SQLite (expense.db)"]
        TxCtrl --> SQLite
        BudgetCtrl --> SQLite
        ReportCtrl --> SQLite
        NotificationCtrl --> SQLite
        
        AIService -->|Google Generative AI SDK| GeminiAPI["✨ Google Gemini API (gemini-1.5-flash)"]
        AIService -.->|Fallback Engine| RuleBasedAnalyzer["⚙️ Local Financial Heuristics Analyzer"]
    end
```

---

## 3. Component Architecture & Data Flow

### A. Authentication Flow
- User registers/logs in -> Server hashes password using `bcryptjs` -> Generates JWT token -> Saved in `localStorage` -> Attached to Axios `Authorization` header for protected endpoints.

### B. Transaction & Budget Alert Flow
- User submits transaction -> Backend validates positive amount and non-empty fields -> Inserts record into `transactions` table.
- If transaction type is `expense`, `budgetHelper.checkBudgetAlerts()` calculates current category spending vs allocated budget.
- If percentage spent >= 80%, >= 90%, or >= 100%, an automated record is created in `notifications` table.

### C. AI Spending Insight Flow
- User requests AI Insights / Financial Report -> Backend queries aggregated user income, expenses, category breakdown, and budget usage -> Constructs prompt payload -> Dispatches to Google Gemini API (`gemini-1.5-flash`).
- If API key is not configured, the fallback analyzer processes financial metrics using deterministic rule-based heuristics.
