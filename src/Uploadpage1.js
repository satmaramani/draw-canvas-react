import React from 'react';
import './Uploadpage1.css';

const UploadPage = () => {
  return (
    <div className="upload-container">
      <h1 className="title">TechySam</h1>
      <p className="instruction">Please upload Image</p>

      <div className="empty-box-section">
        <img
          src="/box image mosida.png"
          alt="Empty box"
          className="empty-box-img"
        />
        <p className="empty-text">Nothing to show</p>
      </div>

      <button className="upload-btn">⬆ Upload image</button>

      <p className="url-text">https://mosida.com/user/sean/upload-image</p>
    </div>
  );
};

export default UploadPage;
