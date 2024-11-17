export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  content: string;
  imageUrl: string;
  location: string;
  category: 'active' | 'contained' | 'prevention';
  url: string;
}