// components/FireDashboard.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NewsItem } from '../types/news';

interface FireDashboardProps {
  news: NewsItem[];
}

export function FireDashboard({ news }: FireDashboardProps) {
  // Prepare fire-specific data
  const locationData = news.filter(item => item.category === 'active')
    .reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = [
    { name: 'Active Fires', value: news.filter(item => item.category === 'active').length },
    { name: 'Contained', value: news.filter(item => item.category === 'contained').length },
    { name: 'High Risk Areas', value: news.filter(item => item.category === 'prevention').length }
  ];

  const COLORS = ['#ef4444', '#22c55e', '#eab308'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h4 className="text-lg font-medium mb-4">Active Fires by Location</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(locationData).map(([location, count]) => ({ location, count }))}>
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium mb-4">Fire Status Distribution</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}