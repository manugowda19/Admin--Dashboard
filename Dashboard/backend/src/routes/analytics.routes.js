const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRoleLevel } = require('../middleware/rbac.middleware');
const {
  getActiveUsers,
  getDailySignups,
  getTrafficMetrics,
  getSalesMetrics,
  getKPIs,
  createAnalytics
} = require('../controllers/analytics.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRoleLevel('viewer'));

router.get('/active-users', getActiveUsers);
router.get('/signups', getDailySignups);
router.get('/traffic', getTrafficMetrics);
router.get('/sales', getSalesMetrics);
router.get('/kpis', getKPIs);
router.post('/', checkRoleLevel('admin'), createAnalytics);

module.exports = router;

