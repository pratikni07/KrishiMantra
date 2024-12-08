import mongoose, { Schema } from 'mongoose';
import { IUserDetail, SubscriptionType } from '../types/userDetailTypes';

const UserDetailSchema: Schema<IUserDetail> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'User ID is required']
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    default: {}
  },
  interests: [
    {
      type: String,
      trim: true
    }
  ],
  profilePic: {
    type: String,
    trim: true
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  followings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  blockedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  subscription: {
    type: {
      type: {
        type: String,
        enum: Object.values(SubscriptionType),
        default: SubscriptionType.FREE
      },
      transactionDetails: {
        type: Schema.Types.Mixed
      },
      endDate: Date,
      purchasedDate: Date
    },
    default: {}
  }
}, {
  timestamps: true
});

const UserDetail = mongoose.model<IUserDetail>('UserDetail', UserDetailSchema);
export default UserDetail;