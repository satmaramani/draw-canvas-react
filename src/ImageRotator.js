import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageRotator.css';

const ImageRotator = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastDistance = useRef(0);
  const animationFrameId = useRef(null);
  const isInitialized = useRef(false);
  const touchMode = useRef('none'); // 'none', 'rotate', 'zoom'

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
    setScale(1);
    isInitialized.current = false;
    touchMode.current = 'none';
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touches) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  // Smooth rotation function using requestAnimationFrame
  const smoothRotate = useCallback((targetRotation) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    animationFrameId.current = requestAnimationFrame(() => {
      setRotation(targetRotation);
    });
  }, []);

  // Smooth scale function using requestAnimationFrame
  const smoothScale = useCallback((targetScale) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    animationFrameId.current = requestAnimationFrame(() => {
      setScale(targetScale);
    });
  }, []);

  // Use useCallback to prevent unnecessary re-renders
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedImage) return;
    
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    
    // Initialize on first move
    if (!isInitialized.current) {
      lastX.current = currentX;
      isInitialized.current = true;
      return;
    }
    
    // Calculate the actual movement direction and distance
    const deltaX = currentX - lastX.current;
    
    // Apply rotation based on movement direction
    // Positive deltaX (right movement) = clockwise rotation
    // Negative deltaX (left movement) = counter-clockwise rotation
    const rotationDelta = deltaX / 1.5; // Adjust sensitivity here
    const newRotation = rotation + rotationDelta;
    
    // Use smooth rotation for better performance
    smoothRotate(newRotation);
    
    // Update last position for next calculation
    lastX.current = currentX;
  }, [isDragging, selectedImage, rotation, smoothRotate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    isInitialized.current = false;
    touchMode.current = 'none';
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (!selectedImage) return;
    
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    setIsDragging(true);
    lastX.current = currentX;
    isInitialized.current = false;
  }, [selectedImage]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    
    if (!selectedImage) return;
    
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Single touch - rotation mode
      touchMode.current = 'rotate';
      const currentX = touches[0].clientX;
      setIsDragging(true);
      lastX.current = currentX;
      isInitialized.current = false;
    } else if (touches.length === 2) {
      // Two touches - zoom mode
      touchMode.current = 'zoom';
      lastDistance.current = getTouchDistance(touches);
      lastX.current = getTouchCenter(touches).x;
      lastY.current = getTouchCenter(touches).y;
      setIsDragging(true);
    }
  }, [selectedImage]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    if (!isDragging || !selectedImage) return;
    
    const touches = e.touches;
    
    if (touchMode.current === 'rotate' && touches.length === 1) {
      // Handle rotation
      const currentX = touches[0].clientX;
      
      if (!isInitialized.current) {
        lastX.current = currentX;
        isInitialized.current = true;
        return;
      }
      
      const deltaX = currentX - lastX.current;
      const rotationDelta = deltaX / 1.5;
      const newRotation = rotation + rotationDelta;
      
      smoothRotate(newRotation);
      lastX.current = currentX;
      
    } else if (touchMode.current === 'zoom' && touches.length === 2) {
      // Handle zoom
      const currentDistance = getTouchDistance(touches);
      const currentCenter = getTouchCenter(touches);
      
      if (lastDistance.current > 0) {
        const scaleDelta = currentDistance / lastDistance.current;
        const newScale = Math.max(0.1, Math.min(5, scale * scaleDelta));
        
        smoothScale(newScale);
      }
      
      lastDistance.current = currentDistance;
      lastX.current = currentCenter.x;
      lastY.current = currentCenter.y;
    }
  }, [isDragging, selectedImage, rotation, scale, smoothRotate, smoothScale]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

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
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [selectedImage, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const resetRotation = () => {
    setRotation(0);
  };

  const resetScale = () => {
    setScale(1);
  };

  const resetAll = () => {
    setRotation(0);
    setScale(1);
  };

  const rotateLeft = () => {
    setRotation(rotation - 90);
  };

  const rotateRight = () => {
    setRotation(rotation + 90);
  };

  const zoomIn = () => {
    setScale(Math.min(5, scale * 1.2));
  };

  const zoomOut = () => {
    setScale(Math.max(0.1, scale / 1.2));
  };

  return (
    <div className="image-rotator-container" ref={containerRef}>
      <h2 className="rotator-title">Image Rotator & Zoom with Gestures</h2>
      <p className="rotator-description">
        Hover over images to see options. Click to select and use gestures for rotation and zoom.
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
                <span>Click to rotate & zoom</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rotation Workspace */}
      {selectedImage && (
        <div className="rotation-workspace">
          <h3>Rotation & Zoom Workspace</h3>
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
                alt="Selected for rotation and zoom"
                className="rotating-image"
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                }}
              />
            </div>
            
            <div className="rotation-controls">
              <div className="control-buttons">
                <button onClick={rotateLeft} className="control-btn">
                  ↶ Rotate Left
                </button>
                <button onClick={resetAll} className="control-btn">
                  ↻ Reset All
                </button>
                <button onClick={rotateRight} className="control-btn">
                  ↷ Rotate Right
                </button>
              </div>
              
              <div className="control-buttons">
                <button onClick={zoomOut} className="control-btn">
                  🔍- Zoom Out
                </button>
                <button onClick={resetScale} className="control-btn">
                  📏 Reset Size
                </button>
                <button onClick={zoomIn} className="control-btn">
                  🔍+ Zoom In
                </button>
              </div>
              
              <div className="rotation-info">
                <p>Rotation: {Math.round(rotation)}° | Scale: {scale.toFixed(2)}x</p>
                <p className="gesture-hint">
                  💡 <strong>Desktop:</strong> Drag left/right to rotate | <strong>Mobile:</strong> Swipe to rotate, pinch to zoom
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
          <li><strong>Desktop:</strong> Hover over images, click to select, then drag left/right to rotate smoothly</li>
          <li><strong>Mobile Rotation:</strong> Tap an image to select, then swipe left/right to rotate smoothly</li>
          <li><strong>Mobile Zoom:</strong> Use two fingers to pinch in/out for zoom in/out</li>
          <li><strong>Touch Gestures:</strong> Swipe right = clockwise, swipe left = counter-clockwise</li>
          <li><strong>Precise Control:</strong> Use the control buttons for exact rotations and zoom levels</li>
          <li><strong>Multi-touch:</strong> Pinch fingers together to zoom out, spread apart to zoom in</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageRotator;
