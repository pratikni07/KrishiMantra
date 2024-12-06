import { Request, Response } from 'express';
import { User } from '../models/User';
import { Seller } from '../models/Seller';
import { Report } from '../models/Report';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserController {
  // User Registration
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User already exists' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser._id, 
          username: newUser.username 
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '30d' }
      );

      res.status(201).json({ 
        message: 'User registered successfully', 
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // User Login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id, 
          username: user.username 
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '30d' }
      );

      res.json({ 
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Report Seller
  static async reportSeller(req: Request, res: Response) {
    try {
      const { sellerId, reason, description } = req.body;
      const userId = req.user.id; // From auth middleware

      // Check if seller exists
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ 
          message: 'Seller not found' 
        });
      }

      // Create report
      const report = new Report({
        reporter: userId,
        reportedSeller: sellerId,
        reason,
        description
      });

      await report.save();

      // Add to user's reported sellers
      await User.findByIdAndUpdate(userId, {
        $push: { 
          reportedSellers: { 
            seller: sellerId, 
            reportReason: reason, 
            reportDate: new Date() 
          } 
        }
      });

      res.status(201).json({ 
        message: 'Seller reported successfully', 
        report 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Block Seller
  static async blockSeller(req: Request, res: Response) {
    try {
      const { sellerId } = req.body;
      const userId = req.user.id; // From auth middleware

      // Check if seller exists
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ 
          message: 'Seller not found' 
        });
      }

      // Block seller
      await User.findByIdAndUpdate(userId, {
        $addToSet: { blockedSellers: sellerId }
      });

      // Optional: Remove from any ongoing conversations
      // Implement additional logic if needed

      res.json({ 
        message: 'Seller blocked successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
}