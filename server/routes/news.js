import express from 'express';
import { getNews } from '../services/newsService.js';

export const newsRouter = express.Router();

newsRouter.get('/', (req, res) => {
  const { search, category } = req.query;
  const news = getNews(search, category);
  res.json(news);
});