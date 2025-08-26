import { useEffect, useState } from 'react';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

export const useIsImageUrl = (url: string) => {
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const validateImage = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('Content-Type');
        if (contentType && imageMimeTypes.includes(contentType)) {
          setIsImage(true);
        } else {
          setIsImage(false);
        }
      } catch (error) {
        setIsImage(false);
      }
    };

    if (url && typeof url === 'string' && url.startsWith('https')) {
      validateImage();
    } else {
      setIsImage(false);
    }
  }, [url]);

  return isImage;
};