import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Inventory Purchase',
      'Salary',
      'Rent',
      'Utilities',
      'Marketing',
      'Equipment',
      'Maintenance',
      'Transportation',
      'Packaging',
      'Miscellaneous',
      'Other'
    ],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
    default: 'cash'
  },
  paidTo: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ addedBy: 1, date: -1 });

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;

