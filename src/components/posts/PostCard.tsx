import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Trash2, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useDeletePost, Post } from '@/hooks/usePosts';
import { useLikesCount, useHasLiked, useToggleLike } from '@/hooks/useLikes';
import { useRepostsCount, useHasReposted, useToggleRepost } from '@/hooks/useReposts';
import { useQuotePost } from '@/hooks/useQuotePost';
import { useCommentsCount } from '@/hooks/useComments';
import { CommentsDialog } from './CommentsDialog';
import { QuoteDialog } from './QuoteDialog';
import { QuotedPost } from './QuotedPost';
import { PostContent } from './PostContent';
import { PostImage } from './PostImage';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuotedPostData {
  id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  profiles: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface PostCardProps {
  post: Post & { quoted_post?: QuotedPostData | null };
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const deletePost = useDeletePost();
  const isOwner = user?.id === post.user_id;
  const [showComments, setShowComments] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  // Likes
  const { data: likesCount = 0 } = useLikesCount(post.id);
  const { data: hasLiked = false } = useHasLiked(post.id);
  const toggleLike = useToggleLike();

  // Reposts
  const { data: repostsCount = 0 } = useRepostsCount(post.id);
  const { data: hasReposted = false } = useHasReposted(post.id);
  const toggleRepost = useToggleRepost();

  // Quote
  const quotePost = useQuotePost();

  // Comments
  const { data: commentsCount = 0 } = useCommentsCount(post.id);

  const timeAgo = formatDistanceToNow(parseISO(post.created_at), {
    addSuffix: true,
    locale: es,
  });

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      deletePost.mutate(post.id);
    }
  };

  const handleLike = () => {
    if (!user) return;
    toggleLike.mutate({ postId: post.id, hasLiked });
  };

  const handleRepost = () => {
    if (!user) return;
    toggleRepost.mutate({ postId: post.id, hasReposted }, {
      onSuccess: () => {
        toast.success(hasReposted ? 'Repost eliminado' : 'Reposteado');
      }
    });
  };

  const handleQuote = (content: string) => {
    quotePost.mutate({ content, quotedPostId: post.id }, {
      onSuccess: () => {
        setShowQuoteDialog(false);
        toast.success('Cita publicada');
      }
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    }
  };

  return (
    <>
      <article className="flex gap-3 border-b border-border p-4 transition-colors hover:bg-accent/30">
        {/* Avatar */}
        <Link to={`/user/${post.profiles.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback>
              {post.profiles.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Link 
                to={`/user/${post.profiles.username}`}
                className="font-bold hover:underline truncate"
              >
                {post.profiles.full_name || post.profiles.username}
              </Link>
              <Link 
                to={`/user/${post.profiles.username}`}
                className="text-muted-foreground truncate"
              >
                @{post.profiles.username}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {timeAgo}
              </span>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post Content */}
          <PostContent content={post.content} />

          {/* Post Image */}
          {post.image_url && (
            <PostImage src={post.image_url} />
          )}

          {/* Quoted Post */}
          {post.quoted_post && post.quoted_post.created_at && (
            <QuotedPost post={post.quoted_post} />
          )}

          {/* Actions */}
          <div className="mt-3 flex max-w-md justify-between">
            {/* Comments */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{commentsCount}</span>
            </Button>

            {/* Reposts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-green-500",
                    hasReposted && "text-green-500"
                  )}
                >
                  <Repeat2 className={cn("h-4 w-4", hasReposted && "fill-current")} />
                  <span className="text-xs">{repostsCount}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuItem 
                  onClick={handleRepost}
                  disabled={toggleRepost.isPending}
                  className={cn(hasReposted && "text-green-500")}
                >
                  <Repeat2 className="mr-2 h-4 w-4" />
                  {hasReposted ? 'Deshacer Repost' : 'Repostear'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowQuoteDialog(true)}>
                  <Quote className="mr-2 h-4 w-4" />
                  Citar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Likes */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 text-muted-foreground hover:text-red-500",
                hasLiked && "text-red-500"
              )}
              onClick={handleLike}
              disabled={toggleLike.isPending}
            >
              <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
              <span className="text-xs">{likesCount}</span>
            </Button>

            {/* Share */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>

      <CommentsDialog 
        post={post} 
        open={showComments} 
        onOpenChange={setShowComments} 
      />

      <QuoteDialog
        post={post}
        open={showQuoteDialog}
        onOpenChange={setShowQuoteDialog}
        onQuote={handleQuote}
        isPending={quotePost.isPending}
      />
    </>
  );
}
