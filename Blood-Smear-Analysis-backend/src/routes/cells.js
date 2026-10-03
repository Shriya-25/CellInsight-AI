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
      
      let caseId = null;
      if (analysis && analysis.imageId) {
        const ImageModel = (await import('../models/Image.js')).default;
        const image = await ImageModel.findById(analysis.imageId);
        if (image) caseId = image.caseId;
      }
      
      if (caseId) {
        const Report = (await import('../models/Report.js')).default;
        await Report.updateMany({ caseId, status: 'CURRENT' }, { $set: { status: 'OUTDATED' } });
        
        // Also check if this was the last pending flagged cell
        const Case = (await import('../models/Case.js')).default;
        const ImageModel = (await import('../models/Image.js')).default;
        
        const allImages = await ImageModel.find({ caseId });
        const imageIds = allImages.map(img => img._id);
        const allAnalyses = await Analysis.find({ imageId: { $in: imageIds } });
        const analysisIds = allAnalyses.map(a => a._id);
        
        const remainingFlagged = await Cell.countDocuments({
          analysisId: { $in: analysisIds },
          reviewPriority: { $gt: 0.3 },
          reviewStatus: 'pending'
        });
        
        if (remainingFlagged === 0) {
          await Case.findByIdAndUpdate(caseId, { status: 'verified' });
          
          // Auto-accept any remaining low-priority pending cells (e.g. kept pending due to poor image quality)
          await Cell.updateMany(
            { analysisId: { $in: analysisIds }, reviewStatus: 'pending' },
            { $set: { reviewStatus: 'accepted' } }
          );
        }
      }

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
