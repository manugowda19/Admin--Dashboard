const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole, checkRoleLevel } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validation.middleware');
const { logAction } = require('../middleware/audit.middleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  exportUsers,
  bulkUpdateUsers,
  getUserActivity
} = require('../controllers/user.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRoleLevel('admin'));

router.get('/', getAllUsers);
router.get('/export', exportUsers);
router.get('/:id', getUserById);
router.get('/:id/activity', getUserActivity);
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['superadmin', 'admin', 'moderator', 'viewer']),
    body('isActive').optional().isBoolean(),
    validate
  ],
  logAction('update', 'user'),
  updateUser
);
router.put('/bulk', checkRoleLevel('superadmin'), bulkUpdateUsers);
router.delete('/:id', logAction('delete', 'user'), deleteUser);

module.exports = router;
