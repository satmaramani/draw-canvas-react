import React, { useState } from 'react';
import axios from 'axios';
import { applyCaricatureFilter } from './filters/CaricatureFilter';
import './GhibliImageConverter.css'; // Reuse the existing CSS

const CaricatureConverter = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API endpoint - update this to your actual backend URL
  // Try multiple fallback URLs to ensure connectivity
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://mosida-node-backend-production.up.railway.app' || 'http://localhost:8000';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError('');
    setConvertedImage(null);
    
    // Create preview URL for the original image
    setOriginalImage({
      file,
      url: URL.createObjectURL(file),
    });
  };

  const handleConvertImage = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', originalImage.file);

      // Log the API URL being used
      console.log('Using API URL:', API_URL);
      
      try {
        // First try the server-side conversion
        const response = await axios.post(`${API_URL}/filter/caricature`, formData, {
          responseType: 'blob',
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Check if we received a valid image response
        if (response.data.size === 0) {
          throw new Error('Received empty response from server');
        }

        // Create URL for the converted image
        const url = URL.createObjectURL(response.data);
        setConvertedImage(url);
        console.log('Server-side conversion successful');
      } catch (serverError) {
        console.warn('Server-side conversion failed, falling back to client-side:', serverError);
        
        // Fall back to client-side processing
        console.log('Attempting client-side fallback processing...');
        const dataUrl = await applyCaricatureFilter(originalImage.file);
        setConvertedImage(dataUrl);
        console.log('Client-side conversion successful');
      }
    } catch (err) {
      console.error('All conversion methods failed:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to convert image. ';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server error: ${err.response.status}. `;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Check your internet connection. ';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += `Error: ${err.message}. `;
      }
      
      errorMessage += 'Please try again or use a different image.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedImage) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = 'caricature.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setConvertedImage(null);
    setError('');
  };

  return (
    <div className="upload-container">
      <div className="ghibli-header">
        <h1 className="upload-title">Caricature Image Converter</h1>
        <p className="upload-subtitle">Transform your photos into caricature artwork</p>
      </div>

      {!originalImage ? (
        <>
          <div className="empty-box-section">
            <img
              src="/box image mosida.png"
              alt="Empty box"
              className="empty-box-img"
            />
            <p className="empty-text">Upload an image to convert</p>
          </div>
          <button className="upload-btn" onClick={() => document.getElementById('fileInput').click()}>
            ⬆ Upload image
          </button>
        </>
      ) : (
        <div className="ghibli-converter-container">
          <div className="image-comparison">
            <div className="image-box">
              <h3>Original Image</h3>
              <img src={originalImage.url} alt="Original" className="preview-image" />
            </div>
            
            {convertedImage && (
              <div className="image-box">
                <h3>Caricature Style</h3>
                <img src={convertedImage} alt="Converted" className="preview-image" />
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="action-buttons">
            {!convertedImage ? (
              <button 
                className="upload-done-btn" 
                onClick={handleConvertImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-indicator"></span>
                    Converting...
                  </>
                ) : 'Convert to Caricature'}
              </button>
            ) : (
              <>
                <button className="upload-done-btn" onClick={handleDownload}>
                  Download Image
                </button>
                <button className="upload-btn" onClick={handleReset}>
                  Convert Another Image
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />


    </div>
  );
};

export default CaricatureConverter;