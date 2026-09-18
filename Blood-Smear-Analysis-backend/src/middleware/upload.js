import multer from "multer";
import fs from "fs";
import path from "path";

// Define storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const caseId = req.params.id; // Expects to be used on routes like /cases/:id/images
    if (!caseId) {
      return cb(new Error("Case ID is required in the URL to upload an image."));
    }
    const destFolder = path.join(process.cwd(), "uploads", "cases", caseId);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    
    cb(null, destFolder);
  },
  filename: function (req, file, cb) {
    // Generate a safe unique filename: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image file."), false);
  }
};

export const uploadToDisk = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: fileFilter
});
