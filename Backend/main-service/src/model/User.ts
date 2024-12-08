import mongoose, { Schema } from 'mongoose';
import { IUser, AccountType } from '../types/userTypes';

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  phoneNo: {
    type: Number,
    validate: {
      validator: function(v: number) {
        return /\d{10}/.test(v.toString());
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  contactNumber: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail'
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail'
  },
  accountType: {
    type: String,
    enum: Object.values(AccountType),
    default: AccountType.USER
  },
  token: {
    type: String,
  },
  image: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;