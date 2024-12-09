const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
  user: {
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  videoUrl: {
    type: String,
    required: true
  },
  description: String,
  likes: {
    type: Number,
    default: 0,
    like: [{
      userId: {
        type: String,
        require:true
      },
      userName: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  comments: {
    type: Number,
    default: 0,
    comment: [{
      userId: {
        type: String,
        require:true
      },
      userName: String,
      comment: String,
      likes: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  views: {
    type: Number,
    default: 0,
    view: [{
      userId: {
        type: String,
        require:true
      },
      userName: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  hashtags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  s3Key: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Reel', ReelSchema);