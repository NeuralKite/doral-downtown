import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, List, Filter, Navigation } from 'lucide-react';
import { businesses, categories } from '../data/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  selectedCategory?: string;
  onViewModeChange: (mode: 'list' | 'map') => void;
  viewMode: 'list' | 'map';
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  selectedCategory, 
  onViewModeChange, 
  viewMode 
}) => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filteredBusinesses, setFilteredBusinesses] = useState(businesses);

  // Doral center coordinates
  const doralCenter: [number, number] = [25.8198, -80.3478];

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredBusinesses(businesses.filter(b => b.category === selectedCategory));
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [selectedCategory]);

  const createCustomIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    const color = categoryData?.color || '#082C38';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 12px; font-weight: bold;">📍</div>
      </div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  if (viewMode === 'list') {
    return null;
  }

  return (
    <div className="h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-lg relative">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex space-x-2">
        <button
          onClick={() => onViewModeChange('list')}
          className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors"
        >
          <List className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="bg-white shadow-lg rounded-lg px-3 py-2">
          <select 
            className="text-sm text-gray-600 focus:outline-none"
            value={selectedCategory || ''}
            onChange={(e) => {
              // This would be handled by parent component
              console.log('Category changed:', e.target.value);
            }}
          >
            <option value="">{t('all_categories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {t(category.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Button */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => {
            if (userLocation) {
              // This would center the map on user location
              console.log('Center on user location:', userLocation);
            }
          }}
          className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors"
          disabled={!userLocation}
        >
          <Navigation className={`h-5 w-5 ${userLocation ? 'text-brand-primary' : 'text-gray-400'}`} />
        </button>
      </div>

      <MapContainer
        center={userLocation || doralCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              html: '<div style="background-color: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>{t('your_location')}</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Business markers */}
        {filteredBusinesses.map((business) => (
          <Marker
            key={business.id}
            position={[business.coordinates.lat, business.coordinates.lng]}
            icon={createCustomIcon(business.category)}
          >
            <Popup>
              <div className="max-w-xs">
                <img 
                  src={business.image} 
                  alt={business.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-brand-primary mb-1">
                  {business.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {business.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                    {t(business.subcategory)}
                  </span>
                  {business.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium">{business.rating}</span>
                    </div>
                  )}
                </div>
                <button className="w-full mt-3 bg-brand-primary text-white py-2 rounded-lg text-sm hover:bg-brand-primary/90 transition-colors">
                  {t('view_details')}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;