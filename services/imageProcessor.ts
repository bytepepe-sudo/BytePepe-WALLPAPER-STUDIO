
import { ProcessingResult } from '../types';

/**
 * Processes a pixel-art image by sampling the top-right block and extending 
 * the background to create a high-quality phone wallpaper.
 */
export const processPixelArt = (
  imageSrc: string,
  targetWidth: number,
  targetHeight: number
): Promise<ProcessingResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) throw new Error("Could not initialize canvas context");

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Ensure crisp pixel rendering
        ctx.imageSmoothingEnabled = false;

        // 1. Analyze the source image for the background color (Top-Right 8x8 block)
        const sampleCanvas = document.createElement('canvas');
        const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
        if (!sampleCtx) throw new Error("Failed to sample image");

        sampleCanvas.width = img.width;
        sampleCanvas.height = img.height;
        sampleCtx.drawImage(img, 0, 0);

        // Get Top-Right 8x8 block (or smaller if image is tiny)
        const sampleSize = 8;
        const sampleX = Math.max(0, img.width - sampleSize);
        const sampleY = 0;
        
        const pixelData = sampleCtx.getImageData(sampleX, sampleY, 1, 1).data;
        const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

        // 2. Fill the entire target canvas with the sampled background color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 3. Calculate scale to fit width while preserving character size
        // Usually we want the NFT to occupy a significant portion of the screen width
        // while remaining crisp.
        const scale = Math.floor(targetWidth / img.width);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Horizontal centering of the scaled NFT at the bottom
        const xPos = (targetWidth - scaledWidth) / 2;
        const yPos = targetHeight - scaledHeight;

        // 4. Draw the original character at the bottom
        // Using drawImage with integer scaling to maintain pixel integrity
        ctx.drawImage(img, xPos, yPos, scaledWidth, scaledHeight);

        resolve({
          imageUrl: canvas.toDataURL('image/png'),
          originalWidth: img.width,
          originalHeight: img.height,
          sampledColor: color
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = imageSrc;
  });
};
