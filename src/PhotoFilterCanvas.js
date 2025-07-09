import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaDownload, FaRedoAlt } from 'react-icons/fa';
import './PhotoCaptureWithFilters.css';

const filters = [
  { name: 'Original', class: '', image: 'original.png' },
  { name: 'Black and White', class: 'filter-bw', image: 'black-and-white.png' },
  { name: 'Vintage', class: 'filter-vintage', image: 'vintage.png' },
  { name: 'Bright', class: 'filter-bright', image: 'bright.png' },
  { name: 'Cool', class: 'filter-cool', image: 'cool.png' },
  { name: 'Soft', class: 'filter-soft', image: 'soft.png' },
];

const PhotoCaptureWithFilters = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 50);
      setCapturedImage(null);
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/png'));
    stopCamera();
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = 'captured.png';
    link.href = capturedImage;
    link.click();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="main-container">
      <div className="left-section">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`preview ${selectedFilter}`}
          />
        ) : (
          <img src={capturedImage} alt="Captured" className={`preview ${selectedFilter}`} />
        )}
        <canvas ref={canvasRef} className="hidden-canvas" />

        <div className="button-row">
          {!stream && !capturedImage && (
            <button className="btn" onClick={startCamera}>
              <FaCamera /> Open Camera
            </button>
          )}
          {stream && (
            <button className="btn" onClick={capturePhoto}>
              <FaCamera /> Capture
            </button>
          )}
          {capturedImage && (
            <>
              <button className="btn" onClick={startCamera}>
                <FaRedoAlt /> Retake
              </button>
              <button className="btn" onClick={downloadImage}>
                <FaDownload /> Download
              </button>
              <button className="btn">Next</button>
            </>
          )}
        </div>
      </div>

      <div className="right-section">
        <h2>
          <span className="highlight">Select</span> Filter
        </h2>
        <p>Select a filter to create the atmosphere you prefer.</p>
        <div className="filter-list">
          {filters.map(filter => (
            <div
              key={filter.name}
              className={`filter-option ${selectedFilter === filter.class ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter.class)}
            >
              <img
                src={`/filters/${filter.image}`}
                alt={filter.name}
                className="filter-thumb"
              />
              <span>{filter.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoCaptureWithFilters;
