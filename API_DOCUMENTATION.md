# API Documentation — P12 Expense Management System

Base URL: `http://localhost:5000/api`

All endpoints except `/api/auth/register` and `/api/auth/login` require a valid JWT token passed in the request header:
`Authorization: Bearer <token>`

---

## 1. Authentication Endpoints

### POST `/api/auth/register`
- **Purpose**: Registers a new user account.
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "currency": "INR",
      "theme": "light"
    }
  }
  ```

### POST `/api/auth/login`
- **Purpose**: Authenticates user and issues JWT token.
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "demo@xpense.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "name": "Alex Morgan",
      "email": "demo@xpense.com",
      "currency": "INR",
      "theme": "light"
    }
  }
  ```

### GET `/api/auth/me`
- **Purpose**: Fetches logged-in user profile details.
- **Authentication**: Bearer Token required

### PUT `/api/auth/profile`
- **Purpose**: Updates user profile name, email, currency (INR/USD), and theme preference (light/dark).
- **Authentication**: Bearer Token required

---

## 2. Transactions Endpoints

### GET `/api/transactions`
- **Purpose**: Retrieves paginated list of transactions supporting search, filtering, and sorting.
- **Query Parameters**:
  - `type`: `all` | `income` | `expense`
  - `category`: `all` | `Food` | `Salary` | ...
  - `paymentMethod`: `all` | `UPI` | `Credit Card` | ...
  - `search`: string search query
  - `datePreset`: `today` | `this_week` | `this_month` | `last_month`
  - `startDate`, `endDate`: YYYY-MM-DD
  - `sortBy`: `newest` | `oldest` | `amount_high` | `amount_low`
  - `page`: default 1
  - `limit`: default 10

### POST `/api/transactions`
- **Purpose**: Creates a new income or expense transaction.
- **Request Body**:
  ```json
  {
    "type": "expense",
    "amount": 4500,
    "category": "Food",
    "description": "Weekly Groceries & Dining",
    "payment_method": "UPI",
    "transaction_date": "2026-09-12"
  }
  ```

### PUT `/api/transactions/:id`
- **Purpose**: Updates an existing transaction.

### DELETE `/api/transactions/:id`
- **Purpose**: Deletes a transaction by ID.

### GET `/api/transactions/summary/stats`
- **Purpose**: Calculates balance, total income, total expenses, monthly income, monthly expenses, and net savings.

### GET `/api/transactions/export/csv`
- **Purpose**: Exports user's transaction records as a downloadable CSV file.

---

## 3. Budgets Endpoints

### GET `/api/budgets`
- **Purpose**: Retrieves monthly budget targets enriched with live spent amount, remaining amount, and percentage used.
- **Query Parameters**: `month` (1-12), `year` (YYYY)

### POST `/api/budgets`
- **Purpose**: Creates or updates category budget target amount.
- **Request Body**:
  ```json
  {
    "category": "Food",
    "amount": 7000,
    "month": 9,
    "year": 2026
  }
  ```

### DELETE `/api/budgets/:id`
- **Purpose**: Deletes budget target.

---

## 4. Reports Endpoints

### GET `/api/reports/summary`
- **Purpose**: Returns aggregate financial stats (total income, total expense, net savings, average daily spending, top expense category).
### GET `/api/reports/monthly`
- **Purpose**: Returns monthly income vs expense comparison for bar charts.
### GET `/api/reports/categories`
- **Purpose**: Returns category expense breakdown for pie charts.
### GET `/api/reports/trends`
- **Purpose**: Returns daily spending trend for line charts.
### GET `/api/reports/budget-vs-actual`
- **Purpose**: Returns budget limit vs actual spending comparison data.

---

## 5. AI Spending Insights Endpoints

### POST `/api/ai/insights`
- **Purpose**: Invokes Google Gemini API (or rule-based fallback analyzer) to generate 5 financial insight cards (Spending Pattern, Attention Required, Budget Recommendation, Saving Opportunity, Financial Health).
### POST `/api/ai/monthly-summary`
- **Purpose**: Generates full Monthly AI Financial Report card.

---

## 6. Notifications Endpoints

### GET `/api/notifications`
- **Purpose**: Lists notifications and unread count.
### PUT `/api/notifications/:id/read`
- **Purpose**: Marks notification as read.
### PUT `/api/notifications/read-all`
- **Purpose**: Marks all notifications as read.
### DELETE `/api/notifications/clear-all`
- **Purpose**: Clears all user notifications.
