import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    transactionType: {
      type: String,
      enum: ['Attendance Earnings', 'Advance Payments', 'Salary Settlements'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Dynamic reference depending on transactionType (Attendance, Advance, or Payroll settlement model)
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      required: true,
      enum: ['Attendance', 'Advance', 'Payroll'],
    },
    credit: {
      type: Number,
      default: 0, // Earnings (e.g. Wages earned from attendance)
      min: [0, 'Credit cannot be negative.'],
    },
    debit: {
      type: Number,
      default: 0, // Payouts/Deductions (e.g. Advances paid out or Salary settlements paid)
      min: [0, 'Debit cannot be negative.'],
    },
    balanceAfter: {
      type: Number,
      required: true, // Running balance owed to worker. Positive = Company owes worker. Negative = Worker owes Company.
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LedgerSchema.index({ tenantId: 1, workerId: 1, date: 1 });
LedgerSchema.index({ tenantId: 1, workerId: 1, referenceId: 1 }, { unique: true }); // Prevent duplicate postings for the same entity

export default mongoose.models.Ledger || mongoose.model('Ledger', LedgerSchema);
