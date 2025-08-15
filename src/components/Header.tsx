import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Heart, Globe, ChevronDown, Bell } from 'lucide-react';
import { UserRole, Business } from '../types';
import { UserProfile } from '../lib/supabase';
import FavoritesModal from './FavoritesModal';
import Navigation from './layout/Navigation';
import UserMenu from './layout/UserMenu';
import RoleIndicator from './layout/RoleIndicator';

interface HeaderProps {
  onLogout?: () => void;
  user?: UserProfile | null;
  isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogout,
  user,
  isAuthenticated = false
}) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<Business[]>([]);

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLanguageOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleRemoveFavorite = (businessId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== businessId));
  };

  const handleViewDetails = (businessId: string) => {
    setIsFavoritesOpen(false);
  };

  const getRoleBasedCTA = () => {
    if (!isAuthenticated || !user) {
      return {
        text: t('offer_services'),
        action: () => console.log('Navigate to services')
      };
    }

    switch (user.role) {
      case 'admin':
        return {
          text: 'Admin Panel',
          action: () => window.location.href = '/admin'
        };
      case 'business':
        return {
          text: 'My Business',
          action: () => window.location.href = '/business'
        };
      default:
        return {
          text: 'Dashboard',
          action: () => window.location.href = '/profile'
        };
    }
  };

  const ctaButton = getRoleBasedCTA();

  return (
    <header className="bg-brand-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-white hover:text-white/90 transition-colors">
              Doral Downtown
            </a>
          </div>

          {/* Desktop Navigation - Simplified with Icons */}
          <Navigation variant="desktop" />

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <img 
                  src={i18n.language === 'en' ? "https://flagcdn.com/w20/us.png" : "https://flagcdn.com/w20/es.png"}
                  alt={i18n.language === 'en' ? "English" : "Español"}
                  className="w-5 h-4 object-cover rounded-sm"
                />
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => toggleLanguage('en')}
                    className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <img 
                      src="https://flagcdn.com/w20/us.png" 
                      alt="English"
                      className="w-4 h-3 object-cover rounded-sm"
                    />
                    <span className="text-sm text-gray-700">English</span>
                  </button>
                  <button
                    onClick={() => toggleLanguage('es')}
                    className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <img 
                      src="https://flagcdn.com/w20/es.png" 
                      alt="Español"
                      className="w-4 h-3 object-cover rounded-sm"
                    />
                    <span className="text-sm text-gray-700">Español</span>
                  </button>
                </div>
              )}
            </div>

            {/* Favorites */}
            <button 
              onClick={() => setIsFavoritesOpen(true)}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated && user && (
              <RoleIndicator role={user.role} />
            )}
            
            {/* Notifications (for authenticated users) */}
            {isAuthenticated && (
              <button className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative" title="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
            )}

            <UserMenu 
              user={user}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />

            {/* CTA Button */}
            {!isAuthenticated && (
              <button 
                onClick={ctaButton.action}
                className="bg-white text-brand-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-sm"
              >
                {ctaButton.text}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white/80 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-brand-primary border-t border-white/10">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Navigation 
              variant="mobile" 
              onItemClick={() => setIsMenuOpen(false)}
            />

            <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 mt-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-white/80" />
                <span className="text-white/80 text-sm">{t('language')}</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => toggleLanguage('en')} className="p-1">
                  <img src="https://flagcdn.com/w20/us.png" alt="EN" className="w-5 h-4 object-cover rounded-sm" />
                </button>
                <button onClick={() => toggleLanguage('es')} className="p-1">
                  <img src="https://flagcdn.com/w20/es.png" alt="ES" className="w-5 h-4 object-cover rounded-sm" />
                </button>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="flex space-x-2 px-3 py-2">
                <UserMenu 
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <UserMenu 
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </div>
            )}

            <button 
              onClick={ctaButton.action}
              className="mx-3 w-full bg-white text-brand-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              {ctaButton.text}
            </button>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onViewDetails={() => {}}
      />
    </header>
  );
};

export default Header;