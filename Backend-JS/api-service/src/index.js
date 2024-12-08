import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import expressStatusMonitor from 'express-status-monitor';
import dotenv from 'dotenv';
import winston from 'winston';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Console transport for immediate visibility
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for error logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    // File transport for combined logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log') 
    })
  ]
});

// Create Express App
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware Setup
const setupMiddleware = () => {
  // Status Monitoring
  app.use(expressStatusMonitor({
    title: 'Microservices Status',
    path: '/status',
    spans: [
      {
        interval: 1, // Every second
        retention: 60 // Keep 60 data points
      },
      {
        interval: 5, // Every 5 seconds
        retention: 60 // Keep 60 data points
      }
    ],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      responseTime: true,
      rps: true,
      statusCodes: true
    }
  }));

  // CORS Configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));

  // Security Middleware
  app.use(helmet());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Logging Middleware
  app.use((req, res, next) => {
    logger.info(`[${req.method}] ${req.path} - IP: ${req.ip}`);
    next();
  });
};

// Proxy Routes Setup
const setupProxyRoutes = () => {
  // Health Check Route
  app.get('/health', (req, res) => {
    logger.info('Health check requested');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  // Proxy Middleware for Microservices
  app.use('/api/main', createProxyMiddleware({
    target: process.env.MAIN_SERVICE_URL || 'http://localhost:4000',
    changeOrigin: true,
    pathRewrite: {
      '^/api/main': ''
    },
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying request to main service: ${req.path}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error to main service: ${err.message}`);
    }
  }));

  app.use('/api/notifications', createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/notifications': ''
    },
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying request to notifications service: ${req.path}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error to notifications service: ${err.message}`);
    }
  }));

  app.use('/api/feed', createProxyMiddleware({
    target: process.env.FEED_SERVICE_URL || 'http://localhost:4002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/feed': ''
    },
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying request to feed service: ${req.path}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error to feed service: ${err.message}`);
    }
  }));
};

// Error Handling Setup
const setupErrorHandling = () => {
  // 404 Handler
  app.use((req, res) => {
    logger.warn(`404 - Not Found: ${req.path}`);
    res.status(404).json({
      error: 'Not Found',
      path: req.path
    });
  });

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    logger.error('Unhandled Error:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
};

// Start Server Function
const startServer = () => {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 API Gateway running on port ${PORT}`);
    logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Closing HTTP server...');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
};

// Initialize Application
const initializeApp = () => {
  setupMiddleware();
  setupProxyRoutes();
  setupErrorHandling();
  startServer();
};

// Run the application
initializeApp();

export default app;
export { logger };