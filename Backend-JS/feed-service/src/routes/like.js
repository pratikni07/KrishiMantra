const express = require('express');
const router = express.Router();
const LikeController = require('../controller/likeController');
// const { 
//   authenticateUser, 
//   validateLikeCreation 
// } = require('../middleware');

// Toggle Like (Create/Remove)
router.post(
  '/toggle', 
  // authenticateUser,
  // validateLikeCreation,
  LikeController.toggleLike
);

// Get Likes for a Specific Feed
router.get(
  '/feed/:feedId', 
  // authenticateUser,
  LikeController.getFeedLikes
);

// Get User's Liked Feeds
router.get(
  '/user/:userId', 
  // authenticateUser,
  LikeController.getUserLikedFeeds
);

module.exports = router;