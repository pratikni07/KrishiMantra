const Message = require('../model/Message');
const Conversation = require('../model/Conversation');
const socketService = require('../services/socketService');
const redisClient = require('../config/redis');

class MessageController {
  async sendMessage(req, res) {
    try {
      const { conversationId, sender, content, messageType, mediaUrl } = req.body;

      // Validate conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      const newMessage = new Message({
        conversation: conversationId,
        sender,
        content,
        messageType,
        mediaUrl
      });

      await newMessage.save();

      // Broadcast message via Socket.IO
      const io = socketService.getIO();
      io.to(conversationId).emit('new_message', newMessage);

      // Cache message in Redis
      await redisClient.getClient().set(
        `message:${newMessage._id}`, 
        JSON.stringify(newMessage)
      );

      res.status(201).json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.json({
        success: true,
        messages,
        pagination: {
          currentPage: page,
          limit,
          totalMessages: messages.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MessageController();