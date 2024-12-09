const Comment = require('../model/CommetModel');
const Feed = require('../model/FeedModel');
const { redisCache } = require('../utils/redis');

class CommentController {
  // Create a new comment
  static async createComment(req, res) {
    try {
      const { 
        userId, 
        userName, 
        profilePhoto, 
        feedId, 
        content, 
        parentCommentId 
      } = req.body;

      // Find the feed
      const feed = await Feed.findById(feedId);
      if (!feed) {
        return res.status(404).json({ message: 'Feed not found' });
      }

      // Determine comment depth
      const depth = parentCommentId 
        ? (await Comment.findById(parentCommentId)).depth + 1 
        : 0;

      // Check depth limit
      if (depth >= 5) {
        return res.status(400).json({ message: 'Maximum comment nesting depth reached' });
      }

      // Create new comment
      const newComment = new Comment({
        userId,
        userName,
        profilePhoto,
        feed: feedId,
        content,
        parentComment: parentCommentId || null,
        depth
      });

      // Save comment
      await newComment.save();

      // Update feed comment count
      await Feed.findByIdAndUpdate(feedId, {
        $inc: { 'comment.count': 1 },
        $push: { 'comment.comments': newComment._id }
      });

      // If this is a reply, update parent comment
      if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
          $push: { replies: newComment._id }
        });
      }

      // Invalidate comment cache for this feed
      await redisCache.invalidatePatterns(`comments:${feedId}:*`);

      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating comment', 
        error: error.message 
      });
    }
  }

  // Get comments for a specific feed with pagination
  static async getComments(req, res) {
    try {
      const { 
        feedId, 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      // Create cache key
      const cacheKey = `comments:${feedId}:${page}:${limit}:${sortBy}:${sortOrder}`;
      
      // Check cache
      const cachedComments = await redisCache.get(cacheKey);
      if (cachedComments) {
        return res.json(cachedComments);
      }

      // Pagination options
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { 
          [sortBy]: sortOrder === 'desc' ? -1 : 1 
        },
        populate: [
          { path: 'replies', select: 'content userName createdAt' },
          { path: 'parentComment', select: 'content userName' }
        ],
        // Only fetch top-level comments
        match: { 
          feed: feedId, 
          parentComment: null 
        }
      };

      // Fetch paginated comments
      const comments = await Comment.paginate({}, options);

      // Cache results
      await redisCache.set(cacheKey, comments, 300); // 5 min cache

      res.json(comments);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching comments', 
        error: error.message 
      });
    }
  }

  // Update a comment
  static async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
      );

      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Invalidate specific comment cache
      await redisCache.del(`comment:${commentId}`);

      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating comment', 
        error: error.message 
      });
    }
  }

  // Delete a comment (soft delete)
  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Soft delete
      comment.isDeleted = true;
      await comment.save();

      // Update feed comment count
      await Feed.findByIdAndUpdate(comment.feed, {
        $inc: { 'comment.count': -1 },
        $pull: { 'comment.comments': commentId }
      });

      // Invalidate caches
      await redisCache.invalidatePatterns(`comments:${comment.feed}:*`);
      await redisCache.del(`comment:${commentId}`);

      res.json({ message: 'Comment soft deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting comment', 
        error: error.message 
      });
    }
  }

  // Report a comment
  static async reportComment(req, res) {
    try {
      const { commentId } = req.params;
      const { userId, reason } = req.body;

      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { 
          $push: { 
            reports: { 
              userId, 
              reason, 
              createdAt: new Date() 
            } 
          } 
        },
        { new: true }
      );

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      res.json({ message: 'Comment reported successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error reporting comment', 
        error: error.message 
      });
    }
  }
}

module.exports = CommentController;