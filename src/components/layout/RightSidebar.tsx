import { SearchBox } from '@/components/search/SearchBox';
import { TrendingList } from '@/components/trends/TrendingList';

export function RightSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 border-l border-border bg-background p-4 lg:flex">
      {/* Search */}
      <SearchBox />

      {/* Trends */}
      <div className="rounded-2xl bg-muted p-4">
        <TrendingList limit={5} />
      </div>

      {/* Who to follow */}
      <div className="rounded-2xl bg-muted p-4">
        <h2 className="mb-4 text-xl font-bold">A quién seguir</h2>
        <p className="text-sm text-muted-foreground">
          Regístrate para ver sugerencias personalizadas.
        </p>
      </div>
    </aside>
  );
}
