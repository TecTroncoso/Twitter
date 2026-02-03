import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useRepostsCount(postId: string) {
  return useQuery({
    queryKey: ['reposts-count', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_reposts_count', { p_post_id: postId });
      
      if (error) throw error;
      return data as number;
    },
  });
}

export function useHasReposted(postId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['has-reposted', postId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('has_reposted', { p_post_id: postId });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, hasReposted }: { postId: string; hasReposted: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (hasReposted) {
        const { error } = await supabase
          .from('reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reposts')
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['reposts-count', postId] });
      queryClient.invalidateQueries({ queryKey: ['has-reposted', postId] });
    },
  });
}
