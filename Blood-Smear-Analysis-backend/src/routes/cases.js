import express from 'express';
import Case from '../models/Case.js';

const router = express.Router();

// POST /api/cases - Create a new case
router.post('/', async (req, res) => {
  try {
    const { subjectId, status, assignedTo, notes } = req.body;
    
    // Basic validation
    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId is required.' });
    }

    const newCase = new Case({
      subjectId,
      status: status || 'draft',
      assignedTo,
      notes,
    });

    const savedCase = await newCase.save();
    return res.status(201).json(savedCase);
  } catch (error) {
    console.error('Error creating case:', error);
    return res.status(500).json({ error: 'Failed to create case.' });
  }
});

// GET /api/cases - Get a list of cases
router.get('/', async (req, res) => {
  try {
    const cases = await Case.find().populate('subjectId').populate('assignedTo', 'name email role');
    return res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return res.status(500).json({ error: 'Failed to fetch cases.' });
  }
});

// GET /api/cases/:id - Get a single case by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = await Case.findById(id).populate('subjectId').populate('assignedTo', 'name email role');
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    
    return res.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    return res.status(500).json({ error: 'Failed to fetch case.' });
  }
});

export default router;
