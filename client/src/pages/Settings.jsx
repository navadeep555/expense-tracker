import { Database, RefreshCw, RotateCcw, Server } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { useTransactions } from '../context/TransactionsContext.jsx';
import { CURRENCIES } from '../data/constants.js';

export default function Settings() {
  const { name, currency, update } = useSettings();
  const { mode, retryConnection, resetDemoData } = useTransactions();
  const api = mode === 'api';

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:hidden">Settings</h2>
        <p className="text-sm text-slate-500">Personalise the app and check your backend connection.</p>
      </div>

      <section className="card space-y-5 p-5 sm:p-6">
        <h3 className="text-base font-bold text-slate-900">Profile & preferences</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Display name
            </label>
            <input
              id="name"
              className="input"
              value={name}
              maxLength={30}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="currency" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Currency
            </label>
            <select id="currency" className="input" value={currency} onChange={(e) => update({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400">Saved automatically in this browser.</p>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              api ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {api ? <Server className="h-5 w-5" /> : <Database className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Data source</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {api
                ? 'Connected to the Express API and MongoDB. Everything you add is stored in your database.'
                : 'The backend was not detected, so the app is using sample data stored in this browser. Start the server (see README) and retry.'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              api ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {api ? 'MongoDB' : 'Demo'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={retryConnection}>
            <RefreshCw className="h-4 w-4" /> Check backend connection
          </button>
          {!api && (
            <button className="btn-ghost" onClick={resetDemoData}>
              <RotateCcw className="h-4 w-4" /> Reset sample data
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
