const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketService = require('./services/socketService');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const redisClient = require('./config/redis');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// MongoDB Connection Event Listeners
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from database');
});

// Redis Connection
const redis = redisClient.getClient();

redis.on('connect', () => {
  console.log('✅ Redis client connected');
});

redis.on('ready', () => {
  console.log('✅ Redis client is ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Initialize Socket.IO
socketService.initializeSocket(server);

// Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    redis.quit();
    console.log('🔌 MongoDB and Redis connections closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});