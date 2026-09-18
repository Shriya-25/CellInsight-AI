import mongoose from 'mongoose';

const caseSubjectSchema = new mongoose.Schema(
  {
    patientIdentifier: {
      type: String,
      required: true,
      unique: true,
      comment: 'Anonymized or hashed identifier for the patient',
    },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String },
    active: { type: Boolean, default: false },
    demographics: {
      age: Number,
      gender: String,
      blood: String,
      weight: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CaseSubject', caseSubjectSchema);
