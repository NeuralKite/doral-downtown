import React from 'react';
import { Shield, Store, User } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleIndicatorProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RoleIndicator: React.FC<RoleIndicatorProps> = ({ 
  role, 
  size = 'sm',
  showLabel = false 
}) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          icon: Shield,
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Admin'
        };
      case 'business':
        return {
          icon: Store,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Business'
        };
      default:
        return {
          icon: User,
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'User'
        };
    }
  };

  const config = getRoleConfig(role);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (showLabel) {
    return (
      <div className={`flex items-center space-x-2 ${config.bgColor} px-3 py-1 rounded-full`}>
        <div className={`${sizeClasses[size]} ${config.color} rounded-full flex items-center justify-center`}>
          <IconComponent className={`${iconSizes[size]} text-white`} />
        </div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${config.color} rounded-full flex items-center justify-center`}
      title={config.label}
    >
      <IconComponent className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

export default RoleIndicator;