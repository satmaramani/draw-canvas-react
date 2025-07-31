// WynwoodFilter.js - Client-side fallback for Wynwood Cartoon Walking style image filtering

/**
 * Apply a Wynwood Cartoon Walking effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyWynwoodEffects = (data, width, height) => {
  // Create a copy of the original data for edge detection
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Apply cartoon-like color quantization
  applyColorQuantization(data);
  
  // Step 2: Apply edge detection for the cartoon outline
  const edgeData = detectCartoonEdges(originalData, width, height);
  
  // Step 3: Blend the edge data with the color-enhanced data
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 80% color data, 20% edge data
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.8 + edgeData[i + c] * 0.2);
    }
    // Keep original alpha
  }
};

/**
 * Apply color quantization to create a cartoon-like effect
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 */
const applyColorQuantization = (data) => {
  // Define the number of color levels for quantization
  const levels = 5;
  const levelStep = 255 / levels;
  
  for (let i = 0; i < data.length; i += 4) {
    // Quantize each color channel
    for (let c = 0; c < 3; c++) {
      const value = data[i + c];
      // Quantize to nearest level
      data[i + c] = Math.round(Math.round(value / levelStep) * levelStep);
    }
    
    // Boost saturation for vibrant Wynwood colors
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Boost saturation by pushing colors away from gray
    const saturationFactor = 1.5; // Increase for more vibrant colors
    
    data[i] = Math.min(255, Math.max(0, luminance + saturationFactor * (r - luminance)));
    data[i + 1] = Math.min(255, Math.max(0, luminance + saturationFactor * (g - luminance)));
    data[i + 2] = Math.min(255, Math.max(0, luminance + saturationFactor * (b - luminance)));
  }
};

/**
 * Detect edges in the image for the cartoon outline
 * 
 * @param {Uint8ClampedArray} data - The original image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Uint8ClampedArray} - The edge data
 */
const detectCartoonEdges = (data, width, height) => {
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
      
      // Apply threshold for bold cartoon edges
      const edgeValue = magnitude > 35 ? 0 : 255; // Invert for white background, black edges
      
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
 * Apply a Wynwood Cartoon Walking filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyWynwoodFilter = (imageFile) => {
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
          
          // Apply Wynwood cartoon effects
          applyWynwoodEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply additional canvas filters for the vibrant Wynwood look
          ctx.filter = 'saturate(180%) contrast(120%) brightness(110%)';
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