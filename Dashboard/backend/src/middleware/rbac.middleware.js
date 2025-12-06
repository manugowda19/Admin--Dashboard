const roleHierarchy = {
  viewer: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4
};

exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({ 
      message: 'Insufficient permissions',
      required: allowedRoles,
      current: req.user.role
    });
  };
};

exports.checkRoleLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const minLevel = roleHierarchy[minRole] || 0;

    if (userLevel >= minLevel) {
      return next();
    }

    res.status(403).json({ 
      message: 'Insufficient permissions',
      required: minRole,
      current: req.user.role
    });
  };
};

