import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { compressImage } from '@/lib/imageCompression';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      setError('Debes iniciar sesión para subir imágenes');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return null;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10MB');
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      // Compress image before uploading
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      });

      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      setError('Error al subir la imagen');
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const path = url.split('/post-images/')[1];
      if (!path) return false;

      const { error } = await supabase.storage
        .from('post-images')
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return { uploadImage, removeImage, uploading, error };
}
