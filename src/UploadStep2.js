import React, { useState } from 'react';
import './UploadStep2.css'; // Separate CSS for styling

const UploadStep2 = () => {
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, 8 - images.length); // Enforce max 8
    const imagePreviews = newImages.map((file) => URL.createObjectURL(file));
    setImages([...images, ...imagePreviews]);
  };

  const handleAddMoreClick = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">TechySam</h2>
      <p className="upload-subtitle">Please upload a maximum of 8 images</p>

      <div className="upload-grid">
  {images.length === 0 && (
    <img
      src="/smiling-girl.png"
      alt="Default"
      className="upload-image"
    />
  )}

  {images.map((img, idx) => (
    <img key={idx} src={img} alt={`Uploaded ${idx}`} className="upload-image" />
  ))}

  {images.length < 8 && (
    <div className="upload-add" onClick={handleAddMoreClick}>
      <div className="plus-icon">+</div>
      <div className="add-label">Add more</div>
    </div>
  )}
</div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />

      <button className="upload-done-btn">Done</button>

      <div className="upload-footer-link">https://mosida.com/user/sean/upload-image</div>
    </div>
  );
};

export default UploadStep2;
