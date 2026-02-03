import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingHashtag {
  hashtag: string;
  post_count: number;
}

export function useTrendingHashtags(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_trending_hashtags', { limit_count: limit });
      
      if (error) throw error;
      return data as TrendingHashtag[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
