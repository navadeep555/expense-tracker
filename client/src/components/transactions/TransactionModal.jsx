import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { useTransactions } from '../../context/TransactionsContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../data/constants.js';
import { today } from '../../utils/format.js';
import { validateTransactionForm } from '../../utils/validation.js';

const CURRENCY_SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export default function TransactionModal() {
  const { modal, closeModal, addTransaction, editTransaction, month } = useTransactions();
  const { currency } = useSettings();
  const editing = modal.editing;

  // default the date into the month being viewed (today if it's the current month)
  const defaultDate = today().slice(0, 7) === month ? today() : `${month}-01`;

  const [form, setForm] = useState(() =>
    editing
      ? {
          type: editing.type,
          amount: String(editing.amount),
          category: editing.category,
          date: editing.date.slice(0, 10),
          paymentMethod: editing.paymentMethod,
          note: editing.note || '',
        }
      : { type: 'expense', amount: '', category: '', date: defaultDate, paymentMethod: 'UPI', note: '' }
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError('');
  };

  const setType = (type) => {
    setForm((f) => ({ ...f, type, category: '' }));
    setErrors((e) => ({ ...e, category: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateTransactionForm(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const payload = {
      type: form.type,
      amount: Math.round(Number(form.amount) * 100) / 100,
      category: form.category,
      date: form.date,
      paymentMethod: form.paymentMethod,
      note: form.note.trim(),
    };

    setSaving(true);
    try {
      if (editing) await editTransaction(editing.id, payload);
      else await addTransaction(payload);
      closeModal();
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      setFormError(err.message || 'Could not save the transaction');
      setSaving(false);
    }
  };

  const isIncome = form.type === 'income';

  return (
    <Modal
      title={editing ? 'Edit transaction' : 'Add transaction'}
      subtitle={editing ? 'Update the details below' : 'Record a new income or expense'}
      onClose={saving ? () => {} : closeModal}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {/* type toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          {[
            { value: 'expense', label: 'Expense', icon: ArrowUpRight, on: 'text-rose-600' },
            { value: 'income', label: 'Income', icon: ArrowDownLeft, on: 'text-brand-600' },
          ].map(({ value, label, icon: Icon, on }) => (
            <button
              type="button"
              key={value}
              onClick={() => setType(value)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                form.type === value ? `bg-white shadow-sm ${on}` : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <Field label="Amount" error={errors.amount}>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold ${
                isIncome ? 'text-brand-600' : 'text-rose-500'
              }`}
            >
              {CURRENCY_SYMBOL[currency] || currency}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              className={`input !pl-9 text-base font-semibold ${errors.amount ? 'input-error' : ''}`}
            />
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" error={errors.category}>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={`input ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={`input ${errors.date ? 'input-error' : ''}`}
            />
          </Field>
        </div>

        <Field label="Payment method" error={errors.paymentMethod}>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => set('paymentMethod', m)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  form.paymentMethod === m
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Note (optional)" error={errors.note} hint={`${form.note.length}/200`}>
          <textarea
            rows={2}
            maxLength={200}
            placeholder="e.g. Lunch with friends"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            className={`input resize-none ${errors.note ? 'input-error' : ''}`}
          />
        </Field>

        {formError && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={closeModal} disabled={saving} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary min-w-[9rem]">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
