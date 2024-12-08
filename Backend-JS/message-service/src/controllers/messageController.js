const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

class MessageController {
  // Send a new message
  async sendMessage(req, res) {
    try {
      const { 
        conversationId, 
        senderId, 
        content, 
        messageType = 'text', 
        mediaUrl = null, 
        productLink = null,
        replyTo = null
      } = req.body;

      // Validate conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversation not found' 
        });
      }

      // Check if sender is part of conversation
      if (!conversation.participants.includes(senderId)) {
        return res.status(403).json({ 
          error: 'You are not a participant of this conversation' 
        });
      }

      // Check if user is blocked
      if (conversation.blockedUsers.includes(senderId)) {
        return res.status(403).json({ 
          error: 'You are blocked from this conversation' 
        });
      }

      // Create new message
      const newMessage = new Message({
        conversation: conversationId,
        sender: senderId,
        content,
        messageType,
        mediaUrl,
        productLink,
        replyTo
      });

      await newMessage.save();

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id
      });

      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Upload media for messages
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded' 
        });
      }

      // Cloudinary upload
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'chat_media',
        resource_type: 'auto',
        max_file_size: 10 * 1024 * 1024 // 10MB max
      });

      res.status(200).json({
        url: result.secure_url,
        type: result.resource_type
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Get messages for a conversation
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { 
        page = 1, 
        limit = 50, 
        lastMessageId = null 
      } = req.query;

      const query = { conversation: conversationId };

      // Pagination with cursor-based approach
      if (lastMessageId) {
        const lastMessage = await Message.findById(lastMessageId);
        if (lastMessage) {
          query._id = { $lt: lastMessageId };
        }
      }

      const messages = await Message.find(query)
        .populate('sender', 'name image')
        .populate('replyTo', 'content messageType')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      const totalMessages = await Message.countDocuments({ 
        conversation: conversationId 
      });

      res.status(200).json({
        messages: messages.reverse(), // Reverse to maintain chronological order
        pagination: {
          currentPage: Number(page),
          totalMessages,
          hasMore: totalMessages > page * limit
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Mark messages as read
  async markMessagesAsRead(req, res) {
    try {
      const { conversationId, userId, messageIds } = req.body;

      // Validate conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversation not found' 
        });
      }

      // Update multiple messages
      const result = await Message.updateMany(
        { 
          _id: { $in: messageIds },
          conversation: conversationId,
          readBy: { $ne: userId }
        },
        { 
          $addToSet: { readBy: userId } 
        }
      );

      res.status(200).json({
        message: 'Messages marked as read',
        updatedCount: result.modifiedCount
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Delete a message
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ 
          error: 'Message not found' 
        });
      }

      // Only sender can delete their own message
      if (message.sender.toString() !== userId) {
        return res.status(403).json({ 
          error: 'You are not authorized to delete this message' 
        });
      }

      await Message.findByIdAndDelete(messageId);

      res.status(200).json({ 
        message: 'Message deleted successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  // Search messages within a conversation
  async searchMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { query, page = 1, limit = 20 } = req.query;

      const searchResults = await Message.find({
        conversation: conversationId,
        content: { $regex: query, $options: 'i' }
      })
      .populate('sender', 'name image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

      const totalResults = await Message.countDocuments({
        conversation: conversationId,
        content: { $regex: query, $options: 'i' }
      });

      res.status(200).json({
        messages: searchResults,
        pagination: {
          currentPage: Number(page),
          totalResults,
          hasMore: totalResults > page * limit
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }
}

module.exports = new MessageController();