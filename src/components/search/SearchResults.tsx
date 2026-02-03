import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SearchUser, SearchPost } from '@/hooks/useSearch';

interface SearchResultsProps {
  users: SearchUser[];
  posts: SearchPost[];
  activeTab: 'all' | 'users' | 'posts';
  isLoading: boolean;
  query: string;
  onUserClick?: () => void;
}

export function SearchResults({ 
  users, 
  posts, 
  activeTab, 
  isLoading, 
  query,
  onUserClick 
}: SearchResultsProps) {
  if (!query.trim()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Buscando...
      </div>
    );
  }

  const showUsers = activeTab === 'all' || activeTab === 'users';
  const showPosts = activeTab === 'all' || activeTab === 'posts';

  const hasResults = (showUsers && users.length > 0) || (showPosts && posts.length > 0);

  if (!hasResults) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-bold">Sin resultados para "{query}"</p>
        <p className="mt-2 text-muted-foreground">
          Intenta buscar algo diferente o verifica la ortografía.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {/* Users Section */}
      {showUsers && users.length > 0 && (
        <>
          {activeTab === 'all' && (
            <h3 className="px-4 py-3 text-lg font-bold">Personas</h3>
          )}
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/user/${user.username}`}
              onClick={onUserClick}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/50"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">
                  {user.full_name || user.username}
                </p>
                <p className="text-muted-foreground truncate">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </>
      )}

      {/* Posts Section */}
      {showPosts && posts.length > 0 && (
        <>
          {activeTab === 'all' && (
            <h3 className="px-4 py-3 text-lg font-bold">Publicaciones</h3>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex gap-3 p-4 transition-colors hover:bg-accent/50"
            >
              <Link to={`/user/${post.profiles.username}`} onClick={onUserClick}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.profiles.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Link 
                    to={`/user/${post.profiles.username}`}
                    onClick={onUserClick}
                    className="font-bold hover:underline truncate"
                  >
                    {post.profiles.full_name || post.profiles.username}
                  </Link>
                  <span className="text-muted-foreground truncate">
                    @{post.profiles.username}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {post.created_at && formatDistanceToNow(parseISO(post.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words">
                  {post.content}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
