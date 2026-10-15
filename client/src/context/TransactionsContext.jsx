import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getMode, resetMode, transactionService } from '../api/transactionService.js';
import { currentMonth } from '../utils/format.js';
import { useToast } from './ToastContext.jsx';

const TransactionsContext = createContext(null);

const EMPTY_FILTERS = { search: '', category: 'all', type: 'all' };

export function TransactionsProvider({ children }) {
  const toast = useToast();

  const [month, setMonth] = useState(currentMonth());
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(getMode());

  // modal + delete-confirm state (shared so any page can trigger them)
  const [modal, setModal] = useState({ open: false, editing: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  const reqId = useRef(0);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++reqId.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [list, sum] = await Promise.all([
          transactionService.list(month),
          transactionService.summary(month),
        ]);
        if (id !== reqId.current) return; // a newer request superseded this one
        setTransactions(list);
        setSummary(sum);
        setMode(getMode());
      } catch (err) {
        if (id !== reqId.current) return;
        setError(err.message || 'Failed to load transactions');
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [month]
  );

  useEffect(() => {
    load();
  }, [load]);

  /* ------------------------------------------------------------ CRUD */
  const addTransaction = useCallback(
    async (data) => {
      await transactionService.create(data);
      toast.success('Transaction added');
      await load({ silent: true });
    },
    [load, toast]
  );

  const editTransaction = useCallback(
    async (id, data) => {
      await transactionService.update(id, data);
      toast.success('Transaction updated');
      await load({ silent: true });
    },
    [load, toast]
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await transactionService.remove(pendingDelete.id);
      toast.success('Transaction deleted');
      setPendingDelete(null);
      await load({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Could not delete transaction');
      throw err;
    }
  }, [pendingDelete, load, toast]);

  const retryConnection = useCallback(() => {
    resetMode();
    load();
  }, [load]);

  const resetDemoData = useCallback(() => {
    transactionService.resetDemo();
    toast.success('Sample data restored');
    load();
  }, [load, toast]);

  /* --------------------------------------------------------- filters */
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (q) {
        const hay = `${t.note || ''} ${t.category} ${t.paymentMethod}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const value = useMemo(
    () => ({
      month,
      setMonth,
      filters,
      setFilters,
      clearFilters: () => setFilters(EMPTY_FILTERS),
      hasActiveFilters:
        filters.search !== '' || filters.category !== 'all' || filters.type !== 'all',
      transactions,
      filtered,
      summary,
      loading,
      error,
      mode,
      reload: load,
      addTransaction,
      editTransaction,
      retryConnection,
      resetDemoData,
      modal,
      openAdd: () => setModal({ open: true, editing: null }),
      openEdit: (tx) => setModal({ open: true, editing: tx }),
      closeModal: () => setModal({ open: false, editing: null }),
      pendingDelete,
      requestDelete: setPendingDelete,
      cancelDelete: () => setPendingDelete(null),
      confirmDelete,
    }),
    [
      month,
      filters,
      transactions,
      filtered,
      summary,
      loading,
      error,
      mode,
      load,
      addTransaction,
      editTransaction,
      retryConnection,
      resetDemoData,
      modal,
      pendingDelete,
      confirmDelete,
    ]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export const useTransactions = () => useContext(TransactionsContext);
