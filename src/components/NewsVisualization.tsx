import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { NewsItem } from '../types/news';
import { format } from 'date-fns';

// Approximate coordinates for major Algerian cities
const CITY_COORDINATES: Record<string, [number, number]> = {
  'Algiers': [36.7538, 3.0588],
  'Oran': [35.6969, -0.6331],
  'Constantine': [36.3650, 6.6147],
  'Batna': [35.5550, 6.1742],
  'Djelfa': [34.6703, 3.2630],
  'Sétif': [36.1898, 5.4108],
  'Annaba': [36.9000, 7.7667],
  'Sidi Bel Abbès': [35.1667, -0.6331],
  'Biskra': [34.8500, 5.7333],
  'Tébessa': [35.4000, 8.1167],
  'Tizi Ouzou': [36.7169, 4.0497],
  'Béjaïa': [36.7500, 5.0833],
  'Médéa': [36.2675, 2.7500],
  'Algeria': [36.7538, 3.0588], // Default to Algiers if city not found
};

interface NewsVisualizationProps {
  news: NewsItem[];
  width: number;
  height: number;
}

export function NewsVisualization({ news, width, height }: NewsVisualizationProps) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltip<NewsItem>();

  // Create scales for mapping coordinates to pixels
  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [-8.68, 12],
        range: [0, width],
      }),
    [width]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [23.4, 37.4],
        range: [height, 0],
      }),
    [height]
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'active':
        return '#ef4444';
      case 'contained':
        return '#eab308';
      case 'prevention':
        return '#22c55e';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="relative">
      <svg width={width} height={height} className="bg-gray-50 rounded-lg">
        <Group>
          {news.map((item, i) => {
            const coords = CITY_COORDINATES[item.location] || CITY_COORDINATES['Algeria'];
            const x = xScale(coords[1]);
            const y = yScale(coords[0]);

            return (
              <Circle
                key={item.id}
                cx={x}
                cy={y}
                r={8}
                fill={getCategoryColor(item.category)}
                opacity={0.8}
                className="cursor-pointer transition-all hover:opacity-100"
                onMouseEnter={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  showTooltip({
                    tooltipData: item,
                    tooltipLeft: rect.x,
                    tooltipTop: rect.y,
                  });
                }}
                onMouseLeave={() => hideTooltip()}
              />
            );
          })}
        </Group>
      </svg>

      {tooltipData && (
        <Tooltip
          left={tooltipLeft}
          top={tooltipTop}
          className="absolute z-10 min-w-[200px] p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{tooltipData.title}</div>
            <div className="text-sm text-gray-600">{tooltipData.location}</div>
            <div className="text-xs text-gray-500">
              {format(new Date(tooltipData.date), 'MMM dd, yyyy')}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block
              ${tooltipData.category === 'active' ? 'bg-red-100 text-red-800' : ''}
              ${tooltipData.category === 'contained' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${tooltipData.category === 'prevention' ? 'bg-green-100 text-green-800' : ''}
            `}>
              {tooltipData.category}
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
}