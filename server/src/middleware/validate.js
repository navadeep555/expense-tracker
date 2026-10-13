const mongoose = require('mongoose');
const {
  TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} = require('../constants');

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(str) {
  if (!DATE_RE.test(str)) return false;
  const d = new Date(`${str}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

/**
 * Validates the body of POST / PUT. Responds 400 with { message, errors: { field: msg } }.
 * Normalises values into req.cleanBody.
 */
function validateTransaction(req, res, next) {
  const b = req.body || {};
  const errors = {};

  const amount = Number(b.amount);
  if (b.amount === undefined || b.amount === '' || Number.isNaN(amount)) {
    errors.amount = 'Amount is required and must be a number';
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (amount > 1e9) {
    errors.amount = 'Amount is too large';
  }

  if (!TYPES.includes(b.type)) errors.type = 'Type must be income or expense';

  const allowedCategories = b.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!b.category) errors.category = 'Category is required';
  else if (TYPES.includes(b.type) && !allowedCategories.includes(b.category)) {
    errors.category = `Invalid category for ${b.type}`;
  }

  if (!b.date) errors.date = 'Date is required';
  else if (!isValidDate(String(b.date).slice(0, 10))) errors.date = 'Date must be a valid YYYY-MM-DD';

  if (!PAYMENT_METHODS.includes(b.paymentMethod)) errors.paymentMethod = 'Invalid payment method';

  if (b.note !== undefined && b.note !== null && String(b.note).length > 200) {
    errors.note = 'Note can be at most 200 characters';
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.cleanBody = {
    amount: Math.round(amount * 100) / 100,
    type: b.type,
    category: b.category,
    date: new Date(`${String(b.date).slice(0, 10)}T00:00:00.000Z`),
    paymentMethod: b.paymentMethod,
    note: (b.note || '').toString().trim(),
  };
  next();
}

function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid transaction id' });
  }
  next();
}

function validateMonthQuery(req, res, next) {
  if (req.query.month !== undefined && !MONTH_RE.test(req.query.month)) {
    return res.status(400).json({ message: 'month must be in YYYY-MM format, e.g. 2026-10' });
  }
  next();
}

module.exports = { validateTransaction, validateObjectId, validateMonthQuery };
