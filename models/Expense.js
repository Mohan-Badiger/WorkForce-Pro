import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null, // Null means general company overhead expense
    },
    category: {
      type: String,
      enum: ['Material', 'Transport', 'Food', 'Equipment', 'Miscellaneous'],
      required: [true, 'Please specify an expense category.'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the expense amount.'],
      min: [0.01, 'Expense amount must be greater than zero.'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiptUrl: {
      type: String, // Cloudinary link for expense bills
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ExpenseSchema.index({ tenantId: 1, category: 1, date: -1 });
ExpenseSchema.index({ projectId: 1, date: -1 }); // Quick project profit calculations
ExpenseSchema.index({ tenantId: 1, date: -1 });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
