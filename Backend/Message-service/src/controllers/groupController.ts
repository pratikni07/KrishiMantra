import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { Message } from '../models/Message';

export class GroupController {
  // Create Group
  static async createGroup(req: Request, res: Response) {
    try {
      const { 
        name, 
        members, 
        allowUserMessages = false 
      } = req.body;
      const sellerId = req.user.id;

      // Create group
      const group = new Group({
        name,
        seller: sellerId,
        members,
        settings: {
          allowUserMessages
        }
      });

      await group.save();

      res.status(201).json({ 
        message: 'Group created successfully', 
        group 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Get Group Messages
  static async getGroupMessages(req: Request, res: Response) {
    try {
      const { 
        groupId, 
        page = 1, 
        limit = 50 
      } = req.query;

      // Verify group membership or ownership
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ 
          message: 'Group not found' 
        });
      }

      // Check if user is a member or the seller
      const isMember = group.members.includes(req.user.id) || 
        group.seller.toString() === req.user.id;

      if (!isMember) {
        return res.status(403).json({ 
          message: 'Not authorized to view group messages' 
        });
      }

      // Fetch messages
      const messages = await Message.find({ 
        group: groupId 
      })
      .sort({ createdAt: -1 })
      .skip((page as number - 1) * (limit as number))
      .limit(limit as number)
      .populate('sender', 'username profilePicture');

      const totalMessages = await Message.countDocuments({ 
        group: groupId 
      });

      res.json({
        messages,
        totalPages: Math.ceil(totalMessages / (limit as number)),
        currentPage: page
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Update Group Settings
  static async updateGroupSettings(req: Request, res: Response) {
    try {
      const { 
        groupId, 
        allowUserMessages, 
        members 
      } = req.body;
      const sellerId = req.user.id;

      // Find and update group
      const group = await Group.findOneAndUpdate(
        { 
          _id: groupId, 
          seller: sellerId 
        },
        {
          $set: {
            'settings.allowUserMessages': allowUserMessages,
            ...(members && { members })
          }
        },
        { new: true }
      );

      if (!group) {
        return res.status(404).json({ 
          message: 'Group not found or unauthorized' 
        });
      }

      res.json({ 
        message: 'Group settings updated', 
        group 
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  // Remove User from Group
  static async removeUserFromGroup(req: Request, res: Response) {
    try {
      const { 
        groupId, 
        userId 
      } = req.body;
      const sellerId = req.user.id;

      // Find and update group
      const group = await Group.findOneAndUpdate(
        { 
          _id: groupId, 
          seller: sellerId 
        },
        {
          $pull: { members: userId }
        },
        { new: true }
      );

      if (!group) {
        return res.status(404).json({ 
          message: 'Group not found or unauthorized' 
        });
      }

      res.json({ 
        message: 'User removed from group', 
        group 
      });
    } catch (error:any) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
}