const Reel = require('../models/Reel');
const { uploadToS3 } = require('../config/s3');
const { processVideo } = require('../utils/videoProcessor');

// Create a new reel
exports.createReel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Process video
    const processedVideo = await processVideo(file);

    // Upload to S3
    const videoUrl = await uploadToS3(processedVideo);

    // Create reel document
    const reel = new Reel({
      user: {
        userId: req.user._id,
        userName: req.user.username
      },
      videoUrl,
      description: req.body.description,
      hashtags: req.body.hashtags?.split(',') || [],
      s3Key: videoUrl.split('/').pop()
    });

    await reel.save();

    res.status(201).json({
      message: 'Reel uploaded successfully',
      reel
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading reel', 
      error: error.message 
    });
  }
};

// Get reels with pagination (7 reels per page)
exports.getReels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 7; // Fixed to 7 reels per page as requested
    const skip = (page - 1) * limit;

    // Fetch reels with pagination
    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-views.view -likes.like -comments.comment'); // Exclude detailed view/like/comment arrays

    // Count total reels for pagination info
    const totalReels = await Reel.countDocuments();
    const totalPages = Math.ceil(totalReels / limit);

    res.json({
      reels,
      pagination: {
        currentPage: page,
        totalPages,
        totalReels,
        reelsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching reels', 
      error: error.message 
    });
  }
};

// Like a reel
exports.likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Check if user already liked the reel
    const alreadyLiked = reel.likes.like.some(
      like => like.userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike the reel
      reel.likes.like = reel.likes.like.filter(
        like => like.userId.toString() !== req.user._id.toString()
      );
      reel.likes.type = Math.max(0, reel.likes.type - 1);
    } else {
      // Like the reel
      reel.likes.like.push({
        userId: req.user._id,
        userName: req.user.username
      });
      reel.likes.type += 1;
    }

    await reel.save();

    res.json({
      message: alreadyLiked ? 'Reel unliked' : 'Reel liked',
      likes: reel.likes.type
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error liking reel', 
      error: error.message 
    });
  }
};

// Add a comment to a reel
exports.addComment = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const newComment = {
      userId: req.user._id,
      userName: req.user.username,
      comment: req.body.comment,
      likes: 0
    };

    reel.comments.comment.push(newComment);
    reel.comments.type += 1;

    await reel.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding comment', 
      error: error.message 
    });
  }
};