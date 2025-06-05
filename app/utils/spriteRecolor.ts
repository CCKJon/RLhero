import { useEffect, useRef, useState } from 'react';

// Define the color mapping interface
interface ColorMapping {
  original: string;
  replacement: string;
}

// Define the sprite recolor options
interface SpriteRecolorOptions {
  colorMappings: ColorMapping[];
  tolerance?: number;
}

/**
 * Utility function to recolor a sprite image using HTML5 Canvas
 * @param imageUrl - URL of the sprite image to recolor
 * @param options - Recoloring options including color mappings
 * @returns Promise that resolves to a data URL of the recolored image
 */
export async function recolorSprite(
  imageUrl: string,
  options: SpriteRecolorOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip transparent pixels
        if (a === 0) continue;
        
        // Convert current pixel to hex
        const currentColor = rgbToHex(r, g, b);
        
        // Find matching color mapping
        const mapping = options.colorMappings.find(m => 
          colorMatches(currentColor, m.original, options.tolerance || 0)
        );
        
        if (mapping) {
          // Convert replacement color to RGB
          const [newR, newG, newB] = hexToRgb(mapping.replacement);
          data[i] = newR;
          data[i + 1] = newG;
          data[i + 2] = newB;
        }
      }
      
      // Put modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

/**
 * Check if two colors match within a tolerance
 */
function colorMatches(color1: string, color2: string, tolerance: number): boolean {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  return Math.abs(r1 - r2) <= tolerance &&
         Math.abs(g1 - g2) <= tolerance &&
         Math.abs(b1 - b2) <= tolerance;
}

/**
 * React hook for sprite recoloring
 */
export function useSpriteRecolor(
  imageUrl: string,
  options: SpriteRecolorOptions
): string | null {
  const [recoloredImage, setRecoloredImage] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    recolorSprite(imageUrl, options)
      .then(dataUrl => {
        if (isMounted) {
          setRecoloredImage(dataUrl);
        }
      })
      .catch(error => {
        console.error('Failed to recolor sprite:', error);
      });
      
    return () => {
      isMounted = false;
    };
  }, [imageUrl, JSON.stringify(options)]);
  
  return recoloredImage;
} 