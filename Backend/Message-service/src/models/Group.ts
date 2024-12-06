import mongoose, { Schema, Document } from 'mongoose';
import { IGroup } from '../types';

const GroupSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller',
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  settings: {
    allowUserMessages: {
      type: Boolean,
      default: false
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

export const Group = mongoose.model<IGroup>('Group', GroupSchema);