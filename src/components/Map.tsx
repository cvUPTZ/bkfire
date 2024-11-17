import React, { useEffect, useRef } from 'react';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import LayerSwitcher from 'ol-layerswitcher';
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

interface NewsItem {
  id: string | number;
  title: string;
  content: string;
  location: string;
  category: 'active' | 'contained' | 'prevention';
}

interface MapProps {
  news: NewsItem[];
}

const icons = {
  active: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  contained: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  prevention: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png'
};

// Algeria bounds
const algeriaBounds = [-8.0, 19.0, 12.0, 37.5];

const Map: React.FC<MapProps> = ({ news }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<OLMap | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source for markers
    const vectorSource = new VectorSource();

    // Create markers for each news item
    news.forEach(item => {
      const coords = getCoordinates(item.location);
      const feature = new Feature({
        geometry: new Point(fromLonLat(coords)),
        properties: item
      });

      feature.setStyle(new Style({
        image: new Icon({
          src: icons[item.category],
          scale: 0.5,
          anchor: [0.5, 1]
        })
      }));

      vectorSource.addFeature(feature);
    });

    // Create map layers
    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: { title: 'Light' }
    });

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: '&copy; Esri'
      }),
      visible: false,
      properties: { title: 'Satellite' }
    });

    const markersLayer = new VectorLayer({
      source: vectorSource,
      properties: { title: 'Markers' }
    });

    // Create map instance
    const map = new OLMap({
      target: mapRef.current,
      layers: [osmLayer, satelliteLayer, markersLayer],
      view: new View({
        center: fromLonLat([1.6596, 28.0339]),
        zoom: 5,
        extent: algeriaBounds.map((coord, i) => 
          i % 2 === 0 ? fromLonLat([coord, 0])[0] : fromLonLat([0, coord])[1]
        ) as [number, number, number, number],
        minZoom: 5,
        maxZoom: 12
      })
    });

    // Add layer switcher control
    const layerSwitcher = new LayerSwitcher({
      tipLabel: 'Layer Switcher'
    });
    map.addControl(layerSwitcher);

    // Create popup overlay
    if (popupRef.current) {
      const popup = new Overlay({
        element: popupRef.current,
        positioning: 'bottom-center',
        offset: [0, -20],
        autoPan: true,  // This alone will enable auto panning when the popup is shown
      });
      map.addOverlay(popup);

      // Add click handler for features
      map.on('click', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);

        if (feature) {
          const coords = (feature.getGeometry() as Point).getCoordinates();
          const properties = feature.get('properties') as NewsItem;
          
          popup.setPosition(coords);
          if (popupRef.current) {
            popupRef.current.innerHTML = `
              <div class="max-w-xs p-2 bg-white rounded shadow">
                <h3 class="font-semibold">${properties.title}</h3>
                <p class="text-sm">${properties.content.substring(0, 100)}...</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    properties.category === 'active' ? 'bg-red-100 text-red-800' :
                    properties.category === 'contained' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }">
                    ${properties.category}
                  </span>
                  <span class="text-xs text-gray-500">${properties.location}</span>
                </div>
              </div>
            `;
          }
        } else {
          popup.setPosition(undefined);
        }
      });
    }

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [news]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      <div ref={popupRef} className="absolute" />
    </div>
  );
};

function getCoordinates(location: string): [number, number] {
  const coordinates: Record<string, [number, number]> = {
    'Algiers': [3.0588, 36.7538],
    'Oran': [-0.6331, 35.6969],
    'Constantine': [6.6147, 36.3650],
    'Batna': [6.1742, 35.5550],
    'Djelfa': [3.2630, 34.6703],
    'Sétif': [5.4108, 36.1898],
    'Annaba': [7.7667, 36.9000],
    'Sidi Bel Abbès': [-0.6331, 35.1667],
    'Biskra': [5.7333, 34.8500],
    'Tébessa': [8.1167, 35.4000],
    'Tizi Ouzou': [4.0497, 36.7169],
    'Béjaïa': [5.0833, 36.7500],
    'Médéa': [2.7500, 36.2675]
  };
  return coordinates[location] || [3.0588, 36.7538]; // Default to Algiers
}

export default Map;
