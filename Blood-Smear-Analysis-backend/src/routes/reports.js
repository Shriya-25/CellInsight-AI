import express from 'express';
import Report from '../models/Report.js';
import Case from '../models/Case.js';
import AuditEvent from '../models/AuditEvent.js';
import ImageModel from '../models/Image.js';
import Analysis from '../models/Analysis.js';
import Cell from '../models/Cell.js';
import { generateNextId } from '../utils/generateId.js';

const router = express.Router();

// GET /api/reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({
        path: 'caseId',
        populate: { path: 'subjectId' }
      })
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    const formattedReports = await Promise.all(reports.map(async r => {
      const caseDoc = r.caseId;
      if (!caseDoc) {
        return {
          _id: r._id,
          id: r.reportId || `R-${r._id.toString().slice(-6).toUpperCase()}`,
          caseId: 'Unknown',
          patient: 'Unknown',
          patientId: 'Unknown',
          test: 'Blood Smear',
          status: r.status || 'CURRENT',
          version: r.version ? `v${r.version}` : 'v1',
          date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      }

      const subject = caseDoc.subjectId || {};
      
      const images = await ImageModel.find({ caseId: caseDoc._id });
      const imageIds = images.map(i => i._id);
      
      const analyses = await Analysis.find({ imageId: { $in: imageIds } });
      const analysisIds = analyses.map(a => a._id);
      
      const cells = await Cell.find({ analysisId: { $in: analysisIds } });

      let qualityStatus = 'Unknown';
      let qualityReasons = [];
      let aiConfidence = 0;
      if (analyses.length > 0) {
        qualityStatus = analyses[0].results?.qualityStatus || 'Unknown';
        qualityReasons = analyses[0].results?.qualityReasons || [];
        aiConfidence = analyses[0].confidence || 0;
      }

      let rbcCount = 0;
      let wbcCount = 0;
      let plateletCount = 0;
      let wbcSubtypes = {
        'neutrophil': 0, 'lymphocyte': 0, 'monocyte': 0, 'eosinophil': 0, 'basophil': 0,
        'myeloblast': 0, 'erythroblast': 0, 'seg_neutrophil': 0
      };
      
      let reviewSummary = {
        accepted: 0,
        reclassified: 0,
        unknown: 0,
        pending: 0
      };

      let comments = [];
      if (caseDoc.notes) comments.push(caseDoc.notes);

      cells.forEach(c => {
        if (c.reviewStatus === 'pending') {
          reviewSummary.pending++;
        } else if (c.reviewStatus && reviewSummary[c.reviewStatus] !== undefined) {
          reviewSummary[c.reviewStatus]++;
        } else if (c.reviewStatus) {
          reviewSummary.unknown++;
        }
        
        if (c.comment) {
          comments.push(c.comment);
        }

        const label = c.finalLabel || c.subtype || c.cellType;
        const normalized = (label || '').toLowerCase();
        
        if (normalized === 'rbc' || normalized === 'red blood cell') {
          rbcCount++;
        } else if (normalized === 'platelet' || normalized === 'platelets') {
          plateletCount++;
        } else if (normalized === 'wbc' || normalized === 'white blood cell') {
          wbcCount++;
        } else {
          wbcCount++; // Subtypes are WBCs
          // Subtype counting
          const subNorm = normalized.replace('seg_neutrophil', 'neutrophil');
          if (wbcSubtypes[subNorm] !== undefined) {
            wbcSubtypes[subNorm]++;
          } else if (wbcSubtypes[normalized] !== undefined) {
            wbcSubtypes[normalized]++;
          }
        }
      });

      // Combine seg_neutrophil into neutrophil for simpler display if needed, but PRD keeps them separate or mapped.
      
      return {
        _id: r._id,
        id: r.reportId || `R-${r._id.toString().slice(-6).toUpperCase()}`,
        caseId: caseDoc.caseId || caseDoc._id?.toString().slice(-6).toUpperCase(),
        patient: subject.name || 'Unknown',
        patientId: subject.patientIdentifier || 'Unknown',
        patientAge: subject.demographics?.age || 'Unknown',
        patientGender: subject.demographics?.gender || 'Unknown',
        test: caseDoc.test || 'Peripheral Blood Smear',
        status: r.status || 'CURRENT',
        version: r.version ? `v${r.version}` : 'v1',
        date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        collectionDate: new Date(caseDoc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        
        // Real Data below:
        imageCount: images.length,
        qualityStatus,
        qualityReasons,
        aiConfidence,
        totalCells: cells.length,
        rbcCount,
        wbcCount,
        plateletCount,
        wbcSubtypes,
        reviewSummary,
        remarks: comments
      };
    }));

    return res.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// POST /api/reports - Generate a report for a case
router.post('/', async (req, res) => {
  try {
    const { caseId, generatedBy, content } = req.body;

    // Handle versioning
    const existingReports = await Report.find({ caseId }).sort({ version: -1 });
    let nextVersion = 1;
    if (existingReports.length > 0) {
      nextVersion = (existingReports[0].version || 1) + 1;
      await Report.updateMany({ caseId, status: 'CURRENT' }, { $set: { status: 'OUTDATED' } });
    }

    const reportId = await generateNextId('reportId', 'R-');

    const report = new Report({
      reportId,
      caseId,
      generatedBy,
      content: content || 'Generated PDF Report placeholder',
      version: nextVersion,
      status: 'CURRENT'
    });

    const savedReport = await report.save();

    // Log audit event
    await AuditEvent.create({
      action: 'REPORT_GENERATED',
      performedBy: generatedBy,
      targetResource: {
        resourceType: 'Report',
        resourceId: savedReport._id
      }
    });

    return res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
});

export default router;
