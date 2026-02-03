import { Link } from 'react-router-dom';
import { useTrendingHashtags } from '@/hooks/useHashtags';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingListProps {
  limit?: number;
  showTitle?: boolean;
}

export function TrendingList({ limit = 5, showTitle = true }: TrendingListProps) {
  const { data: hashtags = [], isLoading } = useTrendingHashtags(limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-xl font-bold">Tendencias para ti</h2>}
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // If no real hashtags, show placeholder trends
  const displayTrends = hashtags.length > 0 ? hashtags : null;

  return (
    <div>
      {showTitle && <h2 className="mb-4 text-xl font-bold">Tendencias para ti</h2>}
      <div className="space-y-1">
        {displayTrends ? (
          displayTrends.map((trend, index) => (
            <Link
              key={trend.hashtag}
              to={`/explore?q=${encodeURIComponent('#' + trend.hashtag)}`}
              className="block cursor-pointer transition-colors hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg"
            >
              <p className="text-xs text-muted-foreground">
                {index + 1} · Tendencia
              </p>
              <p className="font-bold">#{trend.hashtag}</p>
              <p className="text-xs text-muted-foreground">
                {trend.post_count.toLocaleString()} {trend.post_count === 1 ? 'post' : 'posts'}
              </p>
            </Link>
          ))
        ) : (
          // Placeholder when no hashtags exist yet
          Array.from({ length: limit }).map((_, i) => (
            <div 
              key={i} 
              className="cursor-pointer transition-colors hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg"
            >
              <p className="text-xs text-muted-foreground">
                {i + 1} · Tendencia
              </p>
              <p className="font-bold">#Tendencia{i + 1}</p>
              <p className="text-xs text-muted-foreground">
                {(i + 1) * 1000} posts
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
