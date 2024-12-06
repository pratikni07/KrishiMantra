import mongoose, { Schema, Document } from 'mongoose';
import { IReport } from '../types';

const ReportSchema: Schema = new Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  reportedSeller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller',
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);