import { Document, Types } from 'mongoose';

export enum SubscriptionType {
  FREE = 'free',
  PRIME = 'prime',
  ADVANCE = 'advance'
}

export interface IUserDetail extends Document {
  userId: Types.ObjectId;
  address?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  interests?: string[];
  profilePic?: string;
  followers?: Types.ObjectId[];
  followings?: Types.ObjectId[];
  blockedUsers?: Types.ObjectId[];
  subscription?: {
    type: SubscriptionType;
    transactionDetails?: Record<string, unknown>;
    endDate?: Date;
    purchasedDate?: Date;
  };
}