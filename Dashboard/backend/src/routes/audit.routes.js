const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRoleLevel } = require('../middleware/rbac.middleware');
const { getAuditLogs, exportLogs } = require('../controllers/audit.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRoleLevel('admin'));

router.get('/', getAuditLogs);
router.get('/export', exportLogs);

module.exports = router;

