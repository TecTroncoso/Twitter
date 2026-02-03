import { useState } from 'react';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';

export default function Notifications() {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    unreadCount 
  } = useNotifications();

  const allNotifications = notifications;
  const mentionNotifications = notifications.filter(n => n.type === 'comment');

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">Notificaciones</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todo como leído
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Todas
          </TabsTrigger>
          <TabsTrigger 
            value="mentions" 
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Menciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold">No tienes notificaciones</h2>
              <p className="mt-1 text-muted-foreground">
                Cuando recibas notificaciones, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div>
              {allNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentions" className="mt-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : mentionNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold">No tienes menciones</h2>
              <p className="mt-1 text-muted-foreground">
                Cuando te mencionen, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div>
              {mentionNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
