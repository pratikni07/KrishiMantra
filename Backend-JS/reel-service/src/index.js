const express = require('express');
const connectDB = require('./config/database');
const reelRoutes = require('./routes/reelRoutes');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/reels', reelRoutes);

// Database Connection
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});