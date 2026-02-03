import { Heart, MessageCircle, Repeat2, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const iconMap = {
  like: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  repost: { icon: Repeat2, color: 'text-green-500', bg: 'bg-green-500/10' },
  follow: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
};

const messageMap = {
  like: 'le gustó tu publicación',
  comment: 'comentó tu publicación',
  repost: 'compartió tu publicación',
  follow: 'comenzó a seguirte',
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const navigate = useNavigate();
  const { icon: Icon, color, bg } = iconMap[notification.type];

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    if (notification.type === 'follow') {
      navigate(`/user/${notification.actor.username}`);
    } else if (notification.post_id) {
      // Navigate to post (could be expanded to a post detail page)
      navigate('/');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex gap-3 p-4 cursor-pointer transition-colors hover:bg-accent/50 border-b border-border',
        !notification.is_read && 'bg-primary/5'
      )}
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', bg)}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.actor.avatar_url || undefined} />
            <AvatarFallback>
              {notification.actor.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-bold">
                {notification.actor.full_name || notification.actor.username}
              </span>{' '}
              {messageMap[notification.type]}
            </p>
            {notification.post?.content && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {notification.post.content}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(parseISO(notification.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>

      {!notification.is_read && (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
