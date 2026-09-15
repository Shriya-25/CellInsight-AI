import mongoose from 'mongoose';

const caseSubjectSchema = new mongoose.Schema(
  {
    patientIdentifier: {
      type: String,
      required: true,
      unique: true,
      comment: 'Anonymized or hashed identifier for the patient',
    },
    demographics: {
      age: Number,
      gender: String,
      // Add more demographic fields as needed safely
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CaseSubject', caseSubjectSchema);
