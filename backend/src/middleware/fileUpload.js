const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure private upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/jpg': '.jpg',
};

// Storage configuration with secure random filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    cb(null, `doc_${timestamp}_${randomHex}${ext}`);
  },
});

// File filter for extensions and MIME types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const validExts = ['.pdf', '.jpg', '.jpeg', '.png'];
  const isExtValid = validExts.includes(ext);
  const isMimeValid = Object.keys(ALLOWED_MIME_TYPES).includes(mime);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${ext}". Only PDF, JPG, JPEG, and PNG files are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 10, // Max 10 files per request
  },
});

module.exports = {
  upload,
  uploadDir,
  ALLOWED_MIME_TYPES,
};
