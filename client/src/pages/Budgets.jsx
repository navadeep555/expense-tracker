import { useState } from 'react';
import { Check, Pencil, Target } from 'lucide-react';
import CategoryIcon from '../components/transactions/CategoryIcon.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import { useTransactions } from '../context/TransactionsContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { DEFAULT_BUDGETS, EXPENSE_CATEGORIES } from '../data/constants.js';
import { formatCurrency, monthLabel } from '../utils/format.js';

function BudgetCard({ category, limit, spent, currency, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(limit));

  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const state = pct > 100 ? 'over' : pct >= 75 ? 'warn' : 'ok';
  const bar = { ok: 'bg-brand-500', warn: 'bg-amber-400', over: 'bg-rose-500' }[state];
  const label = {
    ok: ['On track', 'bg-brand-50 text-brand-700'],
    warn: [pct >= 100 ? 'Limit reached' : 'Almost there', 'bg-amber-50 text-amber-700'],
    over: ['Over budget', 'bg-rose-50 text-rose-600'],
  }[state];

  const save = () => {
    const n = Number(draft);
    if (Number.isFinite(n) && n > 0) onSave(Math.round(n));
    else setDraft(String(limit));
    setEditing(false);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <CategoryIcon category={category} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{category}</p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${label[1]}`}>
            {label[0]}
          </span>
        </div>
        {editing ? (
          <button onClick={save} className="rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600" aria-label="Save budget">
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              setDraft(String(limit));
              setEditing(true);
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Edit ${category} budget`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>

      <div className="mt-3 flex items-end justify-between text-sm">
        <div>
          <p className="tabular font-extrabold text-slate-900">{formatCurrency(spent, currency)}</p>
          <p className="text-xs text-slate-400">spent</p>
        </div>
        <div className="text-right">
          {editing ? (
            <input
              type="number"
              min="1"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className="input !w-28 !py-1.5 text-right"
              aria-label={`${category} budget limit`}
            />
          ) : (
            <p className="tabular font-semibold text-slate-600">{formatCurrency(limit, currency)}</p>
          )}
          <p className="text-xs text-slate-400">
            {limit - spent >= 0
              ? `${formatCurrency(limit - spent, currency)} left`
              : `${formatCurrency(spent - limit, currency)} over`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Budgets() {
  const { summary, loading, error, reload, month } = useTransactions();
  const { currency } = useSettings();
  const [budgets, setBudgets] = useLocalStorage('spendwise_budgets', DEFAULT_BUDGETS);

  const spentBy = Object.fromEntries((summary?.categoryBreakdown || []).map((c) => [c.category, c.total]));
  const limitOf = (c) => budgets[c] ?? DEFAULT_BUDGETS[c] ?? 1000;

  const totalLimit = EXPENSE_CATEGORIES.reduce((s, c) => s + limitOf(c), 0);
  const totalSpent = EXPENSE_CATEGORIES.reduce((s, c) => s + (spentBy[c] || 0), 0);
  const pct = totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:hidden">Budgets</h2>
        <p className="text-sm text-slate-500">
          Monthly spending limits per category for {monthLabel(month)}. Click the pencil to change a limit.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}

      <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-pop">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500">
            <Target className="h-7 w-7" />
          </div>
          <div className="min-w-[12rem] flex-1">
            <p className="text-sm text-slate-300">Total monthly budget</p>
            <p className="tabular text-3xl font-extrabold">
              {formatCurrency(totalSpent, currency)}{' '}
              <span className="text-base font-medium text-slate-400">/ {formatCurrency(totalLimit, currency)}</span>
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1.5 flex justify-between text-xs text-slate-300">
              <span>{loading ? '…' : `${pct}% used`}</span>
              <span>{formatCurrency(Math.max(0, totalLimit - totalSpent), currency)} left</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-400' : 'bg-brand-400'}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EXPENSE_CATEGORIES.map((c) => (
          <BudgetCard
            key={c}
            category={c}
            limit={limitOf(c)}
            spent={spentBy[c] || 0}
            currency={currency}
            onSave={(n) => setBudgets((b) => ({ ...b, [c]: n }))}
          />
        ))}
      </div>
    </div>
  );
}
