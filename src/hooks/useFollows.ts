import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFollowersCount(userId: string) {
  return useQuery({
    queryKey: ['followers-count', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_followers_count', { p_user_id: userId });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!userId,
  });
}

export function useFollowingCount(userId: string) {
  return useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_following_count', { p_user_id: userId });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!userId,
  });
}

export function useIsFollowing(targetUserId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-following', targetUserId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('is_following', { target_user_id: targetUserId });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers-count', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following-count'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
