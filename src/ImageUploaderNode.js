import React, { useState } from 'react';
import axios from 'axios';

const RemoveBackgroundApp = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removedUrl, setRemovedUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOriginalImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemovedUrl(null);
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    const formData = new FormData();
    formData.append('image', originalImage);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/remove-background', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const blobUrl = URL.createObjectURL(response.data);
      setRemovedUrl(blobUrl);
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Background removal failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>High Quality Background Remover</h2>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {previewUrl && (
        <div style={{ marginTop: '20px' }}>
          <h4>Original Image:</h4>
          <img src={previewUrl} alt="Original" style={{ maxWidth: '300px' }} />
        </div>
      )}

      <button
        onClick={handleRemoveBackground}
        disabled={!originalImage || loading}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : 'Remove Background'}
      </button>

      {removedUrl && (
        <div style={{ marginTop: '30px' }}>
          <h4>Background Removed:</h4>
          <img src={removedUrl} alt="Removed" style={{ maxWidth: '300px', background: 'white' }} />
          <div style={{ marginTop: '10px' }}>
            <a href={removedUrl} download="no-background.png">
              <button>Download Image</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveBackgroundApp;
