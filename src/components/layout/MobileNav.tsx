import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, Mail, User } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useConversations } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const { unreadCount: unreadNotifications } = useNotifications();
  const { unreadCount: unreadMessages } = useConversations();

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/', badge: 0 },
    { icon: Search, label: 'Explorar', path: '/explore', badge: 0 },
    { icon: Bell, label: 'Notificaciones', path: '/notifications', badge: unreadNotifications },
    { icon: Mail, label: 'Mensajes', path: '/messages', badge: unreadMessages },
    { icon: User, label: 'Perfil', path: '/profile', badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background py-2 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'relative flex flex-col items-center gap-1 p-2 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className="relative">
              <item.icon className={cn('h-6 w-6', isActive && 'stroke-[2.5px]')} />
              {item.badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
