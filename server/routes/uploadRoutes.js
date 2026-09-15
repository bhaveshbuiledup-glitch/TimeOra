const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp|svg|mp4|webm|ogg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images and videos are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    res.json({ success: true, filePath: `/uploads/${req.file.filename}`, fileName: req.file.originalname });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

router.post('/multiple', protect, admin, upload.array('images', 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ success: true, urls });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

router.post('/video', protect, admin, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video uploaded' });
    }
    res.json({ success: true, filePath: `/uploads/${req.file.filename}`, fileName: req.file.originalname });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
