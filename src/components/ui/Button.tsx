import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary/20',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/90 focus:ring-brand-secondary/20',
    outline: 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white focus:ring-brand-primary/20',
    ghost: 'text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary/20',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="h-4 w-4 mr-2" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4 ml-2" />}
    </button>
  );
};

export default Button;