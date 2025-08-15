import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import HeroSection from '../components/HeroSection';
import CategoryCards from '../components/CategoryCards';
import FeaturedPlaces from '../components/FeaturedPlaces';
import NewsSection from '../components/NewsSection';
import EventsSection from '../components/EventsSection';
import PhotoGallery from '../components/PhotoGallery';
import Newsletter from '../components/Newsletter';
import BusinessList from '../components/BusinessList';
import BusinessDetail from '../components/BusinessDetail';
import NewsDetail from '../components/NewsDetail';
import SearchResults from '../components/SearchResults';
import TestimonialsSection from '../components/TestimonialsSection';
import { businesses } from '../data/mockData';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

type ViewMode = 'home' | 'category' | 'detail' | 'news-detail' | 'search';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedNewsId, setSelectedNewsId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Show role-specific welcome message for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`Welcome ${user.name}! You are logged in as: ${user.role}`);
    }
  }, [isAuthenticated, user]);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('home');
    }
  };

  // Filtrar negocios basado en la búsqueda
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return businesses.filter(business => 
      business.name.toLowerCase().includes(query) ||
      business.description.toLowerCase().includes(query) ||
      business.category.toLowerCase().includes(query) ||
      business.subcategory.toLowerCase().includes(query) ||
      business.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Limpiar búsqueda al seleccionar categoría
    setViewMode('category');
  };

  const handleViewDetails = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setViewMode('detail');
  };

  const handleNewsDetail = (newsId: string) => {
    setSelectedNewsId(newsId);
    setViewMode('news-detail');
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setSelectedCategory('');
    setSelectedBusinessId('');
    setSelectedNewsId('');
    setSearchQuery('');
  };

  const handleBackToCategory = () => {
    setViewMode('category');
    setSelectedBusinessId('');
  };

  const handleBackToSearch = () => {
    setViewMode('search');
    setSelectedBusinessId('');
  };
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  if (viewMode === 'category') {
    return (
      <BusinessList 
        selectedCategory={selectedCategory}
        onViewDetails={handleViewDetails}
      />
    );
  }

  if (viewMode === 'search') {
    return (
      <SearchResults 
        searchQuery={searchQuery}
        businesses={filteredBusinesses}
        onViewDetails={handleViewDetails}
        onBackToHome={handleBackToHome}
        onNewSearch={handleSearch}
      />
    );
  }
  if (viewMode === 'detail' && selectedBusiness) {
    return (
      <BusinessDetail 
        business={selectedBusiness}
        onBack={
          selectedCategory ? handleBackToCategory : 
          searchQuery ? handleBackToSearch : 
          handleBackToHome
        }
      />
    );
  }

  if (viewMode === 'news-detail') {
    return (
      <NewsDetail 
        articleId={selectedNewsId}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <>
      <HeroSection onSearch={handleSearch} />
      <CategoryCards onCategorySelect={handleCategorySelect} />
      <FeaturedPlaces onViewDetails={handleViewDetails} />
      <TestimonialsSection />
      <NewsSection onNewsDetail={handleNewsDetail} />
      <EventsSection />
      <PhotoGallery />
      <Newsletter />
    </>
  );
}