import mongoose from 'mongoose';

const PayrollSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    presentDays: {
      type: Number,
      required: true,
      default: 0,
    },
    grossEarnings: {
      type: Number,
      required: true,
      min: [0, 'Gross earnings cannot be negative.'],
    },
    advanceDeductions: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Deductions cannot be negative.'],
    },
    netAmountPaid: {
      type: Number,
      required: true,
      min: [0, 'Amount paid cannot be negative.'],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI'],
      required: true,
      default: 'Cash',
    },
    status: {
      type: String,
      enum: ['paid', 'partially_paid'],
      default: 'paid',
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentNotes: {
      type: String,
      trim: true,
    },
    transactionReference: {
      type: String, // Bank UTR or UPI Txn ID
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PayrollSchema.index({ tenantId: 1, workerId: 1, periodEnd: -1 });
PayrollSchema.index({ tenantId: 1, paymentDate: -1 });

export default mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
