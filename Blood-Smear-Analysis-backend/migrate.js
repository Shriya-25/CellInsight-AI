import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CaseSubject from './src/models/CaseSubject.js';
import Case from './src/models/Case.js';
import Report from './src/models/Report.js';
import Counter from './src/models/Counter.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cellinsight';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Migrate Patients
    console.log('\n--- Migrating Patients ---');
    const subjects = await CaseSubject.find().sort({ createdAt: 1 });
    let pCount = 0;
    for (const subject of subjects) {
      pCount++;
      const idStr = String(pCount).padStart(4, '0');
      subject.patientIdentifier = `P-${idStr}`;
      await subject.save();
    }
    await Counter.findByIdAndUpdate('patientId', { seq: pCount }, { upsert: true });
    console.log(`Migrated ${pCount} patients.`);

    // 2. Migrate Cases
    console.log('\n--- Migrating Cases ---');
    const cases = await Case.find().sort({ createdAt: 1 });
    let sCount = 0;
    for (const c of cases) {
      sCount++;
      const idStr = String(sCount).padStart(4, '0');
      c.caseId = `S-${idStr}`;
      
      // Fix invalid old enum values
      if (c.status === 'review_pending') {
        c.status = 'review_required';
      }
      
      await c.save();
    }
    await Counter.findByIdAndUpdate('caseId', { seq: sCount }, { upsert: true });
    console.log(`Migrated ${sCount} cases.`);

    // 3. Migrate Reports
    console.log('\n--- Migrating Reports ---');
    const reports = await Report.find().sort({ createdAt: 1 });
    let rCount = 0;
    for (const r of reports) {
      rCount++;
      const idStr = String(rCount).padStart(4, '0');
      r.reportId = `R-${idStr}`;
      await r.save();
    }
    await Counter.findByIdAndUpdate('reportId', { seq: rCount }, { upsert: true });
    console.log(`Migrated ${rCount} reports.`);

    console.log('\nMigration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
