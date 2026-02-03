import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useMessages';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No tienes conversaciones aún
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            'flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-accent/50',
            selectedId === conv.id && 'bg-accent',
            conv.unread_count > 0 && 'bg-primary/5'
          )}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={conv.other_user?.avatar_url || undefined} />
            <AvatarFallback>
              {conv.other_user?.username?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold truncate">
                {conv.other_user?.full_name || conv.other_user?.username || 'Usuario'}
              </p>
              {conv.last_message && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conv.last_message.created_at), {
                    addSuffix: false,
                    locale: es,
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              @{conv.other_user?.username || 'unknown'}
            </p>
            {conv.last_message && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {conv.last_message.content}
              </p>
            )}
          </div>

          {conv.unread_count > 0 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {conv.unread_count}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
