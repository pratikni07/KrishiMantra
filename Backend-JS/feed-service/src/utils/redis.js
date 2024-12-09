const Redis = require('ioredis');

// Primary Redis client for caching
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  connectTimeout: 10000,
  maxRetriesPerRequest: 3
});

// Redis cache utility functions
const redisCache = {
  // Set cache with expiration
  set: async (key, value, expiration = 3600) => {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', expiration);
    } catch (error) {
      console.error('Redis Set Error:', error);
    }
  },

  // Get cache
  get: async (key) => {
    try {
      const cachedData = await redisClient.get(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Redis Get Error:', error);
      return null;
    }
  },

  // Delete cache
  del: async (key) => {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis Delete Error:', error);
    }
  },

  // Cache invalidation patterns
  invalidatePatterns: async (pattern) => {
    const keys = await redisClient.keys(pattern);
    if (keys.length) {
      await redisClient.del(...keys);
    }
  }
};

// Error handling for Redis
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

module.exports = { 
  redisClient, 
  redisCache 
};