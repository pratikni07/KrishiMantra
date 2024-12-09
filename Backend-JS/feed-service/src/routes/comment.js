const express = require('express');
const router = express.Router();
const CommentController = require('../controller/commentController');
// const { 
//   authenticateUser, 
//   validateCommentCreation 
// } = require('../middleware');

// Create a new comment
router.post(
  '/create', 
  // authenticateUser,
  // validateCommentCreation,
  CommentController.createComment
);

// Get comments for a specific feed
router.get(
  '/', 
  // authenticateUser,
  CommentController.getComments
);

// Update a specific comment
router.put(
  '/:commentId', 
  // authenticateUser,
  CommentController.updateComment
);

// Delete a comment
router.delete(
  '/:commentId', 
  // authenticateUser,
  CommentController.deleteComment
);

// Report a comment
router.post(
  '/:commentId/report', 
  // authenticateUser,
  CommentController.reportComment
);

module.exports = router;