import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema: Schema = new Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'senderModel',
    required: true 
  },
  senderModel: { 
    type: String, 
    enum: ['User', 'Seller'], 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'receiverModel',
    required: true 
  },
  receiverModel: { 
    type: String, 
    enum: ['User', 'Seller'], 
    required: true 
  },
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  content: { 
    type: String 
  },
  attachments: [{
    type: {
      url: String,
      fileType: {
        type: String,
        enum: ['image', 'video', 'file', 'link']
      }
    }
  }],
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'senderModel' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);