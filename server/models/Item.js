const mongoose = require('mongoose');

const ReminderStageSchema = new mongoose.Schema({
  daysBefore: {
    type: Number,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  isTriggered: {
    type: Boolean,
    default: false,
  },
  triggeredAt: {
    type: Date,
  },
}, { _id: false });

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  path: String,
  size: Number,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const RenewalHistorySchema = new mongoose.Schema({
  renewalDate: {
    type: Date,
    default: Date.now,
  },
  previousExpiryDate: Date,
  newExpiryDate: Date,
  amountPaid: Number,
  provider: String,
  notes: String,
  attachments: [AttachmentSchema],
});

const ActivityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String, // 'created', 'snoozed', 'renewed', 'resolved', 'edited'
    required: true,
  },
  details: String,
  performedBy: {
    type: String,
    default: 'Aswin',
  },
});

const ChecklistItemSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  link: String,
});

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'document',      // Driving Licence, Passport, Aadhaar, PAN
      'vehicle',       // Insurance, PUC, RC, FASTag, Service
      'warranty',      // Electronics, Appliances, Parts
      'subscription',  // Netflix, Google One, Domain, Hosting
      'finance',       // FD, RD, PPF, EMI, Insurance Premium
      'home',          // Rent, Property Tax, Maintenance, Water, Inverter
      'health',        // Health Insurance, Medical Checkup, Prescriptions
      'other',
    ],
    default: 'document',
  },
  // Priority & Risk
  priority: {
    type: String,
    enum: ['critical', 'high', 'normal', 'low'],
    default: 'normal',
  },
  // Privacy & Sharing
  privacy: {
    type: String,
    enum: ['family', 'private'],
    default: 'family',
  },
  // 4-tier references & Shared Responsibility
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
  },
  personName: {
    type: String,
    default: 'Aswin',
  },
  responsiblePerson: {
    type: String, // Who is assigned to pay/renew (e.g. Dad, Aswin)
    default: '',
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
  },
  assetName: {
    type: String,
    default: '',
  },
  // Document particulars
  documentNumber: {
    type: String,
    trim: true,
    default: '',
  },
  documentType: {
    type: String,
    trim: true,
    default: 'Document',
  },
  provider: {
    type: String,
    trim: true,
    default: '',
  },
  issueDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  // Recurring schedules & Grace periods
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrenceInterval: {
    type: String,
    enum: ['none', 'monthly', 'quarterly', 'half-yearly', 'annual', 'custom'],
    default: 'none',
  },
  gracePeriodDays: {
    type: Number,
    default: 0,
  },
  // Snooze controls
  snoozedUntil: {
    type: Date,
    default: null,
  },
  snoozeCount: {
    type: Number,
    default: 0,
  },
  // Financial context
  amount: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  billingCycle: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'half-yearly', 'annual', 'none'],
    default: 'one-time',
  },
  notes: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  attachments: [AttachmentSchema],
  reminders: {
    type: [ReminderStageSchema],
    default: () => [
      { daysBefore: 90, isEnabled: true },
      { daysBefore: 60, isEnabled: true },
      { daysBefore: 30, isEnabled: true },
      { daysBefore: 15, isEnabled: true },
      { daysBefore: 7, isEnabled: true },
      { daysBefore: 1, isEnabled: true },
    ],
  },
  // Renewal History & Document Versioning
  renewalHistory: [RenewalHistorySchema],
  // Activity History Log
  activityLog: [ActivityLogSchema],
  // Smart Renewal Checklist
  checklist: [ChecklistItemSchema],
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Computed virtuals
ItemSchema.virtual('daysRemaining').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = new Date(this.expiryDate).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

ItemSchema.virtual('status').get(function () {
  if (this.isResolved) return 'resolved';
  // If snoozed into the future, treat as snoozed
  if (this.snoozedUntil && new Date(this.snoozedUntil) > new Date()) {
    return 'snoozed';
  }
  const days = this.daysRemaining;
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'urgent';
  return 'good';
});

// High performance database indexes for production scale
ItemSchema.index({ isArchived: 1, expiryDate: 1 });
ItemSchema.index({ person: 1, isArchived: 1 });
ItemSchema.index({ asset: 1, isArchived: 1 });
ItemSchema.index({ category: 1, isArchived: 1 });
ItemSchema.index({ priority: 1, isArchived: 1 });
ItemSchema.index({ title: 'text', provider: 'text', documentNumber: 'text', notes: 'text' });

ItemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Item', ItemSchema);
