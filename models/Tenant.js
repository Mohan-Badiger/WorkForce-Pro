import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the company/contractor name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a contact email.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'growth', 'enterprise'],
        default: 'growth',
      },
      status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'trialing'],
        default: 'trialing',
      },
      trialEndsAt: {
        type: Date,
        default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TenantSchema.index({ email: 1 });

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
