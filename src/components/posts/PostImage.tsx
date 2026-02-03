import { cn } from '@/lib/utils';

interface PostImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function PostImage({ src, alt = 'Imagen del post', className }: PostImageProps) {
  return (
    <div className={cn('mt-3 overflow-hidden rounded-2xl border border-border', className)}>
      <img 
        src={src} 
        alt={alt}
        className="w-full max-h-[500px] object-cover"
        loading="lazy"
      />
    </div>
  );
}
