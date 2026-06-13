import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required.'],
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required.'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    projectValue: {
      type: Number,
      required: [true, 'Project contract value/revenue is required.'],
      min: [0, 'Project value cannot be negative.'],
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed'],
      default: 'planning',
      required: true,
    },
    assignedWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
ProjectSchema.index({ tenantId: 1, status: 1 });
ProjectSchema.index({ tenantId: 1, name: 1 });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
