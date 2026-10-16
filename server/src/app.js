const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: origins }));
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
