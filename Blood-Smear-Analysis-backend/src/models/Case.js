import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
    },
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
    test: {
      type: String,
      default: 'Blood Smear',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Case', caseSchema);
