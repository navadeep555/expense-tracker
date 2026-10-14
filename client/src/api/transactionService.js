/**
 * Single place where the UI talks to data.
 *
 *  - API mode : calls the Express/MongoDB backend (REST).
 *  - Demo mode: if the backend can't be reached, falls back to realistic sample data
 *               stored in localStorage, so the UI is fully usable on its own.
 *
 * Every function returns the same JSON shapes in both modes.
 */
import { generateSampleTransactions } from '../data/sampleTransactions.js';
import { computeSummary } from '../utils/summary.js';

const BASE = import.meta.env.VITE_API_URL || '/api';
const FORCE_DEMO = import.meta.env.VITE_FORCE_DEMO === 'true';
const STORE_KEY = 'spendwise_demo_transactions_v1';

let mode = FORCE_DEMO ? 'demo' : 'unknown'; // 'unknown' | 'api' | 'demo'
export const getMode = () => mode;
export const resetMode = () => {
  mode = FORCE_DEMO ? 'demo' : 'unknown';
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ REST */
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    const err = new Error('Cannot reach the server');
    err.isNetwork = true;
    throw err;
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!isJson) {
    // e.g. the dev proxy answering with an empty 500 when the API is down
    const err = new Error('Cannot reach the server');
    err.isNetwork = true;
    throw err;
  }

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.fieldErrors = data.errors;
    throw err;
  }
  return data;
}

/* ------------------------------------------------------------ demo store */
function loadDemo() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seeded = generateSampleTransactions();
  saveDemo(seeded);
  return seeded;
}

function saveDemo(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: data lives for this session only */
  }
}

let memoryFallback = null; // used only if localStorage is blocked
const getDemo = () => (memoryFallback ??= loadDemo());
const setDemo = (list) => {
  memoryFallback = list;
  saveDemo(list);
};

const sortTx = (list) =>
  [...list].sort((a, b) => (a.date === b.date ? (a.id < b.id ? 1 : -1) : a.date < b.date ? 1 : -1));

const demo = {
  async list(month) {
    await delay(250);
    return sortTx(getDemo().filter((t) => t.date.slice(0, 7) === month));
  },
  async summary(month) {
    await delay(250);
    return computeSummary(getDemo(), month);
  },
  async create(body) {
    await delay(300);
    const tx = { ...body, id: `demo-${Date.now()}` };
    setDemo([tx, ...getDemo()]);
    return tx;
  },
  async update(id, body) {
    await delay(300);
    const list = getDemo();
    if (!list.some((t) => t.id === id)) throw Object.assign(new Error('Transaction not found'), { status: 404 });
    const tx = { ...body, id };
    setDemo(list.map((t) => (t.id === id ? tx : t)));
    return tx;
  },
  async remove(id) {
    await delay(250);
    setDemo(getDemo().filter((t) => t.id !== id));
    return { message: 'Transaction deleted', id };
  },
};

/* ------------------------------------------------- always use real API */
async function run(remote) {
  const result = await remote();
  mode = 'api';
  return result;
}

const json = (body) => JSON.stringify(body);

export const transactionService = {
  list: (month) =>
    run(() => request(`/transactions?month=${encodeURIComponent(month)}`), () => demo.list(month)),

  summary: (month) =>
    run(() => request(`/transactions/summary?month=${encodeURIComponent(month)}`), () => demo.summary(month)),

  create: (body) =>
    run(() => request('/transactions', { method: 'POST', body: json(body) }), () => demo.create(body)),

  update: (id, body) =>
    run(() => request(`/transactions/${id}`, { method: 'PUT', body: json(body) }), () => demo.update(id, body)),

  remove: (id) =>
    run(() => request(`/transactions/${id}`, { method: 'DELETE' }), () => demo.remove(id)),

  /** Demo mode only: restore the original sample data */
  resetDemo() {
    setDemo(generateSampleTransactions());
  },
};
