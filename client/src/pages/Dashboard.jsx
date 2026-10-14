import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart.jsx';
import CategoryDonut from '../components/dashboard/CategoryDonut.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import { useTransactions } from '../context/TransactionsContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { monthLabel } from '../utils/format.js';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const { summary, loading, error, reload, month } = useTransactions();
  const { name } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:hidden">Dashboard</h2>
        <p className="text-sm text-slate-500">
          {greeting()}, <span className="font-semibold text-slate-700">{name}</span> 👋 Here’s your
          financial overview for {monthLabel(month)}.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <IncomeExpenseChart summary={summary} loading={loading} />
        </div>
        <div className="xl:col-span-2">
          <CategoryDonut summary={summary} loading={loading} />
        </div>
      </div>

      <RecentTransactions />
    </div>
  );
}
