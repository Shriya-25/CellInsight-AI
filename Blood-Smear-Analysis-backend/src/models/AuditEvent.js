import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      comment: 'e.g., CASE_CREATED, REVIEW_ADDED, ANALYSIS_RUN',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetResource: {
      resourceType: String,
      resourceId: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AuditEvent', auditEventSchema);
