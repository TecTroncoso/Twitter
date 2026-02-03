import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, Mail, User, Settings, LogOut, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useConversations } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { unreadCount: unreadNotifications } = useNotifications();
  const { unreadCount: unreadMessages } = useConversations();

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/', badge: 0 },
    { icon: Search, label: 'Explorar', path: '/explore', badge: 0 },
    { icon: Bell, label: 'Notificaciones', path: '/notifications', badge: unreadNotifications },
    { icon: Mail, label: 'Mensajes', path: '/messages', badge: unreadMessages },
    { icon: User, label: 'Perfil', path: '/profile', badge: 0 },
    { icon: Settings, label: 'Configuración', path: '/settings', badge: 0 },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-20 flex-col items-center border-r border-border bg-background py-4 xl:w-64 xl:items-start xl:px-4">
      {/* Logo */}
      <Link to="/" className="mb-6 flex h-12 w-12 items-center justify-center rounded-full hover:bg-accent xl:ml-2">
        <Feather className="h-7 w-7 text-primary" />
      </Link>

      {/* Navigation */}
      <nav className="flex w-full flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center justify-center gap-4 rounded-full p-3 transition-colors hover:bg-accent xl:justify-start xl:px-4',
                isActive && 'font-bold'
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
              <span className="hidden text-xl xl:inline">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto hidden rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground xl:inline">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Post Button */}
        <Link to="/compose" className="mt-4">
          <Button className="h-12 w-12 rounded-full xl:w-full" size="lg">
            <Feather className="h-5 w-5 xl:hidden" />
            <span className="hidden xl:inline">Publicar</span>
          </Button>
        </Link>
      </nav>

      {/* User Menu */}
      {user && (
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="mt-auto flex items-center justify-center gap-3 rounded-full p-3 hover:bg-destructive/10 xl:w-full xl:justify-start xl:px-4"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden xl:inline">Cerrar sesión</span>
        </Button>
      )}
    </aside>
  );
}
