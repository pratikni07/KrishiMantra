const express = require('express');
const { 
  createReel, 
  getReels, 
  likeReel,
  addComment
} = require('../controllers/reelController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Upload a new reel
router.post(
  '/upload', 
  authMiddleware, 
  uploadMiddleware.single('video'), 
  createReel
);

// Get paginated reels
router.get('/', authMiddleware, getReels);

// Like/Unlike a reel
router.post('/:reelId/like', authMiddleware, likeReel);

// Add a comment to a reel
router.post('/:reelId/comment', authMiddleware, addComment);

module.exports = router;