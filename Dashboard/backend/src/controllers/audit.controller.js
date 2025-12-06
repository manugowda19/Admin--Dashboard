const AuditLog = require('../models/AuditLog.model');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId = '', resource = '', action = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) query.user = userId;
    if (resource) query.resource = resource;
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.exportLogs = async (req, res, next) => {
  try {
    const { format = 'csv', userId = '', resource = '', action = '' } = req.query;

    const query = {};
    if (userId) query.user = userId;
    if (resource) query.resource = resource;
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit export to 10k records

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      
      let csv = 'Date,User,Action,Resource,IP Address,User Agent\n';
      logs.forEach(log => {
        const user = log.user ? `${log.user.name} (${log.user.email})` : 'N/A';
        csv += `"${log.createdAt}","${user}","${log.action}","${log.resource}","${log.ipAddress || 'N/A'}","${log.userAgent || 'N/A'}"\n`;
      });
      
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
      res.json({ logs });
    }
  } catch (error) {
    next(error);
  }
};

