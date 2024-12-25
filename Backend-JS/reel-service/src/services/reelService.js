// services/reelService.js
const mongoose = require("mongoose");
const Reel = require("../models/Reel");
const Comment = require("../models/CommentModal");
const Like = require("../models/LikeModel");
const TagService = require("./tagService");
const redis = require("../config/redis");
const PaginationUtils = require("../utils/pagination");

const CACHE_TTL = 3600; // 1 hour

class ReelService {
  static async createReel(reelData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reel = new Reel(reelData);
      await reel.save({ session });

      if (reelData.description) {
        await TagService.processTags(reelData.description, reel._id);
      }

      await session.commitTransaction();

      await redis.del(`reels:trending`);
      await redis.del(`reels:user:${reelData.userId}`);

      return reel;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getReels(page = 1, limit = 10, filters = {}) {
    const cacheKey = `reels:page:${page}:limit:${limit}:${JSON.stringify(
      filters
    )}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const skip = (page - 1) * limit;

    const [reels, total] = await Promise.all([
      Reel.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Reel.countDocuments(filters),
    ]);

    const result = PaginationUtils.formatPaginationResponse(
      reels,
      page,
      limit,
      total
    );

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  static async getReelWithComments(reelId, page = 1, limit = 10) {
    const cacheKey = `reel:${reelId}:comments:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const skip = (page - 1) * limit;

    const [reel, comments, totalComments] = await Promise.all([
      Reel.findById(reelId).lean(),
      Comment.find({
        reel: reelId,
        parentComment: null,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "replies",
          options: {
            sort: { createdAt: -1 },
            limit: 5,
          },
        })
        .lean(),
      Comment.countDocuments({
        reel: reelId,
        parentComment: null,
      }),
    ]);

    if (!reel) {
      return null;
    }

    const result = {
      ...reel,
      comments: PaginationUtils.formatPaginationResponse(
        comments,
        page,
        limit,
        totalComments
      ),
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  static async getTrendingReels(page = 1, limit = 10) {
    const cacheKey = `reels:trending:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const skip = (page - 1) * limit;

    const [reels, total] = await Promise.all([
      Reel.aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "reel",
            as: "comments",
          },
        },
        {
          $addFields: {
            commentCount: { $size: "$comments" },
            engagement: {
              $add: [{ $ifNull: ["$like.count", 0] }, { $size: "$comments" }],
            },
          },
        },
        {
          $sort: {
            engagement: -1,
            createdAt: -1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]),
      Reel.countDocuments(),
    ]);

    const result = PaginationUtils.formatPaginationResponse(
      reels,
      page,
      limit,
      total
    );

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  static async likeReel(reelId, userData) {
    const existingLike = await Like.findOne({
      reel: reelId,
      userId: userData.userId,
    });

    if (existingLike) {
      throw new Error("Reel already liked");
    }

    const like = new Like({
      reel: reelId,
      ...userData,
    });

    await like.save();
    await Reel.findByIdAndUpdate(reelId, {
      $inc: { "like.count": 1 },
    });

    await redis.del(`reel:${reelId}`);
    return like;
  }

  static async unlikeReel(reelId, userId) {
    const result = await Like.findOneAndDelete({
      reel: reelId,
      userId,
    });

    if (result) {
      await Reel.findByIdAndUpdate(reelId, {
        $inc: { "like.count": -1 },
      });
      await redis.del(`reel:${reelId}`);
    }

    return result;
  }
  static async addComment(reelId, commentData) {
    const comment = new Comment({
      reel: reelId,
      ...commentData,
    });

    if (commentData.parentComment) {
      const parentComment = await Comment.findById(commentData.parentComment);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      if (parentComment.depth >= 5) {
        throw new Error("Maximum comment depth reached");
      }

      comment.depth = parentComment.depth + 1;
      await Comment.findByIdAndUpdate(commentData.parentComment, {
        $push: { replies: comment._id },
      });
    }

    await comment.save();
    await Reel.findByIdAndUpdate(reelId, {
      $inc: { "comment.count": 1 },
    });

    await redis.del(`reel:${reelId}`);
    await redis.del(`reel:${reelId}:comments:*`);

    return comment;
  }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findOne({
      _id: commentId,
      userId,
    });

    if (!comment) {
      throw new Error("Comment not found or unauthorized");
    }

    // Soft delete the comment
    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();

    // Update reel comment count
    await Reel.findByIdAndUpdate(comment.reel, {
      $inc: { "comment.count": -1 },
    });

    await redis.del(`reel:${comment.reel}`);
    await redis.del(`reel:${comment.reel}:comments:*`);

    return comment;
  }

  static async getUserReels(userId, page = 1, limit = 10) {
    const cacheKey = `reels:user:${userId}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const skip = (page - 1) * limit;

    const [reels, total] = await Promise.all([
      Reel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reel.countDocuments({ userId }),
    ]);

    const result = PaginationUtils.formatPaginationResponse(
      reels,
      page,
      limit,
      total
    );

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  static async deleteReel(reelId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reel = await Reel.findOne({ _id: reelId, userId });

      if (!reel) {
        throw new Error("Reel not found or unauthorized");
      }

      await Promise.all([
        Reel.findByIdAndDelete(reelId, { session }),
        Comment.deleteMany({ reel: reelId }, { session }),
        Like.deleteMany({ reel: reelId }, { session }),
        TagService.removeTagsFromReel(reelId),
      ]);

      await session.commitTransaction();

      // Clear related cache
      const cacheKeys = [
        `reel:${reelId}`,
        `reel:${reelId}:comments:*`,
        `reels:user:${userId}:*`,
        "reels:trending:*",
      ];

      await Promise.all(cacheKeys.map((key) => redis.del(key)));

      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async searchReels(query, page = 1, limit = 10) {
    const cacheKey = `reels:search:${query}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, "i");
    const [reels, total] = await Promise.all([
      Reel.find({
        $or: [{ description: searchRegex }, { userName: searchRegex }],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reel.countDocuments({
        $or: [{ description: searchRegex }, { userName: searchRegex }],
      }),
    ]);

    const result = PaginationUtils.formatPaginationResponse(
      reels,
      page,
      limit,
      total
    );

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }
}

module.exports = ReelService;
