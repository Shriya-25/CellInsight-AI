import Counter from '../models/Counter.js';

/**
 * Atomically generates a formatted sequential ID.
 * @param {string} counterName The ID of the counter document (e.g. 'patientId', 'caseId', 'reportId')
 * @param {string} prefix The prefix for the ID (e.g. 'P-', 'S-', 'R-')
 * @returns {Promise<string>} The formatted ID (e.g. 'P-0001')
 */
export async function generateNextId(counterName, prefix) {
  const counter = await Counter.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  // Zero-pad to 4 digits
  const paddedSeq = String(counter.seq).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}
