const LOCALES = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB' };

const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

// 12500 -> "12.5k", 2400000 -> "2.4M" (Intl's compact style gives "T" for thousand in en-IN)
function shortNumber(n) {
  const abs = Math.abs(n);
  const fmt = (v, s) => `${Number.isInteger(v) ? v : v.toFixed(1).replace(/\.0$/, '')}${s}`;
  if (abs >= 1e9) return fmt(n / 1e9, 'B');
  if (abs >= 1e6) return fmt(n / 1e6, 'M');
  if (abs >= 1e3) return fmt(n / 1e3, 'k');
  return String(Math.round(n));
}

export function formatCurrency(amount, currency = 'INR', { decimals = false, compact = false } = {}) {
  const n = Number(amount) || 0;
  if (compact) return `${n < 0 ? '-' : ''}${SYMBOLS[currency] || ''}${shortNumber(Math.abs(n))}`;
  return new Intl.NumberFormat(LOCALES[currency] || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(n);
}

const toUTC = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d || 1));
};

/** "2026-10-15" -> "15 Oct 2026" (no timezone shifts) */
export function formatDate(iso) {
  return toUTC(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "2026-10" -> "October 2026" */
export function monthLabel(month) {
  return toUTC(`${month}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "2026-10" -> "Oct" */
export function shortMonth(month) {
  return toUTC(`${month}-01`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
