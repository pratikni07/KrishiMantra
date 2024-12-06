import express from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware for registration
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
    .withMessage('Password must be at least 6 characters long')
];

// Validation middleware for login
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for reporting seller
const reportSellerValidation = [
  body('sellerId')
    .trim()
    .notEmpty()
    .withMessage('Seller ID is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Report reason is required')
];

// Public Routes
router.post(
  '/register', 
  registerValidation, 
  validateRequest, 
  UserController.register
);

router.post(
  '/login', 
  loginValidation, 
  validateRequest, 
  UserController.login
);

// Protected Routes
router.post(
  '/report-seller', 
  authMiddleware, 
  reportSellerValidation, 
  validateRequest, 
  UserController.reportSeller
);

router.post(
  '/block-seller', 
  authMiddleware, 
  reportSellerValidation, 
  validateRequest, 
  UserController.blockSeller
);

export default router;