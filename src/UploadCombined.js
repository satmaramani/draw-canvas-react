import React, { useState } from 'react';
import './UploadStep2.css';
import axios from 'axios';

const allowedImagesCount = 1;
const UploadCombined = () => {
  const [images, setImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, allowedImagesCount - images.length);
    const previews = newImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...previews]);
  };

  const handleAddMoreClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleUploadToS3 = async () => {
    const sessionId = 'user-session'; // You can replace this with dynamic session ID logic
    setUploading(true);

    try {
      const uploaded = [];
      for (const img of images) {
        const formData = new FormData();
        formData.append('file', img.file);
        formData.append('sessionId', sessionId);

        const response = await axios.post('http://localhost:5000/upload', formData);
        uploaded.push(response.data.imageUrl);
      }

      setUploadedUrls(uploaded);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check the console for more info.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1 className="upload-title">TechySam</h1>
      <p className="upload-subtitle">Please upload Image</p>

      {images.length === 0 ? (
        <>
          <div className="empty-box-section">
            <img
              src="/box image mosida.png"
              alt="Empty box"
              className="empty-box-img"
            />
            <p className="empty-text">Nothing to show</p>
          </div>
          <button className="upload-btn" onClick={handleAddMoreClick}>
            ⬆ Upload image
          </button>
        </>
      ) : (
        <>
          <div className="upload-grid">
            {images.map((img, idx) => (
              <img key={idx} src={img.url} alt={`Preview ${idx}`} className="upload-image" />
            ))}
            {images.length < allowedImagesCount && (
              <div className="upload-add" onClick={handleAddMoreClick}>
                <div className="plus-icon">+</div>
                <div className="add-label">Add more</div>
              </div>
            )}
          </div>
          <button className="upload-done-btn" onClick={handleUploadToS3}>
            {uploading ? 'Uploading...' : 'Done'}
          </button>
        </>
      )}

      {/* Uploaded S3 image display */}
      {uploadedUrls.length > 0 && (
        <div className="upload-grid">
          {uploadedUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`Uploaded ${idx}`} className="upload-image" />
          ))}
        </div>
      )}

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />

      <div className="upload-footer-link">
        https://mosida.com/user/sean/upload-image
      </div>
    </div>
  );
};

export default UploadCombined;
