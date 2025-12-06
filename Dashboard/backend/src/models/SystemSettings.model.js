const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'System is under maintenance. Please check back later.'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  apiKeys: [{
    name: String,
    key: String,
    createdAt: Date,
    lastUsed: Date,
    isActive: Boolean
  }],
  emailConfig: {
    host: String,
    port: Number,
    secure: Boolean,
    user: String,
    password: String
  },
  siteSettings: {
    siteName: String,
    siteUrl: String,
    contactEmail: String
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

