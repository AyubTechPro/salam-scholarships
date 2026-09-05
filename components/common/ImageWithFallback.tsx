'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { generateBrandBlurPlaceholder } from '@/lib/image-utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: "lazy" | "eager";
  onError?: (e: any) => void;
}

export default function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  loading,
  onError: customOnError
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const blurData = generateBrandBlurPlaceholder();

  const handleError = (e?: any) => {
    if (customOnError && e) customOnError(e);
    
    if (imgSrc !== '/images/placeholder.png') {
      setImgSrc('/images/placeholder.png'); // Fallback to placeholder
    } else {
      setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    return (
      <div
        className={`bg-[#0a192f] border border-white/5 flex items-center justify-center ${className || ''}`}
        style={fill ? undefined : { width, height }}
      >
        <ImageOff className="w-12 h-12 text-gray-500/50" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        placeholder="blur"
        blurDataURL={blurData}
        loading={loading}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      placeholder="blur"
      blurDataURL={blurData}
      loading={loading}
    />
  );
}

