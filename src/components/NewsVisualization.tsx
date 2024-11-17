import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { NewsItem } from '../types/news';
import { format } from 'date-fns';

const CITY_COORDINATES: Record<string, [number, number]> = {
  Algiers: [36.7538, 3.0588],
  Oran: [35.6969, -0.6331],
  Constantine: [36.365, 6.6147],
  Batna: [35.555, 6.1742],
  Djelfa: [34.6703, 3.263],
  Sétif: [36.1898, 5.4108],
  Annaba: [36.9, 7.7667],
  Sidi_Bel_Abbès: [35.1667, -0.6331],
  Biskra: [34.85, 5.7333],
  Tébessa: [35.4, 8.1167],
  Tizi_Ouzou: [36.7169, 4.0497],
  Béjaïa: [36.75, 5.0833],
  Médéa: [36.2675, 2.75],
  Algeria: [36.7538, 3.0588], // Default fallback
};

interface NewsVisualizationProps {
  news: NewsItem[];
  width: number;
  height: number;
}

export function NewsVisualization({ news, width, height }: NewsVisualizationProps) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltip<NewsItem>();

  // Coordinate scaling
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

  // Determine circle color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      active: '#ef4444',
      contained: '#eab308',
      prevention: '#22c55e',
    };
    return colors[category] || '#94a3b8';
  };

  return (
    <div className="relative">
      <svg width={width} height={height} className="bg-gray-50 rounded-lg">
        <Group>
          {news.map((item) => {
            const coords = CITY_COORDINATES[item.location] || CITY_COORDINATES['Algeria'];
            const [lat, lon] = coords;
            const x = xScale(lon);
            const y = yScale(lat);

            return (
              <Circle
                key={item.id}
                cx={x}
                cy={y}
                r={8}
                fill={getCategoryColor(item.category)}
                opacity={0.8}
                className="cursor-pointer transition-opacity hover:opacity-100"
                aria-label={`${item.title} (${item.category})`}
                role="button"
                tabIndex={0}
                onMouseEnter={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  showTooltip({
                    tooltipData: item,
                    tooltipLeft: rect.x + window.scrollX,
                    tooltipTop: rect.y + window.scrollY,
                  });
                }}
                onMouseLeave={hideTooltip}
              />
            );
          })}
        </Group>
      </svg>

      {tooltipData && (
        <Tooltip
          left={tooltipLeft}
          top={tooltipTop}
          className="absolute z-10 p-3 bg-white rounded-lg shadow-md border border-gray-300"
        >
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{tooltipData.title}</div>
            <div className="text-sm text-gray-600">{tooltipData.location}</div>
            <div className="text-xs text-gray-500">
              {format(new Date(tooltipData.date), 'MMM dd, yyyy')}
            </div>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                tooltipData.category === 'active' ? 'bg-red-100 text-red-800' : ''
              } ${tooltipData.category === 'contained' ? 'bg-yellow-100 text-yellow-800' : ''} ${
                tooltipData.category === 'prevention' ? 'bg-green-100 text-green-800' : ''
              }`}
            >
              {tooltipData.category}
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
