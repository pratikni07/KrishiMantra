const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const { cloudnairyconnect } = require("./config/cloudinary");
const connect = require("./config/database");
const winston = require("winston");
const Joi = require("joi");
const rateLimit = require("express-rate-limit");
const Redis = require("redis");
const path = require("path");
const { MemoryStore } = require("express-rate-limit");
const statusMonitor = require("express-status-monitor");

const userRoutes = require("./routes/User");
const companyRoutes = require('./routes/companyRoutes');
const productRoutes = require('./routes/productRoutes');

// Load environment variables
dotenv.config();

// Validate environment variables
const envSchema = Joi.object({
  PORT: Joi.number().default(40043),
  MONGODB_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().uri().default('*'),
  // CLOUDINARY_URL: Joi.string().uri().required()
});

const { error } = envSchema.validate(process.env, { allowUnknown: true });
if (error) {
  logger.error(`Config validation error: ${error.message}`);
  process.exit(1); // Exit the process gracefully
}


const app = express();
const PORT = process.env.PORT || 40043;

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  ]
});

// Connect to database
connect();

// Apply security headers
app.use(helmet());

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Rate limiting setup using Redis (Optional: You can configure your own Redis)
const redisClient = Redis.createClient();


app.use(
  statusMonitor({
    path: '/status', // URL path for the dashboard
    spans: [
      { interval: 1, retention: 60 }, // 1 second for 1 minute
      { interval: 5, retention: 60 }, // 5 seconds for 5 minutes
      { interval: 15, retention: 60 }, // 15 seconds for 15 minutes
    ],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      eventLoop: true,
      heap: true,
      responseTime: true,
      rps: true,
      statusCodes: true,
    },
  })
);

const limiter = rateLimit({
  store: new MemoryStore(), // Correct usage
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);


// Custom configuration for express-status-monitor


// Configure CORS for production
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow dynamic origin or use '*' for open
    credentials: true,
  })
);

// File upload configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"), // Use dynamic paths instead of hardcoded
  })
);

// Initialize third-party services
// cloudnairyconnect();

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.use("/api/v1/auth", userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/products', productRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info("Server is shutting down...");
  process.exit();
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
