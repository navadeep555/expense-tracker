# Spendwise – MERN Expense Tracker

Record daily income and expenses, categorise them, and view monthly summaries on a responsive fintech-style dashboard.

**Stack:** MongoDB · Express.js · React (Vite) · Node.js · Tailwind CSS · Recharts · Lucide React

```
Expense Tracker/
├── client/                     React frontend (Vite + Tailwind)
│   └── src/
│       ├── api/                transactionService.js  ← all REST calls (+ demo-mode fallback)
│       ├── components/
│       │   ├── layout/         Sidebar, Topbar, MonthSelector, AppLayout
│       │   ├── dashboard/      SummaryCards, IncomeExpenseChart, CategoryDonut, RecentTransactions
│       │   ├── transactions/   TransactionModal (form), TransactionsTable, FilterBar, CategoryIcon
│       │   └── ui/             Modal, ConfirmDialog, EmptyState, ErrorBanner
│       ├── context/            TransactionsContext, SettingsContext, ToastContext
│       ├── data/               constants (categories, icons, colours), sampleTransactions
│       ├── hooks/              useLocalStorage
│       ├── pages/              Dashboard, Transactions, Budgets, Analytics, Settings
│       └── utils/              format, validation, summary (client-side twin of the aggregation)
└── server/                     Express + MongoDB API
    └── src/
        ├── config/db.js        builds the connection string from .env placeholders
        ├── controllers/        transactionController.js (CRUD + $facet aggregation)
        ├── middleware/         validate.js, errorHandler.js
        ├── models/             Transaction.js (Mongoose schema)
        ├── routes/             transactionRoutes.js
        └── seed/seed.js        sample data loader
```

---

## 1. Prerequisites

- **Node.js 18 or newer** (check with `node -v`)
- A **MongoDB** database – either a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local MongoDB install

> **You can run the frontend without MongoDB.** If the API isn't running, the app automatically switches to *Demo mode*
> (a yellow banner appears) and uses realistic sample transactions stored in your browser. Add, edit and delete all still work.

---

## 2. Run the frontend (works immediately)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 3. Set up the backend + MongoDB

### 3.1 Add your MongoDB details

```bash
cd server
npm install
copy .env.example .env        # Windows (PowerShell / cmd)
# cp .env.example .env        # macOS / Linux
```

Open **`server/.env`** and replace the placeholders:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

DB_USERNAME=<your_mongodb_username>
DB_PASSWORD=<your_mongodb_password>
DB_NAME=<your_database_name>
DB_CLUSTER=<your_cluster_host>        # e.g. cluster0.abcde.mongodb.net
```

Prefer a single connection string? Set `MONGODB_URI` instead – it takes priority:

```env
# Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/<db_name>?retryWrites=true&w=majority
# Local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/<db_name>
```

Atlas checklist: create a database user (Database Access) and allow your IP address (Network Access).
Special characters in the password are handled automatically when you use the four `DB_*` values.

### 3.2 (Optional) load sample data into MongoDB

```bash
npm run seed          # inserts 140 sample transactions (May–Oct 2026) if the collection is empty
npm run seed:reset    # wipes the collection first, then inserts
```

### 3.3 Start the API

```bash
npm run dev           # auto-restart on file changes   (or: npm start)
```

You should see `MongoDB connected: …` and `API running at http://localhost:5000/api`.

---

## 4. Run both together

Use two terminals:

| Terminal 1 (API)                | Terminal 2 (React)              |
| ------------------------------- | ------------------------------- |
| `cd server` → `npm run dev`     | `cd client` → `npm run dev`     |

Refresh http://localhost:5173 – the yellow *Demo mode* banner disappears and the sidebar shows **“Connected to MongoDB”**.
The Vite dev server proxies `/api` to port 5000 (see `client/vite.config.js`), so no CORS setup is needed.

From the project root you can also use: `npm run install:all`, `npm run server`, `npm run client`, `npm run seed`.

**Deploying later:** set `VITE_API_URL=https://your-api-host/api` in `client/.env` before `npm run build`, and set
`CLIENT_ORIGIN` on the server to your frontend URL.

---

## 5. REST API

Base URL: `http://localhost:5000/api`

