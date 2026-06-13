import mongoose from 'mongoose';

const AdvanceSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Advance amount is required.'],
      min: [1, 'Advance must be greater than zero.'],
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
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AdvanceSchema.index({ tenantId: 1, workerId: 1, date: -1 });
AdvanceSchema.index({ tenantId: 1, date: -1 });

export default mongoose.models.Advance || mongoose.model('Advance', AdvanceSchema);
