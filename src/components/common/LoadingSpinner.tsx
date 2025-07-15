import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
  showTimeout?: boolean;
  onTimeout?: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  message = 'Loading...',
  showTimeout = false,
  onTimeout
}) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = React.useState(false);

  React.useEffect(() => {
    if (showTimeout) {
      const timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 8000); // Show timeout after 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showTimeout]);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-brand-primary border-t-transparent ${sizeClasses[size]} mb-2`} />
      <p className="text-gray-600 text-sm">{message}</p>
      {showTimeoutMessage && (
        <div className="mt-4 text-center">
          <p className="text-red-600 text-sm mb-2">This is taking longer than expected...</p>
          <button 
            onClick={onTimeout || (() => window.location.reload())}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-sm"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;