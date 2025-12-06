const User = require('../models/User.model');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
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

exports.exportUsers = async (req, res, next) => {
  try {
    const { format = 'csv', role = '', status = '' } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      
      let csv = 'Name,Email,Role,Status,Last Login,Created At\n';
      users.forEach(user => {
        csv += `"${user.name}","${user.email}","${user.role}","${user.isActive ? 'Active' : 'Inactive'}","${user.lastLogin || 'Never'}","${user.createdAt}"\n`;
      });
      
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=users.json');
      res.json({ users });
    } else {
      res.status(400).json({ message: 'Invalid format. Use csv or json' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const userId = req.params.id;

    // Prevent users from modifying their own role/status (except superadmin)
    if (req.user._id.toString() === userId && req.user.role !== 'superadmin') {
      if (role !== undefined || isActive !== undefined) {
        return res.status(403).json({ message: 'Cannot modify your own role or status' });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (role && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
      user.role = role;
    }
    if (isActive !== undefined && req.user.role !== 'viewer') {
      user.isActive = isActive;
    }

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateUsers = async (req, res, next) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs required' });
    }

    const update = {};
    if (action === 'activate') {
      update.isActive = true;
    } else if (action === 'deactivate') {
      update.isActive = false;
    } else if (action === 'changeRole' && value) {
      update.role = value;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: update }
    );

    res.json({ message: `${result.modifiedCount} users updated successfully` });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (req.user._id.toString() === userId) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getUserActivity = async (req, res, next) => {
  try {
    const AuditLog = require('../models/AuditLog.model');
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ user: req.params.id })
      .populate('user', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments({ user: req.params.id });

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
