import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Express Request object to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        accountType: 'User' | 'Consultant' | 'Admin';
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from cookies, body, or authorization header
    const token =
      req.cookies.token ||
      req.body.token ||
      (req.headers.authorization?.replace('Bearer ', '') || '');

    // Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token is missing',
      });
      return;
    }

    // Verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET || '') as {
        id: string;
        email: string;
        accountType: 'User' | 'Consultant' | 'Admin';
      };

      // Attach the decoded user info to the request object
      req.user = decode;

      // Proceed to the next middleware
      next();
    } catch (err) {
      res.status(401).json({
        success: false,
        message: 'Token is invalid',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong while validating the token',
    });
  }
};


// Role-based middleware
export const isUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the user's account type is "User"
    if (req.user?.accountType !== 'User') {
      res.status(403).json({
        success: false,
        message: 'This route is restricted to Users only.',
      });
      return;
    }
    // Proceed to the next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to verify user role. Please try again.',
    });
  }
};


export const isConsultant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the user's account type is "Consultant"
    if (req.user?.accountType !== 'Consultant') {
      res.status(403).json({
        success: false,
        message: 'This route is restricted to Consultants only.',
      });
      return;
    }
    // Proceed to the next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to verify consultant role. Please try again.',
    });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the user's account type is "Admin"
    if (req.user?.accountType !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'This route is restricted to Admins only.',
      });
      return;
    }
    // Proceed to the next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to verify admin role. Please try again.',
    });
  }
};
