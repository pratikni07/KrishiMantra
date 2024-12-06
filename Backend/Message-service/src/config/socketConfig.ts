import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Message } from '../models/Message';

export const configureSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Configure this to your frontend URL in production
      methods: ['GET', 'POST']
    }
  });

  // Active user connections
  const activeUsers: { [key: string]: string } = {};

  io.on('connection', (socket) => {
    // User authentication and connection
    socket.on('authenticate', (userId: string, userType: 'User' | 'Seller') => {
      activeUsers[userId] = socket.id;
      socket.userId = userId;
      socket.userType = userType;
    });

    // Send message
    socket.on('send_message', async (messageData) => {
      try {
        const newMessage = new Message(messageData);
        await newMessage.save();

        // Emit to receiver if online
        const receiverSocketId = activeUsers[messageData.receiver];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', newMessage);
        }

        // If it's a group message
        if (messageData.group) {
          io.to(messageData.group).emit('group_message', newMessage);
        }
      } catch (error) {
        socket.emit('message_error', error);
      }
    });

    // Block user
    socket.on('block_user', async (blockData) => {
      const { blockerId, blockedId, blockerType } = blockData;
      const receiverSocketId = activeUsers[blockedId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_blocked', {
          blockerId,
          blockerType
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Remove from active users
      const userId = Object.keys(activeUsers).find(
        key => activeUsers[key] === socket.id
      );
      if (userId) delete activeUsers[userId];
    });
  });

  return io;
};