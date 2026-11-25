import { useState, type ComponentPropsWithoutRef } from 'react';
import { getImageSource, responsiveImage } from '../lib/images.ts';

type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'srcSet' | 'onError'> & {
  src?: string;
  sizes: string;
  thumbnail?: boolean;
};

export function ResponsiveImage({ src, sizes, thumbnail = false, loading = 'lazy', width, height, ...props }: ImageProps) {
  const [failedTransform, setFailedTransform] = useState<string>();
  const { src: source, dimensions } = getImageSource(src);
  const optimized = source && dimensions && failedTransform !== source;
  const image = optimized ? responsiveImage(source, thumbnail) : { src: source };

  return (
    <img
      {...props}
      {...image}
      sizes={optimized ? sizes : undefined}
      width={width ?? dimensions?.width ?? 400}
      height={height ?? dimensions?.height ?? 400}
      loading={loading}
      onError={optimized ? () => setFailedTransform(source) : undefined}
    />
  );
}
