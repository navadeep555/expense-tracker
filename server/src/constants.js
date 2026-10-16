// Keep these lists in sync with client/src/data/constants.js
const TYPES = ['income', 'expense'];

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Rent & Housing',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Travel',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income'];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'];

module.exports = { TYPES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS };
