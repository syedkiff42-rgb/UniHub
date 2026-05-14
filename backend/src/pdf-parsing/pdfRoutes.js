const router   = require('express').Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { authenticate } = require('../middleware/auth');
const ctrl     = require('./pdfController');

// ── Multer storage ────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only PDF files are allowed.'), false);
};

const maxMB  = Number(process.env.MAX_FILE_SIZE_MB || 10);
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMB * 1024 * 1024 },
});

// ── Routes ────────────────────────────────────────────────────
router.use(authenticate);

// Upload PDF → triggers background parsing
router.post('/upload', upload.single('pdf'), ctrl.uploadPdf);

// Poll parse status
router.get('/status/:uploadId', ctrl.getStatus);

// List all uploads for the user
router.get('/', ctrl.listUploads);

// Get events extracted from a specific upload
router.get('/:uploadId/events', ctrl.getEvents);

// Delete upload + its events
router.delete('/:uploadId', ctrl.deleteUpload);

// ── Multer error handler ──────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: `File too large. Max ${maxMB} MB.` });
  }
  return res.status(400).json({ success: false, message: err.message });
});

module.exports = router;