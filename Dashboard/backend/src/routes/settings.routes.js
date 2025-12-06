const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRoleLevel } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validation.middleware');
const { logAction } = require('../middleware/audit.middleware');
const {
  getSettings,
  updateSettings,
  createApiKey,
  deleteApiKey,
  updateEmailConfig
} = require('../controllers/settings.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRoleLevel('superadmin'));

router.get('/', getSettings);
router.put(
  '/',
  [
    body('maintenanceMode').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    validate
  ],
  logAction('update', 'settings'),
  updateSettings
);
router.post(
  '/api-keys',
  [
    body('name').trim().notEmpty().withMessage('API key name is required'),
    validate
  ],
  logAction('create', 'api-key'),
  createApiKey
);
router.delete('/api-keys/:id', logAction('delete', 'api-key'), deleteApiKey);
router.put('/email-config', logAction('update', 'email-config'), updateEmailConfig);

module.exports = router;

