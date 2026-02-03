import { useState, useEffect } from 'react';
import { Mail, Settings, ArrowLeft, PenSquare } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { useConversations, useConversationMessages } from '@/hooks/useMessages';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations, isLoading } = useConversations();
  const { messages, sendMessage, isSending } = useConversationMessages(selectedConversationId);
  const isMobile = useIsMobile();

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // On mobile, show either list or chat
  const showChat = isMobile && selectedConversationId;
  const showList = !isMobile || !selectedConversationId;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen">
        {/* Conversation List */}
        {showList && (
          <div className={`${isMobile ? 'w-full' : 'w-80 border-r border-border'} flex flex-col`}>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
              <h1 className="text-xl font-bold">Mensajes</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
                <ThemeToggle />
              </div>
            </header>

            {isLoading ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-bold">Bienvenido a tus mensajes</h2>
                <p className="mt-1 max-w-sm text-muted-foreground">
                  Envía mensajes privados a otros usuarios. Las conversaciones aparecerán aquí.
                </p>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
              />
            )}
          </div>
        )}

        {/* Chat Window */}
        {(!isMobile || showChat) && (
          <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col`}>
            {isMobile && selectedConversationId && (
              <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 px-2 py-3 backdrop-blur">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="font-bold">
                  {selectedConversation?.other_user?.full_name || selectedConversation?.other_user?.username}
                </span>
              </header>
            )}
            <div className="flex-1">
              <ChatWindow
                messages={messages}
                otherUser={selectedConversation?.other_user || null}
                onSend={sendMessage}
                isSending={isSending}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
