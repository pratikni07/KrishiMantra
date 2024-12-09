const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  // Singleton pattern
  static getInstance() {
    if (!this.instance) {
      this.instance = new RedisClient();
    }
    return this.instance;
  }

  getClient() {
    return this.client;
  }
}

module.exports = RedisClient.getInstance();