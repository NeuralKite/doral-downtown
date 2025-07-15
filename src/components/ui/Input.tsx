import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  helperText,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors';
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200';
  const iconPadding = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  
  const inputClasses = `${baseClasses} ${errorClasses} ${iconPadding} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;