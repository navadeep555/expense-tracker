const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns an object of { field: message }. Empty object = valid. */
export function validateTransactionForm(form) {
  const errors = {};

  const amount = Number(form.amount);
  if (form.amount === '' || form.amount === null || Number.isNaN(amount)) {
    errors.amount = 'Enter an amount';
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (amount > 1e9) {
    errors.amount = 'Amount is too large';
  }

  if (!form.category) errors.category = 'Select a category';
  if (!form.paymentMethod) errors.paymentMethod = 'Select a payment method';

  if (!form.date) errors.date = 'Pick a date';
  else if (!DATE_RE.test(form.date) || Number.isNaN(new Date(form.date).getTime())) {
    errors.date = 'Enter a valid date';
  }

  if (form.note && form.note.length > 200) errors.note = 'Note can be at most 200 characters';

  return errors;
}
