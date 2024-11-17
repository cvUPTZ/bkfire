// server/websocket.ts
import { Server } from 'socket.io';
import { fetchNewsFromSources } from './services/newsService';

export function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Check for news updates every 5 minutes
  setInterval(async () => {
    try {
      const news = await fetchNewsFromSources();
      io.emit('newsUpdate', news);
    } catch (error) {
      console.error('Error fetching news updates:', error);
    }
  }, 5 * 60 * 1000);

  return io;
}