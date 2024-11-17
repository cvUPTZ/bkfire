import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { setupNewsFeeds } from './services/newsService.js';
import { newsRouter } from './routes/news.js';
import { subscriptionRouter } from './routes/subscription.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:  '*',
    methods: ['GET', 'POST'],
  },
});

// CORS configuration
const corsOptions = {
  origin:  '*', // Allowed origins
  methods: ['GET', 'POST'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies to be sent with cross-origin requests
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/news', newsRouter);
app.use('/api/subscribe', subscriptionRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start news feed monitoring
setupNewsFeeds(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
