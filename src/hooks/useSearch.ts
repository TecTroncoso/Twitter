import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export interface SearchPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['search', 'users', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data as SearchUser[];
    },
    enabled: query.length >= 1,
  });
}

export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: ['search', 'posts', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as SearchPost[];
    },
    enabled: query.length >= 1,
  });
}
