import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SearchBox } from '@/components/search/SearchBox';
import { SearchResults } from '@/components/search/SearchResults';
import { TrendingList } from '@/components/trends/TrendingList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchUsers, useSearchPosts } from '@/hooks/useSearch';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');

  const { data: users = [], isLoading: loadingUsers } = useSearchUsers(query);
  const { data: posts = [], isLoading: loadingPosts } = useSearchPosts(query);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setSearchParams(newQuery ? { q: newQuery } : {});
  };

  const isLoading = loadingUsers || loadingPosts;
  const hasQuery = query.length >= 1;

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex items-center gap-4 px-4 py-3">
          <SearchBox
            className="flex-1"
            expandable={false}
            onSearch={handleSearch}
          />
          <ThemeToggle />
        </div>

        {/* Tabs */}
        {hasQuery && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent h-auto p-0">
              <TabsTrigger
                value="all"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold"
              >
                Personas
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold"
              >
                Publicaciones
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </header>

      {/* Content */}
      {hasQuery ? (
        <SearchResults
          users={users}
          posts={posts}
          activeTab={activeTab}
          isLoading={isLoading}
          query={query}
        />
      ) : (
        /* Trends */
        <div className="p-4">
          <TrendingList limit={10} />
        </div>
      )}
    </MainLayout>
  );
}
