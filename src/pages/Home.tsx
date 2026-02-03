import { MainLayout } from '@/components/layout/MainLayout';
import { CreatePost } from '@/components/posts/CreatePost';
import { Feed } from '@/components/posts/Feed';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">Inicio</h1>
        <ThemeToggle />
      </header>

      {/* Create Post */}
      <CreatePost />

      {/* Feed */}
      <Feed />
    </MainLayout>
  );
}
