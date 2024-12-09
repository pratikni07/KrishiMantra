const express = require('express');
const router = express.Router();
const FeedController = require('../controller/feedController');
// const { 
//   validateFeedCreation, 
//   // authenticateUser, 
//   uploadMiddleware 
// } = require('../middleware');

// Create new feed
router.post(
  '/create', 
  // authenticateUser,
  // uploadMiddleware.single('media'),
  // validateFeedCreation,
  FeedController.createFeed
);

// Get feeds with pagination and filtering
router.get(
  '/', 
  // authenticateUser,
  FeedController.getFeeds
);

// Delete a specific feed
router.delete(
  '/:feedId', 
  // authenticateUser,
  FeedController.deleteFeed
);

module.exports = router;