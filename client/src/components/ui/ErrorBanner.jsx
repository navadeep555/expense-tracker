import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-rose-700">Something went wrong</p>
        <p className="text-sm text-rose-600">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost !py-2 text-rose-600">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}
