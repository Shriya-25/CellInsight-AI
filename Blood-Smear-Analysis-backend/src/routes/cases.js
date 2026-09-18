import express from 'express';
import Case from '../models/Case.js';

const router = express.Router();

// POST /api/cases - Create a new case
router.post('/', async (req, res) => {
  try {
    const { subjectId, caseId, status, assignedTo, notes, test, priority } = req.body;
    
    // Basic validation
    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId is required.' });
    }

    const newCase = new Case({
      subjectId,
      caseId,
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

      if (c.status === 'review_pending' || c.status === 'completed' || c.status === 'verified') {
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
         finding = 'Awaiting images';
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
    
    return res.json({ message: 'Case deleted successfully.' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return res.status(500).json({ error: 'Failed to delete case.' });
  }
});

import { uploadToDisk } from '../middleware/upload.js';
import ImageModel from '../models/Image.js';
import Analysis from '../models/Analysis.js';
import Cell from '../models/Cell.js';
import fs from 'fs';
import path from 'path';

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

    // Save image metadata to MongoDB
    const relativePath = `/uploads/cases/${id}/${req.file.filename}`;
    
    const newImage = new ImageModel({
      caseId: id,
      filePath: relativePath,
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
      const fullPath = path.join(process.cwd(), image.filePath);
      
      if (!fs.existsSync(fullPath)) {
        continue;
      }

      const fileBuffer = fs.readFileSync(fullPath);
      const blob = new Blob([fileBuffer], { type: image.metadata.mimeType || 'image/jpeg' });
      const formData = new FormData();
      formData.append("file", blob, image.metadata.originalName || 'image.jpg');

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
      const cellDocs = result.detections.map(det => ({
        analysisId: savedAnalysis._id,
        cellType: det.class,
        confidence: det.detectionConfidence,
        subtype: det.subtype,
        subtypeConfidence: det.subtypeConfidence,
        reviewPriority: det.reviewPriority,
        boundingBox: {
          x: det.box.x1,
          y: det.box.y1,
          width: det.box.x2 - det.box.x1,
          height: det.box.y2 - det.box.y1
        }
      }));

      if (cellDocs.length > 0) {
        await Cell.insertMany(cellDocs);
      }

      analysisResults.push({
        analysisId: savedAnalysis._id,
        imageId: image._id,
        summary: savedAnalysis.results
      });
      
      // Update case status
      await Case.findByIdAndUpdate(id, { status: 'review_pending' });
    }

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

export default router;
