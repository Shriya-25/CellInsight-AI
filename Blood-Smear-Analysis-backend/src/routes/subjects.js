import express from 'express';
import CaseSubject from '../models/CaseSubject.js';

const router = express.Router();

// GET /api/subjects - List all patients
router.get('/', async (req, res) => {
  try {
    const CaseSubject = (await import('../models/CaseSubject.js')).default;
    const Case = (await import('../models/Case.js')).default;
    
    const subjects = await CaseSubject.find().sort({ createdAt: -1 }).lean();
    
    // Attach cases for each subject
    const subjectsWithCases = await Promise.all(subjects.map(async (subject) => {
      const cases = await Case.find({ subjectId: subject._id }).sort({ createdAt: -1 }).lean();
      return { ...subject, cases };
    }));
    
    return res.json(subjectsWithCases);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
});

// POST /api/subjects - Create a new patient
router.post('/', async (req, res) => {
  try {
    const { patientIdentifier, name, contact, address, active, demographics } = req.body;
    
    if (!patientIdentifier || !name || !contact) {
      return res.status(400).json({ error: 'patientIdentifier, name, and contact are required.' });
    }

    const newSubject = new CaseSubject({
      patientIdentifier,
      name,
      contact,
      address,
      active: active || false,
      demographics: demographics || {}
    });

    const savedSubject = await newSubject.save();
    return res.status(201).json(savedSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'patientIdentifier must be unique.' });
    }
    return res.status(500).json({ error: 'Failed to create subject.' });
  }
});

// GET /api/subjects/:id - Get a single patient
router.get('/:id', async (req, res) => {
  try {
    const subject = await CaseSubject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    return res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return res.status(500).json({ error: 'Failed to fetch subject.' });
  }
});

// PUT /api/subjects/:id - Update a patient
router.put('/:id', async (req, res) => {
  try {
    const { name, contact, address, active, demographics } = req.body;
    
    // Do not allow patientIdentifier update
    const updateData = {};
    if (name) updateData.name = name;
    if (contact) updateData.contact = contact;
    if (address !== undefined) updateData.address = address;
    if (active !== undefined) updateData.active = active;
    if (demographics) updateData.demographics = demographics;

    const updatedSubject = await CaseSubject.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) return res.status(404).json({ error: 'Subject not found.' });
    return res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return res.status(500).json({ error: 'Failed to update subject.' });
  }
});

// DELETE /api/subjects/:id - Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    const deletedSubject = await CaseSubject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }
    
    // Find all cases for this subject
    const Case = (await import('../models/Case.js')).default;
    const ImageModel = (await import('../models/Image.js')).default;
    const Analysis = (await import('../models/Analysis.js')).default;
    
    const cases = await Case.find({ subjectId: req.params.id });
    if (cases.length > 0) {
      const caseIds = cases.map(c => c._id);
      
      const images = await ImageModel.find({ caseId: { $in: caseIds } });
      if (images.length > 0) {
        const imageIds = images.map(img => img._id);
        await Analysis.deleteMany({ imageId: { $in: imageIds } });
        await ImageModel.deleteMany({ caseId: { $in: caseIds } });
      }
      
      await Case.deleteMany({ subjectId: req.params.id });
    }
    
    return res.json({ message: 'Patient deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({ error: 'Failed to delete subject.' });
  }
});

export default router;
