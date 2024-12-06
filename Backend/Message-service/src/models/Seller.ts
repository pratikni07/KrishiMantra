import mongoose, { Schema, Document } from 'mongoose';
import { ISeller } from '../types';

const SellerSchema: Schema = new Schema({
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
  companyName: { 
    type: String 
  },
  profilePicture: { 
    type: String 
  },
  blockedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  groups: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
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

export const Seller = mongoose.model<ISeller>('Seller', SellerSchema);