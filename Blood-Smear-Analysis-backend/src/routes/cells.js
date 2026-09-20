import express from 'express';
import Cell from '../models/Cell.js';

const router = express.Router();

// PATCH /api/cells/:id/review - Accept, reclassify, or mark unknown
router.patch('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus, finalLabel, reviewerId, comment } = req.body;

    // We don't overwrite the original AI prediction, we add reviewer data.
    // Ensure the model supports these fields (or we add them).
    const updateData = {
      $set: {}
    };

    if (reviewStatus) updateData.$set.reviewStatus = reviewStatus; // e.g. 'accepted', 'reclassified', 'unknown'
    if (finalLabel) updateData.$set.finalLabel = finalLabel;
    if (reviewerId) updateData.$set.reviewerId = reviewerId;
    if (comment) updateData.$set.comment = comment;

    const updatedCell = await Cell.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedCell) {
      return res.status(404).json({ error: 'Cell not found.' });
    }

    // Log to AuditEvent
    if (reviewerId) {
      const AuditEvent = (await import('../models/AuditEvent.js')).default;
      const Analysis = (await import('../models/Analysis.js')).default;
      
      const analysis = await Analysis.findById(updatedCell.analysisId);
      const caseId = analysis ? analysis.caseId : null;

      await AuditEvent.create({
        action: 'CELL_REVIEWED',
        performedBy: reviewerId,
        targetResource: {
          resourceType: 'Cell',
          resourceId: updatedCell._id
        },
        details: {
          reviewStatus,
          finalLabel,
          comment
        }
      });
    }

    return res.json(updatedCell);
  } catch (error) {
    console.error('Error reviewing cell:', error);
    return res.status(500).json({ error: 'Failed to update cell review.' });
  }
});

export default router;
