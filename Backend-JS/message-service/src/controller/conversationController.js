const Conversation = require('../model/Conversation');
const redisClient = require('../config/redis');

class ConversationController {
  // Create a new conversation
  async createConversation(req, res) {
    try {
      const { type, participants, title, description } = req.body;
      
      const conversation = new Conversation({
        type,
        participants,
        admin: participants[0], // First participant is admin
        title,
        description
      });

      await conversation.save();

      // Cache conversation in Redis
      await redisClient.getClient().set(
        `conversation:${conversation._id}`, 
        JSON.stringify(conversation)
      );

      res.status(201).json({
        success: true,
        conversation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get conversation by ID
  async getConversation(req, res) {
    try {
      const { id } = req.params;
      
      // Try to get from Redis first
      const cachedConversation = await redisClient.getClient().get(`conversation:${id}`);
      
      if (cachedConversation) {
        return res.json({
          success: true,
          conversation: JSON.parse(cachedConversation)
        });
      }

      const conversation = await Conversation.findById(id);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Cache for future requests
      await redisClient.getClient().set(
        `conversation:${id}`, 
        JSON.stringify(conversation)
      );

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add participant to conversation
  async addParticipant(req, res) {
    try {
      const { id } = req.params;
      const { participant } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        id,
        { $push: { participants: participant } },
        { new: true }
      );

      // Invalidate Redis cache
      await redisClient.getClient().del(`conversation:${id}`);

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Block user from conversation
  async blockUser(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        id,
        { 
          $push: { blockedUsers: userId },
          $pull: { participants: { userId } }
        },
        { new: true }
      );

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ConversationController();