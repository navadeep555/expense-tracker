import { useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import MonthSelector from './MonthSelector.jsx';
import { NAV_ITEMS } from './Sidebar.jsx';
import { useTransactions } from '../../context/TransactionsContext.jsx';

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { openAdd } = useTransactions();
  const current = NAV_ITEMS.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden text-xl font-bold tracking-tight text-slate-900 sm:block">
        {current?.label || 'Dashboard'}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <MonthSelector />
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}
