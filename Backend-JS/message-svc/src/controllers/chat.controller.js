const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Redis = require("../config/redis");

class ChatController {
  async createDirectChat(req, res) {
    try {
      const { participantId, userId } = req.body;
      // const userId = req.user.userId;

      // Check if chat already exists
      const existingChat = await Chat.findOne({
        type: "direct",
        participants: { $all: [userId, participantId] },
      });

      if (existingChat) {
        return res.json(existingChat);
      }

      const chat = await Chat.create({
        type: "direct",
        participants: [userId, participantId],
      });

      return res.status(201).json(chat);
    } catch (error) {
      console.error("Create direct chat error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getUserChats(req, res) {
    try {
      const { userId } = req.body;
      // const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const chats = await Chat.aggregate([
        {
          $match: {
            participants: userId,
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "lastMessage",
            foreignField: "_id",
            as: "lastMessageDetails",
          },
        },
        {
          $lookup: {
            from: "groups",
            localField: "_id",
            foreignField: "chatId",
            as: "groupDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { participants: "$participants" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$userId", "$$participants"] },
                      { $ne: ["$userId", userId] },
                    ],
                  },
                },
              },
            ],
            as: "participantDetails",
          },
        },
        {
          $sort: { "lastMessageDetails.createdAt": -1 },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ]);

      return res.json(chats);
    } catch (error) {
      console.error("Get user chats error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getChatMessages(req, res) {
    try {
      const { userId } = req.body;
      const { chatId } = req.params;
      // const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (!chat.participants.includes(userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await Message.find({
        chatId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Mark messages as read
      await Message.updateMany(
        {
          chatId,
          "readBy.userId": { $ne: userId },
          sender: { $ne: userId },
        },
        {
          $push: {
            readBy: {
              userId,
              readAt: new Date(),
            },
          },
        }
      );

      return res.json(messages.reverse());
    } catch (error) {
      console.error("Get chat messages error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new ChatController();
