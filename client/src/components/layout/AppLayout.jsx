import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Database, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import TransactionModal from '../transactions/TransactionModal.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { useTransactions } from '../../context/TransactionsContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatCurrency } from '../../utils/format.js';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mode, modal, pendingDelete, cancelDelete, confirmDelete, retryConnection } =
    useTransactions();
  const { currency } = useSettings();

  return (
    <div className="flex h-full">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} />

        {mode === 'demo' && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:px-6 lg:px-8">
            <Database className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              <strong>Demo mode:</strong> backend not detected, showing sample data saved in this browser.
            </span>
            <button
              onClick={retryConnection}
              className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Retry connection
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {modal.open && <TransactionModal />}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`This will permanently remove ${
            pendingDelete.note || pendingDelete.category
          } (${formatCurrency(pendingDelete.amount, currency, { decimals: true })}). This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
