const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const { generateToken, generateRefreshToken } = require('../utils/jwt.utils');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (role defaults to 'viewer', only superadmin can create admins)
    const user = await User.create({
      name,
      email,
      password,
      role: req.user?.role === 'superadmin' ? (role || 'viewer') : 'viewer'
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    user.refreshToken = refreshToken;
    await user.save();

    // Log audit
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'create',
        resource: 'user',
        resourceId: user._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    await user.save();

    // Log audit
    await AuditLog.create({
      user: user._id,
      action: 'login',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Login successful',
      user,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If email exists, password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // In production, send email with reset link
    // For now, return token (remove in production)
    res.json({
      message: 'Password reset link sent to email',
      resetToken // Remove this in production
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log audit
    await AuditLog.create({
      user: user._id,
      action: 'update',
      resource: 'auth',
      details: { action: 'password_reset' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!await user.comparePassword(currentPassword)) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Log audit
    await AuditLog.create({
      user: user._id,
      action: 'update',
      resource: 'auth',
      details: { action: 'password_change' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const { verifyRefreshToken } = require('../utils/jwt.utils');
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();

      await AuditLog.create({
        user: req.user._id,
        action: 'logout',
        resource: 'auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
