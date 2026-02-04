import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchUsers, SearchUser } from '@/hooks/useSearchUsers';
import { cn } from '@/lib/utils';

interface MentionAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    rows?: number;
}

export function MentionAutocomplete({
    value,
    onChange,
    onKeyDown,
    placeholder,
    className,
    maxLength,
    rows = 1,
}: MentionAutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: users = [], isLoading } = useSearchUsers(mentionQuery);

    // Detect @mention while typing
    useEffect(() => {
        const beforeCursor = value.slice(0, cursorPosition);
        const mentionMatch = beforeCursor.match(/@([a-zA-Z0-9_]*)$/);

        if (mentionMatch) {
            setMentionQuery(mentionMatch[1]);
            setShowSuggestions(true);
            setSelectedIndex(0);
        } else {
            setShowSuggestions(false);
            setMentionQuery('');
        }
    }, [value, cursorPosition]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        setCursorPosition(e.target.selectionStart);
    };

    const handleSelect = (user: SearchUser) => {
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        const mentionStart = beforeCursor.lastIndexOf('@');

        const newValue =
            beforeCursor.slice(0, mentionStart) +
            `@${user.username} ` +
            afterCursor;

        onChange(newValue);
        setShowSuggestions(false);
        setMentionQuery('');

        // Focus textarea and set cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                const newPosition = mentionStart + user.username.length + 2;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newPosition, newPosition);
                setCursorPosition(newPosition);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions && users.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % users.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleSelect(users[selectedIndex]);
                return;
            }
            if (e.key === 'Escape') {
                setShowSuggestions(false);
                return;
            }
        }

        onKeyDown?.(e);
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                className={cn(
                    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg">
                    {isLoading ? (
                        <div className="p-3 text-sm text-muted-foreground">Buscando...</div>
                    ) : users.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">
                            No se encontraron usuarios
                        </div>
                    ) : (
                        users.map((user, index) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => handleSelect(user)}
                                className={cn(
                                    'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent',
                                    index === selectedIndex && 'bg-accent',
                                    index === 0 && 'rounded-t-lg',
                                    index === users.length - 1 && 'rounded-b-lg'
                                )}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback>
                                        {user.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-sm">
                                        {user.full_name || user.username}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        @{user.username}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
