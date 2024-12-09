const Feed = require('../model/FeedModel');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { redisCache } = require('../utils/redis');
const mongoose = require('mongoose');
const Comments = require("../model/CommetModel")
class FeedController {
  // Extract hashtags from description
  static extractHashtags(description) {
    const hashtagRegex = /#(\w+)/g;
    return (description.match(hashtagRegex) || [])
      .map(tag => tag.slice(1).toLowerCase())
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  // Create a new feed
  static async createFeed(req, res) {
    try {
      const { 
        userId, 
        userName, 
        profilePhoto, 
        description, 
        content 
      } = req.body;

      // Extract hashtags from description
      const extractedTags = this.extractHashtags(description);

      // Handle media upload
      let mediaUrl = null;
      if (req.file) {
        const uploadResult = await uploadToCloudinary(
          req.file.path, 
          'feeds', 
          req.file.mimetype.startsWith('image') ? 'image' : 'video'
        );
        mediaUrl = uploadResult.url;
      }
      // Create feed with tags
      const newFeed = new Feed({
        userId,
        userName,
        profilePhoto,
        description,
        content: mediaUrl || content,
        tags: [
          ...extractedTags,
          ...(req.body.tags || [])
        ],
        location: req.body.location || {}
      });

      await newFeed.save();

      // Invalidate feed cache
      await redisCache.invalidatePatterns('feeds:*');

      res.status(201).json(newFeed);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating feed', 
        error: error.message 
      });
    }
  }

  // Get feeds with advanced filtering and pagination
  static async getFeeds(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        tag, 
        latitude, 
        longitude, 
        radius = 10 

      } = req.query;

      // Check Redis cache first
      const cacheKey = `feeds:${page}:${limit}:${tag || 'all'}`;
      const cachedFeeds = await redisCache.get(cacheKey);
      
      if (cachedFeeds) {
        return res.json(cachedFeeds);
      }

      // Build query
      const query = {};
      
      // Location-based filtering
      if (latitude && longitude) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: radius * 1000 // Convert to meters
          }
        };
      }

      // Tag filtering
      if (tag) {
        query.tags = tag.toLowerCase();
      }

      // Pagination
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { date: -1 },
        populate: ['likes.likes', 'comment.comments']
      };

      const feeds = await Feed.paginate(query, options);

      // Cache results
      await redisCache.set(cacheKey, feeds, 300); // 5 min cache

      res.json(feeds);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching feeds', 
        error: error.message 
      });
    }
  }

  // Delete feed with associated media cleanup
  static async deleteFeed(req, res) {
    try {
      const { feedId } = req.params;
      const feed = await Feed.findByIdAndDelete(feedId);

      if (feed && feed.content) {
        // Delete associated Cloudinary media
        await deleteFromCloudinary(
          feed.content.split('/').pop().split('.')[0],
          feed.content.includes('video') ? 'video' : 'image'
        );
      }

      // Invalidate cache
      await redisCache.invalidatePatterns('feeds:*');

      res.status(200).json({ message: 'Feed deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting feed', 
        error: error.message 
      });
    }
  }
}

module.exports = FeedController;