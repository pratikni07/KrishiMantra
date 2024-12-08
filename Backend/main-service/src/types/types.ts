import { Types } from 'mongoose';

// User Types
export interface IUser {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  accountType: 'admin' | 'user' | 'consultant';
  additionalDetails: Types.ObjectId;
  image?: string;
}

// UserDetail Types
export interface IUserDetail {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  // Add other fields as needed
}

// OTP Types
export interface IOTP {
  email: string;
  otp: string;
  createdAt: Date;
}

// Extended Request Interface to include user authentication
export interface AuthRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    accountType?: string;
  };
}