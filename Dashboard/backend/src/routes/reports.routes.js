const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// All report routes require authentication and admin role
router.use(authenticate);
router.use(checkRole('admin', 'superadmin'));

// Generate report
router.post('/generate', reportsController.generateReport);

// Get report history
router.get('/history', reportsController.getReportHistory);

// Delete report
router.delete('/:id', reportsController.deleteReport);

module.exports = router;

