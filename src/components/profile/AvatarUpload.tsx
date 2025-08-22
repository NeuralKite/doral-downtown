// components/profile/AvatarUpload.tsx
import React, { useState, useRef } from "react";
import { Camera, X, Check, SquarePen } from "lucide-react";
import { uploadAvatar, deleteAvatar } from "../../utils/imageUpload";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = "md",
}) => {
  const { user, updateProfile } = useSupabaseAuth(); // 👈 usamos updateProfile del hook
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };

  const getDefaultAvatar = () => {
    const role = user?.role || "user";
    switch (role) {
      case "admin":
        return "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1";
      case "business":
        return "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1";
      default:
        return "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1";
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validaciones simples
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max size is 5MB");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess(false);

    try {
      // 1) Subir
      const result = await uploadAvatar(file, user.user_id || user.id);
      // 👆 según tu shape de `user` (perfil). Si tu perfil usa `user_id`, úsalo; si no, `id`.
      if (!result.success || !result.url) {
        setError(result.error || "Upload failed");
        return;
      }

      // 2) Borrar anterior si era de Supabase (opcional)
      if (
        currentAvatar &&
        currentAvatar.includes("/storage/v1/object/public/avatars/")
      ) {
        await deleteAvatar(currentAvatar).catch(() => {});
      }

      // 3) Persistir en DB
      const ok = await updateProfile({ avatar_url: result.url });
      if (!ok) {
        setError("Could not update profile");
        return;
      }

      // 4) Refrescar UI del padre
      onAvatarChange(result.url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="relative">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden group cursor-pointer`}
      >
        <img
          src={currentAvatar || getDefaultAvatar()}
          alt="Avatar"
          className="object-cover w-full h-full"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100"
          onClick={triggerFileSelect}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent" />
          ) : success ? (
            <Check className="w-6 h-6 text-green-400" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 text-white transition-colors rounded-full shadow-lg bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
          ) : (
            <SquarePen className="w-4 h-4" />
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

      {error && (
        <p className="flex items-center mt-2 text-sm text-red-600">
          <X className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}

      {success && (
        <p className="flex items-center mt-2 text-sm text-green-600">
          <Check className="w-4 h-4 mr-1" />
          Avatar updated successfully!
        </p>
      )}

      <p className="mt-2 text-xs text-center text-gray-500">
        Click to upload a new photo (max 5MB)
      </p>
    </div>
  );
};

export default AvatarUpload;
