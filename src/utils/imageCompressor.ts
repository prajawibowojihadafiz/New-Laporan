import { PhotoItem } from './reportLogic';

/**
 * Resizes and compresses an image File using an offscreen canvas.
 * Reduces file size significantly (e.g. from 5MB+ to ~40-80KB)
 * so that PDFs generated on mobile remain lightweight and crisp.
 *
 * Includes fallback to original FileReader data URL if canvas compression fails,
 * ensuring photos are NEVER blank or lost.
 *
 * @param file The uploaded image File
 * @param maxWidth Max width in pixels (default 800px)
 * @param quality JPEG compression quality (0.0 to 1.0, default 0.75)
 */
export async function compressImageFile(
  file: File,
  maxWidth = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, return empty string
    if (file.type && !file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }

      // If already a small SVG or tiny file, return immediately
      if (file.type === 'image/svg+xml' || file.size < 40000) {
        resolve(src);
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          const naturalW = img.naturalWidth || img.width;
          const naturalH = img.naturalHeight || img.height;

          if (!naturalW || !naturalH) {
            resolve(src);
            return;
          }

          let width = naturalW;
          let height = naturalH;

          // Scale down proportionally if larger than maxWidth
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Fill background with white to handle transparent PNGs
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Compress as JPEG
            const compressed = canvas.toDataURL('image/jpeg', quality);
            if (compressed && compressed.length > 100) {
              resolve(compressed);
              return;
            }
          }
          // Fallback to original src if canvas fails
          resolve(src);
        } catch (err) {
          console.warn('Canvas compression failed, falling back to original source:', err);
          resolve(src);
        }
      };

      img.onerror = (err) => {
        console.warn('Image loading for compression failed, using original src:', err);
        resolve(src);
      };

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
  maxWidth = 800,
  quality = 0.75
): Promise<string> {
  if (!src) return '';

  return new Promise((resolve) => {
    const img = new Image();
    // Do NOT set crossOrigin on data: URIs
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;

        if (!naturalW || !naturalH) {
          resolve(src);
          return;
        }

        let width = naturalW;
        let height = naturalH;

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
          const compressed = canvas.toDataURL('image/jpeg', quality);
          if (compressed && compressed.length > 100) {
            resolve(compressed);
            return;
          }
        }
        resolve(src);
      } catch {
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
  maxWidth = 800,
  quality = 0.75
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
