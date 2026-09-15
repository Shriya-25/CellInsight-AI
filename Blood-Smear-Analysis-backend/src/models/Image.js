import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    filePath: {
      type: String,
      required: true,
      comment: 'Path or URL to the stored image file (not the binary)',
    },
    metadata: {
      originalName: String,
      mimeType: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Image', imageSchema);
