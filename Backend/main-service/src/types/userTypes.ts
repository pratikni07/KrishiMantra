import { Document, Types } from 'mongoose';

export enum AccountType {
  ADMIN = 'admin',
  USER = 'user',
  CONSULTANT = 'consultant'
}

export interface IUser extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNo?: number;
  contactNumber?: string;
  details?: Types.ObjectId;
  additionalDetails?: Types.ObjectId;
  accountType: AccountType;
  token?: string;
  image?: string;
  createdAt: Date;
}