import React from 'react';
import { Filter, Search } from 'lucide-react';

interface NewsFilterProps {
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

export function NewsFilter({ onSearchChange, onCategoryChange, selectedCategory }: NewsFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Filter className="text-gray-500 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="active">Active Fires</option>
            <option value="contained">Contained Fires</option>
            <option value="prevention">Prevention</option>
          </select>
        </div>
      </div>
    </div>
  );
}