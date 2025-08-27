import React, { useState, useRef } from 'react';
import './LightXImageTransformer.css';

export default function LightXImageTransformer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [strength, setStrength] = useState(0.6);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const fileInputRef = useRef();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      // Clear previous results when new image is selected
      setFinalImageUrl(null);
      setOrderId(null);
      setStatus('');
      setStatusMessage('');
      setDebugInfo({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    if (!textPrompt.trim()) {
      setError('Please enter a text prompt');
      return;
    }

    // Clear previous results and start fresh
    setFinalImageUrl(null);
    setError('');
    setIsProcessing(true);
    setStatus('processing');
    setStatusMessage('Submitting image transformation request...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('text_prompt', textPrompt);
      formData.append('strength', strength);

             // Using existing backend URL
       const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/edit/lightx-submit`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'submitted') {
        setOrderId(data.orderId);
        setStatusMessage(`Job submitted! Order ID: ${data.orderId}`);
        
                 // Update debug info
         setDebugInfo({
           orderId: data.orderId,
           statusCheckUrl: data.statusCheckUrl || `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/edit/lightx-status?order_id=${data.orderId}`,
          submittedAt: new Date().toLocaleTimeString(),
          prompt: textPrompt,
          strength: strength
        });
        
        // Start polling for status
        pollStatus(data.orderId);
      } else {
        throw new Error(data.error || 'Failed to submit job');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit job');
      setStatus('error');
      setIsProcessing(false);
    }
  };

  const pollStatus = async (id) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
                 const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/edit/lightx-status?order_id=${id}`);
        const data = await response.json();
        
        // Update debug info with current status
        setDebugInfo(prev => ({
          ...prev,
          lastChecked: new Date().toLocaleTimeString(),
          currentStatus: data.body ? data.body.status : data.status,
          attempts: attempts + 1
        }));
        
        // Check if we have the final image URL from LightX API
        if (data.body && data.body.status === 'active' && data.body.output) {
          setStatus('completed');
          setStatusMessage('Image transformation completed!');
          setFinalImageUrl(data.body.output);
          setIsProcessing(false);
          
          // Update debug info with completion details
          setDebugInfo(prev => ({
            ...prev,
            completedAt: new Date().toLocaleTimeString(),
            finalImageUrl: data.body.output,
            totalAttempts: attempts + 1
          }));
          return;
        } else if (data.body && data.body.status === 'failed') {
          setStatus('error');
          setStatusMessage('Image transformation failed');
          setError('The transformation failed on the server');
          setIsProcessing(false);
          return;
        } else {
          const currentStatus = data.body ? data.body.status : data.status;
          setStatusMessage(`Processing... (${currentStatus})`);
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Poll every 5 seconds
        } else {
          setStatus('error');
          setStatusMessage('Transformation timed out');
          setError('The transformation took too long to complete');
          setIsProcessing(false);
        }
      } catch (err) {
        setError('Failed to check status');
        setStatus('error');
        setIsProcessing(false);
      }
    };

    checkStatus();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTextPrompt('');
    setStrength(0.6);
    setIsProcessing(false);
    setOrderId(null);
    setStatus('');
    setStatusMessage('');
    setFinalImageUrl(null);
    setError('');
    setDebugInfo({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadImage = () => {
    if (finalImageUrl) {
      const link = document.createElement('a');
      link.href = finalImageUrl;
      link.download = 'transformed-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="lightx-container">
      <div className="lightx-header">
        <h2>🚀 LightX AI Image Transformation</h2>
        <p>Transform your images using AI with text prompts</p>
      </div>

      {/* Debug Information Panel */}
      {Object.keys(debugInfo).length > 0 && (
        <div className="debug-panel">
          <h3>🔍 Debug Information</h3>
          <div className="debug-grid">
            {debugInfo.orderId && (
              <div className="debug-item">
                <strong>Order ID:</strong> {debugInfo.orderId}
              </div>
            )}
            {debugInfo.statusCheckUrl && (
              <div className="debug-item">
                <strong>Status URL:</strong> 
                <a href={debugInfo.statusCheckUrl} target="_blank" rel="noopener noreferrer">
                  {debugInfo.statusCheckUrl}
                </a>
              </div>
            )}
            {debugInfo.submittedAt && (
              <div className="debug-item">
                <strong>Submitted:</strong> {debugInfo.submittedAt}
              </div>
            )}
            {debugInfo.lastChecked && (
              <div className="debug-item">
                <strong>Last Checked:</strong> {debugInfo.lastChecked}
              </div>
            )}
            {debugInfo.currentStatus && (
              <div className="debug-item">
                <strong>Current Status:</strong> {debugInfo.currentStatus}
              </div>
            )}
            {debugInfo.attempts && (
              <div className="debug-item">
                <strong>Polling Attempts:</strong> {debugInfo.attempts}
              </div>
            )}
            {debugInfo.prompt && (
              <div className="debug-item">
                <strong>Prompt:</strong> {debugInfo.prompt}
              </div>
            )}
            {debugInfo.strength && (
              <div className="debug-item">
                <strong>Strength:</strong> {debugInfo.strength}
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="lightx-form">
        <div className="form-group">
          <label htmlFor="image">Select Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={isProcessing}
            className="file-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prompt">Transformation Prompt:</label>
          <textarea
            id="prompt"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder="e.g., Convert this into an Indian Goddess with 2 heads"
            rows="3"
            disabled={isProcessing}
            className="prompt-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="strength">Transformation Strength: {strength}</label>
          <input
            type="range"
            id="strength"
            min="0.0"
            max="1.0"
            step="0.1"
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
            disabled={isProcessing}
            className="strength-slider"
          />
        </div>

        {error && (
          <div className="status-indicator status-error">
            {error}
          </div>
        )}

        {status && (
          <div className={`status-indicator status-${status}`}>
            {statusMessage}
            {status === 'processing' && <span className="loading-spinner"></span>}
          </div>
        )}

        {/* Image Comparison Section */}
        <div className="image-comparison-section">
          <div className="image-container">
            <h3>📤 Input Image</h3>
            {selectedFile ? (
              <div className="image-wrapper">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Input"
                  className="comparison-image"
                />
              </div>
            ) : (
              <div className="image-placeholder">
                <p>No image selected</p>
              </div>
            )}
          </div>

          <div className="image-container">
            <h3>📥 Output Image</h3>
            {isProcessing ? (
              <div className="image-placeholder processing">
                <div className="loading-spinner large"></div>
                <p>Transforming...</p>
              </div>
            ) : finalImageUrl ? (
              <div className="image-wrapper">
                <img
                  src={finalImageUrl}
                  alt="Transformed"
                  className="comparison-image"
                />
                <div className="download-section">
                  <button type="button" className="download-btn" onClick={downloadImage}>
                    📥 Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="image-placeholder">
                <p>Transformed image will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          {!isProcessing ? (
            <button type="submit" className="submit-btn" disabled={!selectedFile || !textPrompt.trim()}>
              🚀 Transform Image
            </button>
          ) : (
            <button type="button" className="submit-btn processing" disabled>
              <span className="loading-spinner"></span>
              Processing...
            </button>
          )}
          
          {!isProcessing && (selectedFile || textPrompt || orderId) && (
            <button type="button" className="reset-btn" onClick={handleReset}>
              🔄 Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
