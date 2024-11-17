import React from 'react';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { NewsItem } from '../types/news';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-sm font-semibold
            ${news.category === 'active' ? 'bg-red-500 text-white' : ''}
            ${news.category === 'contained' ? 'bg-yellow-500 text-white' : ''}
            ${news.category === 'prevention' ? 'bg-green-500 text-white' : ''}
          `}>
            {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">{news.source}</span>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(news.date), 'MMM dd, yyyy')}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">{news.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{news.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{news.location}</span>
          </div>
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            Read More
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}