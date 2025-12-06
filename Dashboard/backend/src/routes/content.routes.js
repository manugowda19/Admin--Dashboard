const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRoleLevel } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validation.middleware');
const { logAction } = require('../middleware/audit.middleware');
const {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent
} = require('../controllers/content.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRoleLevel('viewer'));

router.get('/', getAllContent);
router.get('/:id', getContentById);
router.post(
  '/',
  checkRoleLevel('moderator'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').optional().isIn(['post', 'page', 'announcement', 'document']),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    validate
  ],
  logAction('create', 'content'),
  createContent
);
router.put(
  '/:id',
  checkRoleLevel('moderator'),
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('type').optional().isIn(['post', 'page', 'announcement', 'document']),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    validate
  ],
  logAction('update', 'content'),
  updateContent
);
router.delete('/:id', checkRoleLevel('moderator'), logAction('delete', 'content'), deleteContent);

module.exports = router;

