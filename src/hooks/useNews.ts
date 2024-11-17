import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { NewsItem } from '../types/news';
import { fetchNews } from '../lib/api';
import { mockNews } from '../data/mockNews';

const socket = io('https://4599-105-101-37-156.ngrok-free.app/');

export function useNews(search: string, category: string) {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        // Filter mock data for development
        let filteredNews = [...mockNews];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredNews = filteredNews.filter(item =>
            item.title.toLowerCase().includes(searchLower) ||
            item.content.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower)
          );
        }

        if (category && category !== 'all') {
          filteredNews = filteredNews.filter(item => item.category === category);
        }

        setNews(filteredNews);
        setError(null);
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [search, category]);

  useEffect(() => {
    socket.on('newAlert', (newNews: NewsItem) => {
      setNews(prev => [newNews, ...prev]);
    });

    return () => {
      socket.off('newAlert');
    };
  }, []);

  return { news, loading, error };
}