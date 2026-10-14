import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useSettings } from '../../context/SettingsContext.jsx';
import { getCategoryMeta } from '../../data/constants.js';
import { formatCurrency } from '../../utils/format.js';

const MAX_SLICES = 5;

export default function CategoryDonut({ summary, loading }) {
  const { currency } = useSettings();

  const rows = summary?.categoryBreakdown || [];
  const top = rows.slice(0, MAX_SLICES).map((r) => ({
    name: r.category,
    value: r.total,
    pct: r.percentage,
    color: getCategoryMeta(r.category).color,
  }));
  const rest = rows.slice(MAX_SLICES);
  if (rest.length) {
    top.push({
      name: 'Others',
      value: rest.reduce((s, r) => s + r.total, 0),
      pct: Math.round(rest.reduce((s, r) => s + r.percentage, 0) * 10) / 10,
      color: '#cbd5e1',
    });
  }
  const total = summary?.totals.expenses || 0;

  return (
    <section className="card flex flex-col p-5 sm:p-6">
      <div className="mb-2">
        <h2 className="text-base font-bold text-slate-900">Spending by Category</h2>
        <p className="text-sm text-slate-500">Where your money went this month</p>
      </div>

      {loading ? (
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-slate-50" aria-busy="true" />
      ) : !top.length ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">No expenses this month</div>
      ) : (
        <>
          <div className="relative mx-auto h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={top.length > 1 ? 3 : 0}
                  cornerRadius={6}
                  stroke="none"
                >
                  {top.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v, currency)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -10px rgba(10,17,40,.25)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-slate-400">Total spent</span>
              <span className="tabular text-lg font-extrabold text-slate-900">
                {formatCurrency(total, currency, { compact: total >= 1e6 })}
              </span>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {top.map((s) => (
              <li key={s.name} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 truncate text-slate-600">{s.name}</span>
                <span className="tabular font-semibold text-slate-900">{formatCurrency(s.value, currency)}</span>
                <span className="w-11 text-right text-xs text-slate-400">{s.pct}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
