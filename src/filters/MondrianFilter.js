// MondrianFilter.js - Client-side fallback for Mondrian style image filtering

/**
 * Apply a Mondrian-style effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyMondrianEffects = (data, width, height) => {
  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Simplify the image to basic shapes and colors
  simplifyImage(data, width, height);
  
  // Step 2: Add Mondrian-style grid lines
  addMondrianGrid(data, width, height);
};

/**
 * Simplify the image to basic shapes and Mondrian colors
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const simplifyImage = (data, width, height) => {
  // Define Mondrian color palette
  const colors = [
    [255, 255, 255], // White
    [255, 0, 0],     // Red
    [255, 255, 0],   // Yellow
    [0, 0, 255],     // Blue
    [0, 0, 0]        // Black (for lines)
  ];
  
  // Create a simplified version of the image with larger blocks
  const blockSize = Math.max(10, Math.floor(Math.min(width, height) / 20));
  
  // Process the image in blocks
  for (let blockY = 0; blockY < height; blockY += blockSize) {
    for (let blockX = 0; blockX < width; blockX += blockSize) {
      // Determine dominant color in this block
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      
      // Calculate average color in this block
      for (let y = blockY; y < Math.min(blockY + blockSize, height); y++) {
        for (let x = blockX; x < Math.min(blockX + blockSize, width); x++) {
          const pos = (y * width + x) * 4;
          rSum += data[pos];
          gSum += data[pos + 1];
          bSum += data[pos + 2];
          count++;
        }
      }
      
      // Calculate average
      const rAvg = Math.round(rSum / count);
      const gAvg = Math.round(gSum / count);
      const bAvg = Math.round(bSum / count);
      
      // Find closest Mondrian color
      let closestColor = colors[0];
      let minDistance = Number.MAX_VALUE;
      
      for (const color of colors) {
        const distance = Math.sqrt(
          Math.pow(rAvg - color[0], 2) +
          Math.pow(gAvg - color[1], 2) +
          Math.pow(bAvg - color[2], 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color;
        }
      }
      
      // Apply the closest color to the entire block
      for (let y = blockY; y < Math.min(blockY + blockSize, height); y++) {
        for (let x = blockX; x < Math.min(blockX + blockSize, width); x++) {
          const pos = (y * width + x) * 4;
          data[pos] = closestColor[0];
          data[pos + 1] = closestColor[1];
          data[pos + 2] = closestColor[2];
          // Keep original alpha
        }
      }
    }
  }
};

/**
 * Add Mondrian-style grid lines to the image
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const addMondrianGrid = (data, width, height) => {
  // Define line properties
  const lineColor = [0, 0, 0]; // Black
  const lineThickness = Math.max(3, Math.floor(Math.min(width, height) / 100));
  
  // Create horizontal and vertical grid lines
  const numHLines = 5; // Number of horizontal lines
  const numVLines = 5; // Number of vertical lines
  
  // Create horizontal lines
  for (let i = 1; i < numHLines; i++) {
    const y = Math.floor(height * i / numHLines);
    
    // Draw a horizontal line
    for (let x = 0; x < width; x++) {
      for (let t = 0; t < lineThickness; t++) {
        const lineY = y + t - Math.floor(lineThickness / 2);
        if (lineY >= 0 && lineY < height) {
          const pos = (lineY * width + x) * 4;
          data[pos] = lineColor[0];
          data[pos + 1] = lineColor[1];
          data[pos + 2] = lineColor[2];
        }
      }
    }
  }
  
  // Create vertical lines
  for (let i = 1; i < numVLines; i++) {
    const x = Math.floor(width * i / numVLines);
    
    // Draw a vertical line
    for (let y = 0; y < height; y++) {
      for (let t = 0; t < lineThickness; t++) {
        const lineX = x + t - Math.floor(lineThickness / 2);
        if (lineX >= 0 && lineX < width) {
          const pos = (y * width + lineX) * 4;
          data[pos] = lineColor[0];
          data[pos + 1] = lineColor[1];
          data[pos + 2] = lineColor[2];
        }
      }
    }
  }
};

/**
 * Apply a Mondrian filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyMondrianFilter = (imageFile) => {
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
          
          // Apply Mondrian effects
          applyMondrianEffects(data, canvas.width, canvas.height);
          
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