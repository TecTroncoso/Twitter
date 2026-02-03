import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { RightSidebar } from './RightSidebar';

interface MainLayoutProps {
  children: ReactNode;
  hideRightSidebar?: boolean;
}

export function MainLayout({ children, hideRightSidebar = false }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen justify-center bg-background">
      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="w-full max-w-2xl border-x border-border pb-16 md:pb-0">
        {children}
      </main>

      {/* Right Sidebar - Hidden on tablet and mobile */}
      {!hideRightSidebar && <RightSidebar />}

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
