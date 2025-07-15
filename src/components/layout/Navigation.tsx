import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { 
  Home,
  Compass,
  Newspaper,
  Camera,
  Calendar,
  Mail,
  BarChart3,
  Store,
  Shield,
  User
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  isActive?: boolean;
}

interface NavigationProps {
  variant?: 'desktop' | 'mobile';
  onItemClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  variant = 'desktop',
  onItemClick 
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated } = useSupabaseAuth();

  // Base navigation items for all users
  const baseNavigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: t('home'),
      icon: Home,
      href: '/',
      isActive: location.pathname === '/'
    },
    {
      id: 'explore',
      label: t('explore'),
      icon: Compass,
      href: '#explore',
      isActive: location.hash === '#explore'
    },
    {
      id: 'news',
      label: t('news'),
      icon: Newspaper,
      href: '#news',
      isActive: location.hash === '#news'
    },
    {
      id: 'gallery',
      label: t('gallery'),
      icon: Camera,
      href: '#gallery',
      isActive: location.hash === '#gallery'
    },
    {
      id: 'events',
      label: t('events'),
      icon: Calendar,
      href: '#events',
      isActive: location.hash === '#events'
    },
    {
      id: 'contact',
      label: t('contact'),
      icon: Mail,
      href: '#contact',
      isActive: location.hash === '#contact'
    }
  ];

  // Role-specific navigation items
  const getRoleSpecificItems = (): NavigationItem[] => {
    if (!isAuthenticated || !user) return [];

    switch (user.role) {
      case 'admin':
        return [
          {
            id: 'admin-dashboard',
            label: 'Admin Panel',
            icon: Shield,
            href: '/admin',
            isActive: location.pathname.startsWith('/admin')
          }
        ];
      case 'business':
        return [
          {
            id: 'business-dashboard',
            label: 'Business Panel',
            icon: Store,
            href: '/business',
            isActive: location.pathname.startsWith('/business')
          }
        ];
      case 'user':
        return [
          {
            id: 'profile',
            label: 'My Profile',
            icon: User,
            href: '/profile',
            isActive: location.pathname.startsWith('/profile')
          }
        ];
      default:
        return [];
    }
  };

  const navigationItems = [...baseNavigationItems, ...getRoleSpecificItems()];

  if (variant === 'mobile') {
    return (
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          
          if (item.href.startsWith('#')) {
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
                onClick={onItemClick}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                item.isActive 
                  ? 'text-white bg-white/10' 
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
              onClick={onItemClick}
            >
              <IconComponent className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="hidden lg:flex items-center space-x-6">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        
        if (item.href.startsWith('#')) {
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center space-y-1 transition-colors p-2 rounded-lg ${
                item.isActive 
                  ? 'text-white bg-white/10' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            to={item.href}
            className={`flex flex-col items-center space-y-1 transition-colors p-2 rounded-lg ${
              item.isActive 
                ? 'text-white bg-white/10' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <IconComponent className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;