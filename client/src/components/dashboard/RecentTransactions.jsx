import { Link } from 'react-router-dom';
import { ArrowRight, Plus, SearchX, Receipt } from 'lucide-react';
import FilterBar from '../transactions/FilterBar.jsx';
import TransactionsTable from '../transactions/TransactionsTable.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useTransactions } from '../../context/TransactionsContext.jsx';
import { monthLabel } from '../../utils/format.js';

export default function RecentTransactions() {
  const {
    filtered,
    transactions,
    loading,
    month,
    openAdd,
    openEdit,
    requestDelete,
    clearFilters,
  } = useTransactions();

  const items = filtered.slice(0, 6);
  const noData = !loading && transactions.length === 0;

  const emptyState = noData ? (
    <EmptyState
      icon={Receipt}
      title={`No transactions in ${monthLabel(month)}`}
      text="Add your first income or expense to see it here."
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
      text="Try a different search term or clear the filters."
      action={
        <button onClick={clearFilters} className="btn-ghost">
          Clear filters
        </button>
      }
    />
  );

  return (
    <section className="card overflow-hidden">
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-sm text-slate-500">{monthLabel(month)}</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <FilterBar />
      </div>
      <div className="border-t border-slate-100">
        <TransactionsTable
          items={items}
          loading={loading}
          rows={6}
          onEdit={openEdit}
          onDelete={requestDelete}
          emptyState={emptyState}
        />
      </div>
    </section>
  );
}
