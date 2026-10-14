import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '../../context/TransactionsContext.jsx';
import { currentMonth, monthLabel, shiftMonth } from '../../utils/format.js';

export default function MonthSelector() {
  const { month, setMonth } = useTransactions();

  // last 18 months up to the current month (plus the selected one if outside)
  const options = [];
  for (let i = 0; i < 18; i += 1) options.push(shiftMonth(currentMonth(), -i));
  if (!options.includes(month)) options.unshift(month);

  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setMonth(shiftMonth(month, -1))}
        className="rounded-l-xl p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <label className="relative">
        <span className="sr-only">Select month</span>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="cursor-pointer appearance-none bg-transparent px-2 py-2 text-center text-sm font-semibold text-slate-800 focus:outline-none sm:px-4"
        >
          {options.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => setMonth(shiftMonth(month, 1))}
        disabled={month >= currentMonth()}
        className="rounded-r-xl p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
