import express from 'express';
import asyncHandler from 'express-async-handler';
import { 
    signup, 
    login, 
    sendOTP, 
    changePassword 
} from '../controller/Auth';
import { auth, isUser, isConsultant, isAdmin } from '../middlewares/auth';

const router = express.Router();

// **Public Routes** (No authentication required)
router.post('/signup', asyncHandler(signup));       // Signup endpoint
router.post('/login', asyncHandler(login));         // Login endpoint
router.post('/send-otp', asyncHandler(sendOTP));    // Send OTP endpoint

// **Protected Routes** (Require authentication)
router.put('/change-password', auth, asyncHandler(changePassword));

// **Role-Based Routes**
// Route for user-specific actions
router.get('/user-dashboard', auth, isUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the User Dashboard',
    });
});

// Route for consultant-specific actions
router.get('/consultant-dashboard', auth, isConsultant, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Consultant Dashboard',
    });
});

// Route for admin-specific actions
router.get('/admin-dashboard', auth, isAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Admin Dashboard',
    });
});

export default router;
