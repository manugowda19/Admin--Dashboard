const { authenticate } = require('../middleware/auth.middleware');
const Analytics = require('../models/Analytics.model');
const User = require('../models/User.model');

let io;

exports.initializeSocket = (socketIo) => {
  io = socketIo;

  // Socket.io middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const jwt = require('jsonwebtoken');
    const { jwtSecret } = require('../config/jwt');
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle analytics subscription
    socket.on('subscribe:analytics', () => {
      socket.join('analytics');
      console.log(`User ${socket.userId} subscribed to analytics`);
    });

    socket.on('unsubscribe:analytics', () => {
      socket.leave('analytics');
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  // Emit realtime analytics updates
  setInterval(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const analytics = await Analytics.findOne({
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      });

      const activeUsers = await User.countDocuments({ isActive: true, lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

      if (io) {
        io.to('analytics').emit('analytics:update', {
          activeUsers,
          revenue: analytics?.revenue || 0,
          transactions: analytics?.transactions || 0,
          pageViews: analytics?.pageViews || 0,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error emitting analytics:', error);
    }
  }, 5000); // Emit every 5 seconds
};

// Function to emit analytics updates manually
exports.emitAnalyticsUpdate = (data) => {
  if (io) {
    io.to('analytics').emit('analytics:update', data);
  }
};

