import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Phone, Globe, Heart, CheckCircle, Shield } from 'lucide-react';
import { Business } from '../../types';
import { Card, Button } from '../ui';

interface BusinessCardProps {
  business: Business;
  onViewDetails: (businessId: string) => void;
  onToggleFavorite?: (businessId: string) => void;
  isFavorite?: boolean;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  onViewDetails,
  onToggleFavorite,
  isFavorite = false
}) => {
  const { t } = useTranslation();

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(business.id);
  };

  const isVerified = business.featured;

  return (
    <Card 
      className="cursor-pointer group overflow-hidden"
      hover
      onClick={() => onViewDetails(business.id)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {onToggleFavorite && (
          <button 
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'} hover:text-red-500`} />
          </button>
        )}
        
        {isVerified && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <CheckCircle className="h-3 w-3" />
              <span>Verified</span>
            </div>
          </div>
        )}
        
        {business.rating && (
          <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{business.rating}</span>
            <span className="text-xs text-gray-500">({business.reviews})</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-primary/80 transition-colors">
              {business.name}
            </h3>
            {isVerified && (
              <Shield className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
              {t(business.subcategory)}
            </span>
            {business.subcategory === 'restaurants' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Reservations
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {business.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{business.address}</span>
          </div>
          
          {business.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{business.phone}</span>
            </div>
          )}
          
          {business.website && (
            <div className="flex items-center text-sm text-gray-500">
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Website</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button 
            fullWidth
            variant={business.subcategory === 'restaurants' ? 'primary' : 'outline'}
          >
            {business.subcategory === 'restaurants' ? 'Make Reservation' : t('get_directions')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BusinessCard;