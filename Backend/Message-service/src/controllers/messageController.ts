import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Group } from '../models/Group';
import { uploadToCloudinary } from '../utils/fileUpload';
import mongoose from 'mongoose';

export class MessageController {
  // Send Message (supports multiple attachment types)
  static async sendMessage(req: Request, res: Response) {
    try {
      const { 
        receiver, 
        receiverModel, 
        content, 
        group 
      } = req.body;

      // Prepare attachments
      const attachments: any[] = [];

      // Handle file uploads
      if (req.files) {
        const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
          const result = await uploadToCloudinary(file, {
            folder: 'chat_attachments',
            resource_type: 'auto'
          });

          attachments.push({
            url: result.secure_url,
            fileType: file.mimetype.startsWith('image') 
              ? 'image' 
              : file.mimetype.startsWith('video') 
                ? 'video' 
                : 'file'
          });
        });

        await Promise.all(uploadPromises);
      }

      // Handle links
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      const links = content?.match(linkRegex) || [];
      links.forEach(link => {
        attachments.push({
          url: link,
          fileType: 'link'
        });
      });

      // Create message
      const newMessage = new Message({
        sender: req.user.id,
        senderModel: req.user.type, // from auth middleware
        receiver,
        receiverModel,
        content,
        attachments,
        group
      });

      // Save message
      await newMessage.save();

      // If it's a group message, validate group permissions
      if (group) {
        const groupDoc = await Group.findById(group);
        
        if (!groupDoc) {
          return res.status(404).json({ 
            message: 'Group not found' 
          });
        }

        // Check if sender has permission to send in group
        if (
          groupDoc.seller.toString() !== req.user.id && 
          !groupDoc.settings.allowUserMessages
        ) {
          return res.status(403).json({ 
            message: 'Not authorized to send message in this group' 
          });
        }
      }

      res.status(201).json({ 
        message: 'Message sent successfully', 
        messageData: newMessage 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Get Conversation Messages
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const { 
        receiverId, 
        receiverModel, 
        page = 1, 
        limit = 50 
      } = req.query;

      const messages = await Message.find({
        $or: [
          {
            sender: req.user.id,
            senderModel: req.user.type,
            receiver: receiverId,
            receiverModel
          },
          {
            sender: receiverId,
            senderModel: receiverModel,
            receiver: req.user.id,
            receiverModel: req.user.type
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip((page as number - 1) * (limit as number))
      .limit(limit as number)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');

      const totalMessages = await Message.countDocuments({
        $or: [
          {
            sender: req.user.id,
            senderModel: req.user.type,
            receiver: receiverId,
            receiverModel
          },
          {
            sender: receiverId,
            senderModel: receiverModel,
            receiver: req.user.id,
            receiverModel: req.user.type
          }
        ]
      });

      res.json({
        messages,
        totalPages: Math.ceil(totalMessages / (limit as number)),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Mark Messages as Read
  static async markMessagesAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.body;

      await Message.updateMany(
        {
          $or: [
            {
              sender: conversationId,
              receiver: req.user.id
            },
            {
              sender: req.user.id,
              receiver: conversationId
            }
          ],
          readBy: { $ne: req.user.id }
        },
        {
          $addToSet: { readBy: req.user.id }
        }
      );

      res.json({ 
        message: 'Messages marked as read' 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
}