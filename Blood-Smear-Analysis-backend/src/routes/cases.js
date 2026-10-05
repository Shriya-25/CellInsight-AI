import express from 'express';
import Case from '../models/Case.js';
import Notification from '../models/Notification.js';
import { generateNextId } from '../utils/generateId.js';
import Report from '../models/Report.js';
import { uploadToDisk } from '../middleware/upload.js';
import ImageModel from '../models/Image.js';
import Analysis from '../models/Analysis.js';
import Cell from '../models/Cell.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// POST /api/cases - Create a new case
router.post('/', async (req, res) => {
  try {
    const { subjectId, status, assignedTo, notes, test, priority } = req.body;
    
    // Basic validation
    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId is required.' });
    }

    const generatedCaseId = await generateNextId('caseId', 'S-');

    const newCase = new Case({
      subjectId,
      caseId: generatedCaseId,
      status: status || 'draft',
      assignedTo,
      notes,
      test: test || 'Blood Smear',
      priority: priority || 'Medium',
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
    const cases = await Case.find().populate('subjectId').populate('assignedTo', 'name email role').sort({ createdAt: -1 }).lean();
    
    // Fetch latest analysis for each case to populate finding and confidence
    const casesWithAnalysis = await Promise.all(cases.map(async (c) => {
      let finding = 'Processing pending...';
      let confidence = null;
      let colorType = 'processing';

      if (['review_required', 'verified'].includes(c.status)) {
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
      } else if (c.status === 'draft') {
         finding = 'Processing pending...';
         colorType = 'neutral';
      }
      
      return { ...c, finding, confidence, colorType };
    }));

    return res.json(casesWithAnalysis);
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

// PATCH /api/cases/:id - Update case details (e.g., status)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedCase = await Case.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    
    // If fast-approving to 'verified', accept all pending cells
    if (updateData.status === 'verified') {
      const allImages = await ImageModel.find({ caseId: id });
      const imageIds = allImages.map(img => img._id);
      const allAnalyses = await Analysis.find({ imageId: { $in: imageIds } });
      const analysisIds = allAnalyses.map(a => a._id);
      
      await Cell.updateMany(
        { analysisId: { $in: analysisIds }, reviewStatus: 'pending' },
        { $set: { reviewStatus: 'accepted' } }
      );
      
      // Invalidate existing reports just in case
      await Report.updateMany({ caseId: id, status: 'CURRENT' }, { $set: { status: 'OUTDATED' } });
    }
    
    return res.json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    return res.status(500).json({ error: 'Failed to update case.' });
  }
});

// DELETE /api/cases/:id - Delete a case
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCase = await Case.findByIdAndDelete(id);
    
    if (!deletedCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    
    // Also delete associated images and analyses if necessary
    const images = await ImageModel.find({ caseId: id });
    if (images.length > 0) {
      const imageIds = images.map(img => img._id);
      await Analysis.deleteMany({ imageId: { $in: imageIds } });
      await ImageModel.deleteMany({ caseId: id });
    }
    
    // Also delete associated reports
    await Report.deleteMany({ caseId: id });
    
    return res.json({ message: 'Case deleted successfully.' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return res.status(500).json({ error: 'Failed to delete case.' });
  }
});

const INFERENCE_URL = process.env.INFERENCE_URL || "http://localhost:8000";

// POST /api/cases/:id/images - Upload an image for a case
router.post('/:id/images', uploadToDisk.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const caseData = await Case.findById(id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'An image file is required.' });
    }

    const imageCount = await ImageModel.countDocuments({ caseId: id });
    if (imageCount >= 3) {
      return res.status(400).json({ error: 'Maximum of 3 microscopy fields allowed per case.' });
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    if (!IMGBB_API_KEY) {
      return res.status(500).json({ error: 'IMGBB_API_KEY is missing from the environment variables.' });
    }

    // Upload to ImgBB
    const formData = new URLSearchParams();
    formData.append('image', req.file.buffer.toString('base64'));

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const imgbbData = await imgbbRes.json();
    if (!imgbbRes.ok || !imgbbData.success) {
      throw new Error(imgbbData.error?.message || 'ImgBB upload failed');
    }

    const imageUrl = imgbbData.data.url;

    // Save image metadata to MongoDB
    const newImage = new ImageModel({
      caseId: id,
      filePath: imageUrl, // Storing the remote URL
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });

    const savedImage = await newImage.save();
    return res.status(201).json(savedImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// GET /api/cases/:id/images - Get all images for a case
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const images = await ImageModel.find({ caseId: id });
    return res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ error: 'Failed to fetch images.' });
  }
});

