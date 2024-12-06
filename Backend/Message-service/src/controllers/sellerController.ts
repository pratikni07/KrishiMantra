import { Request, Response } from 'express';
import { Seller } from '../models/Seller';
import { User } from '../models/User';
import { Group } from '../models/Group';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class SellerController {
  // Seller Registration
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, companyName } = req.body;

      // Check if seller already exists
      const existingSeller = await Seller.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingSeller) {
        return res.status(400).json({ 
          message: 'Seller already exists' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new seller
      const newSeller = new Seller({
        username,
        email,
        password: hashedPassword,
        companyName
      });

      await newSeller.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newSeller._id, 
          username: newSeller.username 
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '30d' }
      );

      res.status(201).json({ 
        message: 'Seller registered successfully', 
        token,
        seller: {
          id: newSeller._id,
          username: newSeller.username,
          email: newSeller.email,
          companyName: newSeller.companyName
        }
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Create Group Chat
  static async createGroup(req: Request, res: Response) {
    try {
      const { name, members } = req.body;
      const sellerId = req.user.id; // From auth middleware

      // Create group
      const group = new Group({
        name,
        seller: sellerId,
        members,
        settings: {
          allowUserMessages: false
        }
      });

      await group.save();

      // Update seller's groups
      await Seller.findByIdAndUpdate(sellerId, {
        $push: { groups: group._id }
      });

      res.status(201).json({ 
        message: 'Group created successfully', 
        group 
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Block User
  static async blockUser(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const sellerId = req.user.id; // From auth middleware

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Block user
      await Seller.findByIdAndUpdate(sellerId, {
        $addToSet: { blockedUsers: userId }
      });

      res.json({ 
        message: 'User blocked successfully' 
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Find Related Products
  static async findRelatedProducts(req: Request, res: Response) {
    try {
      const { keywords } = req.query;
      
      // Implement advanced product search logic
      // This could involve text search, AI-powered recommendations, etc.
      const products = await Product.find({
        $text: { 
          $search: keywords as string 
        }
      }).limit(10);

      res.json({ 
        products 
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
}