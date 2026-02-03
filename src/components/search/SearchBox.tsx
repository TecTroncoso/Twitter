import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchUsers, useSearchPosts } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  className?: string;
  expandable?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBox({ className, expandable = true, onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: users = [], isLoading: loadingUsers } = useSearchUsers(query);
  const { data: posts = [], isLoading: loadingPosts } = useSearchPosts(query);

  const isLoading = loadingUsers || loadingPosts;
  const hasResults = users.length > 0 || posts.length > 0;
  const showDropdown = isFocused && query.length >= 1 && expandable;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/explore?q=${encodeURIComponent(query)}`);
      }
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleUserClick = (username: string) => {
    setIsFocused(false);
    setQuery('');
    navigate(`/user/${username}`);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Buscar"
            className={cn(
              'rounded-full bg-muted pl-10 pr-10 transition-all',
              isFocused && 'ring-2 ring-primary bg-background'
            )}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full hover:bg-primary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-xl z-50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Buscando "{query}"...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-muted-foreground">
              Buscar "{query}"
            </div>
          ) : (
            <>
              {/* User Results */}
              {users.slice(0, 5).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.username)}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))}

              {/* Posts Preview */}
              {posts.length > 0 && (
                <button
                  onClick={() => {
                    navigate(`/explore?q=${encodeURIComponent(query)}`);
                    setIsFocused(false);
                  }}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent/50 border-t border-border"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium">
                    Buscar "{query}" en publicaciones
                  </p>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
