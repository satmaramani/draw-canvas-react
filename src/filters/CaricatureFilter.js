// CaricatureFilter.js - Client-side fallback for Caricature-style image filtering

/**
 * Apply a caricature effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyCaricatureEffects = (data, width, height) => {
  // Create a copy of the original data for edge detection
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Apply edge enhancement
  const edgeData = detectEdges(originalData, width, height);
  
  // Step 2: Apply color exaggeration
  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Exaggerate colors
    data[i] = Math.min(255, r * 1.2);     // Boost red
    data[i + 1] = Math.min(255, g * 1.1); // Boost green slightly less
    data[i + 2] = Math.min(255, b * 1.3); // Boost blue more
    
    // Increase contrast
    for (let c = 0; c < 3; c++) {
      const value = data[i + c];
      data[i + c] = value > 128 ? Math.min(255, value + 20) : Math.max(0, value - 20);
    }
  }
  
  // Step 3: Blend the edge data with the color-enhanced data
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 75% color data, 25% edge data for stronger lines
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.75 + edgeData[i + c] * 0.25);
    }
    // Keep original alpha
  }
};

/**
 * Detect edges in the image for the caricature look
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
      
      // Apply threshold for cleaner edges - use a lower threshold for caricature
      const edgeValue = magnitude > 25 ? 0 : 255; // Invert for white background, black edges
      
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
 * Apply a caricature filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyCaricatureFilter = (imageFile) => {
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
          
          // Apply caricature effects
          applyCaricatureEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply additional canvas filters for the caricature look
          ctx.filter = 'saturate(150%) contrast(130%) brightness(110%)';
          ctx.drawImage(canvas, 0, 0);
          
          // Reset the filter
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