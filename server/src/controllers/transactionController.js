const Transaction = require('../models/Transaction');

/** "2026-10" -> { start: 2026-10-01T00:00Z, end: 2026-11-01T00:00Z } */
function monthRange(month) {
  const [y, m] = month.split('-').map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------- GET /api/transactions?month=2026-10
exports.getTransactions = async (req, res, next) => {
  try {
    const { month, type, category, search } = req.query;
    const filter = {};

    if (month) {
      const { start, end } = monthRange(month);
      filter.date = { $gte: start, $lt: end };
    }
    if (type === 'income' || type === 'expense') filter.type = type;
    if (category) filter.category = category;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ note: rx }, { category: rx }, { paymentMethod: rx }];
    }

    const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------- POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const created = await Transaction.create(req.cleanBody);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------- PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.cleanBody, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------- DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------- GET /api/transactions/summary?month=2026-10
/**
 * One aggregation ($facet) returns everything the dashboard needs:
 *  - all-time income / expense        -> Total Balance
 *  - selected-month income / expense  -> Monthly Income, Expenses, Savings
 *  - expense totals per category      -> donut chart
 *  - expense totals per payment method-> analytics
 *  - last 6 months income vs expense  -> bar chart
 */
exports.getSummary = async (req, res, next) => {
  try {
    const month = req.query.month || currentMonth();
    const { start, end } = monthRange(month);
    const trendStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 5, 1));

    const [facets] = await Transaction.aggregate([
      {
        $facet: {
          allTime: [{ $group: { _id: '$type', total: { $sum: '$amount' } } }],
          monthTotals: [
            { $match: { date: { $gte: start, $lt: end } } },
            { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          categories: [
            { $match: { type: 'expense', date: { $gte: start, $lt: end } } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
          paymentMethods: [
            { $match: { type: 'expense', date: { $gte: start, $lt: end } } },
            { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
          ],
          trend: [
            { $match: { date: { $gte: trendStart, $lt: end } } },
            {
              $group: {
                _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
                total: { $sum: '$amount' },
              },
            },
          ],
        },
      },
    ]);

    const sumOf = (rows, type) => rows.find((r) => r._id === type)?.total || 0;
    const round = (n) => Math.round(n * 100) / 100;

    const allIncome = sumOf(facets.allTime, 'income');
    const allExpense = sumOf(facets.allTime, 'expense');
    const income = sumOf(facets.monthTotals, 'income');
    const expenses = sumOf(facets.monthTotals, 'expense');
    const transactionCount = facets.monthTotals.reduce((n, r) => n + r.count, 0);

    // Fill months with no data so the chart always shows 6 bars
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - i, 1));
      const key = d.toISOString().slice(0, 7);
      const pick = (type) => facets.trend.find((r) => r._id.month === key && r._id.type === type)?.total || 0;
      monthlyTrend.push({ month: key, income: round(pick('income')), expenses: round(pick('expense')) });
    }

    res.json({
      month,
      totals: {
        balance: round(allIncome - allExpense),
        income: round(income),
        expenses: round(expenses),
        savings: round(income - expenses),
        savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
        transactionCount,
      },
      categoryBreakdown: facets.categories.map((c) => ({
        category: c._id,
        total: round(c.total),
        count: c.count,
        percentage: expenses > 0 ? Math.round((c.total / expenses) * 1000) / 10 : 0,
      })),
      paymentMethods: facets.paymentMethods.map((p) => ({ method: p._id, total: round(p.total) })),
      monthlyTrend,
    });
  } catch (err) {
    next(err);
  }
};
