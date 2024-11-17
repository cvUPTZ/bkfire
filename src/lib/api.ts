import axios from 'axios';
import { NewsItem } from '../types/news';

const API_URL =  'https://4599-105-101-37-156.ngrok-free.app/';

export async function fetchNews(params?: {
  search?: string;
  category?: string;
}): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${API_URL}/api/news`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

export async function subscribeToAlerts(email: string): Promise<void> {
  try {
    await axios.post(`${API_URL}/api/subscribe`, { email });
  } catch (error) {
    console.error('Error subscribing to alerts:', error);
    throw error;
  }
}