import mongoose from 'mongoose';

const cellSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
    },
    cellType: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
    },
    boundingBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Cell', cellSchema);
