import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Filter, MapPin, Star, X } from 'lucide-react';
import { Business } from '../types';
import BusinessCard from './BusinessCard';

interface SearchResultsProps {
  searchQuery: string;
  businesses: Business[];
  onViewDetails: (businessId: string) => void;
  onBackToHome: () => void;
  onNewSearch: (query: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  businesses,
  onViewDetails,
  onBackToHome,
  onNewSearch
}) => {
  const { t } = useTranslation();
  const [newSearchQuery, setNewSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'category'>('name');

  // Filtrar por categoría si está seleccionada
  const filteredByCategory = selectedCategory 
    ? businesses.filter(b => b.category === selectedCategory)
    : businesses;

  // Ordenar resultados
  const sortedBusinesses = [...filteredByCategory].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Obtener categorías únicas de los resultados
  const availableCategories = [...new Set(businesses.map(b => b.category))];

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSearchQuery.trim()) {
      onNewSearch(newSearchQuery.trim());
    }
  };

  const clearSearch = () => {
    setNewSearchQuery('');
    onNewSearch('');
    onBackToHome();
  };

  const clearCategoryFilter = () => {
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con búsqueda */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 text-brand-secondary hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            
            {/* Búsqueda en header */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleNewSearch} className="relative">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search in Doral..."
                    value={newSearchQuery}
                    onChange={(e) => setNewSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
                  />
                  {newSearchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resultados header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">
            Search Results
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <p>
              {businesses.length} results for <span className="font-semibold">"{searchQuery}"</span>
            </p>
            {selectedCategory && (
              <div className="flex items-center space-x-2">
                <span>in</span>
                <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                  <span>{t(selectedCategory)}</span>
                  <button
                    onClick={clearCategoryFilter}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filtros y ordenamiento */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full transition-colors font-medium ${
                !selectedCategory
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border'
              }`}
            >
              All Categories
            </button>
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors font-medium ${
                  selectedCategory === category
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border'
                }`}
              >
                {t(category)} ({businesses.filter(b => b.category === category).length})
              </button>
            ))}
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'category')}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        {sortedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBusinesses.map(business => (
              <BusinessCard
                key={business.id}
                business={business}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No results found
            </h3>
            <p className="text-gray-500 mb-6">
              Try searching with different keywords or browse our categories
            </p>
            <button
              onClick={onBackToHome}
              className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
            >
              Browse Categories
            </button>
          </div>
        )}

        {/* Sugerencias si hay pocos resultados */}
        {sortedBusinesses.length > 0 && sortedBusinesses.length < 3 && (
          <div className="mt-12 bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Looking for something else?
            </h3>
            <p className="text-blue-700 mb-4">
              Try these popular searches in Doral:
            </p>
            <div className="flex flex-wrap gap-2">
              {['restaurant', 'spa', 'shopping', 'events', 'beauty'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => onNewSearch(suggestion)}
                  className="bg-white text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;