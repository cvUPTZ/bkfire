import React, { useState } from 'react';
import { Flame, FireExtinguisher, Bell, AlertTriangle } from 'lucide-react';
import { NewsCard } from './components/NewsCard';
import { NewsFilter } from './components/NewsFilter';
import { NewsletterForm } from './components/NewsletterForm';
import { Map } from './components/Map';
import { FireDashboard } from './components/FireDashboard';
import { useNews } from './hooks/useNews';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { news, loading, error } = useNews(searchTerm, selectedCategory);

  // Calculate fire-specific statistics
  const fireStats = {
    active: news.filter(item => item.category === 'active').length,
    contained: news.filter(item => item.category === 'contained').length,
    riskAreas: news.filter(item => item.category === 'prevention').length
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Flame className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Algeria Fire Watch</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#alerts" className="hover:text-red-200 transition-colors">Active Alerts</a>
              <a href="#prevention" className="hover:text-red-200 transition-colors">Fire Prevention</a>
              <a href="#emergency" className="hover:text-red-200 transition-colors">Emergency Contacts</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Fire Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flame className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Fires</h3>
                <p className="text-2xl font-semibold text-gray-900">{fireStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FireExtinguisher className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Contained Fires</h3>
                <p className="text-2xl font-semibold text-gray-900">{fireStats.contained}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">High Risk Areas</h3>
                <p className="text-2xl font-semibold text-gray-900">{fireStats.riskAreas}</p>
              </div>
            </div>
          </div>
        </div>

        <NewsFilter
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* Fire Map */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Active Fire Locations</h3>
          <div className="w-full h-[500px]">
            <Map news={news} />
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              <span className="text-sm text-gray-600">Active Fires</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm text-gray-600">Contained Fires</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
              <span className="text-sm text-gray-600">High Risk Areas</span>
            </div>
          </div>
        </div>

        {/* Fire Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6">Fire Incident Analysis</h3>
          <FireDashboard news={news} />
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(item => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>

        {!loading && !error && news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No fire incidents reported in this area</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency Fire Services</h3>
              <ul className="space-y-2">
                <li>Civil Protection: 14</li>
                <li>Forest Fire Control: 1070</li>
                <li>Emergency Services: 112</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Fire Safety Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-300">Fire Prevention Tips</a></li>
                <li><a href="#" className="hover:text-red-300">Report a Fire</a></li>
                <li><a href="#" className="hover:text-red-300">Evacuation Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Fire Alerts</h3>
              <p className="text-gray-400 mb-4">Get immediate fire alerts for your area</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2024 Algeria Fire Watch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;