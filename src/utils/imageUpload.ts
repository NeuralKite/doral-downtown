// utils/imageUpload.ts
import { supabase } from "../lib/supabase";

export interface UploadResult {
  success: boolean;
  url?: string; // public URL
  path?: string; // storage path inside the bucket (useful to delete later)
  error?: string;
}

const BUCKET = "avatars";
const MAX_SIZE_MB = 5;

function slugifyFilename(name: string) {
  const lastDot = name.lastIndexOf(".");
  const base = (lastDot > -1 ? name.slice(0, lastDot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = (lastDot > -1 ? name.slice(lastDot + 1) : "").toLowerCase();
  return ext ? `${base}.${ext}` : base;
}

function buildAvatarPath(userId: string, fileName: string) {
  const ts = Date.now();
  return `${userId}/${ts}_${slugifyFilename(fileName)}`;
}

// Convert a public URL to the storage object path (after /object/public/<bucket>/...)
function urlToStoragePath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
}

export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Please select an image file" };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return {
        success: false,
        error: `Image must be less than ${MAX_SIZE_MB}MB`,
      };
    }

    // IMPORTANTÍSIMO: el path NO lleva "avatars/" porque ya estamos dentro del bucket "avatars".
    // Además, debe empezar por `${userId}/` para que pasen las políticas RLS recomendadas.
    const path = buildAvatarPath(userId, file.name);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false, // como usamos timestamp en el nombre, no necesitamos sobrescribir
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, error: "Failed to upload image" };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { success: true, url: data.publicUrl, path };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const deleteAvatar = async (urlOrPath: string): Promise<boolean> => {
  try {
    // Acepta tanto la URL pública como el path interno
    const path = urlOrPath.startsWith("http")
      ? urlToStoragePath(urlOrPath)
      : urlOrPath;
    if (!path) {
      console.error("Delete error: invalid path from", urlOrPath);
      return false;
    }

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error("Delete error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Avatar delete error:", error);
    return false;
  }
};
