// PencilSketchFilter.js - Client-side fallback for Pencil Sketch style image filtering

/**
 * Apply a Pencil Sketch effect to image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyPencilSketchEffects = (data, width, height) => {
  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    originalData[i] = data[i];
  }
  
  // Step 1: Convert to grayscale
  convertToGrayscale(data);
  
  // Step 2: Invert the grayscale image
  const invertedData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    invertedData[i] = 255 - data[i];
    invertedData[i + 1] = 255 - data[i + 1];
    invertedData[i + 2] = 255 - data[i + 2];
    invertedData[i + 3] = data[i + 3]; // Keep original alpha
  }
  
  // Step 3: Apply Gaussian blur to the inverted image
  const blurredData = new Uint8ClampedArray(invertedData.length);
  applyGaussianBlur(invertedData, blurredData, width, height);
  
  // Step 4: Blend the grayscale image with the blurred inverted image using color dodge
  for (let i = 0; i < data.length; i += 4) {
    // Apply color dodge blend mode: result = base / (255 - blend)
    for (let c = 0; c < 3; c++) {
      const base = data[i + c];
      const blend = blurredData[i + c];
      
      // Avoid division by zero
      const divisor = 255 - blend;
      data[i + c] = divisor === 0 ? 255 : Math.min(255, (base * 255) / divisor);
    }
  }
  
  // Step 5: Enhance the sketch effect with edge detection
  const edgeData = detectPencilEdges(originalData, width, height);
  
  // Step 6: Blend the edge data with the sketch data - INCREASED EDGE WEIGHT
  for (let i = 0; i < data.length; i += 4) {
    // Blend with 60% sketch data, 40% edge data (increased from 70%/30%)
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(data[i + c] * 0.6 + edgeData[i + c] * 0.4);
    }
    // Keep original alpha
  }
  
  // Step 7: Apply additional contrast enhancement
  enhanceContrast(data);
  
  // Step 8: Darken the overall image for better visibility
  darkenImage(data);
};

/**
 * Convert image data to grayscale
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 */
const convertToGrayscale = (data) => {
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(
      data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    );
    
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    // Keep original alpha
  }
};

/**
 * Enhance contrast of the image data
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 */
const enhanceContrast = (data) => {
  // Find min and max values for contrast stretching
  let min = 255;
  let max = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    if (gray < min) min = gray;
    if (gray > max) max = gray;
  }
  
  // Apply contrast stretching
  const range = max - min;
  if (range > 0) {
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round(((data[i + c] - min) / range) * 255);
      }
    }
  }
  
  // Apply additional contrast boost
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const pixel = data[i + c];
      // Apply sigmoid-like contrast enhancement
      const normalized = pixel / 255;
      const enhanced = Math.pow(normalized, 0.7) * 255;
      data[i + c] = Math.round(enhanced);
    }
  }
};

/**
 * Darken the image for better pencil sketch visibility
 * 
 * @param {Uint8ClampedArray} data - The image data to modify
 */
const darkenImage = (data) => {
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      // Darken by 20% for better visibility
      data[i + c] = Math.round(data[i + c] * 0.8);
    }
  }
};

/**
 * Apply Gaussian blur to image data
 * 
 * @param {Uint8ClampedArray} srcData - The source image data
 * @param {Uint8ClampedArray} dstData - The destination image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 */
const applyGaussianBlur = (srcData, dstData, width, height) => {
  // Copy source data to destination initially
  for (let i = 0; i < srcData.length; i++) {
    dstData[i] = srcData[i];
  }
  
  // Define Gaussian kernel (3x3)
  const kernel = [
    1/16, 2/16, 1/16,
    2/16, 4/16, 2/16,
    1/16, 2/16, 1/16
  ];
  
  // Apply horizontal blur
  const tempData = new Uint8ClampedArray(srcData.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = (y * width + x) * 4;
      
      // For each color channel (except alpha)
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let kernelIndex = 0;
        
        // Apply kernel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const samplePos = ((y + ky) * width + (x + kx)) * 4;
            sum += srcData[samplePos + c] * kernel[kernelIndex++];
          }
        }
        
        tempData[pos + c] = Math.round(sum);
      }
      
      tempData[pos + 3] = srcData[pos + 3]; // Keep original alpha
    }
  }
  
  // Copy result back to destination
  for (let i = 0; i < tempData.length; i++) {
    dstData[i] = tempData[i];
  }
};

/**
 * Detect edges for pencil sketch effect
 * 
 * @param {Uint8ClampedArray} data - The original image data
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Uint8ClampedArray} - The edge data
 */
const detectPencilEdges = (data, width, height) => {
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
      
      // For pencil sketch, we want darker edges on lighter background
      const edgeValue = 255 - magnitude;
      
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
 * Apply a Pencil Sketch filter to an image using HTML5 Canvas
 * This is a fallback method when the backend API is not available
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - A promise that resolves to a data URL of the processed image
 */
export const applyPencilSketchFilter = (imageFile) => {
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
          
          // Apply Pencil Sketch effects
          applyPencilSketchEffects(data, canvas.width, canvas.height);
          
          // Put the modified image data back on the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply additional canvas filters for the pencil sketch look - ENHANCED FOR VISIBILITY
          ctx.filter = 'contrast(150%) brightness(90%) saturate(0%)';
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