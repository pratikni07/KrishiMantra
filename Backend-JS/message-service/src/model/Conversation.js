const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true
  },
  participants: [{
    userId:{
      type:String
    },
    userName:{
      type:String
    },
    profilePhoto : {
      type:String
    }
  }],
  admin: {
    userId:{
      type:String
    },
    userName:{
      type:String
    },
    profilePhoto : {
      type:String
    }
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  inviteLink: {
    type: String
  },
  blockedUsers: [{
    userId:{
      type:String
    },
    userName:{
      type:String
    },
    profilePhoto : {
      type:String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);