import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuotedPostProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export function QuotedPost({ post }: QuotedPostProps) {
  const timeAgo = post.created_at 
    ? formatDistanceToNow(parseISO(post.created_at), {
        addSuffix: true,
        locale: es,
      })
    : '';

  return (
    <Link 
      to={`/post/${post.id}`}
      className="block rounded-xl border border-border p-3 mt-3 hover:bg-accent/50 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
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
      <p className="mt-2 text-sm whitespace-pre-wrap break-words line-clamp-3">
        {post.content}
      </p>
    </Link>
  );
}
