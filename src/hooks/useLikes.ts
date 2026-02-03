import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLikesCount(postId: string) {
  return useQuery({
    queryKey: ['likes-count', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_likes_count', { p_post_id: postId });
      
      if (error) throw error;
      return data as number;
    },
  });
}

export function useHasLiked(postId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['has-liked', postId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('has_liked', { p_post_id: postId });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (hasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['likes-count', postId] });
      queryClient.invalidateQueries({ queryKey: ['has-liked', postId] });
    },
  });
}
