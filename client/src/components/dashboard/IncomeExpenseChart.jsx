import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatCurrency, shortMonth } from '../../utils/format.js';

export const COLORS = { income: '#10b981', expense: '#f43f5e' };

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-pop">
      <p className="mb-2 text-xs font-semibold text-slate-500">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="tabular font-bold text-slate-900">{formatCurrency(p.value, currency)}</span>
        </div>
      ))}
    </div>
  );
}

export default function IncomeExpenseChart({ summary, loading }) {
  const { currency } = useSettings();

  const data = (summary?.monthlyTrend || []).map((m) => ({
    name: shortMonth(m.month),
    Income: m.income,
    Expenses: m.expenses,
  }));
  const hasData = data.some((d) => d.Income || d.Expenses);

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Income vs Expenses</h2>
          <p className="text-sm text-slate-500">Last 6 months</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.income }} /> Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.expense }} /> Expenses
          </span>
        </div>
      </div>

      <div className="h-72">
        {loading ? (
          <div className="h-full animate-pulse rounded-xl bg-slate-50" aria-busy="true" />
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No data for this period yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
                width={64}
              />
              <Tooltip cursor={{ fill: '#f1f5f9', radius: 8 }} content={<ChartTooltip currency={currency} />} />
              <Bar dataKey="Income" fill={COLORS.income} radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Expenses" fill={COLORS.expense} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export { ChartTooltip };
