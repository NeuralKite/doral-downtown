import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Búsqueda en tiempo real después de 2 caracteres
    if (value.length >= 2 && onSearch) {
      onSearch(value.trim());
    } else if (value.length === 0 && onSearch) {
      onSearch(''); // Limpiar resultados
    }
  };

  return (
    <section className="relative min-h-[75vh] text-white overflow-hidden flex items-center justify-center py-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1')`
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/80 via-brand-primary/70 to-brand-secondary/80" />
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-700"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 leading-tight drop-shadow-lg text-shadow-lg">
          {t('welcome')}
        </h1>
        
        {/* Enhanced Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-2">
            <div className="flex items-center">
              <div className="flex items-center flex-1">
                <Search className="h-5 w-5 text-gray-400 ml-6 mr-4" />
                <input
                  type="text"
                  placeholder="What are you looking for in Doral today?"
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="flex-1 py-4 text-gray-900 placeholder-gray-500 focus:outline-none text-lg bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-primary text-white px-8 py-4 rounded-full hover:bg-brand-primary/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Subtle Call to Action */}
        <p className="mt-8 text-lg text-white/90 max-w-xl mx-auto drop-shadow-md">
          Discover restaurants, shops, events, and everything that makes Doral special
        </p>
      </div>

      {/* Bottom Wave - Fixed Direction */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16 text-gray-50">
          <path d="M0,120V46.29c47.79-22.2,103.59-32.17,158-28,70.36,5.37,136.33,33.31,206.8,37.5C438.64,87.57,512.34,66.33,583,47.95c69.27-18,138.3-24.88,209.4-13.08,36.15,6,69.85,17.84,104.45,29.34C989.49,95,1113,134.29,1200,67.53V120Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,120V104.19C13,83.08,27.64,63.14,47.69,47.95,99.41,8.73,165,9,224.58,28.42c31.15,10.15,60.09,26.07,89.67,39.8,40.92,19,84.73,46,130.83,49.67,36.26,2.85,70.9-9.42,98.6-31.56,31.77-25.39,62.32-62,103.63-73,40.44-10.79,81.35,6.69,119.13,24.28s75.16,39,116.92,43.05c59.73,5.85,113.28-22.88,168.9-38.84,30.2-8.66,59-6.17,87.09,7.5,22.43,10.89,48,26.93,60.65,49.24V120Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,120V114.37C149.93,61,314.09,48.68,475.83,77.43c43,7.64,84.23,20.12,127.61,26.46,59,8.63,112.48-12.24,165.56-35.4C827.93,42.78,886,24.76,951.2,30c86.53,7,172.46,45.71,248.8,84.81V120Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;