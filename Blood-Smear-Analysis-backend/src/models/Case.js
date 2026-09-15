import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CaseSubject',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'review_required', 'completed', 'approved'],
      default: 'draft',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Case', caseSchema);