// POST /api/cases/:id/analyze - Run AI analysis on the case's images
router.post('/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all images for this case
    const images = await ImageModel.find({ caseId: id });
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'No images found for this case.' });
    }

    const analysisResults = [];

    // For MVP, we'll process each image sequentially
    for (const image of images) {
      // Skip already analyzed fields
      const existingAnalysis = await Analysis.findOne({ imageId: image._id });
      if (existingAnalysis) {
        analysisResults.push(existingAnalysis);
        continue;
      }

      let fileBuffer;
      let originalName = image.metadata.originalName || 'image.jpg';
      let mimeType = image.metadata.mimeType || 'image/jpeg';

      if (image.filePath.startsWith('http')) {
        const response = await fetch(image.filePath);
        if (!response.ok) {
           console.error(`Failed to download ${image.filePath} for inference.`);
           continue;
        }
        fileBuffer = await response.arrayBuffer();
      } else {
        // Fallback for old local images
        const fullPath = path.join(process.cwd(), image.filePath);
        if (!fs.existsSync(fullPath)) {
          continue;
        }
        fileBuffer = fs.readFileSync(fullPath);
      }

      const blob = new Blob([fileBuffer], { type: mimeType });
      const formData = new FormData();
      formData.append("file", blob, originalName);

      const inferenceResponse = await fetch(`${INFERENCE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!inferenceResponse.ok) {
        console.error(`Inference failed for image ${image._id}`);
        continue;
      }

      const result = await inferenceResponse.json();

      // Create Analysis document
      const newAnalysis = new Analysis({
        imageId: image._id,
        type: 'BloodSmear',
        confidence: result.qualityScore, // using quality score as overall confidence for MVP
        results: {
          totalCells: result.totalCells,
          rbcCount: result.rbcCount,
          wbcCount: result.wbcCount,
          plateletCount: result.plateletCount,
          wbcSubtypes: result.wbcSubtypes,
          qualityStatus: result.qualityStatus,
          qualityReasons: result.qualityReasons
        }
      });

      const savedAnalysis = await newAnalysis.save();

      // Create Cell documents
      const cellDocs = result.detections.map(det => {
        let rStatus = 'pending';
        if (det.reviewPriority <= 0.3 && result.qualityStatus === 'Good') {
          rStatus = 'accepted';
        }
        return {
          analysisId: savedAnalysis._id,
          cellType: det.class,
          confidence: det.detectionConfidence,
          subtype: det.subtype,
          subtypeConfidence: det.subtypeConfidence,
          reviewPriority: det.reviewPriority,
          reviewStatus: rStatus,
          boundingBox: {
            x: det.box.x1,
            y: det.box.y1,
            width: det.box.x2 - det.box.x1,
            height: det.box.y2 - det.box.y1
          }
        };
      });

      if (cellDocs.length > 0) {
        await Cell.insertMany(cellDocs);
      }

      analysisResults.push({
        analysisId: savedAnalysis._id,
        imageId: image._id,
        summary: savedAnalysis.results
      });
    }
      
    // Determine the case status based on whether there are pending flagged cells
    const allImages = await ImageModel.find({ caseId: id });
    const imageIds = allImages.map(img => img._id);
    const allAnalyses = await Analysis.find({ imageId: { $in: imageIds } });
    const analysisIds = allAnalyses.map(a => a._id);
    const allCells = await Cell.find({ analysisId: { $in: analysisIds } });
    
    // Check if any cell requires review and hasn't been reviewed yet
    const imageNeedsReview = allAnalyses.some(a => a.results.qualityStatus !== 'Good');
    const cellNeedsReview = allCells.some(c => c.reviewStatus === 'pending');
    
    const needsReview = imageNeedsReview || cellNeedsReview;
    const newStatus = needsReview ? 'review_required' : 'verified';
    
    // Update case status at the end regardless if some images failed
    await Case.findByIdAndUpdate(id, { status: newStatus });

    // Invalidate any existing reports since new analysis data is available
    await Report.updateMany({ caseId: id, status: 'CURRENT' }, { $set: { status: 'OUTDATED' } });

    // Create a notification
    const notificationMsg = needsReview 
      ? `AI Analysis Complete for Case. Cells flagged for review.`
      : `AI Analysis Complete for Case. No manual review needed.`;
      
    await Notification.create({
      userId: req.user ? req.user.id : null,
      message: notificationMsg,
      type: 'success',
      link: 'cases'
    });

    return res.status(200).json({ message: 'Analysis complete', results: analysisResults });

  } catch (error) {
    console.error('Error running analysis:', error);
    return res.status(500).json({ error: 'Failed to run analysis.' });
  }
});

// GET /api/cases/:id/analyses - Get all analyses for a case
router.get('/:id/analyses', async (req, res) => {
  try {
    const { id } = req.params;
    const images = await ImageModel.find({ caseId: id });
    const imageIds = images.map(img => img._id);
    
    const analyses = await Analysis.find({ imageId: { $in: imageIds } }).populate('imageId');
    return res.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return res.status(500).json({ error: 'Failed to fetch analyses.' });
  }
});

// GET /api/cases/:id/cells - Get all cells for a case's analyses
router.get('/:id/cells', async (req, res) => {
  try {
    const { id } = req.params;
    const images = await ImageModel.find({ caseId: id });
    const imageIds = images.map(img => img._id);
    const analyses = await Analysis.find({ imageId: { $in: imageIds } });
    const analysisIds = analyses.map(a => a._id);

    const cells = await Cell.find({ analysisId: { $in: analysisIds } }).populate('reviewerId', 'name email');
    return res.json(cells);
  } catch (error) {
    console.error('Error fetching cells:', error);
    return res.status(500).json({ error: 'Failed to fetch cells.' });
  }
});

export default router;
