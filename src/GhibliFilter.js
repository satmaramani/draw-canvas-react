// GhibliFilter.js - Client-side fallback for Ghibli-style image filtering

/**
 * Detect edges in the image for the hand-drawn look
 * 
 * @param {Uint8ClampedArray} data - The original image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Uint8ClampedArray} - The edge data
 */
const detectEdges = (data, width, height) => {
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
      
      // Apply threshold for cleaner edges
      const edgeValue = magnitude > 30 ? 0 : 255; // Invert for white background, black edges
      
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

/**
 * Apply a watercolor-like softening effect
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyWatercolorEffect = (data, width, height) => {
  // Create a temporary copy for the blur operation
  const tempData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    tempData[i] = data[i];
  }
  
  // Apply a simple box blur twice for a stronger effect
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pos = (y * width + x) * 4;
        
        // For each color channel (except alpha)
        for (let c = 0; c < 3; c++) {
          // Sample 3x3 neighborhood
          let sum = 0;
          let count = 0;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const samplePos = ((y + dy) * width + (x + dx)) * 4;
              sum += tempData[samplePos + c];
              count++;
            }
          }
          
          // Set to average
          data[pos + c] = Math.round(sum / count);
        }
      }
    }
    
    // Update temp data for second pass
    if (pass === 0) {
      for (let i = 0; i < data.length; i++) {
        tempData[i] = data[i];
      }
    }
  }
};

/**
 * Apply Ghibli-style effects to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyGhibliEffects = (data, width, height) => {
  // Create a copy of the original data for edge detection
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Apply a watercolor-like softening effect
  applyWatercolorEffect(data, width, height);
  
  // Step 2: Enhance colors to match Ghibli palette
  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Enhance blues (for skies) and greens (for nature) - Ghibli's signature colors
    data[i] = Math.min(255, r * 1.05);     // Slight red enhancement
    data[i + 1] = Math.min(255, g * 1.15); // More green enhancement for lush landscapes
    data[i + 2] = Math.min(255, b * 1.2);  // Strong blue enhancement for vibrant skies
    
    // Lighten shadows slightly for the dreamy Ghibli look
    if (r < 60 && g < 60 && b < 60) {
      data[i] = Math.min(255, r + 15);
      data[i + 1] = Math.min(255, g + 15);
      data[i + 2] = Math.min(255, b + 15);
    }
    
    // Add a subtle warm tone to highlights for that golden Ghibli sunlight
    if (r > 200 && g > 200 && b > 200) {
      data[i] = Math.min(255, r + 5);
      data[i + 1] = Math.min(255, g + 2);
      // Leave blue as is for highlights
    }
  }
  
  // Step 3: Apply edge detection for the hand-drawn look
  const edgeData = detectEdges(originalData, width, height);
  
  // Step 4: Blend the edge data with the color-enhanced data
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 90% color data, 10% edge data
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.9 + edgeData[i + c] * 0.1);
    }
    // Keep original alpha
  }
};

/**
 * Apply a Ghibli-style filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyGhibliFilter = (imageFile) => {
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
          
          // Apply Ghibli-style effects
          applyGhibliEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply additional canvas filters for the Ghibli look
          ctx.filter = 'saturate(140%) contrast(110%) brightness(105%)';
          ctx.drawImage(canvas, 0, 0);
          
          // Reset the filter
          ctx.filter = 'none';
          
          // Apply a slight blur for the soft Ghibli look
          ctx.globalAlpha = 0.3;
          ctx.filter = 'blur(0.5px)';
          ctx.drawImage(canvas, 0, 0);
          
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