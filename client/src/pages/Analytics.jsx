import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarDays, Flame, PiggyBank, Receipt } from 'lucide-react';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import { COLORS, ChartTooltip } from '../components/dashboard/IncomeExpenseChart.jsx';
import { useTransactions } from '../context/TransactionsContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { getCategoryMeta } from '../data/constants.js';
import { currentMonth, formatCurrency, monthLabel, shortMonth } from '../utils/format.js';

function Stat({ icon: Icon, label, value, sub, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-28 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="tabular mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      )}
      <p className="mt-1 truncate text-xs text-slate-400">{sub}</p>
    </div>
  );
}

export default function Analytics() {
  const { summary, transactions, loading, error, reload, month } = useTransactions();
  const { currency } = useSettings();
  const money = (n) => formatCurrency(n, currency);

  const totals = summary?.totals;
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const daysElapsed = month === currentMonth() ? new Date().getDate() : daysInMonth;
  const avgDaily = totals ? totals.expenses / daysElapsed : 0;

  const biggest = transactions
    .filter((t) => t.type === 'expense')
    .reduce((max, t) => (!max || t.amount > max.amount ? t : max), null);

  const trend = (summary?.monthlyTrend || []).map((t) => ({
    name: shortMonth(t.month),
    Income: t.income,
    Expenses: t.expenses,
    Savings: t.income - t.expenses,
  }));

  const categories = (summary?.categoryBreakdown || []).slice(0, 7).map((c) => ({
    name: c.category,
    value: c.total,
    color: getCategoryMeta(c.category).color,
  }));

  const methods = summary?.paymentMethods || [];
  const methodTotal = methods.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:hidden">Analytics</h2>
        <p className="text-sm text-slate-500">Insights into your spending habits for {monthLabel(month)}.</p>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat loading={loading} icon={CalendarDays} label="Avg. daily spend" value={money(avgDaily)} sub={`Over ${daysElapsed} days`} />
        <Stat
          loading={loading}
          icon={Flame}
          label="Biggest expense"
          value={biggest ? money(biggest.amount) : '—'}
          sub={biggest ? biggest.note || biggest.category : 'No expenses yet'}
        />
        <Stat
          loading={loading}
          icon={PiggyBank}
          label="Savings rate"
          value={`${totals?.savingsRate ?? 0}%`}
          sub={totals ? `${money(totals.savings)} saved` : ''}
        />
        <Stat
          loading={loading}
          icon={Receipt}
          label="Transactions"
          value={totals?.transactionCount ?? 0}
          sub="Recorded this month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900">Cash-flow trend</h2>
          <p className="mb-4 text-sm text-slate-500">Income and expenses over 6 months</p>
          <div className="h-64">
            {loading ? (
              <div className="h-full animate-pulse rounded-xl bg-slate-50" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.income} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.income} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.expense} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={COLORS.expense} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    width={64}
                    tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
                  />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Area type="monotone" dataKey="Income" stroke={COLORS.income} strokeWidth={2.5} fill="url(#gInc)" />
                  <Area type="monotone" dataKey="Expenses" stroke={COLORS.expense} strokeWidth={2.5} fill="url(#gExp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900">Top spending categories</h2>
          <p className="mb-4 text-sm text-slate-500">Highest expense categories this month</p>
          <div className="h-64">
            {loading ? (
              <div className="h-full animate-pulse rounded-xl bg-slate-50" />
            ) : !categories.length ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No expenses this month</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f6" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tick={{ fill: '#475569', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(v) => money(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                    {categories.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Payment methods</h2>
        <p className="mb-5 text-sm text-slate-500">How you paid for expenses this month</p>
        {!loading && !methods.length ? (
          <p className="py-6 text-center text-sm text-slate-400">No expenses this month</p>
        ) : (
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {methods.map((p) => {
              const pct = methodTotal ? Math.round((p.total / methodTotal) * 100) : 0;
              return (
                <li key={p.method}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{p.method}</span>
                    <span className="tabular text-slate-500">
                      {money(p.total)} <span className="text-slate-400">· {pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
