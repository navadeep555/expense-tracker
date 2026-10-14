import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  Target,
  TrendingUp,
  X,
  LogOut,
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { mode } = useTransactions();
  const { user, logout } = useAuth();
  const displayName = user?.username || 'User';

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-900 px-5 py-6 text-slate-300 transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0 lg:animate-none ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
              <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">Spendwise</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.9} />
                  {label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {displayName[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${mode === 'api' ? 'bg-brand-400' : 'bg-amber-400'}`}
                />
                {mode === 'api' ? 'Connected to MongoDB' : 'Offline'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
