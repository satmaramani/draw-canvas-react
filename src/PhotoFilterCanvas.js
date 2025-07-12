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

const getCanvasFilter = (filterClass) => {
  switch (filterClass) {
    case 'filter-bw':
      return 'grayscale(1)';
    case 'filter-vintage':
      return 'sepia(0.6) contrast(1.1)';
    case 'filter-bright':
      return 'brightness(1.3)';
    case 'filter-cool':
      return 'hue-rotate(190deg) saturate(1.2)';
    case 'filter-soft':
      return ''; // custom painterly logic
    default:
      return 'none';
  }
};

const PhotoCaptureWithFilters = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
  
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
  
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
  
      setIsCaptured(false); // Reset state
    } catch (err) {
      console.error('Camera error:', err);
    }
  };
  

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const applyPainterlyEffect = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(data[i] / 32) * 32;
      data[i + 1] = Math.floor(data[i + 1] / 32) * 32;
      data[i + 2] = Math.floor(data[i + 2] / 32) * 32;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.videoWidth === 0) return;
  
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    if (selectedFilter === 'filter-soft') {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      applyPainterlyEffect(canvas);
    } else {
      ctx.filter = getCanvasFilter(selectedFilter);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  
    setTimeout(() => {
      setIsCaptured(true); // defer to next tick to ensure canvas rendered
      stopCamera();
    }, 50);
  };
  

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'captured_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="main-container">
      <div className="left-section">
        <div className="filter-header">
          <h2><span className="highlight">Select</span> Filter</h2>
          <p>Select a filter to create the atmosphere you prefer.</p>
        </div>

        {!isCaptured ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`preview ${selectedFilter}`}
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="preview"
          />
        )}

        <div className="button-row">
          {!isCaptured && (
            <button className="btn" onClick={capturePhoto}>
              <FaCamera /> Capture
            </button>
          )}
          {isCaptured && (
            <>
              <button className="btn" onClick={startCamera}>
                <FaRedoAlt /> Retake
              </button>
              <button className="btn" onClick={downloadImage}>
                <FaDownload /> Download
              </button>
            </>
          )}
        </div>
      </div>

      <div className="right-section">
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
