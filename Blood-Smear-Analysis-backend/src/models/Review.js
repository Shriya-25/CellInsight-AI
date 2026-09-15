import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: {
      type: String,
    },
    flagged: {
      type: Boolean,
      default: false,
      comment: 'Whether the reviewer flagged this case for further review',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Review', reviewSchema);
