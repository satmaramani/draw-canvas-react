// ColorOnWallFilter.js - Client-side fallback for Color on Wall style image filtering

/**
 * Apply a Color on Wall effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyColorOnWallEffects = (data, width, height) => {
  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Apply texture effect to simulate wall
  applyWallTexture(data, width, height);
  
  // Step 2: Enhance colors for vibrant wall art look
  enhanceColors(data);
  
  // Step 3: Add a subtle graffiti-like edge effect
  const edgeData = detectGraffitiEdges(originalData, width, height);
  
  // Step 4: Blend the edge data with the textured color data
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 90% color data, 10% edge data
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.9 + edgeData[i + c] * 0.1);
    }
    // Keep original alpha
  }
};

/**
 * Apply wall texture effect to the image
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyWallTexture = (data, width, height) => {
  // Create a noise pattern for the wall texture
  const noiseIntensity = 15; // Adjust for more/less texture
  
  for (let i = 0; i < data.length; i += 4) {
    // Generate random noise
    const noise = (Math.random() - 0.5) * noiseIntensity;
    
    // Apply noise to each channel
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.min(255, Math.max(0, data[i + c] + noise));
    }
  }
  
  // Apply a subtle blur to simulate wall surface
  const tempData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    tempData[i] = data[i];
  }
  
  // Simple box blur
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = (y * width + x) * 4;
      
      // For each color channel (except alpha)
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        
        // Sample 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const samplePos = ((y + dy) * width + (x + dx)) * 4;
            sum += tempData[samplePos + c];
            count++;
          }
        }
        
        // Apply subtle blur (70% original, 30% blur)
        data[pos + c] = Math.round(tempData[pos + c] * 0.7 + (sum / count) * 0.3);
      }
    }
  }
};

/**
 * Enhance colors for a vibrant wall art look
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 */
const enhanceColors = (data) => {
  // Increase saturation and contrast
  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Increase saturation
    const saturationFactor = 1.4; // Adjust for more/less saturation
    data[i] = Math.min(255, Math.max(0, luminance + saturationFactor * (r - luminance)));
    data[i + 1] = Math.min(255, Math.max(0, luminance + saturationFactor * (g - luminance)));
    data[i + 2] = Math.min(255, Math.max(0, luminance + saturationFactor * (b - luminance)));
    
    // Increase contrast
    const contrastFactor = 1.2; // Adjust for more/less contrast
    const midpoint = 128;
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.min(255, Math.max(0, 
        midpoint + contrastFactor * (data[i + c] - midpoint)
      ));
    }
  }
};

/**
 * Detect edges for a graffiti-like effect
 * 
 * @param {Uint8ClampedArray} data - The original image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Uint8ClampedArray} - The edge data
 */
const detectGraffitiEdges = (data, width, height) => {
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
      
      // Apply threshold for graffiti-like edges
      const edgeValue = magnitude > 40 ? 0 : 255; // Invert for white background, black edges
      
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
 * Apply a Color on Wall filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyColorOnWallFilter = (imageFile) => {
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
          
          // Apply Color on Wall effects
          applyColorOnWallEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply additional canvas filters for the wall art look
          ctx.filter = 'saturate(130%) contrast(120%)';
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