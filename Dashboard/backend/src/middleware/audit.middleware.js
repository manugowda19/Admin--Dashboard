const AuditLog = require('../models/AuditLog.model');

exports.logAction = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to capture response
    res.json = function(data) {
      // Log the action after response is sent
      if (req.user && res.statusCode < 400) {
        AuditLog.create({
          user: req.user._id,
          action,
          resource,
          resourceId: req.params.id || data._id || null,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined,
            query: Object.keys(req.query).length > 0 ? req.query : undefined
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Audit log error:', err));
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

