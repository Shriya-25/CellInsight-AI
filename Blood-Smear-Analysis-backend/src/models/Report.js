import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      comment: 'The content of the report or a path to a PDF',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Report', reportSchema);
