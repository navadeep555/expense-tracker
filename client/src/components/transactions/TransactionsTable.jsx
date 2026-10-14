import { CreditCard, Pencil, Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

function Amount({ tx, currency }) {
  const income = tx.type === 'income';
  return (
    <span className={`tabular font-bold ${income ? 'text-brand-600' : 'text-rose-500'}`}>
      {income ? '+' : '−'}
      {formatCurrency(tx.amount, currency, { decimals: true })}
    </span>
  );
}

function TypeBadge({ type }) {
  return type === 'income' ? (
    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">Income</span>
  ) : (
    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">Expense</span>
  );
}

function RowActions({ tx, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onEdit(tx)}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Edit ${tx.note || tx.category}`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(tx)}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
        aria-label={`Delete ${tx.note || tx.category}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Skeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-slate-50" aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <div className="h-11 w-11 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-slate-100" />
            <div className="h-3 w-1/5 rounded bg-slate-100" />
          </div>
          <div className="h-4 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function TransactionsTable({ items, loading, onEdit, onDelete, emptyState, rows }) {
  const { currency } = useSettings();

  if (loading) return <Skeleton rows={rows || 5} />;
  if (!items.length) return emptyState;

  return (
    <>
      {/* desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3">Transaction</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Payment</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((tx) => (
              <tr key={tx.id} className="group transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <CategoryIcon category={tx.category} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{tx.note || tx.category}</p>
                      <p className="text-xs text-slate-400">{tx.category}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-500">{formatDate(tx.date)}</td>
                <td className="px-3 py-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <CreditCard className="h-3.5 w-3.5" /> {tx.paymentMethod}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <TypeBadge type={tx.type} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right text-sm">
                  <Amount tx={tx} currency={currency} />
                </td>
                <td className="px-5 py-3.5">
                  <RowActions tx={tx} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <ul className="divide-y divide-slate-50 md:hidden">
        {items.map((tx) => (
          <li key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
            <CategoryIcon category={tx.category} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{tx.note || tx.category}</p>
              <p className="truncate text-xs text-slate-400">
                {formatDate(tx.date)} · {tx.paymentMethod}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <Amount tx={tx} currency={currency} />
              </p>
              <RowActions tx={tx} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export { Amount, TypeBadge };
