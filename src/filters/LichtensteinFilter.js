// LichtensteinFilter.js - Client-side fallback for Lichtenstein Pop Art style image filtering

/**
 * Apply a Lichtenstein Pop Art effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyLichtensteinEffects = (data, width, height) => {
  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Apply halftone dot pattern
  applyHalftoneDots(data, width, height);
  
  // Step 2: Apply bold outlines
  const edgeData = detectBoldEdges(originalData, width, height);
  
  // Step 3: Apply pop art color palette
  applyPopArtColors(data, width, height);
  
  // Step 4: Blend the edge data with the color data
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 80% color data, 20% edge data for bold outlines
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.8 + edgeData[i + c] * 0.2);
    }
    // Keep original alpha
  }
};

/**
 * Apply halftone dot pattern to the image
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyHalftoneDots = (data, width, height) => {
  // Define dot pattern properties
  const dotSize = Math.max(4, Math.floor(Math.min(width, height) / 100));
  const dotSpacing = dotSize * 2;
  
  // Create a temporary copy of the data
  const tempData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    tempData[i] = data[i];
  }
  
  // Apply dot pattern
  for (let y = 0; y < height; y += dotSpacing) {
    for (let x = 0; x < width; x += dotSpacing) {
      // Calculate average color in this dot area
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      
      for (let dy = 0; dy < dotSpacing && y + dy < height; dy++) {
        for (let dx = 0; dx < dotSpacing && x + dx < width; dx++) {
          const pos = ((y + dy) * width + (x + dx)) * 4;
          rSum += tempData[pos];
          gSum += tempData[pos + 1];
          bSum += tempData[pos + 2];
          count++;
        }
      }
      
      const rAvg = Math.round(rSum / count);
      const gAvg = Math.round(gSum / count);
      const bAvg = Math.round(bSum / count);
      const brightness = Math.round(0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg);
      
      // Calculate dot radius based on brightness (darker areas have larger dots)
      const dotRadius = Math.max(1, Math.round(dotSize * (255 - brightness) / 255));
      
      // Fill the area with background color (white)
      for (let dy = 0; dy < dotSpacing && y + dy < height; dy++) {
        for (let dx = 0; dx < dotSpacing && x + dx < width; dx++) {
          const pos = ((y + dy) * width + (x + dx)) * 4;
          data[pos] = 255;     // R
          data[pos + 1] = 255; // G
          data[pos + 2] = 255; // B
          // Keep original alpha
        }
      }
      
      // Draw the dot
      for (let dy = -dotRadius; dy <= dotRadius; dy++) {
        for (let dx = -dotRadius; dx <= dotRadius; dx++) {
          // Check if the point is within the dot (circle)
          if (dx * dx + dy * dy <= dotRadius * dotRadius) {
            const px = x + dotSpacing / 2 + dx;
            const py = y + dotSpacing / 2 + dy;
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const pos = (py * width + px) * 4;
              data[pos] = rAvg;
              data[pos + 1] = gAvg;
              data[pos + 2] = bAvg;
              // Keep original alpha
            }
          }
        }
      }
    }
  }
};

/**
 * Detect bold edges for the comic book outline
 * 
 * @param {Uint8ClampedArray} data - The original image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Uint8ClampedArray} - The edge data
 */
const detectBoldEdges = (data, width, height) => {
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
      
      // Apply threshold for bold comic book edges
      const edgeValue = magnitude > 50 ? 0 : 255; // Invert for white background, black edges
      
      // Set edge value to all channels
      const pos = (y * width + x) * 4;
      edgeData[pos] = edgeValue;
      edgeData[pos + 1] = edgeValue;
      edgeData[pos + 2] = edgeValue;
      edgeData[pos + 3] = data[pos + 3]; // Keep original alpha
    }
  }
  
  // Thicken the edges
  const thickenedEdgeData = new Uint8ClampedArray(edgeData.length);
  for (let i = 0; i < edgeData.length; i++) {
    thickenedEdgeData[i] = edgeData[i];
  }
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = (y * width + x) * 4;
      
      // If any neighboring pixel is an edge, make this pixel an edge too
      if (edgeData[pos] === 0) { // If this is already an edge pixel
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const npos = ((y + dy) * width + (x + dx)) * 4;
            thickenedEdgeData[npos] = 0;
            thickenedEdgeData[npos + 1] = 0;
            thickenedEdgeData[npos + 2] = 0;
          }
        }
      }
    }
  }
  
  return thickenedEdgeData;
};

/**
 * Apply pop art color palette to the image
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyPopArtColors = (data, width, height) => {
  // Define pop art color palette
  const colors = [
    [255, 255, 0],   // Yellow
    [255, 0, 0],     // Red
    [0, 0, 255],     // Blue
    [0, 255, 255]    // Cyan
  ];
  
  for (let i = 0; i < data.length; i += 4) {
    // Skip white pixels (from halftone background)
    if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
      continue;
    }
    
    // Get the grayscale value
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    
    // Map grayscale to color palette
    const colorIndex = Math.floor(gray / 64); // 256 / 4 = 64 (4 colors)
    const color = colors[Math.min(colorIndex, colors.length - 1)];
    
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
  }
};

/**
 * Apply a Lichtenstein Pop Art filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyLichtensteinFilter = (imageFile) => {
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
          
          // Apply Lichtenstein Pop Art effects
          applyLichtensteinEffects(data, canvas.width, canvas.height);
          
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