const SystemSettings = require('../models/SystemSettings.model');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    // Don't expose sensitive data
    const safeSettings = settings.toObject();
    if (safeSettings.apiKeys) {
      safeSettings.apiKeys = safeSettings.apiKeys.map(key => ({
        ...key,
        key: key.key ? '***' + key.key.slice(-4) : undefined
      }));
    }
    if (safeSettings.emailConfig) {
      safeSettings.emailConfig.password = undefined;
    }
    res.json({ settings: safeSettings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    
    const { maintenanceMode, maintenanceMessage, theme, siteSettings } = req.body;
    
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage) settings.maintenanceMessage = maintenanceMessage;
    if (theme) settings.theme = theme;
    if (siteSettings) {
      settings.siteSettings = { ...settings.siteSettings, ...siteSettings };
    }
    
    await settings.save();
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    next(error);
  }
};

exports.createApiKey = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const settings = await SystemSettings.getSettings();
    
    const { name } = req.body;
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    settings.apiKeys.push({
      name,
      key: apiKey,
      createdAt: new Date(),
      isActive: true
    });
    
    await settings.save();
    
    res.json({ 
      message: 'API key created successfully',
      apiKey // Only show once
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteApiKey = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    settings.apiKeys = settings.apiKeys.filter(
      key => key._id.toString() !== req.params.id
    );
    await settings.save();
    
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateEmailConfig = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    settings.emailConfig = { ...settings.emailConfig, ...req.body };
    await settings.save();
    
    res.json({ message: 'Email configuration updated successfully' });
  } catch (error) {
    next(error);
  }
};

