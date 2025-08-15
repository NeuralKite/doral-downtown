import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { businesses } from '../data/mockData';

interface FeaturedPlacesProps {
  onViewDetails: (businessId: string) => void;
}

const FeaturedPlaces: React.FC<FeaturedPlacesProps> = ({ onViewDetails }) => {
  const { t } = useTranslation();
  const featuredBusinesses = businesses.filter(business => business.featured).slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
              {t('featured_places')}
            </h2>
            <p className="text-xl text-gray-600">
              Hand-picked favorites from our community
            </p>
          </div>
          <button className="hidden md:flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors font-medium">
            <span>{t('see_all')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBusinesses.map((business) => (
            <div
              key={business.id}
              onClick={() => onViewDetails(business.id)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={business.image} 
                  alt={business.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {business.rating && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{business.rating}</span>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full mb-2">
                    {t(business.subcategory)}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-primary mb-2 group-hover:text-brand-primary/80 transition-colors">
                  {business.name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {business.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
                
                <button className="w-full bg-brand-primary text-white py-3 rounded-xl hover:bg-brand-primary/90 transition-colors font-medium flex items-center justify-center space-x-2">
                  <span>{t('view_details')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <button className="flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors font-medium mx-auto">
            <span>{t('see_all')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPlaces;