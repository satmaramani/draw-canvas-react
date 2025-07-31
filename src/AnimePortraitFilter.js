// AnimePortraitFilter.js - Client-side fallback for anime portrait filtering

/**
 * Apply an anime portrait filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyAnimePortraitFilter = (imageFile) => {
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
          
          // Apply anime portrait effects
          applyAnimeEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply additional canvas filters for the anime look - enhanced to match example
          ctx.filter = 'saturate(150%) contrast(130%) brightness(115%)';
          ctx.drawImage(canvas, 0, 0);
          
          // Reset the filter
          ctx.filter = 'none';
          
          // Apply a slight blur for the soft anime look
          ctx.globalAlpha = 0.3;
          ctx.filter = 'blur(0.5px)';
          ctx.drawImage(canvas, 0, 0);
          
          // Add a subtle warm tone overlay for that anime feel
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = '#ff9e7d';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Reset for final drawing
          ctx.globalAlpha = 1.0;
          ctx.filter = 'none';
          
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

/**
 * Apply anime-style effects to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyAnimeEffects = (data, width, height) => {
  // Create a copy of the original data for edge detection
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Apply bilateral filter for skin smoothing while preserving edges
  applyBilateralFilter(data, width, height);
  
  // Step 2: Enhance colors for anime look
  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Enhance colors for anime style
    // Boost saturation for vibrant anime colors
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const satBoost = 1.5; // Increased saturation boost factor
    
    if (max > 0 && delta > 0) {
      const satMult = (satBoost * delta) / max;
      data[i] = Math.min(255, r + (r - min) * satMult);
      data[i + 1] = Math.min(255, g + (g - min) * satMult);
      data[i + 2] = Math.min(255, b + (b - min) * satMult);
    }
    
    // Enhance skin tones for anime characters
    // Check if pixel is in skin tone range (simplified)
    if (r > 150 && g > 100 && b > 80 && r > g && g > b) {
      // Lighten and warm up skin tones
      data[i] = Math.min(255, r * 1.15);    // More red for warmer skin
      data[i + 1] = Math.min(255, g * 1.08); // Slightly more green
      data[i + 2] = Math.min(255, b * 0.9);  // Less blue for anime look
    }
    
    // Enhance blues for vibrant skies and water (common in anime)
    if (b > r && b > g) {
      data[i + 2] = Math.min(255, b * 1.2); // Boost blues
    }
    
    // Enhance greens for vibrant foliage (common in anime)
    if (g > r && g > b) {
      data[i + 1] = Math.min(255, g * 1.15); // Boost greens
    }
  }
  
  // Step 3: Apply edge detection for the anime line art
  const edgeData = detectAnimeEdges(originalData, width, height);
  
  // Step 4: Blend the edge data with the color-enhanced data
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 80% color data, 20% edge data for stronger anime-style lines
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.8 + edgeData[i + c] * 0.2);
    }
    // Keep original alpha
  }
};

/**
 * Apply a bilateral filter for skin smoothing while preserving edges
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyBilateralFilter = (data, width, height) => {
  // Create a temporary copy for the filter operation
  const tempData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    tempData[i] = data[i];
  }
  
  const radius = 2;
  const sigmaSpace = 2.0;
  const sigmaColor = 30.0;
  
  // Apply bilateral filter
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const pos = (y * width + x) * 4;
      
      // For each color channel (except alpha)
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let totalWeight = 0;
        const centerValue = tempData[pos + c];
        
        // Sample neighborhood
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const samplePos = ((y + dy) * width + (x + dx)) * 4;
            const sampleValue = tempData[samplePos + c];
            
            // Calculate spatial weight (based on distance)
            const spatialDist = dx * dx + dy * dy;
            const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));
            
            // Calculate color weight (based on color difference)
            const colorDist = (centerValue - sampleValue) * (centerValue - sampleValue);
            const colorWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));
            
            // Combined weight
            const weight = spatialWeight * colorWeight;
            
            sum += sampleValue * weight;
            totalWeight += weight;
          }
        }
        
        // Set to weighted average
        data[pos + c] = Math.round(sum / totalWeight);
      }
    }
  }
};

/**
 * Detect edges for anime-style line art
 * 
 * @param {Uint8ClampedArray} data - The original image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Uint8ClampedArray} - The edge data
 */
const detectAnimeEdges = (data, width, height) => {
  // Create a new array for the edge data
  const edgeData = new Uint8ClampedArray(data.length);
  
  // First convert to grayscale for edge detection
  const grayscale = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = (y * width + x) * 4;
      // Standard grayscale conversion
      grayscale[y * width + x] = Math.round(
        data[pos] * 0.299 + data[pos + 1] * 0.587 + data[pos + 2] * 0.114
      );
    }
  }
  
  // Apply Sobel operator for edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Sobel kernels
      const gx = (
        -1 * grayscale[(y - 1) * width + (x - 1)] +
        -2 * grayscale[y * width + (x - 1)] +
        -1 * grayscale[(y + 1) * width + (x - 1)] +
        1 * grayscale[(y - 1) * width + (x + 1)] +
        2 * grayscale[y * width + (x + 1)] +
        1 * grayscale[(y + 1) * width + (x + 1)]
      );
      
      const gy = (
        -1 * grayscale[(y - 1) * width + (x - 1)] +
        -2 * grayscale[(y - 1) * width + x] +
        -1 * grayscale[(y - 1) * width + (x + 1)] +
        1 * grayscale[(y + 1) * width + (x - 1)] +
        2 * grayscale[(y + 1) * width + x] +
        1 * grayscale[(y + 1) * width + (x + 1)]
      );
      
      // Calculate edge magnitude
      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      
      // Apply adaptive threshold for cleaner edges - creates more defined anime-style lines
      // Use a lower threshold for stronger edges (like face contours) and higher for subtle details
      let threshold = 40;
      if (magnitude > 80) {
        threshold = 30; // Stronger lines for high-contrast edges
      }
      const edgeValue = magnitude > threshold ? 0 : 255; // Invert for white background, black edges
      
      // Set edge value to all channels
      const pos = (y * width + x) * 4;
      edgeData[pos] = edgeValue;
      edgeData[pos + 1] = edgeValue;
      edgeData[pos + 2] = edgeValue;
      edgeData[pos + 3] = data[pos + 3]; // Keep original alpha
    }
  }
  
  return edgeData;
};