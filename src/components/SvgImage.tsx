import { useEffect, useState } from 'react';

export const SvgImage = () => {
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const src = new URL('/assets/house.jpeg', import.meta.url).href;

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImgSize({
        width: img.width / 3,
        height: img.height / 3,
      });
    };

    img.src = src;
  }, [src]);

  return (
    imgSize && (
      <image
        x={(1600 - imgSize.width) / 2}
        y={(900 - imgSize.height) / 2}
        href={src}
        width={imgSize.width}
        height={imgSize.height}
      />
    )
  );
};
