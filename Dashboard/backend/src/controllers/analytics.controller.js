const Analytics = require('../models/Analytics.model');
const User = require('../models/User.model');

exports.getActiveUsers = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await Analytics.find({
      date: { $gte: startDate }
    })
    .sort({ date: 1 })
    .select('date activeUsers');

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};

exports.getDailySignups = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get signups from User model
    const signups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ signups });
  } catch (error) {
    next(error);
  }
};

exports.getTrafficMetrics = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await Analytics.find({
      date: { $gte: startDate }
    })
    .sort({ date: 1 })
    .select('date traffic pageViews');

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};

exports.getSalesMetrics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await Analytics.find({
      date: { $gte: startDate }
    })
    .sort({ date: 1 })
    .select('date revenue transactions');

    const totalRevenue = await Analytics.aggregate([
      {
        $match: { date: { $gte: startDate } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$revenue' },
          count: { $sum: '$transactions' }
        }
      }
    ]);

    res.json({
      analytics,
      summary: totalRevenue[0] || { total: 0, count: 0 }
    });
  } catch (error) {
    next(error);
  }
};

exports.getKPIs = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total users
    const totalUsers = await User.countDocuments({ isActive: true });

    // Today's metrics
    const todayAnalytics = await Analytics.findOne({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    // Last 30 days revenue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const revenueData = await Analytics.aggregate([
      {
        $match: { date: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$revenue' }
        }
      }
    ]);

    res.json({
      totalUsers,
      activeUsers: todayAnalytics?.activeUsers || 0,
      revenue: revenueData[0]?.total || 0,
      transactions: todayAnalytics?.transactions || 0,
      pageViews: todayAnalytics?.pageViews || 0
    });
  } catch (error) {
    next(error);
  }
};

exports.createAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!analytics) {
      analytics = await Analytics.create({
        date: today,
        ...req.body
      });
    } else {
      Object.assign(analytics, req.body);
      await analytics.save();
    }

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};

