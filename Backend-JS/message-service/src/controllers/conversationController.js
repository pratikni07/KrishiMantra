const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

class ConversationController {
  // Create a new conversation
  async createConversation(req, res) {
    try {
      const { 
        type, 
        participants, 
        admin, 
        title, 
        description 
      } = req.body;

      // Validate participants
      const existingUsers = await User.find({
        _id: { $in: participants }
      });

      if (existingUsers.length !== participants.length) {
        return res.status(400).json({ 
          error: 'One or more participants do not exist' 
        });
      }

      const conversation = new Conversation({
        type,
        participants,
        admin: admin || participants[0],
        title,
        description,
        inviteLink: type === 'group' ? uuidv4() : null
      });

      await conversation.save();

      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Get user's conversations
  async getUserConversations(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const conversations = await Conversation.find({
        participants: userId
      })
      .populate({
        path: 'lastMessage',
        populate: { 
          path: 'sender', 
          select: 'name image' 
        }
      })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

      const totalConversations = await Conversation.countDocuments({
        participants: userId
      });

      res.status(200).json({
        conversations,
        pagination: {
          currentPage: Number(page),
          totalConversations,
          hasMore: totalConversations > page * limit
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Add participant to group conversation
  async addParticipant(req, res) {
    try {
      const { conversationId } = req.params;
      const { userId, adminId } = req.body;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversation not found' 
        });
      }

      // Check if requester is admin
      if (conversation.admin.toString() !== adminId) {
        return res.status(403).json({ 
          error: 'Only admin can add participants' 
        });
      }

      // Check if user already in conversation
      if (conversation.participants.includes(userId)) {
        return res.status(400).json({ 
          error: 'User is already in the conversation' 
        });
      }

      conversation.participants.push(userId);
      await conversation.save();

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Remove participant from group conversation
  async removeParticipant(req, res) {
    try {
      const { conversationId } = req.params;
      const { userId, adminId } = req.body;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversation not found' 
        });
      }

      // Check if requester is admin
      if (conversation.admin.toString() !== adminId) {
        return res.status(403).json({ 
          error: 'Only admin can remove participants' 
        });
      }

      conversation.participants = conversation.participants.filter(
        participant => participant.toString() !== userId
      );

      await conversation.save();

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Block user in conversation
  async blockUser(req, res) {
    try {
      const { conversationId } = req.params;
      const { userToBlock, adminId } = req.body;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversation not found' 
        });
      }

      // Check if requester is admin
      if (conversation.admin.toString() !== adminId) {
        return res.status(403).json({ 
          error: 'Only admin can block users' 
        });
      }

      // Add user to blocked list if not already blocked
      if (!conversation.blockedUsers.includes(userToBlock)) {
        conversation.blockedUsers.push(userToBlock);
        
        // Remove user from participants
        conversation.participants = conversation.participants.filter(
          participant => participant.toString() !== userToBlock
        );

        await conversation.save();
      }

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Generate invite link for group conversation
  async generateInviteLink(req, res) {
    try {
      const { conversationId } = req.params;
      const { adminId } = req.body;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversation not found' 
        });
      }

      // Check if requester is admin and conversation is a group
      if (conversation.type !== 'group' || conversation.admin.toString() !== adminId) {
        return res.status(403).json({ 
          error: 'Only group admins can generate invite links' 
        });
      }

      // Generate new invite link
      conversation.inviteLink = uuidv4();
      await conversation.save();

      res.status(200).json({ 
        inviteLink: conversation.inviteLink 
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Join conversation using invite link
  async joinConversationByLink(req, res) {
    try {
      const { inviteLink } = req.params;
      const { userId } = req.body;

      const conversation = await Conversation.findOne({ inviteLink });

      if (!conversation) {
        return res.status(404).json({ 
          error: 'Invalid invite link' 
        });
      }

      // Check if user is already in conversation
      if (conversation.participants.includes(userId)) {
        return res.status(400).json({ 
          error: 'You are already in this conversation' 
        });
      }

      // Add user to participants
      conversation.participants.push(userId);
      await conversation.save();

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }
}

module.exports = new ConversationController();