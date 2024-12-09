const { Server } = require('socket.io');
const redisAdapter = require('socket.io-redis');
const redisClient = require('../config/redis');

class SocketService {
  constructor() {
    this.io = null;
  }

  initializeSocket(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Use Redis adapter for scaling
    this.io.adapter(redisAdapter({
      pubClient: redisClient.getClient(),
      subClient: redisClient.getClient().duplicate()
    }));

    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('New client connected');

      // Join conversation room
      socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
      });

      // Send message
      socket.on('send_message', async (messageData) => {
        // Broadcast message to conversation room
        this.io.to(messageData.conversationId).emit('new_message', messageData);
      });

      // Typing indicator
      socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('user_typing', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  getIO() {
    return this.io;
  }
}

module.exports = new SocketService();