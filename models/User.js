import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the user name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      select: false, // Prevents password leak in general queries
    },
    role: {
      type: String,
      enum: ['contractor', 'accountant', 'supervisor'],
      default: 'contractor', // Contractor = Admin of the tenant
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Every user must belong to a tenant/company.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compounded indexes for fast user lookup and authorization queries
UserSchema.index({ email: 1 });
UserSchema.index({ tenantId: 1, role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
