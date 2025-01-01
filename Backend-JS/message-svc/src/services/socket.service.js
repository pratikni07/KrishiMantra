// src/services/socket.service.js
const { Server } = require("socket.io");
const Redis = require("../config/redis");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
      pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      maxHttpBufferSize: 1e7, // 10 MB
    });

    this.userSocketMap = new Map();
    this.initialize();
  }

  initialize() {
    this.io.use(async (socket, next) => {
      try {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
          return next(new Error("Authentication error"));
        }

        socket.userId = userId;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.handleConnection(socket);
    });
  }

  async handleConnection(socket) {
    try {
      // Store socket mapping
      this.userSocketMap.set(socket.userId, socket.id);
      await Redis.hset("online_users", socket.userId, socket.id);

      // Update user status
      await User.findOneAndUpdate(
        { userId: socket.userId },
        {
          isOnline: true,
          lastSeen: new Date(),
        }
      );

      // Broadcast user online status
      this.broadcastUserStatus(socket.userId, true);

      // Handle joining user's chat rooms
      const chats = await Chat.find({
        participants: socket.userId,
      });

      chats.forEach((chat) => {
        socket.join(chat._id.toString());
      });

      // Event Handlers
      this.setupMessageHandlers(socket);
      this.setupTypingHandlers(socket);
      this.setupPresenceHandlers(socket);
      this.setupGroupHandlers(socket);

      // Handle disconnection
      socket.on("disconnect", () => this.handleDisconnection(socket));
    } catch (error) {
      console.error("Socket connection handler error:", error);
    }
  }

  setupMessageHandlers(socket) {
    // Send message
    socket.on("message:send", async (data) => {
      try {
        const { chatId, message } = data;

        // Emit to all users in chat
        this.io.to(chatId).emit("message:received", {
          ...message,
          sender: socket.userId,
          timestamp: new Date(),
        });

        // Handle delivery status
        const chat = await Chat.findById(chatId);
        const onlineParticipants = chat.participants.filter(
          (p) => this.userSocketMap.has(p) && p !== socket.userId
        );

        onlineParticipants.forEach((userId) => {
          const recipientSocket = this.userSocketMap.get(userId);
          if (recipientSocket) {
            this.io.to(recipientSocket).emit("message:delivered", {
              messageId: message._id,
              chatId,
              timestamp: new Date(),
            });
          }
        });
      } catch (error) {
        console.error("Message send handler error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Message read receipt
    socket.on("message:read", async (data) => {
      try {
        const { chatId, messageIds } = data;

        await Message.updateMany(
          {
            _id: { $in: messageIds },
            "readBy.userId": { $ne: socket.userId },
          },
          {
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date(),
              },
            },
          }
        );

        this.io.to(chatId).emit("message:read:update", {
          userId: socket.userId,
          messageIds,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Message read handler error:", error);
      }
    });
  }

  setupTypingHandlers(socket) {
    socket.on("typing:start", async (data) => {
      const { chatId } = data;
      socket.to(chatId).emit("typing:update", {
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", async (data) => {
      const { chatId } = data;
      socket.to(chatId).emit("typing:update", {
        userId: socket.userId,
        isTyping: false,
      });
    });
  }

  setupPresenceHandlers(socket) {
    socket.on("presence:update", async (data) => {
      try {
        const { status } = data;
        await User.findOneAndUpdate(
          { userId: socket.userId },
          {
            status,
            lastSeen: new Date(),
          }
        );

        this.broadcastUserStatus(socket.userId, status === "online");
      } catch (error) {
        console.error("Presence update handler error:", error);
      }
    });
  }

  setupGroupHandlers(socket) {
    socket.on("group:join", async (data) => {
      const { groupId } = data;
      socket.join(groupId);
    });

    socket.on("group:leave", async (data) => {
      const { groupId } = data;
      socket.leave(groupId);
    });
  }

  async handleDisconnection(socket) {
    try {
      console.log(`User disconnected: ${socket.userId}`);

      // Update user status
      await User.findOneAndUpdate(
        { userId: socket.userId },
        {
          isOnline: false,
          lastSeen: new Date(),
        }
      );

      // Clean up socket mapping
      this.userSocketMap.delete(socket.userId);
      await Redis.hdel("online_users", socket.userId);

      // Broadcast offline status
      this.broadcastUserStatus(socket.userId, false);
    } catch (error) {
      console.error("Socket disconnection handler error:", error);
    }
  }

  async broadcastUserStatus(userId, isOnline) {
    try {
      const user = await User.findOne({ userId });
      if (!user) return;

      const chats = await Chat.find({
        participants: userId,
      });

      chats.forEach((chat) => {
        this.io.to(chat._id.toString()).emit("user:status", {
          userId,
          isOnline,
          lastSeen: new Date(),
        });
      });
    } catch (error) {
      console.error("Broadcast user status error:", error);
    }
  }
}

module.exports = SocketService;
