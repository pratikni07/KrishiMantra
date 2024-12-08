const mongoose = require("mongoose")

const UserDetailSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    subscription: {
      type: {
        type: {
          type: String,
          enum: ["FREE","PRIME","MEGA"],
          default: "FREE"
        },
        transactionDetails: {
          type: mongoose.Schema.Types.Mixed
        },
        endDate: Date,
        purchasedDate: Date
      },
      default: {}
    },
    company:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Company"
    }
  }, {
    timestamps: true
  });

  module.exports = mongoose.model("UserDetail", UserDetailSchema);