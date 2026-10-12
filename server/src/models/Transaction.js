const mongoose = require('mongoose');
const { TYPES, PAYMENT_METHODS } = require('../constants');

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: { values: TYPES, message: 'Type must be income or expense' },
      required: [true, 'Type is required'],
    },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'], index: true },
    paymentMethod: {
      type: String,
      enum: { values: PAYMENT_METHODS, message: 'Invalid payment method' },
      required: [true, 'Payment method is required'],
    },
    note: { type: String, trim: true, maxlength: [200, 'Note can be at most 200 characters'], default: '' },
  },
  { timestamps: true }
);

// Fast month / type queries and aggregation
transactionSchema.index({ date: -1, type: 1 });

// Return `id` instead of `_id`, and date as YYYY-MM-DD to avoid time-zone shifts in the UI
transactionSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    ret.date = ret.date.toISOString().slice(0, 10);
    return ret;
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
