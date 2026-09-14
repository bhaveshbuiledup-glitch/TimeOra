const express = require('express');
const router = express.Router();
const multer = require('multer');

// Memory storage for Vercel & serverless compatibility (no local files written to disk)
const storage = multer.memoryStorage();

// Image file filter: JPG, JPEG, PNG, WebP
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Video file filter: MP4, WebM, OGG, QuickTime
const videoFileFilter = (req, file, cb) => {
  const allowedVideoMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ];

  if (allowedVideoMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4 and WebM video formats are allowed.'), false);
  }
};

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per image
  fileFilter: imageFileFilter
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per video
  fileFilter: videoFileFilter
});

// @desc    Upload single product image
// @route   POST /api/upload
router.post('/', (req, res) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      message: 'Product image uploaded successfully.',
      url: dataUrl,
      fileName: req.file.originalname
    });
  });
});

// @desc    Upload multiple product images (up to 6)
// @route   POST /api/upload/multiple
router.post('/multiple', (req, res) => {
  uploadImage.array('images', 6)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided.' });
    }

    const urls = req.files.map(file => {
      const base64Data = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64Data}`;
    });

    return res.status(200).json({
      success: true,
      message: `${urls.length} product images uploaded successfully.`,
      urls
    });
  });
});

// @desc    Upload single product video (MP4/WebM)
// @route   POST /api/upload/video
router.post('/video', (req, res) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided.' });
    }

    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      message: 'Product video uploaded successfully.',
      url: dataUrl,
      fileName: req.file.originalname
    });
  });
});

module.exports = router;
