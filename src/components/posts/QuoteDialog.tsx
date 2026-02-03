import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Post } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface QuoteDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuote: (content: string) => void;
  isPending: boolean;
}

export function QuoteDialog({ post, open, onOpenChange, onQuote, isPending }: QuoteDialogProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [content, setContent] = useState('');

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: es,
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    onQuote(content);
    setContent('');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Citar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User input area */}
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.username?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Añade un comentario..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Quoted post preview */}
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.profiles.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {post.profiles.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">
                {post.profiles.full_name || post.profiles.username}
              </span>
              <span className="text-muted-foreground text-sm">
                @{post.profiles.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || isPending}
              className="rounded-full"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Postear'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
