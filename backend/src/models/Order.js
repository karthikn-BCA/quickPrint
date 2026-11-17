const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'word', 'doc', 'docx'],
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
    min: 1,
  },
  printType: {
    type: String,
    enum: ['BW', 'COLOUR'],
    default: 'BW',
  },
  printSides: {
    type: String,
    enum: ['SINGLE', 'DOUBLE'],
    default: 'SINGLE',
  },
  copies: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 100,
  },
  pageSelection: {
    type: String,
    enum: ['ALL', 'CUSTOM'],
    default: 'ALL',
  },
  customPages: {
    type: String,
    default: '',
    trim: true,
  },
  selectedPagesList: {
    type: [Number],
    default: [],
  },
  selectedPagesCount: {
    type: Number,
    required: true,
    min: 1,
  },
  paperSize: {
    type: String,
    enum: ['A4'],
    default: 'A4',
  },
  orientation: {
    type: String,
    enum: ['PORTRAIT', 'LANDSCAPE'],
    default: 'PORTRAIT',
  },
  physicalSheets: {
    type: Number,
    required: true,
    min: 1,
  },
  ratePerSheet: {
    type: Number,
    required: true,
    min: 0,
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    sessionToken: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one document.',
      },
    },
    totalPhysicalSheets: {
      type: Number,
      required: true,
      min: 1,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    printingStatus: {
      type: String,
      enum: ['WAITING_FOR_PAYMENT', 'PAID', 'QUEUED', 'PRINTING', 'PRINTED', 'FAILED'],
      default: 'WAITING_FOR_PAYMENT',
      index: true,
    },
    collectionStatus: {
      type: String,
      enum: ['UNCOLLECTED', 'READY', 'COLLECTED'],
      default: 'UNCOLLECTED',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    printStartedAt: {
      type: Date,
    },
    printedAt: {
      type: Date,
    },
    collectedAt: {
      type: Date,
    },
    printAttempts: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      default: null,
    },
    printedByAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
