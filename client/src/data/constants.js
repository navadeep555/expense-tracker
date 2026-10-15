import {
  Briefcase,
  CircleDollarSign,
  Film,
  GraduationCap,
  Gift,
  HeartPulse,
  Home,
  Laptop,
  MoreHorizontal,
  Plane,
  ShoppingBag,
  TrendingUp,
  Car,
  Utensils,
  Zap,
} from 'lucide-react';

// Keep these lists in sync with server/src/constants.js
export const EXPENSE_CATEGORIES = [
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

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income'];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'];

// icon + colour per category (colour is reused by the donut chart)
export const CATEGORY_META = {
  'Food & Dining': { icon: Utensils, color: '#f59e0b' },
  Shopping: { icon: ShoppingBag, color: '#8b5cf6' },
  Transport: { icon: Car, color: '#3b82f6' },
  'Rent & Housing': { icon: Home, color: '#ec4899' },
  'Bills & Utilities': { icon: Zap, color: '#14b8a6' },
  Health: { icon: HeartPulse, color: '#ef4444' },
  Entertainment: { icon: Film, color: '#f97316' },
  Education: { icon: GraduationCap, color: '#6366f1' },
  Travel: { icon: Plane, color: '#06b6d4' },
  Other: { icon: MoreHorizontal, color: '#64748b' },
  Salary: { icon: Briefcase, color: '#10b981' },
  Freelance: { icon: Laptop, color: '#059669' },
  Investments: { icon: TrendingUp, color: '#0d9488' },
  Gifts: { icon: Gift, color: '#22c55e' },
  'Other Income': { icon: CircleDollarSign, color: '#16a34a' },
};

export const getCategoryMeta = (name) =>
  CATEGORY_META[name] || { icon: MoreHorizontal, color: '#64748b' };

export const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
];

// Suggested monthly limits used by the Budgets page until the user edits them
export const DEFAULT_BUDGETS = {
  'Food & Dining': 8000,
  Shopping: 6000,
  Transport: 2500,
  'Rent & Housing': 14000,
  'Bills & Utilities': 4500,
  Health: 2000,
  Entertainment: 2500,
  Education: 3000,
  Travel: 5000,
  Other: 1500,
};
