import Image from 'next/image';
import { cn } from '@/design';

interface ProductImageProps {
  imageUrl?: string;
  imageAlt: string;
  imageColor: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}

export default function ProductImage({
  imageUrl,
  imageAlt,
  imageColor,
  className,
  sizes,
  priority = false,
}: ProductImageProps) {
  return (
    <div
      data-product-image
      role={imageUrl ? undefined : 'img'}
      aria-label={imageUrl ? undefined : imageAlt}
      className={cn(
        'relative overflow-hidden rounded-md',
        imageUrl ? 'bg-neutral-white' : cn('bg-gradient-to-br', imageColor),
        className
      )}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}
