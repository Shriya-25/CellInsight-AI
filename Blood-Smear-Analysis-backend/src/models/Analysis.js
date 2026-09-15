import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true,
    },
    type: {
      type: String,
      required: true,
      comment: 'e.g., BloodSmear, BoneMarrow',
    },
    confidence: {
      type: Number,
      comment: 'Overall confidence score from the AI model',
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      comment: 'JSON payload of analysis results (e.g., cell counts, percentages)',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Analysis', analysisSchema);
