import { shiftMonth } from './format.js';

const round = (n) => Math.round(n * 100) / 100;

/**
 * Client-side twin of the server's GET /transactions/summary aggregation.
 * Used in demo mode so the dashboard works without a backend.
 * Returns exactly the same JSON shape as the API.
 */
export function computeSummary(all, month) {
  const sum = (rows) => rows.reduce((s, t) => s + t.amount, 0);
  const inMonth = (t) => t.date.slice(0, 7) === month;

  const allIncome = sum(all.filter((t) => t.type === 'income'));
  const allExpense = sum(all.filter((t) => t.type === 'expense'));

  const monthRows = all.filter(inMonth);
  const income = sum(monthRows.filter((t) => t.type === 'income'));
  const expenses = sum(monthRows.filter((t) => t.type === 'expense'));

  const group = (rows, key) => {
    const map = new Map();
    rows.forEach((t) => {
      const cur = map.get(t[key]) || { total: 0, count: 0 };
      cur.total += t.amount;
      cur.count += 1;
      map.set(t[key], cur);
    });
    return [...map.entries()].map(([k, v]) => ({ key: k, ...v })).sort((a, b) => b.total - a.total);
  };

  const expenseRows = monthRows.filter((t) => t.type === 'expense');

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i -= 1) {
    const key = shiftMonth(month, -i);
    const rows = all.filter((t) => t.date.slice(0, 7) === key);
    monthlyTrend.push({
      month: key,
      income: round(sum(rows.filter((t) => t.type === 'income'))),
      expenses: round(sum(rows.filter((t) => t.type === 'expense'))),
    });
  }

  return {
    month,
    totals: {
      balance: round(allIncome - allExpense),
      income: round(income),
      expenses: round(expenses),
      savings: round(income - expenses),
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
      transactionCount: monthRows.length,
    },
    categoryBreakdown: group(expenseRows, 'category').map((c) => ({
      category: c.key,
      total: round(c.total),
      count: c.count,
      percentage: expenses > 0 ? Math.round((c.total / expenses) * 1000) / 10 : 0,
    })),
    paymentMethods: group(expenseRows, 'paymentMethod').map((p) => ({
      method: p.key,
      total: round(p.total),
    })),
    monthlyTrend,
  };
}
