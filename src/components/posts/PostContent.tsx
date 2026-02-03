import { Link } from 'react-router-dom';

interface PostContentProps {
  content: string;
}

// Combined regex for hashtags and mentions
const hashtagRegex = /#[a-zA-Z0-9_áéíóúüñÁÉÍÓÚÜÑ]+/;
const mentionRegex = /@[a-zA-Z0-9_]+/;
const combinedRegex = new RegExp(`(${hashtagRegex.source}|${mentionRegex.source})`, 'g');

export function PostContent({ content }: PostContentProps) {
  const parts = content.split(combinedRegex);
  
  return (
    <p className="mt-1 whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        // Check if it's a hashtag
        if (part.match(hashtagRegex)) {
          return (
            <Link
              key={index}
              to={`/explore?q=${encodeURIComponent(part)}`}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        
        // Check if it's a mention
        if (part.match(mentionRegex)) {
          const username = part.slice(1); // Remove the @
          return (
            <Link
              key={index}
              to={`/profile/${username}`}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        
        return part;
      })}
    </p>
  );
}
