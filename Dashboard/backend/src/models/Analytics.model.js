const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  newSignups: {
    type: Number,
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  transactions: {
    type: Number,
    default: 0
  },
  traffic: {
    organic: { type: Number, default: 0 },
    direct: { type: Number, default: 0 },
    referral: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    paid: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
analyticsSchema.index({ date: 1, createdAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

