import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/hooks/useMessages';

interface ChatWindowProps {
  messages: Message[];
  otherUser: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  onSend: (content: string) => void;
  isSending: boolean;
}

export function ChatWindow({ messages, otherUser, onSend, isSending }: ChatWindowProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    onSend(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!otherUser) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Selecciona una conversación para empezar
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <Link
        to={`/user/${otherUser.username}`}
        className="flex items-center gap-3 border-b border-border p-4 hover:bg-muted/50 transition-colors"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar_url || undefined} />
          <AvatarFallback>
            {otherUser.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold hover:underline">{otherUser.full_name || otherUser.username}</p>
          <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
        </div>
      </Link>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
        <div className="space-y-4 p-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;

            return (
              <div
                key={message.id}
                className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2',
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={cn(
                      'mt-1 text-xs',
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full shrink-0"
            disabled={!content.trim() || isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
