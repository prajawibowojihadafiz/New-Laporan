import { PhotoItem } from './reportLogic';

/**
 * Resizes and compresses an image File using an offscreen canvas.
 * Reduces file size significantly (e.g. from 5MB+ to ~30-60KB)
 * so that PDFs generated on mobile remain lightweight and crisp.
 *
 * @param file The uploaded image File
 * @param maxWidth Max width in pixels (default 500px)
 * @param quality JPEG compression quality (0.0 to 1.0, default 0.65)
 */
export async function compressImageFile(
  file: File,
  maxWidth = 500,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Fill background with white to handle transparent PNGs nicely
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(src);
        }
      };

      img.onerror = () => resolve(src);
      img.src = src;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and compresses an existing image data URL / image source
 * to ensure all photos in PDF are constrained to maximum width and quality.
 */
export async function compressDataUrl(
  src: string,
  maxWidth = 500,
  quality = 0.65
): Promise<string> {
  // If it's empty, return immediately
  if (!src) return '';

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(src);
      }
    };

    img.onerror = () => resolve(src);
    img.src = src;
  });
}

/**
 * Compresses an array of PhotoItem objects concurrently.
 */
export async function compressPhotosList(
  photos: PhotoItem[],
  maxWidth = 500,
  quality = 0.65
): Promise<PhotoItem[]> {
  if (!photos || photos.length === 0) return [];

  const promises = photos.map(async (photo) => {
    try {
      const compressedUrl = await compressDataUrl(photo.url, maxWidth, quality);
      return {
        ...photo,
        url: compressedUrl,
      };
    } catch {
      return photo;
    }
  });

  return Promise.all(promises);
}
