import express from 'express';
import Case from '../models/Case.js';
import Report from '../models/Report.js';
import AuditEvent from '../models/AuditEvent.js';
import ImageModel from '../models/Image.js';
import Analysis from '../models/Analysis.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Metrics
    const pendingReviewCount = await Case.countDocuments({ status: 'review_required' });
    const aiProcessingCount = await Case.countDocuments({ status: 'draft' });
    const reviewedCount = await Case.countDocuments({ status: 'verified' });
    const reportsCount = await Report.countDocuments();

    // 2. Cases Requiring Attention (Top 5 review_required cases)
    let attentionCases = await Case.find({ status: 'review_required' })
      .populate('subjectId')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Populate finding and confidence
    attentionCases = await Promise.all(attentionCases.map(async (c) => {
      let finding = 'Awaiting AI Results';
      let confidence = null;
      let colorType = 'processing';
      const images = await ImageModel.find({ caseId: c._id });
      if (images.length > 0) {
        const imageIds = images.map(img => img._id);
        const analyses = await Analysis.find({ imageId: { $in: imageIds } }).sort({ createdAt: -1 }).limit(1);
        if (analyses.length > 0) {
          confidence = analyses[0].confidence;
          finding = analyses[0].results?.qualityReasons?.[0] || 'AI analysis completed';
          colorType = confidence && confidence < 80 ? 'warning' : 'success';
        }
      }
      
      const waitingTimeMs = Date.now() - new Date(c.updatedAt || c.createdAt).getTime();
      const waitingHours = Math.floor(waitingTimeMs / (1000 * 60 * 60));
      const waitingMins = Math.floor((waitingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
      const waiting = waitingHours > 0 ? `${waitingHours}h ${waitingMins}m` : `${waitingMins}m`;

      return { ...c, finding, confidence, colorType, waiting };
    }));

    // 3. This Week's Patients
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const recentPatients = await Case.find({ createdAt: { $gte: startOfWeek } })
      .populate('subjectId')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 4. AI Result Distribution (Today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const analyses = await Analysis.find({ createdAt: { $gte: startOfToday } });
    let distribution = {
      total: analyses.length,
      normal: 0,
      abnormal: 0,
      reviewRequired: 0
    };
    
    // As a fallback if no analysis run today, we count all time just so dashboard isn't completely empty for demo purposes
    let dataToAggregate = analyses;
    if (analyses.length === 0) {
      dataToAggregate = await Analysis.find({});
      distribution.total = dataToAggregate.length;
    }

    dataToAggregate.forEach(a => {
      if (a.results?.qualityStatus === 'Good') {
        distribution.normal++;
      } else if (a.results?.qualityStatus === 'Poor') {
        distribution.reviewRequired++;
      } else {
        distribution.abnormal++;
      }
    });

    // 5. Recent Audit Activity
    const recentAudit = await AuditEvent.find()
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({
      metrics: {
        pendingReview: pendingReviewCount,
        aiProcessing: aiProcessingCount,
        reviewed: reviewedCount,
        reports: reportsCount
      },
      attentionCases,
      recentPatients,
      aiDistribution: distribution,
      recentAudit
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

export default router;
