import React, { useState, useRef, useEffect } from 'react';
import './ImageRotator.css';

const ImageRotator = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  const [hoveredImage, setHoveredImage] = useState(null);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Sample images for demonstration
  const sampleImages = [
    '/boy_girl_bw.png',
    '/fish.png',
    '/sean-sample.png',
    '/random.png',
    '/picaso.png'
  ];

  const handleImageHover = (imageSrc) => {
    setHoveredImage(imageSrc);
  };

  const handleImageLeave = () => {
    setHoveredImage(null);
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setRotation(0);
  };

  const handleMouseDown = (e) => {
    if (!selectedImage) return;
    
    setIsDragging(true);
    setStartX(e.clientX || e.touches?.[0]?.clientX || 0);
    setStartRotation(rotation);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedImage) return;
    
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const deltaX = currentX - startX;
    
    // Convert horizontal movement to rotation
    // Adjust sensitivity by changing the divisor
    const rotationDelta = (deltaX / 2);
    const newRotation = startRotation + rotationDelta;
    
    setRotation(newRotation);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    handleMouseDown(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMouseMove(e);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleMouseUp();
  };

  // Add event listeners for mouse and touch
  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [selectedImage, isDragging, startX, startRotation, rotation]);

  const resetRotation = () => {
    setRotation(0);
  };

  const rotateLeft = () => {
    setRotation(rotation - 90);
  };

  const rotateRight = () => {
    setRotation(rotation + 90);
  };

  return (
    <div className="image-rotator-container" ref={containerRef}>
      <h2 className="rotator-title">Image Rotator with Gestures</h2>
      <p className="rotator-description">
        Hover over images to see rotation options. Click to select and rotate using mouse drag or touch gestures.
      </p>

      {/* Image Gallery */}
      <div className="image-gallery">
        {sampleImages.map((imageSrc, index) => (
          <div
            key={index}
            className={`image-item ${hoveredImage === imageSrc ? 'hovered' : ''}`}
            onMouseEnter={() => handleImageHover(imageSrc)}
            onMouseLeave={handleImageLeave}
            onClick={() => handleImageClick(imageSrc)}
          >
            <img
              src={imageSrc}
              alt={`Sample ${index + 1}`}
              className="gallery-image"
            />
            {hoveredImage === imageSrc && (
              <div className="rotation-hint">
                <span>Click to rotate</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rotation Workspace */}
      {selectedImage && (
        <div className="rotation-workspace">
          <h3>Rotation Workspace</h3>
          <div className="workspace-container">
            <div
              className="image-container"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Selected for rotation"
                className="rotating-image"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease'
                }}
              />
            </div>
            
            <div className="rotation-controls">
              <div className="control-buttons">
                <button onClick={rotateLeft} className="control-btn">
                  ↶ Rotate Left
                </button>
                <button onClick={resetRotation} className="control-btn">
                  ↻ Reset
                </button>
                <button onClick={rotateRight} className="control-btn">
                  ↷ Rotate Right
                </button>
              </div>
              
              <div className="rotation-info">
                <p>Current Rotation: {Math.round(rotation)}°</p>
                <p className="gesture-hint">
                  💡 Drag left/right or use touch gestures to rotate
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setSelectedImage(null)} 
            className="close-btn"
          >
            Close Workspace
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h3>How to Use:</h3>
        <ul>
          <li><strong>Desktop:</strong> Hover over images, click to select, then drag left/right to rotate</li>
          <li><strong>Mobile:</strong> Tap an image to select, then swipe left/right to rotate</li>
          <li><strong>Touch Gestures:</strong> Swipe right to rotate clockwise, swipe left to rotate counter-clockwise</li>
          <li><strong>Precise Control:</strong> Use the control buttons for exact 90° rotations</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageRotator;
