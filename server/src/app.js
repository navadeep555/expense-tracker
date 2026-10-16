const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow localhost in dev
    if (origin.includes('localhost')) return callback(null, true);
    // Allow all vercel.app domains
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => res.json({
  name: 'Spendwise Expense Tracker API',
  version: '1.0.0',
  status: 'running',
  endpoints: {
    health: '/api/health',
    transactions: '/api/transactions',
    summary: '/api/transactions/summary?month=YYYY-MM',
  },
}));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/transactions', transactionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
