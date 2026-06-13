import mongoose from 'mongoose';

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
});

const WorkerSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Every worker must belong to a tenant.'],
    },
    name: {
      type: String,
      required: [true, 'Please specify the worker name.'],
      trim: true,
    },
    photo: {
      type: String, // Cloudinary URL
      default: '',
    },
    mobileNumber: {
      type: String,
      required: [true, 'Worker mobile number is required.'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String, // e.g. 'Mason', 'Helper', 'Supervisor', 'Carpenter', 'Bar Bender'
      required: [true, 'Worker role is required.'],
      trim: true,
    },
    dailyWage: {
      type: Number,
      required: [true, 'Please specify the daily wage amount.'],
      min: [0, 'Daily wage cannot be negative.'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    aadhaarNumber: {
      type: String,
      required: [true, 'Aadhaar number is required for verification.'],
      trim: true,
    },
    emergencyContact: {
      type: EmergencyContactSchema,
      required: [true, 'Emergency contact is required.'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WorkerSchema.index({ tenantId: 1, name: 1 });
WorkerSchema.index({ tenantId: 1, status: 1 });
WorkerSchema.index({ tenantId: 1, aadhaarNumber: 1 }, { unique: true }); // Prevent duplicate worker registrations within the platform

export default mongoose.models.Worker || mongoose.model('Worker', WorkerSchema);
