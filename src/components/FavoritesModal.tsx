import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { Business } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Business[];
  onRemoveFavorite: (businessId: string) => void;
  onViewDetails: (businessId: string) => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onViewDetails
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-brand-primary">
              My Favorites
            </h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {favorites.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-500">
                Start exploring and add places to your favorites!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-brand-primary truncate">
                      {business.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{business.address}</span>
                    </div>
                    {business.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{business.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(business.id)}
                      className="px-3 py-1 bg-brand-primary text-white text-sm rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(business.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;