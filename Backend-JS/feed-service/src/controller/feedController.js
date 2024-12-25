const Feed = require("../model/FeedModel");
const mongoose = require("mongoose");
const Comment = require("../model/CommetModel");
const Tag = require("../model/Tags");
const Like = require("../model/LikeModel");
const redis = require("../config/redis");

// Cache keys and duration
const FEED_CACHE_KEY = "feed:";
const COMMENTS_CACHE_KEY = "comments:";
const TAG_CACHE_KEY = "tag:";
const CACHE_DURATION = 3600; // 1 hour in seconds
const RANDOM_FEEDS_CACHE_KEY = "random-feeds:"; // Add this with other constants

function extractTags(content) {
  const tagRegex = /#(\w+)/g;
  const matches = content.match(tagRegex);
  return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
}

class FeedController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getRandomFeeds = this.getRandomFeeds.bind(this);
    this.manageRandomFeedCache = this.manageRandomFeedCache.bind(this);
    this.invalidateRandomFeedsCache =
      this.invalidateRandomFeedsCache.bind(this);
    this.createFeed = this.createFeed.bind(this);
    this.getFeed = this.getFeed.bind(this);
    this.addComment = this.addComment.bind(this);
    this.toggleLike = this.toggleLike.bind(this);
    this.getFeedsByTag = this.getFeedsByTag.bind(this);
  }
  async getRandomFeeds(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

      // Create a cache key that includes pagination parameters
      const cacheKey = `${RANDOM_FEEDS_CACHE_KEY}${page}:${limit}`;

      // Try to get from cache first
      try {
        const cachedFeeds = await redis.get(cacheKey);
        if (cachedFeeds) {
          return res.json(JSON.parse(cachedFeeds));
        }
      } catch (cacheError) {
        console.error("Cache error:", cacheError);
        // Continue without cache if there's an error
      }

      // Get total count of feeds
      const totalFeeds = await Feed.countDocuments();

      if (totalFeeds === 0) {
        return res.json({
          feeds: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalFeeds: 0,
            hasMore: false,
          },
        });
      }

      // Calculate skip for random offset while maintaining consistency per page
      const maxSkip = Math.max(0, totalFeeds - limit);
      const baseSkip = ((page - 1) * limit) % (maxSkip + 1);

      // Create a deterministic but seemingly random offset based on page number
      const seed = parseInt(page.toString() + Date.now().toString().slice(-4));
      const randomOffset = seed % Math.max(1, Math.floor(maxSkip / 10));
      const skip = Math.min(maxSkip, baseSkip + randomOffset);

      const feeds = await Feed.aggregate([
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "feed",
            pipeline: [{ $match: { parentComment: null } }, { $limit: 10 }],
            as: "recentComments",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "feed",
            as: "likes",
          },
        },
        {
          $addFields: {
            commentCount: { $size: "$recentComments" },
            likeCount: { $size: "$likes" },
          },
        },
        {
          $project: {
            userId: 1,
            userName: 1,
            profilePhoto: 1,
            description: 1,
            content: 1,
            mediaUrl: 1,
            location: 1,
            date: 1,
            like: {
              count: "$likeCount",
            },
            comment: {
              count: "$commentCount",
            },
            recentComments: { $slice: ["$recentComments", 10] },
          },
        },
      ]).exec();

      const result = {
        feeds,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFeeds / limit),
          totalFeeds,
          hasMore: page * limit < totalFeeds,
        },
      };

      // Cache the results with expiration
      try {
        await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(result));
        await this.manageRandomFeedCache(page);
      } catch (cacheError) {
        console.error("Cache save error:", cacheError);
        // Continue even if caching fails
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching random feeds:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async manageRandomFeedCache(currentPage) {
    try {
      // Get all random feed cache keys using the Redis client
      const keys = await redis.client.keys(`${RANDOM_FEEDS_CACHE_KEY}*`);

      // Keep only the current page and adjacent pages in cache
      for (const key of keys) {
        const pagePart = key.split(":")[1];
        const page = parseInt(pagePart);

        if (Math.abs(page - currentPage) > 2) {
          // Remove cache for pages that are far from current page
          await redis.del(key);
        }
      }
    } catch (error) {
      console.error("Error managing random feed cache:", error);
      // Continue execution even if cache management fails
    }
  }

  async invalidateRandomFeedsCache() {
    try {
      // Get all random feed cache keys
      const keys = await redis.client.keys(`${RANDOM_FEEDS_CACHE_KEY}*`);

      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
      }
    } catch (error) {
      console.error("Error invalidating random feeds cache:", error);
    }
  }
  async createFeed(req, res) {
    try {
      const {
        userId,
        userName,
        profilePhoto,
        description,
        content,
        mediaUrl,
        location,
      } = req.body;

      const feed = new Feed({
        userId,
        userName,
        profilePhoto,
        description,
        content,
        mediaUrl,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        like: { count: 0 },
        comment: { count: 0 },
      });

      await feed.save();

      const tags = extractTags(content);

      // Handle tags with proper error checking
      for (const tagName of tags) {
        try {
          // Use findOneAndUpdate instead of findOne
          const tag = await Tag.findOneAndUpdate(
            { name: tagName },
            {
              $setOnInsert: { name: tagName },
              $addToSet: { feedId: feed._id },
            },
            {
              upsert: true,
              new: true,
            }
          );

          await redis.del(`${TAG_CACHE_KEY}${tagName}`);
        } catch (err) {
          console.error(`Error processing tag ${tagName}:`, err);
          continue;
        }
      }

      await redis.setex(
        `${FEED_CACHE_KEY}${feed._id}`,
        CACHE_DURATION,
        JSON.stringify(feed)
      );
      await this.invalidateRandomFeedsCache();

      res.status(201).json(feed);
    } catch (error) {
      console.error("Error creating feed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getFeed(req, res) {
    try {
      const { feedId } = req.params;

      // Validate if feedId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(feedId)) {
        return res.status(400).json({ error: "Invalid feed ID format" });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      // Try to get feed from cache
      const cachedFeed = await redis.get(`${FEED_CACHE_KEY}${feedId}`);
      let feed;

      if (cachedFeed) {
        feed = JSON.parse(cachedFeed);
      } else {
        feed = await Feed.findById(feedId);
        if (!feed) {
          return res.status(404).json({ error: "Feed not found" });
        }

        // Cache the feed
        await redis.setex(
          `${FEED_CACHE_KEY}${feedId}`,
          CACHE_DURATION,
          JSON.stringify(feed)
        );
      }

      // Try to get comments from cache
      const cacheKey = `${COMMENTS_CACHE_KEY}${feedId}:${page}:${limit}`;
      const cachedComments = await redis.get(cacheKey);
      let comments;

      if (cachedComments) {
        comments = JSON.parse(cachedComments);
      } else {
        comments = await Comment.find({ feed: feedId, parentComment: null })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: "replies",
            options: { limit: 5, sort: { createdAt: -1 } },
          });

        // Cache the comments
        await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(comments));
      }

      const totalComments = await Comment.countDocuments({
        feed: feedId,
        parentComment: null,
      });

      res.json({
        feed,
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
        },
      });
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async addComment(req, res) {
    try {
      const { feedId } = req.params;
      const { userId, userName, profilePhoto, content, parentCommentId } =
        req.body;

      let depth = 0;
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
          return res.status(404).json({ error: "Parent comment not found" });
        }
        depth = parentComment.depth + 1;
        if (depth > 5) {
          return res
            .status(400)
            .json({ error: "Maximum comment depth reached" });
        }
      }

      const comment = new Comment({
        userId,
        userName,
        profilePhoto,
        feed: feedId,
        content,
        parentComment: parentCommentId,
        depth,
      });

      await comment.save();

      if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
          $push: { replies: comment._id },
        });
      }

      await Feed.findByIdAndUpdate(feedId, {
        $inc: { "comment.count": 1 },
      });

      // Invalidate feed and comments cache
      await redis.del(`${FEED_CACHE_KEY}${feedId}`);
      const keys = await redis.client.keys(`${COMMENTS_CACHE_KEY}${feedId}:*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async toggleLike(req, res) {
    try {
      const { feedId } = req.params;
      const { userId, userName, profilePhoto } = req.body;

      const existingLike = await Like.findOne({ feed: feedId, userId });

      if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        await Feed.findByIdAndUpdate(feedId, {
          $inc: { "like.count": -1 },
        });
      } else {
        const like = new Like({
          userId,
          userName,
          profilePhoto,
          feed: feedId,
        });
        await like.save();
        await Feed.findByIdAndUpdate(feedId, {
          $inc: { "like.count": 1 },
        });
      }

      // Invalidate feed cache
      await redis.del(`${FEED_CACHE_KEY}${feedId}`);

      res.json({ success: true });
    } catch (error) {
      console.error("Error processing like:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getFeedsByTag(req, res) {
    try {
      const { tagName } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const cacheKey = `${TAG_CACHE_KEY}${tagName}:${page}:${limit}`;
      const cachedResult = await redis.get(cacheKey);

      if (cachedResult) {
        return res.json(JSON.parse(cachedResult));
      }

      const tag = await Tag.findOne({ name: tagName }).populate({
        path: "feedId",
        options: {
          skip,
          limit,
          sort: { date: -1 },
        },
      });

      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }

      const totalFeeds = tag.feedId.length;
      const result = {
        feeds: tag.feedId,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFeeds / limit),
          totalFeeds,
        },
      };

      // Cache the result
      await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(result));

      res.json(result);
    } catch (error) {
      console.error("Error fetching feeds by tag:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new FeedController();
