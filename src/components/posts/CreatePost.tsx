import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreatePost } from '@/hooks/usePosts';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Image, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreatePost() {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const createPost = useCreatePost();
  const { uploadImage, removeImage, uploading, error: uploadError } = useImageUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    createPost.mutate(
      { content: content.trim(), imageUrl },
      {
        onSuccess: () => {
          setContent('');
          setImageUrl(null);
          setImagePreview(null);
        },
      }
    );
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);
    } else {
      setImagePreview(null);
      if (uploadError) {
        toast.error(uploadError);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (imageUrl) {
      await removeImage(imageUrl);
    }
    setImageUrl(null);
    setImagePreview(null);
  };

  if (!user) return null;

  const charLimit = 280;
  const charsRemaining = charLimit - content.length;
  const isOverLimit = charsRemaining < 0;
  const canSubmit = (content.trim() || imageUrl) && !isOverLimit && !createPost.isPending && !uploading;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 border-b border-border p-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback>
          {profile?.username?.slice(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <Textarea
          placeholder="¿Qué está pasando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] resize-none border-none bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mt-3 rounded-2xl overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-80 w-full object-cover rounded-2xl"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleRemoveImage}
              disabled={uploading}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full text-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !!imageUrl}
            >
              <Image className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charsRemaining}
              </span>
            )}
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className="rounded-full px-4"
            >
              {createPost.isPending ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
