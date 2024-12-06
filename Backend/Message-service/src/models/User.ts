import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

const UserSchema: Schema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  profilePicture: { 
    type: String 
  },
  blockedSellers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller' 
  }],
  reportedSellers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller',
    reportReason: String,
    reportDate: Date
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

export const User = mongoose.model<IUser>('User', UserSchema);