import express from 'express';
import { SellerController } from '../controllers/sellerController';
const { body, query } = require('express-validator');
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';



const router = express.Router();

// Validation middleware for seller registration
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
];

// Validation middleware for group creation
const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required'),
  body('members')
    .isArray()
    .withMessage('Members must be an array')
];

// Validation middleware for blocking user
const blockUserValidation = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
];

// Validation middleware for product search
const productSearchValidation = [
  query('keywords')
    .trim()
    .notEmpty()
    .withMessage('Search keywords are required')
];

// Public Routes
router.post(
  '/register', 
  registerValidation, 
  validateRequest, 
  SellerController.register
);

// Protected Routes
router.post(
  '/create-group', 
  authMiddleware, 
  createGroupValidation, 
  validateRequest, 
  SellerController.createGroup
);

router.post(
  '/block-user', 
  authMiddleware, 
  blockUserValidation, 
  validateRequest, 
  SellerController.blockUser
);

router.get(
  '/related-products', 
  authMiddleware, 
  productSearchValidation, 
  validateRequest, 
  SellerController.findRelatedProducts
);

export default router;