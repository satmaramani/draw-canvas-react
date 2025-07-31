import React, { useState } from 'react';
import axios from 'axios';
import './AnimePortraitConverter.css';
import { applyAnimePortraitFilter } from './AnimePortraitFilter';

const AnimePortraitConverter = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API endpoint - update this to your actual backend URL
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
      // First try to use the backend API
      try {
        const formData = new FormData();
        formData.append('file', originalImage.file);

        console.log('Using API URL:', API_URL);
        
        const response = await axios.post(`${API_URL}/filter/anime-portrait`, formData, {
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
        
      } catch (apiError) {
        console.log('API call failed, falling back to client-side processing:', apiError);
        
        // Fallback to client-side processing
        console.log('Using client-side filter fallback');
        const dataUrl = await applyAnimePortraitFilter(originalImage.file);
        setConvertedImage(dataUrl);
      }
    } catch (err) {
      console.error('Conversion failed:', err);
      
      let errorMessage = 'Failed to convert image. ';
      
      if (err.response) {
        errorMessage += `Server error: ${err.response.status}. `;
      } else if (err.request) {
        errorMessage += 'No response from server. Check your internet connection. ';
      } else {
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
    
    // Determine file extension based on the image format
    // If it's a data URL (client-side processing), use .png
    // If it's an object URL (API response), use .png as well since the API returns a blob
    link.download = 'anime-portrait.png';
    
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
      <div className="anime-header">
        <h1 className="upload-title">Anime Portrait Converter</h1>
        <p className="upload-subtitle">Transform your photos into anime-style portraits</p>
      </div>

      {!originalImage ? (
        <>
          <div className="empty-box-section">
            <img
              src="/box image mosida.png"
              alt="Empty box"
              className="empty-box-img"
            />
            <p className="empty-text">Upload a portrait photo to convert</p>
          </div>
          <button className="upload-btn" onClick={() => document.getElementById('fileInput').click()}>
            ⬆ Upload image
          </button>
        </>
      ) : (
        <div className="anime-converter-container">
          <div className="image-comparison">
            <div className="image-box">
              <h3>Original Photo</h3>
              <img src={originalImage.url} alt="Original" className="preview-image" />
            </div>
            
            {convertedImage && (
              <div className="image-box anime-result">
                <h3>Anime Portrait</h3>
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
                ) : 'Create Anime Portrait'}
              </button>
            ) : (
              <>
                <button className="upload-done-btn" onClick={handleDownload}>
                  Download Portrait
                </button>
                <button className="upload-btn" onClick={handleReset}>
                  Convert Another Photo
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

export default AnimePortraitConverter;