const { Server } = require('socket.io');
const Redis = require('ioredis');

class SocketService {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization', 'Content-Type']
      },
      pingTimeout: 60000,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
      }
    });

    this.redisPublisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    this.setupSocketEvents();
    this.setupRedisEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('New socket connection:', socket.id);

      // User Authentication Middleware
      socket.use(async (packet, next) => {
        const token = socket.handshake.auth.token;
        try {
          // Implement your token verification logic here
          // const decoded = verifyToken(token);
          // socket.user = decoded;
          next();
        } catch (error) {
          return next(new Error('Authentication error'));
        }
      });

      // Online Status
      socket.on('user_online', (userId) => {
        this.redisPublisher.set(`online:${userId}`, socket.id);
        socket.broadcast.emit('user_status', { 
          userId, 
          status: 'online' 
        });
      });

      // Typing Indicator
      socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('typing', {
          userId: data.userId,
          isTyping: data.isTyping
        });
      });

      // Disconnect Handling
      socket.on('disconnect', () => {
        // Remove online status from Redis
        // Broadcast offline status
        console.log('Socket disconnected:', socket.id);
      });
    });
  }

  setupRedisEvents() {
    // Redis Pub/Sub for cross-service communication
    this.redisSubscriber.subscribe('message_service');

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'message_service') {
        const parsedMessage = JSON.parse(message);
        // Broadcast message across socket connections
        this.io.emit('cross_service_message', parsedMessage);
      }
    });
  }

  // Method to publish messages across services
  publishMessage(channel, message) {
    this.redisPublisher.publish(channel, JSON.stringify(message));
  }

  // Get Socket.io Instance
  getInstance() {
    return this.io;
  }
}

module.exports = SocketService;