import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Plus, Receipt, SearchX } from 'lucide-react';
import FilterBar from '../components/transactions/FilterBar.jsx';
import TransactionsTable from '../components/transactions/TransactionsTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import { useTransactions } from '../context/TransactionsContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatCurrency, monthLabel } from '../utils/format.js';

const PAGE_SIZE = 10;

function exportCsv(rows, month) {
  const header = ['Date', 'Type', 'Category', 'Payment method', 'Amount', 'Note'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((t) => [t.date, t.type, t.category, t.paymentMethod, t.amount, t.note].map(esc).join(','));
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const {
    filtered,
    transactions,
    loading,
    error,
    reload,
    month,
    filters,
    openAdd,
    openEdit,
    requestDelete,
    clearFilters,
  } = useTransactions();
  const { currency } = useSettings();
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [filters, month]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const emptyState =
    transactions.length === 0 ? (
      <EmptyState
        icon={Receipt}
        title={`No transactions in ${monthLabel(month)}`}
        text="Nothing recorded for this month yet. Add your first transaction."
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        }
      />
    ) : (
      <EmptyState
        icon={SearchX}
        title="No matching transactions"
        text="Nothing matches your current filters."
        action={
          <button onClick={clearFilters} className="btn-ghost">
            Clear filters
          </button>
        }
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:hidden">Transactions</h2>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`} in{' '}
            {monthLabel(month)}
          </p>
        </div>
        <button
          onClick={() => exportCsv(filtered, month)}
          disabled={!filtered.length}
          className="btn-ghost"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}

      <section className="card overflow-hidden">
        <div className="p-5 sm:p-6">
          <FilterBar />
        </div>

        <div className="border-t border-slate-100">
          <TransactionsTable
            items={visible}
            loading={loading}
            rows={8}
            onEdit={openEdit}
            onDelete={requestDelete}
            emptyState={emptyState}
          />
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-5">
              <span className="text-slate-500">
                Income <strong className="tabular text-brand-600">+{formatCurrency(income, currency)}</strong>
              </span>
              <span className="text-slate-500">
                Expenses <strong className="tabular text-rose-500">−{formatCurrency(expense, currency)}</strong>
              </span>
            </div>
            {pages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  className="btn-ghost !p-2"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-medium text-slate-500">
                  Page {current} of {pages}
                </span>
                <button
                  className="btn-ghost !p-2"
                  disabled={current === pages}
                  onClick={() => setPage(current + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
