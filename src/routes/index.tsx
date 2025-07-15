import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
import { businesses } from '../data/mockData';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

type ViewMode = 'home' | 'category' | 'detail' | 'news-detail';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedNewsId, setSelectedNewsId] = useState('');

  // Show role-specific welcome message for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`Welcome ${user.name}! You are logged in as: ${user.role}`);
    }
  }, [isAuthenticated, user]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
  };

  const handleBackToCategory = () => {
    setViewMode('category');
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

  if (viewMode === 'detail' && selectedBusiness) {
    return (
      <BusinessDetail 
        business={selectedBusiness}
        onBack={selectedCategory ? handleBackToCategory : handleBackToHome}
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
      <HeroSection />
      <CategoryCards onCategorySelect={handleCategorySelect} />
      <FeaturedPlaces onViewDetails={handleViewDetails} />
      <NewsSection onNewsDetail={handleNewsDetail} />
      <EventsSection />
      <PhotoGallery />
      <Newsletter />
    </>
  );
}