| Method | Endpoint                          | Description                                                        |
| ------ | --------------------------------- | ------------------------------------------------------------------ |
| GET    | `/transactions?month=2026-10`     | List transactions for a month (newest first). Optional: `type`, `category`, `search` |
| POST   | `/transactions`                   | Create a transaction                                               |
| PUT    | `/transactions/:id`               | Update a transaction                                               |
| DELETE | `/transactions/:id`               | Delete a transaction                                               |
| GET    | `/transactions/summary?month=2026-10` | Totals, category breakdown, payment methods, 6-month trend      |
| GET    | `/health`                         | Health check                                                       |

**Transaction JSON**

```json
{
  "amount": 450,
  "type": "expense",
  "category": "Transport",
  "date": "2026-10-15",
  "paymentMethod": "UPI",
  "note": "Cab to station"
}
```

- `type`: `income` | `expense`
- `category` (expense): Food & Dining, Shopping, Transport, Rent & Housing, Bills & Utilities, Health, Entertainment, Education, Travel, Other
- `category` (income): Salary, Freelance, Investments, Gifts, Other Income
- `paymentMethod`: Cash, UPI, Credit Card, Debit Card, Bank Transfer
- `note` is optional (max 200 characters)

Invalid input returns **400** with field-level messages, e.g. `{ "message": "Validation failed", "errors": { "amount": "Amount must be greater than 0" } }`.

**Summary response (shape)**

```json
{
  "month": "2026-10",
  "totals": { "balance": 181722, "income": 60340, "expenses": 24808, "savings": 35532, "savingsRate": 59, "transactionCount": 16 },
  "categoryBreakdown": [{ "category": "Rent & Housing", "total": 14000, "count": 1, "percentage": 56.4 }],
  "paymentMethods": [{ "method": "UPI", "total": 17139 }],
  "monthlyTrend": [{ "month": "2026-05", "income": 65950, "expenses": 30528 }]
}
```

**How the aggregation works** (`server/src/controllers/transactionController.js`): one `$facet` pipeline runs five
sub-pipelines at once – all-time totals (Total Balance), the selected month's totals, expense `$group` by category,
expense `$group` by payment method, and a `$group` on `$dateToString('%Y-%m')` for the 6-month income-vs-expense trend.

**Quick test with curl**

```bash
curl "http://localhost:5000/api/transactions?month=2026-10"
curl -X POST http://localhost:5000/api/transactions -H "Content-Type: application/json" \
  -d "{\"amount\":450,\"type\":\"expense\",\"category\":\"Transport\",\"date\":\"2026-10-15\",\"paymentMethod\":\"UPI\",\"note\":\"Cab\"}"
curl "http://localhost:5000/api/transactions/summary?month=2026-10"
```

---

## 6. Features

- **Dashboard:** Total Balance, Monthly Income, Monthly Expenses and Savings cards (with month-over-month change), income-vs-expenses bar chart, category donut chart, recent transactions
- **Transactions page:** search, category filter, income/expense filter, pagination, CSV export
- **Add / edit / delete** through a modal form with validation, loading spinners and toast messages
- **Month selector** (previous / next / dropdown) drives every page
- **Budgets:** editable monthly limit per category with progress bars (stored in the browser)
- **Analytics:** cash-flow trend, top categories, average daily spend, biggest expense, payment-method split
- **Settings:** display name and currency (INR / USD / EUR / GBP), backend connection status
- Loading skeletons, empty states, error banners, responsive layout (desktop sidebar → mobile drawer, table → cards)
- Income shown in **emerald green (+)**, expenses in **red (−)**

## 7. Troubleshooting

| Problem | Fix |
| --- | --- |
| Yellow “Demo mode” banner | The API isn't running or can't reach MongoDB. Start `server` and click **Retry connection**. |
| `MongoDB is not configured…` | You still have `<placeholders>` in `server/.env`. Fill them in (or set `MONGODB_URI`). |
| `MongooseServerSelectionError` | Atlas: add your IP in *Network Access*; check username/password; check internet. |
| Port 5000 busy (macOS AirPlay) | Change `PORT` in `server/.env` **and** the proxy target in `client/vite.config.js`. |
| Empty dashboard when connected | The database is empty – run `npm run seed` in `server`, or add transactions manually. |
