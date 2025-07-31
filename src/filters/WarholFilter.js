// WarholFilter.js - Client-side fallback for Classic Warhol style image filtering

/**
 * Apply a Classic Warhol effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyWarholEffects = (data, width, height) => {
  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Convert to high contrast
  applyHighContrast(data);
  
  // Step 2: Apply color palette shift based on quadrant
  applyWarholColorPalette(data, width, height);
};

/**
 * Apply high contrast to the image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 */
const applyHighContrast = (data) => {
  // Increase contrast significantly
  const factor = 2.5; // High contrast factor
  const midpoint = 128; // Midpoint for contrast adjustment
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply to each color channel
    for (let c = 0; c < 3; c++) {
      const value = data[i + c];
      // Apply contrast formula: newValue = (oldValue - midpoint) * factor + midpoint
      data[i + c] = Math.min(255, Math.max(0, Math.round((value - midpoint) * factor + midpoint)));
    }
  }
};

/**
 * Apply Warhol-style color palette shifts based on image quadrants
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyWarholColorPalette = (data, width, height) => {
  // Define color palettes for each quadrant (Warhol-inspired)
  const palettes = [
    { r: [255, 0, 0], g: [255, 255, 0], b: [0, 0, 255] },     // Red-Yellow-Blue
    { r: [0, 255, 255], g: [255, 0, 255], b: [255, 255, 0] },   // Cyan-Magenta-Yellow
    { r: [0, 255, 0], g: [255, 165, 0], b: [0, 0, 255] },       // Green-Orange-Blue
    { r: [255, 0, 255], g: [0, 255, 255], b: [255, 255, 0] }    // Magenta-Cyan-Yellow
  ];
  
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = (y * width + x) * 4;
      
      // Determine which quadrant this pixel belongs to
      const quadrant = (x < halfWidth ? 0 : 1) + (y < halfHeight ? 0 : 2);
      const palette = palettes[quadrant];
      
      // Get the grayscale value to determine which color to use
      const gray = Math.round(data[pos] * 0.299 + data[pos + 1] * 0.587 + data[pos + 2] * 0.114);
      
      // Apply color based on grayscale value
      if (gray < 85) { // Dark tones
        data[pos] = palette.r[0];
        data[pos + 1] = palette.r[1];
        data[pos + 2] = palette.r[2];
      } else if (gray < 170) { // Mid tones
        data[pos] = palette.g[0];
        data[pos + 1] = palette.g[1];
        data[pos + 2] = palette.g[2];
      } else { // Light tones
        data[pos] = palette.b[0];
        data[pos + 1] = palette.b[1];
        data[pos + 2] = palette.b[2];
      }
    }
  }
};

/**
 * Apply a Classic Warhol filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyWarholFilter = (imageFile) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a FileReader to read the image file
      const reader = new FileReader();
      
      reader.onload = (event) => {
        // Create an image element to load the file data
        const img = new Image();
        
        img.onload = () => {
          // Create a canvas element to manipulate the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the original image to the canvas
          ctx.drawImage(img, 0, 0);
          
          // Get the image data for manipulation
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Apply Warhol effects
          applyWarholEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Convert the canvas to a data URL and resolve the promise
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Set the image source to the file data
        img.src = event.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      // Read the image file as a data URL
      reader.readAsDataURL(imageFile);
    } catch (error) {
      reject(error);
    }
  });
};