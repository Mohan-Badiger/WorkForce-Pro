import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
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
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Attendance must be logged against an active project.'],
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day'],
      default: 'present',
      required: true,
    },
    wageEarned: {
      type: Number,
      required: true,
      default: 0, // 0 for absent, dailyWage for present, dailyWage/2 for half-day
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Compounded unique index ensures a worker has exactly one attendance record per day
AttendanceSchema.index({ tenantId: 1, workerId: 1, date: 1 }, { unique: true });
// Index for report generation (monthly attendance sheets)
AttendanceSchema.index({ tenantId: 1, date: 1 });
// Index for calculating project-wise worker cost
AttendanceSchema.index({ projectId: 1, date: 1 });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
