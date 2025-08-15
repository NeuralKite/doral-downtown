import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { 
  User,
  UserCircle,
  Settings,
  LogOut,
  Shield,
  Store,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../../lib/supabase';
import { UserRole } from '../../types';
import { Dropdown } from '../ui';

interface UserMenuProps {
  user?: UserProfile | null;
  isAuthenticated: boolean;
  onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  isAuthenticated,
  onLogout
}) => {
  const { t } = useTranslation();

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'business':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getDefaultAvatar = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
      case 'business':
        return 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
      default:
        return 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
    }
  };

  if (!isAuthenticated || !user) {
    const guestItems = [
      {
        label: t('login'),
        value: 'login',
        icon: User,
        href: '/auth/login'
      },
      {
        label: t('register'),
        value: 'register',
        icon: UserCircle,
        href: '/auth/register'
      }
    ];

    const trigger = (
      <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="text-white text-sm">Account</span>
        <ChevronDown className="h-4 w-4 text-white" />
      </div>
    );

    return <Dropdown trigger={trigger} items={guestItems} />;
  }

  // Get account label based on role
  const getAccountLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'business':
        return 'Business';
      default:
        return 'User';
    }
  };

  const authenticatedItems = [
    ...(user.role === 'user' ? [{
      label: 'Dashboard',
      value: 'profile',
      icon: UserCircle,
      href: '/profile'
    }] : []),
    ...(user.role === 'admin' ? [{
      label: 'Admin Dashboard',
      value: 'admin',
      icon: Shield,
      href: '/admin'
    }] : []),
    ...(user.role === 'business' ? [{
      label: 'Business Dashboard',
      value: 'business',
      icon: Store,
      href: '/business'
    }] : []),
    ...(user.role !== 'user' ? [{
      label: 'My Profile',
      value: 'profile',
      icon: UserCircle,
      href: '/profile'
    }] : []),
    {
      label: t('settings'),
      value: 'settings',
      icon: Settings,
      onClick: () => console.log('Navigate to settings')
    },
    {
      label: t('logout'),
      value: 'logout',
      icon: LogOut,
      onClick: onLogout
    }
  ];

  const trigger = (
    <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors">
      <div className="relative">
        <img 
          src={user.avatar_url || getDefaultAvatar(user.role)}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">{getAccountLabel(user.role)}</span>
        <span className="text-xs text-white/60">{user.name}</span>
      </div>
      <ChevronDown className="h-4 w-4" />
    </div>
  );

  return <Dropdown trigger={trigger} items={authenticatedItems} />;
};

export default UserMenu;