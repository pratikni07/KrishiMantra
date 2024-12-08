import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import User from '../model/User';
import OTP from '../model/OTP';
import UserDetail from '../model/UserDetails';
import mailSender from '../utils/mailSender';
import { passwordUpdated } from '../mail/templates/passwordTemplate';
import dotenv from 'dotenv';
import { AuthRequest, IUser } from '../types/types';
import { AccountType } from '../types/userTypes';
import mongoose, { Schema ,Types} from 'mongoose';
dotenv.config();

export const signup = async (req: Request, res: Response) => {
    try {
        // Destructure fields from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType = AccountType.USER, // Default to USER if not specified
            contactNumber,
            otp,
            interests,
            address,
            location
        } = req.body;

        // Comprehensive input validation
        const validationErrors: string[] = [];

        if (!firstName) validationErrors.push("First Name is required");
        if (!lastName) validationErrors.push("Last Name is required");
        if (!email) validationErrors.push("Email is required");
        if (!password) validationErrors.push("Password is required");
        if (!confirmPassword) validationErrors.push("Confirm Password is required");
        if (!otp) validationErrors.push("OTP is required");

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            validationErrors.push("Invalid email format");
        }

        // Password strength validation
        if (password && password.length < 8) {
            validationErrors.push("Password must be at least 8 characters long");
        }

        // Password match validation
        if (password !== confirmPassword) {
            validationErrors.push("Password and Confirm Password do not match");
        }

        // Return validation errors if any
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation Errors",
                errors: validationErrors
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }

        // Verify OTP
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (recentOTP.length === 0 || otp !== recentOTP[0].otp) {
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user detail first
        // const userDetail = await UserDetail.create({
        //     interests: interests || [],
        //     address: address || '',
        //     location: location || {},
        //     subscription: {
        //         type: 'free'
        //     }
        // });

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            // additionalDetails: userDetail._id,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // Update user reference in userDetail
        // userDetail.userId = new Types.ObjectId(user._id);
        // await userDetail.save();

        // Generate welcome email
        try {
            await mailSender(
                email, 
                "Welcome to Our Platform", 
                `Hello ${firstName}, Welcome to our platform! Your account has been successfully created.`
            );
        } catch (emailError) {
            console.error("Welcome email send error:", emailError);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountType: user.accountType
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "User registration failed. Please try again.",
            error: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please Fill up All the Required Fields",
            });
        }

        // Find user
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not Registered. Please SignUp to Continue",
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                email: user.email, 
                id: user._id, 
                accountType: user.accountType 
            },
            process.env.JWT_SECRET || '',
            { expiresIn: "24h" }
        );

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        // Send response
        return res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: "User Login Success",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure. Please Try Again",
        });
    }
};

// Send OTP Controller
export const sendOTP = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User is Already Registered",
            });
        }

        // Generate unique OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // Ensure OTP is unique
        let result = await OTP.findOne({ otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        }

        // Save OTP
        const otpPayload = { email, otp };
        await OTP.create(otpPayload);

        return res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            // Remove otp in production
            otp,
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error sending OTP",
            error: error.message,
        });
    }
};

interface PasswordChangeRequest {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
// Change Password Controller
export const changePassword = async (req: Request<{}, {}, PasswordChangeRequest>, res: Response) => {

    try {
        const { oldPassword, newPassword, confirmNewPassword }: PasswordChangeRequest = req.body;
        // Check if all required fields are present
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required",
            });
        }

        // Validate user ID
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "User authentication failed",
            });
        }

        // Get user details
        const userDetails = await User.findById(req.user.id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
            });
        }

        // Check if new password is same as old password
        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as old password",
            });
        }

        // Validate new password confirmation
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm new password do not match",
            });
        }

        // Hash new password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send password update notification email
        try {
            await mailSender(
                userDetails.email,
                "Password Updated",
                passwordUpdated(
                    userDetails.email,
                    `Password updated successfully for ${userDetails.firstName} ${userDetails.lastName}`
                )
            );
        } catch (emailError) {
            console.error("Error sending password update email:", emailError);
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.error("Password change error:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};