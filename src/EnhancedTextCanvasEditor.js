import React, { useRef, useState, useEffect } from 'react';
import {
  FaTrash,
  FaExpandAlt,
  FaCompressAlt,
  FaRedo,
  FaUndo,
  FaEdit,
  FaImage,
  FaDownload,
  FaSync,
  FaSyncAlt
} from 'react-icons/fa';
import './EnhancedTextCanvasEditor.css';

const EnhancedTextCanvasEditor = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'text' or 'image'
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [resizeStartData, setResizeStartData] = useState(null);
  const [rotatingId, setRotatingId] = useState(null);
  const [rotationStartData, setRotationStartData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Fill white background
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  
    // Draw images
    images.forEach(({ x, y, width, height, rotation, image }) => {
      if (!image) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
      ctx.restore();
    });
  
    // Draw texts
    texts.forEach(({ x, y, text, fontSize, rotation }) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  };

  // Function to recalculate positions when canvas dimensions change
  const recalculatePositions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    
    // If canvas dimensions changed significantly, adjust positions
    if (canvasWidth > 0 && canvasHeight > 0) {
      // Force a redraw to ensure everything is in sync
      draw();
    }
  };
  
  useEffect(() => {
    draw();
  }, [texts, images]);

  // Detect mobile device and handle orientation changes
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                             window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    const handleOrientationChange = () => {
      // Update orientation state
      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
      
      // Force a re-render and recalculate positions after orientation change
      setTimeout(() => {
        // Trigger a redraw to ensure canvas and DOM are in sync
        draw();
        
        // Force React to re-render the component
        setImages(prev => [...prev]);
        setTexts(prev => [...prev]);
        
        // Recalculate positions after orientation change
        recalculatePositions();
      }, 300); // Increased delay to ensure orientation change is complete
    };
    
    checkMobile();
    
    // Set initial orientation
    const initialOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    setOrientation(initialOrientation);
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen for screen orientation changes (more reliable on some devices)
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  // Monitor canvas container size changes
  useEffect(() => {
    const canvasContainer = canvasRef.current?.parentElement;
    if (!canvasContainer) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // When canvas container size changes, recalculate positions
        recalculatePositions();
      }
    });
    
    resizeObserver.observe(canvasContainer);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const addText = () => {
    const newText = {
      id: Date.now(),
      x: 200,
      y: 200,
      text: 'Edit Me',
      fontSize: 30,
      rotation: 0
    };
    setTexts([...texts, newText]);
    setSelectedId(newText.id);
    setSelectedType('text');
  };

  const handleImageUpload = (event, existingId = null) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      const maxWidth = 150;
      const width = maxWidth;
      const height = maxWidth / ratio;

      if (existingId) {
        setImages((prev) =>
          prev.map((imgObj) =>
            imgObj.id === existingId
              ? { ...imgObj, image: img, width, height }
              : imgObj
          )
        );
      } else {
        const newImageObj = {
          id: Date.now(),
          x: 250,
          y: 200,
          width,
          height,
          rotation: 0,
          image: img
        };
        setImages((prev) => [...prev, newImageObj]);
        setSelectedId(newImageObj.id);
        setSelectedType('image');
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.icon-toolbar')) return;
    
    // Check if clicking on rotation handle
    if (e.target.closest('.rotation-handle')) {
      const handle = e.target.closest('.rotation-handle');
      const imageId = Number(handle.dataset.imageId);
      const currentImage = images.find(img => img.id === imageId);
      
      if (currentImage) {
        setRotatingId(imageId);
        setRotationStartData({
          startX: e.clientX,
          startY: e.clientY,
          startRotation: currentImage.rotation,
          imageCenterX: currentImage.x,
          imageCenterY: currentImage.y
        });
      }
      return;
    }
    
    // Check if clicking on resize handle
    if (e.target.closest('.resize-handle')) {
      const handle = e.target.closest('.resize-handle');
      const imageId = Number(handle.dataset.imageId);
      const handleType = handle.dataset.handleType;
      
      setResizingId(imageId);
      setResizeStartData({
        startX: e.clientX,
        startY: e.clientY,
        startWidth: images.find(img => img.id === imageId)?.width || 0,
        startHeight: images.find(img => img.id === imageId)?.height || 0,
        handleType
      });
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    
    // Calculate the scale factor between canvas CSS size and actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert mouse position to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check for text selection first
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (Math.sqrt(dx * dx + dy * dy) < t.fontSize * 1.2) {
        setSelectedId(t.id);
        setSelectedType('text');
        canvasRef.current.dataset.dragging = t.id;
        canvasRef.current.dataset.type = 'text';
        canvasRef.current.dataset.offsetX = dx;
        canvasRef.current.dataset.offsetY = dy;
        return;
      }
    }

    // Check for image selection
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      const dx = x - img.x;
      const dy = y - img.y;
      
      // Add margin around image for selection detection (includes rotation icon and resize handles)
      const margin = 50; // pixels around the image
      const hoverWidth = img.width / 2 + margin;
      const hoverHeight = img.height / 2 + margin;
      
      if (Math.abs(dx) < hoverWidth && Math.abs(dy) < hoverHeight) {
        setSelectedId(img.id);
        setSelectedType('image');
        canvasRef.current.dataset.dragging = img.id;
        canvasRef.current.dataset.type = 'image';
        canvasRef.current.dataset.offsetX = dx;
        canvasRef.current.dataset.offsetY = dy;
        return;
      }
    }

    setSelectedId(null);
    setSelectedType(null);
  };

  const handleMouseMove = (e) => {
    // Handle rotation
    if (rotatingId && rotationStartData) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      
      // Calculate the scale factor between canvas CSS size and actual size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Convert mouse position to canvas coordinates
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      // Calculate angle from image center to current mouse position
      const deltaX = mouseX - rotationStartData.imageCenterX;
      const deltaY = mouseY - rotationStartData.imageCenterY;
      const currentAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      // Calculate angle from image center to start mouse position
      const startDeltaX = (rotationStartData.startX - rect.left) * scaleX - rotationStartData.imageCenterX;
      const startDeltaY = (rotationStartData.startY - rect.top) * scaleY - rotationStartData.imageCenterY;
      const startAngle = Math.atan2(startDeltaY, startDeltaX) * 180 / Math.PI;
      
      // Calculate rotation difference
      let rotationDiff = currentAngle - startAngle;
      
      // Normalize rotation to be between -180 and 180 degrees
      if (rotationDiff > 180) rotationDiff -= 360;
      if (rotationDiff < -180) rotationDiff += 360;
      
      // Apply rotation
      const newRotation = rotationStartData.startRotation + rotationDiff;
      updateImage(rotatingId, { rotation: newRotation });
      return;
    }
    
    // Handle resizing
    if (resizingId && resizeStartData) {
      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;
      
      let newWidth = resizeStartData.startWidth;
      let newHeight = resizeStartData.startHeight;
      
      // Calculate new dimensions based on handle type
      if (resizeStartData.handleType === 'top-left') {
        newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
      } else if (resizeStartData.handleType === 'top-right') {
        newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
      } else if (resizeStartData.handleType === 'bottom-right') {
        newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
      } else if (resizeStartData.handleType === 'bottom-left') {
        newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
      }
      
      // Maintain aspect ratio
      const aspectRatio = resizeStartData.startWidth / resizeStartData.startHeight;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
      
      updateImage(resizingId, { width: newWidth, height: newHeight });
      return;
    }
    
    const draggingId = canvasRef.current.dataset.dragging;
    const type = canvasRef.current.dataset.type;
    if (!draggingId || !type) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    
    // Calculate the scale factor between canvas CSS size and actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert mouse position to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX - Number(canvasRef.current.dataset.offsetX);
    const y = (e.clientY - rect.top) * scaleY - Number(canvasRef.current.dataset.offsetY);

    if (type === 'text') {
      setTexts((prev) =>
        prev.map((t) => (t.id === Number(draggingId) ? { ...t, x, y } : t))
      );
    } else if (type === 'image') {
      setImages((prev) =>
        prev.map((img) => (img.id === Number(draggingId) ? { ...img, x, y } : img))
      );
    }
  };

  const handleMouseUp = () => {
    // Stop rotation
    if (rotatingId) {
      setRotatingId(null);
      setRotationStartData(null);
    }
    
    // Stop resizing
    if (resizingId) {
      setResizingId(null);
      setResizeStartData(null);
    }
    
    canvasRef.current.dataset.dragging = '';
    canvasRef.current.dataset.type = '';
  };

  const handleMouseEnter = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    
    // Calculate the scale factor between canvas CSS size and actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert mouse position to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check for text hover
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (Math.sqrt(dx * dx + dy * dy) < t.fontSize * 1.2) {
        setHoveredId(t.id);
        setHoveredType('text');
        return;
      }
    }

    // Check for image hover
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      const dx = x - img.x;
      const dy = y - img.y;
      
      // Add margin around image for hover detection (includes rotation icon and resize handles)
      const margin = 50; // pixels around the image
      const hoverWidth = img.width / 2 + margin;
      const hoverHeight = img.height / 2 + margin;
      
      if (Math.abs(dx) < hoverWidth && Math.abs(dy) < hoverHeight) {
        setHoveredId(img.id);
        setHoveredType('image');
        return;
      }
    }

    // If not hovering over any element, clear hover state
    setHoveredId(null);
    setHoveredType(null);
  };

  // Add a more robust mouse move handler for hover detection
  const handleMouseMoveForHover = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    
    // Calculate the scale factor between canvas CSS size and actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert mouse position to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    let foundHover = false;

    // Check for text hover
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (Math.sqrt(dx * dx + dy * dy) < t.fontSize * 1.2) {
        setHoveredId(t.id);
        setHoveredType('text');
        foundHover = true;
        break;
      }
    }

    // Check for image hover if no text hover
    if (!foundHover) {
      for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        const dx = x - img.x;
        const dy = y - img.y;
        
        // Add margin around image for hover detection (includes rotation icon and resize handles)
        const margin = 50; // pixels around the image
        const hoverWidth = img.width / 2 + margin;
        const hoverHeight = img.height / 2 + margin;
        
        if (Math.abs(dx) < hoverWidth && Math.abs(dy) < hoverHeight) {
          setHoveredId(img.id);
          setHoveredType('image');
          foundHover = true;
          break;
        }
      }
    }

    // If not hovering over any element, clear hover state
    if (!foundHover) {
      setHoveredId(null);
      setHoveredType(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setHoveredType(null);
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent default touch behavior
    const touch = e.touches[0];
    
    // Create a synthetic mouse event
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: touch.target,
      preventDefault: () => {},
      stopPropagation: () => {},
      touches: e.touches,
      type: 'mousedown'
    };
    
    handleMouseDown(syntheticEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent default touch behavior
    const touch = e.touches[0];
    
    // Create a synthetic mouse event
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: touch.target,
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    
    handleMouseMove(syntheticEvent);
    handleMouseMoveForHover(syntheticEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault(); // Prevent default touch behavior
    handleMouseUp();
  };

  const handleTouchCancel = (e) => {
    e.preventDefault(); // Prevent default touch behavior
    handleMouseUp();
  };

  const updateText = (id, changes) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  };

  const updateImage = (id, changes) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...changes } : img))
    );
  };

  const deleteText = (id) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const deleteImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setEditingText(t.text);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateText(editingId, { text: editingText });
    setEditingId(null);
    setEditingText('');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'canvas_output.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const rotateImage = (id, direction) => {
    const currentImage = images.find(img => img.id === id);
    if (currentImage) {
      const newRotation = direction === 'left' 
        ? currentImage.rotation - 90 
        : currentImage.rotation + 90;
      updateImage(id, { rotation: newRotation });
    }
  };

  const resizeImage = (id, direction) => {
    const currentImage = images.find(img => img.id === id);
    if (currentImage) {
      let newWidth, newHeight;
      if (direction === 'shrink') {
        newWidth = currentImage.width * 0.9;
        newHeight = currentImage.height * 0.9;
      } else {
        newWidth = currentImage.width * 1.1;
        newHeight = currentImage.height * 1.1;
      }
      updateImage(id, { width: newWidth, height: newHeight });
    }
  };

  return (
    <div className="enhanced-canvas-editor">
      <div className="controls">
        <button onClick={addText}>➕ Add Text</button>
        <button onClick={() => fileInputRef.current.click()}>
          🖼️ Upload Image
        </button>
        <button onClick={handleDownload}>
          <FaDownload /> Download as Image
        </button>
        <div className="zoom-control">
          <label>Zoom:</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            defaultValue="1"
            onChange={(e) => {
              const zoom = parseFloat(e.target.value);
              const canvas = canvasRef.current;
              canvas.style.transform = `scale(${zoom})`;
              canvas.style.transformOrigin = 'top left';
            }}
          />
        </div>
      </div>
      
      {/* Debug info */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>Debug Info:</strong><br/>
        Hovered ID: {hoveredId} | Type: {hoveredType}<br/>
        Selected ID: {selectedId} | Type: {selectedType}<br/>
        Rotating ID: {rotatingId || 'None'}<br/>
        Images count: {images.length}<br/>
        Mouse position: {hoveredId ? 'Hovering over element' : 'Not hovering'}<br/>
        Device: {isMobile ? '📱 Mobile' : '🖥️ Desktop'}<br/>
        Orientation: {isMobile ? `📱 ${orientation}` : '🖥️ Desktop'}<br/>
        <strong>Instructions:</strong> Upload an image, then hover over it to see the red border and resize handles<br/>
        <strong>Rotation:</strong> Drag the blue rotation icon to rotate the image smoothly<br/>
        <strong>Mobile:</strong> {isMobile ? 'Touch and drag to interact with images' : 'Mouse hover and drag on desktop'}<br/>
        <strong>Note:</strong> Hover area extends 50px around images to keep controls visible<br/>
        <strong>Mobile Tip:</strong> {isMobile ? 'Rotate device to see orientation change handling' : ''}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

             <div
         className="canvas-container"
         onMouseDown={handleMouseDown}
         onMouseMove={(e) => {
           handleMouseMove(e);
           handleMouseMoveForHover(e);
         }}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseLeave}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         onTouchCancel={handleTouchCancel}
       >
                 <canvas
           ref={canvasRef}
           width={700}
           height={500}
           style={{
             border: '1px solid #ccc',
             display: 'block'
           }}
         />

        {/* Text toolbars */}
        {texts.map((t) => (
          <div
            key={t.id}
            className="icon-toolbar"
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y - t.fontSize - 30,
              transform: 'translate(-50%, -50%)',
              display: selectedId === t.id && selectedType === 'text' ? 'flex' : 'none',
              gap: '6px',
              background: 'rgba(255,255,255,0.95)',
              padding: '4px 8px',
              borderRadius: '6px',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <FaEdit onClick={(e) => { e.stopPropagation(); handleEdit(t); }} title="Edit" style={{ cursor: 'pointer' }} />
            <FaUndo onClick={(e) => { e.stopPropagation(); updateText(t.id, { rotation: t.rotation - 10 }); }} title="Rotate Left" style={{ cursor: 'pointer' }} />
            <FaRedo onClick={(e) => { e.stopPropagation(); updateText(t.id, { rotation: t.rotation + 10 }); }} title="Rotate Right" style={{ cursor: 'pointer' }} />
            <FaCompressAlt onClick={(e) => { e.stopPropagation(); updateText(t.id, { fontSize: Math.max(10, t.fontSize - 4) }); }} title="Smaller" style={{ cursor: 'pointer' }} />
            <FaExpandAlt onClick={(e) => { e.stopPropagation(); updateText(t.id, { fontSize: t.fontSize + 4 }); }} title="Larger" style={{ cursor: 'pointer' }} />
            <FaTrash onClick={(e) => { e.stopPropagation(); deleteText(t.id); }} title="Delete" style={{ cursor: 'pointer', color: 'red' }} />
          </div>
        ))}

                 {/* Image toolbars and borders */}
         {images.map((img) => {
           const isHovered = hoveredId === img.id && hoveredType === 'image';
           const isSelected = selectedId === img.id && selectedType === 'image';
           const showBorder = isHovered || isSelected;
           
                       // Debug logging
            console.log(`Image ${img.id}: hovered=${isHovered}, selected=${isSelected}, showBorder=${showBorder}, hoveredId=${hoveredId}, hoveredType=${hoveredType}`);
          
          return (
            <div key={img.id}>
                                            {/* Hover/Selection Border */}
                {showBorder && (
                  <>
                    {/* Main image border */}
                    <div
                      className="image-border"
                      style={{
                        position: 'absolute',
                        left: img.x - img.width / 2,
                        top: img.y - img.height / 2,
                        width: img.width,
                        height: img.height,
                        border: '4px solid #ff0000',
                        borderRadius: '6px',
                        pointerEvents: 'none',
                        zIndex: 5,
                        boxShadow: '0 0 0 4px rgba(255, 0, 0, 0.5)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)'
                      }}
                    />
                    
                    {/* Extended hover area indicator (subtle) */}
                    <div
                      className="hover-area-indicator"
                      style={{
                        position: 'absolute',
                        left: img.x - img.width / 2 - 50,
                        top: img.y - img.height / 2 - 50,
                        width: img.width + 100,
                        height: img.height + 100,
                        border: '1px dashed rgba(255, 0, 0, 0.3)',
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 4,
                        backgroundColor: 'rgba(255, 0, 0, 0.02)'
                      }}
                    />
                  </>
                )}

              {/* Resize Handles (3 dots) */}
              {showBorder && (
                <>
                                     {/* Top-left corner */}
                                       <div
                      className="resize-handle"
                      data-image-id={img.id}
                      data-handle-type="top-left"
                      style={{
                        position: 'absolute',
                        left: img.x - img.width / 2 - 10,
                        top: img.y - img.height / 2 - 10,
                        width: isMobile ? 24 : 20,
                        height: isMobile ? 24 : 20,
                        background: '#007bff',
                        borderRadius: '50%',
                        cursor: 'nw-resize',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: isMobile ? '10px' : '8px'
                      }}
                      title={isMobile ? "Touch and drag to resize" : "Resize"}
                    >
                      ⋯
                    </div>
                   
                                       {/* Top-right corner */}
                    <div
                      className="resize-handle"
                      data-image-id={img.id}
                      data-handle-type="top-right"
                      style={{
                        position: 'absolute',
                        left: img.x + img.width / 2 - 10,
                        top: img.y - img.height / 2 - 10,
                        width: isMobile ? 24 : 20,
                        height: isMobile ? 24 : 20,
                        background: '#007bff',
                        borderRadius: '50%',
                        cursor: 'ne-resize',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: isMobile ? '10px' : '8px'
                      }}
                      title={isMobile ? "Touch and drag to resize" : "Resize"}
                    >
                      ⋯
                    </div>
                   
                                      {/* Bottom-right corner */}
                    <div
                      className="resize-handle"
                      data-image-id={img.id}
                      data-handle-type="bottom-right"
                      style={{
                        position: 'absolute',
                        left: img.x + img.width / 2 - 10,
                        top: img.y + img.height / 2 - 10,
                        width: isMobile ? 24 : 20,
                        height: isMobile ? 24 : 20,
                        background: '#007bff',
                        borderRadius: '50%',
                        cursor: 'se-resize',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: isMobile ? '10px' : '8px'
                      }}
                      title={isMobile ? "Touch and drag to resize" : "Resize"}
                    >
                      ⋯
                    </div>
                   
                                      {/* Bottom-left corner */}
                    <div
                      className="resize-handle"
                      data-image-id={img.id}
                      data-handle-type="bottom-left"
                      style={{
                        position: 'absolute',
                        left: img.x - img.width / 2 - 10,
                        top: img.y + img.height / 2 - 10,
                        width: isMobile ? 24 : 24,
                        height: isMobile ? 24 : 20,
                        background: '#007bff',
                        borderRadius: '50%',
                        cursor: 'sw-resize',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: isMobile ? '10px' : '8px'
                      }}
                      title={isMobile ? "Touch and drag to resize" : "Resize"}
                    >
                      ⋯
                    </div>
                </>
              )}

                                            {/* Rotation Icon on Top */}
                {showBorder && (
                  <>
                                         <div
                       className="rotation-handle"
                       data-image-id={img.id}
                       style={{
                         position: 'absolute',
                         left: img.x,
                         top: img.y - img.height / 2 - 40,
                         transform: 'translateX(-50%)',
                         background: rotatingId === img.id ? '#ff6b35' : '#007bff',
                         borderRadius: '50%',
                         width: isMobile ? 40 : 32,
                         height: isMobile ? 40 : 32,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         cursor: rotatingId === img.id ? 'grabbing' : 'grab',
                         zIndex: 15,
                         border: '2px solid #ffffff',
                         boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                         transition: 'background-color 0.2s'
                       }}
                       title={isMobile ? "Touch and drag to rotate" : "Drag to rotate image"}
                     >
                       <FaSync size={isMobile ? 20 : 16} />
                     </div>
                    
                                         {/* Rotation guide line (shows during rotation) */}
                     {rotatingId === img.id && (
                       <div
                         className="rotation-guide"
                         style={{
                           position: 'absolute',
                           left: img.x,
                           top: img.y - img.height / 2 - 40,
                           width: 2,
                           height: 60,
                           background: 'linear-gradient(to top, #ff6b35, transparent)',
                           transform: 'translateX(-50%)',
                           pointerEvents: 'none',
                           zIndex: 14
                         }}
                       />
                     )}
                     
                     {/* Rotation angle indicator */}
                     <div
                       className="rotation-angle"
                       style={{
                         position: 'absolute',
                         left: img.x + 20,
                         top: img.y - img.height / 2 - 35,
                         background: 'rgba(0,0,0,0.7)',
                         color: 'white',
                         padding: '2px 6px',
                         borderRadius: '4px',
                         fontSize: '10px',
                         pointerEvents: 'none',
                         zIndex: 16,
                         fontFamily: 'monospace'
                       }}
                     >
                       {Math.round(img.rotation)}°
                     </div>
                  </>
                )}

              {/* Image Toolbar */}
              <div
                className="icon-toolbar"
                style={{
                  position: 'absolute',
                  left: img.x,
                  top: img.y - img.height / 2 - 80,
                  transform: 'translateX(-50%)',
                  display: isSelected ? 'flex' : 'none',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.95)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  alignItems: 'center',
                  zIndex: 10
                }}
              >
                                 <FaSyncAlt onClick={(e) => { e.stopPropagation(); rotateImage(img.id, 'left'); }} title="Rotate Left" style={{ cursor: 'pointer' }} />
                 <FaSync onClick={(e) => { e.stopPropagation(); rotateImage(img.id, 'right'); }} title="Rotate Right" style={{ cursor: 'pointer' }} />
                <FaCompressAlt onClick={(e) => { e.stopPropagation(); resizeImage(img.id, 'shrink'); }} title="Shrink" style={{ cursor: 'pointer' }} />
                <FaExpandAlt onClick={(e) => { e.stopPropagation(); resizeImage(img.id, 'enlarge'); }} title="Enlarge" style={{ cursor: 'pointer' }} />
                <FaImage onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.onchange = (ev) => handleImageUpload(ev, img.id);
                  fileInputRef.current.click();
                }} title="Reupload" style={{ cursor: 'pointer' }} />
                <FaTrash onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }} title="Delete" style={{ cursor: 'pointer', color: 'red' }} />
              </div>
            </div>
          );
        })}

        {/* Text editing form */}
        {editingId && (
          <form onSubmit={handleEditSubmit} className="edit-form" style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 20
          }}>
            <input value={editingText} onChange={(e) => setEditingText(e.target.value)} />
            <button type="submit">Save</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EnhancedTextCanvasEditor;
