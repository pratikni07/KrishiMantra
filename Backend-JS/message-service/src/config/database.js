const mongoose = require('mongoose');
const winston = require('winston');

// Create a logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    };

    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);
      
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to database');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected');
      });

      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      logger.info('Mongoose disconnected');
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new DatabaseConnection();