import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '../../utils/imageUpload';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'md'
}) => {
  const { user } = useSupabaseAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const getDefaultAvatar = () => {
    const role = user?.role || 'user';
    switch (role) {
      case 'admin':
        return 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1';
      case 'business':
        return 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1';
      default:
        return 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError('');
    setSuccess(false);

    try {
      // Delete old avatar if it exists and is not a default one
      if (currentAvatar && currentAvatar.includes('supabase')) {
        await deleteAvatar(currentAvatar);
      }

      // Upload new avatar
      const result = await uploadAvatar(file, user.id);
      
      if (result.success && result.url) {
        onAvatarChange(result.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden group cursor-pointer`}>
        <img 
          src={currentAvatar || getDefaultAvatar()}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onClick={triggerFileSelect}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : success ? (
            <Check className="h-6 w-6 text-green-400" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors shadow-lg disabled:opacity-50"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Avatar updated successfully!
        </p>
      )}

      {/* Upload instructions */}
      <p className="mt-2 text-xs text-gray-500 text-center">
        Click to upload a new photo (max 5MB)
      </p>
    </div>
  );
};

export default AvatarUpload;