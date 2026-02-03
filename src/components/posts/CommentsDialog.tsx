import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
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
import { useComments, useCreateComment, useDeleteComment, Comment } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Post } from '@/hooks/usePosts';

interface CommentsDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentsDialog({ post, open, onOpenChange }: CommentsDialogProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(post.id);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createComment.mutateAsync({ postId: post.id, content: content.trim() });
    setContent('');
  };

  const handleDelete = (commentId: string) => {
    if (confirm('¿Eliminar este comentario?')) {
      deleteComment.mutate({ commentId, postId: post.id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle>Comentarios</DialogTitle>
        </DialogHeader>

        {/* Original Post */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles.avatar_url || undefined} />
              <AvatarFallback>
                {post.profiles.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-bold">{post.profiles.full_name || post.profiles.username}</span>
                <span className="text-muted-foreground">@{post.profiles.username}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Cargando...</div>
          ) : comments?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No hay comentarios aún</p>
              <p className="text-sm">¡Sé el primero en comentar!</p>
            </div>
          ) : (
            comments?.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onDelete={handleDelete}
                isOwner={user?.id === comment.user_id}
              />
            ))
          )}
        </div>

        {/* Comment Input */}
        {user && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Textarea
                placeholder="Escribe tu comentario..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[60px] resize-none"
                maxLength={280}
              />
              <Button 
                type="submit" 
                disabled={!content.trim() || createComment.isPending}
                className="self-end"
              >
                {createComment.isPending ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {content.length}/280
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  isOwner: boolean;
}

function CommentItem({ comment, onDelete, isOwner }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="flex gap-3 p-4 border-b border-border hover:bg-accent/30 transition-colors">
      <Link to={`/user/${comment.profiles.username}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles.avatar_url || undefined} />
          <AvatarFallback>
            {comment.profiles.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <Link 
              to={`/user/${comment.profiles.username}`}
              className="font-bold hover:underline truncate text-sm"
            >
              {comment.profiles.full_name || comment.profiles.username}
            </Link>
            <span className="text-muted-foreground text-sm truncate">
              @{comment.profiles.username}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          {isOwner && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
      </div>
    </div>
  );
}
