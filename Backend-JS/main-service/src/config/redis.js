const Redis = require("redis");

class RedisClient {
    constructor() {
        this.client = Redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
        });

        this.client.on('connect', () => {
            console.log('Redis client connected');
        });

        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
        });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }

    async set(key, value) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }

    async setex(key, seconds, value) {
        return new Promise((resolve, reject) => {
            this.client.setex(key, seconds, value, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }
}

module.exports = new RedisClient();