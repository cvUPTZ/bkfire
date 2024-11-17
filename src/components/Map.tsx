// components/Map.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { NewsItem } from '../types/news';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapProps {
  news: NewsItem[];
}

// Define custom icons for different categories
const icons = {
  active: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  contained: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  prevention: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

export function Map({ news }: MapProps) {
  return (
    <MapContainer
      center={[36.7538, 3.0588]} // Center on Algeria
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {news.map((item) => (
        <Marker
          key={item.id}
          position={getCoordinates(item.location)}
          icon={icons[item.category]}
        >
          <Popup>
            <div className="max-w-xs">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm">{item.content.substring(0, 100)}...</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${item.category === 'active' ? 'bg-red-100 text-red-800' : ''}
                  ${item.category === 'contained' ? 'bg-green-100 text-green-800' : ''}
                  ${item.category === 'prevention' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {item.category}
                </span>
                <span className="text-xs text-gray-500">{item.location}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function getCoordinates(location: string): [number, number] {
  const coordinates: Record<string, [number, number]> = {
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
    'Médéa': [36.2675, 2.7500]
  };
  return coordinates[location] || [36.7538, 3.0588]; // Default to Algiers
}