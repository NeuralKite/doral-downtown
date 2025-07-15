import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, List, Filter, Search } from 'lucide-react';
import { businesses } from '../data/mockData';
import BusinessCard from './BusinessCard';
import InteractiveMap from './InteractiveMap';

interface BusinessListProps {
  selectedCategory: string;
  onViewDetails: (businessId: string) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ selectedCategory, onViewDetails }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const categoryMatch = business.category === selectedCategory;
      const subcategoryMatch = !selectedSubcategory || business.subcategory === selectedSubcategory;
      const searchMatch = !searchQuery || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && subcategoryMatch && searchMatch;
    });
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  const subcategories = useMemo(() => {
    const subs = [...new Set(businesses
      .filter(b => b.category === selectedCategory)
      .map(b => b.subcategory))];
    return subs;
  }, [selectedCategory]);

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-2">
              {t(selectedCategory)}
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredBusinesses.length} places found
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-brand-primary'
                }`}
              >
                <List className="h-5 w-5" />
                <span className="hidden sm:inline">{t('list_view')}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'map'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-brand-primary'
                }`}
              >
                <Map className="h-5 w-5" />
                <span className="hidden sm:inline">{t('map_view')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setSelectedSubcategory('')}
            className={`px-4 py-2 rounded-full transition-colors font-medium ${
              !selectedSubcategory
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
            }`}
          >
            All
          </button>
          {subcategories.map(subcategory => (
            <button
              key={subcategory}
              onClick={() => setSelectedSubcategory(subcategory)}
              className={`px-4 py-2 rounded-full transition-colors font-medium ${
                selectedSubcategory === subcategory
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {t(subcategory)}
            </button>
          ))}
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(business => (
              <BusinessCard
                key={business.id}
                business={business}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <InteractiveMap
            selectedCategory={selectedCategory}
            onViewModeChange={setViewMode}
            viewMode={viewMode}
          />
        )}

        {/* No Results */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No places found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Floating Map Button - Only show in list view */}
        {viewMode === 'list' && (
          <button 
            onClick={() => setViewMode('map')}
            className="fixed bottom-6 right-6 bg-brand-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-brand-primary/90 transition-colors flex items-center space-x-2 z-40"
          >
            <Map className="h-5 w-5" />
            <span className="font-medium">{t('view_on_map')}</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default BusinessList;