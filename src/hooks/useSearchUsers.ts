import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchUser {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
}

export function useSearchUsers(query: string) {
    return useQuery({
        queryKey: ['search-users', query],
        queryFn: async () => {
            if (!query || query.length < 1) return [];

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .ilike('username', `${query}%`)
                .limit(5);

            if (error) throw error;
            return data as SearchUser[];
        },
        enabled: query.length >= 1,
        staleTime: 30000,
    });
}
