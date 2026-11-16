const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storageFilename: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileExtension: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    uploadedBySession: {
      type: String,
      index: true,
    },
    isCorrupted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      index: { expires: '7d' }, // Automatically TTL delete after retention window
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
