const Message = require("../models/message.model");
const Chat = require("../models/chat.model");
const Group = require("../models/group.model");
const MessageQueueService = require("../services/message-queue.service");

class MessageController {
  async sendMessage(req, res) {
    try {
      const { userId, chatId, content, mediaType, mediaUrl } = req.body;
      // const userId = req.user.userId;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (!chat.participants.includes(userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (chat.type === "group") {
        const group = await Group.findOne({ chatId });
        if (group.onlyAdminCanMessage && !group.admin.includes(userId)) {
          return res
            .status(403)
            .json({ error: "Only admins can send messages" });
        }
      }

      const message = await Message.create({
        chatId,
        sender: userId,
        content,
        mediaType,
        mediaUrl,
        deliveredTo: [
          {
            userId,
            deliveredAt: new Date(),
          },
        ],
      });

      // Update last message in chat
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        $inc: { [`unreadCount.${userId}`]: 1 },
      });

      // Queue message for delivery
      await MessageQueueService.channel.sendToQueue(
        "message_delivery",
        Buffer.from(
          JSON.stringify({
            messageId: message._id,
            chatId,
            sender: userId,
          })
        ),
        { persistent: true }
      );

      return res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async markMessageAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;
      // const userId = req.user.userId;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.readBy.some((r) => r.userId === userId)) {
        return res.json(message);
      }

      message.readBy.push({
        userId,
        readAt: new Date(),
      });
      await message.save();

      // Update unread count in chat
      await Chat.findByIdAndUpdate(message.chatId, {
        $inc: { [`unreadCount.${userId}`]: -1 },
      });

      return res.json(message);
    } catch (error) {
      console.error("Mark message as read error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.userId;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.sender !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      message.isDeleted = true;
      await message.save();

      return res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new MessageController();
