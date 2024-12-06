
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { configureSocket } from './config/socketConfig';

// Import routes
import userRoutes from './routes/userRoutes';
import sellerRoutes from './routes/sellerRoutes';
import messageRoutes from './routes/messageRoutes';
import groupRoutes from './routes/groupRoutes';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect('mongodb://localhost:27017/chat_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Socket Configuration
const io = configureSocket(server);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});