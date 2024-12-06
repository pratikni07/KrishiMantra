import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  blockedSellers: string[];
  reportedSellers: Array<{
    seller: string;
    reportReason: string;
    reportDate: Date;
  }>;
  createdAt: Date;
  isActive: boolean;
}

export interface ISeller extends Document {
  username: string;
  email: string;
  password: string;
  companyName?: string;
  profilePicture?: string;
  blockedUsers: string[];
  products: string[];
  groups: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface IMessage extends Document {
  sender: string;
  senderModel: 'User' | 'Seller';
  receiver: string;
  receiverModel: 'User' | 'Seller';
  group?: string;
  content?: string;
  attachments: Array<{
    url: string;
    fileType: 'image' | 'video' | 'file' | 'link';
  }>;
  readBy: string[];
  createdAt: Date;
}

export interface IGroup extends Document {
  name: string;
  seller: string;
  members: string[];
  settings: {
    allowUserMessages: boolean;
  };
  createdAt: Date;
}

export interface IReport extends Document {
  reporter: string;
  reportedSeller: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}