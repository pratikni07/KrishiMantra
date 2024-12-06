import express from 'express';
import { GroupController } from '../controllers/groupController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation middleware for creating a group
const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array'),
  body('allowUserMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow user messages must be a boolean')
];

// Validation middleware for getting group messages
const getGroupMessagesValidation = [
  query('groupId')
    .trim()
    .notEmpty()
    .withMessage('Group ID is required'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation middleware for updating group settings
const updateGroupSettingsValidation = [
  body('groupId')
    .trim()
    .notEmpty()
    .withMessage('Group ID is required'),
  body('allowUserMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow user messages must be a boolean'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array')
];

// Validation middleware for removing user from group
const removeUserFromGroupValidation = [
  body('groupId')
    .trim()
    .notEmpty()
    .withMessage('Group ID is required'),
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
];

// Protected Routes
router.post(
  '/create', 
  authMiddleware, 
  createGroupValidation, 
  validateRequest, 
  GroupController.createGroup
);

router.get(
  '/messages', 
  authMiddleware, 
  getGroupMessagesValidation, 
  validateRequest, 
  GroupController.getGroupMessages
);

router.put(
  '/settings', 
  authMiddleware, 
  updateGroupSettingsValidation, 
  validateRequest, 
  GroupController.updateGroupSettings
);

router.delete(
  '/remove-user', 
  authMiddleware, 
  removeUserFromGroupValidation, 
  validateRequest, 
  GroupController.removeUserFromGroup
);

export default router;