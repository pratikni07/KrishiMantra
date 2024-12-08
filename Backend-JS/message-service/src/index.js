require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const DatabaseConnection = require('./config/database');
const SocketService = require('./config/socket');
const logger = require('./utils/logger');

// Route Imports
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

class MessageServiceApp {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.socketService = new SocketService(this.server);
  }

  async initializeMiddlewares() {
    this.app.use(cors({
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      credentials: true
    }));
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  initializeRoutes() {
    this.app.use('/api/messages', messageRoutes);
    this.app.use('/api/conversations', conversationRoutes);

    // Global Error Handler
    this.app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong'
      });
    });
  }

  async start() {
    try {
      // Connect to Database
      await DatabaseConnection.connect();

      // Initialize Middlewares
      await this.initializeMiddlewares();

      // Initialize Routes
      this.initializeRoutes();

      // Start Server
      const PORT = process.env.PORT || 3002;
      this.server.listen(PORT, () => {
        logger.info(`Message Service running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      logger.error('Failed to start Message Service:', error);
      process.exit(1);
    }
  }
}

// Handle Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  await DatabaseConnection.disconnect();
  process.exit(0);
});

// Initialize and Start the Application
const messageService = new MessageServiceApp();
messageService.start();