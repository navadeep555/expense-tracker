import { Search, X } from 'lucide-react';
import { useTransactions } from '../../context/TransactionsContext.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../data/constants.js';

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export default function FilterBar() {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useTransactions();
  const patch = (p) => setFilters((f) => ({ ...f, ...p }));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => patch({ search: e.target.value })}
          placeholder="Search notes, categories, payment method…"
          className="input !pl-10"
          aria-label="Search transactions"
        />
      </div>

      <select
        value={filters.category}
        onChange={(e) => patch({ category: e.target.value })}
        className="input lg:max-w-[13rem]"
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        <optgroup label="Expenses">
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </optgroup>
        <optgroup label="Income">
          {INCOME_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </optgroup>
      </select>

      <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Filter by type">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => patch({ type: t.value })}
            className={`flex-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition lg:flex-none ${
              filters.type === t.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
