import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatCurrency } from '../../utils/format.js';

function SkeletonCard() {
  return (
    <div className="card p-5 sm:p-6 animate-pulse" aria-busy="true">
      <div className="mb-3 h-4 w-24 rounded bg-slate-100" />
      <div className="mb-2 h-8 w-32 rounded bg-slate-100" />
      <div className="h-3 w-20 rounded bg-slate-50" />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color, currency }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="text-2xl font-extrabold tabular-nums text-slate-900">
        {formatCurrency(value, currency)}
      </p>
      {sub != null && (
        <p className="mt-1 text-xs text-slate-400">{sub}</p>
      )}
    </div>
  );
}

export default function SummaryCards({ summary, loading }) {
  const { currency } = useSettings();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const totals = summary?.totals ?? {};
  const balance   = totals.balance   ?? 0;
  const income    = totals.income    ?? 0;
  const expenses  = totals.expenses  ?? 0;
  const savings   = totals.savings   ?? 0;
  const savingsRate = totals.savingsRate ?? 0;
  const txCount   = totals.transactionCount ?? 0;

  const cards = [
    {
      icon: Wallet,
      label: 'Total Balance',
      value: balance,
      sub: `${txCount} transaction${txCount !== 1 ? 's' : ''} total`,
      color: 'bg-brand-50 text-brand-600',
    },
    {
      icon: TrendingUp,
      label: 'Monthly Income',
      value: income,
      sub: income > 0 ? 'This month' : 'No income recorded',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: TrendingDown,
      label: 'Monthly Expenses',
      value: expenses,
      sub: expenses > 0 ? 'This month' : 'No expenses recorded',
      color: 'bg-rose-50 text-rose-500',
    },
    {
      icon: PiggyBank,
      label: 'Monthly Savings',
      value: savings,
      sub: `${savingsRate}% savings rate`,
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <SummaryCard key={c.label} {...c} currency={currency} />
      ))}
    </div>
  );
}
