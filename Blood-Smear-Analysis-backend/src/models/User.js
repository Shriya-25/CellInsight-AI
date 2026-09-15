import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['admin', 'technician', 'pathologist', 'reviewer'],
      default: 'technician',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
