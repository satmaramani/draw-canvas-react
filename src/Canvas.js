import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Paintbrush, Eraser, Undo2, Redo2, Trash2 } from 'lucide-react'; // Importing required icons

const CanvasDrawingApp = () => {
  // useRef for the canvas element to directly access its DOM properties
  const canvasRef = useRef(null);

  // useRefs for mutable states that are frequently accessed by event handlers
  // This helps prevent stale closures in event listeners which are set up once
  const isDrawingRef = useRef(false); // Tracks if the mouse/touch is currently down and drawing
  const selectedToolRef = useRef('pen'); // Stores the currently active tool ('pen', 'brush', or 'eraser')
  const brushSizeRef = useRef(5); // Stores the current brush size for the 'brush' and 'eraser' tools
  const drawingColorRef = useRef('#000000'); // Stores the current drawing color

  // useState for reactive properties that trigger re-renders of the component
  // These are linked to the UI controls
  const [selectedTool, setSelectedTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(5);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [canvasWidth] = useState(800); // Fixed canvas width for the drawing area
  const [canvasHeight] = useState(600); // Fixed canvas height for the drawing area

  // State to store all drawn paths. Each path is an object containing tool, size, color, and points.
  // This allows redrawing the canvas content when its size changes or when cleared/restored.
  const [paths, setPaths] = useState([]); // Array of { tool, size, color, points: [{x, y}] }
  const [undoStack, setUndoStack] = useState([]); // Stores paths for redo functionality

  // Predefined color palette
  const colors = [
    '#990000', '#CC0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
    '#009900', '#00CC00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
    '#000099', '#0000CC', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF',
    '#999900', '#CCCC00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC',
    '#990099', '#CC00CC', '#FF33FF', '#FF66FF', '#FF99FF', '#FFCCFF',
    '#009999', '#00CCCC', '#33FFFF', '#66FFFF', '#99FFFF', '#CCFFFF',
    '#663300', '#996633', '#CC9966', '#FFCC99', '#FFE6CC', '#FFF2E6',
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'
  ];

  // Predefined brush sizes
  const brushSizes = [2, 5, 10, 15, 20, 25, 30];


  // Effect to keep refs synchronized with their corresponding state values
  // This ensures event handlers (which use refs) always have the latest tool, size, and color
  useEffect(() => {
    selectedToolRef.current = selectedTool;
    brushSizeRef.current = brushSize;
    drawingColorRef.current = drawingColor;
  }, [selectedTool, brushSize, drawingColor]);

  // useCallback memoizes the redrawCanvas function. It will only be re-created if `paths` changes.
  // This function iterates through all stored paths and redraws them on the canvas.
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas is available
    const ctx = canvas.getContext('2d'); // Get the 2D rendering context

    // Clear the entire canvas before redrawing all paths
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // Save the current state of the canvas context

    // Iterate over each stored path and draw it
    paths.forEach(path => {
      // A path needs at least two points to form a line
      if (path.points.length < 2) return;

      ctx.beginPath(); // Start a new path for each line segment
      ctx.moveTo(path.points[0].x, path.points[0].y); // Move to the first point

      // Draw lines to subsequent points
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.strokeStyle = path.color; // Set stroke color

      // Determine line width based on the tool. Eraser uses the brush size for its stroke width.
      const lineWidth = path.tool === 'pen' ? 2 : path.size;
      ctx.lineWidth = lineWidth;

      ctx.lineCap = 'round';     // Make line endings rounded
      ctx.lineJoin = 'round';    // Make line joins rounded

      // Set globalCompositeOperation for eraser functionality
      // 'destination-out' makes new shapes transparent where they overlap with existing ones.
      ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.stroke();             // Render the path
    });

    ctx.restore(); // Restore the canvas context state (removes the composite operation)
  }, [paths]); // `paths` is a dependency because `redrawCanvas` reads from it

  // Effect hook to re-render the canvas content whenever `canvasWidth`, `canvasHeight` change
  // or when `paths` are updated (handled by `redrawCanvas`'s dependencies).
  useEffect(() => {
    redrawCanvas();
  }, [canvasWidth, canvasHeight, redrawCanvas]); // `redrawCanvas` is a dependency

  // Helper function to get mouse/touch coordinates relative to the canvas
  const getCoordinates = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect(); // Get canvas position and size on the page

    let clientX, clientY;
    // Differentiate between mouse and touch events
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Calculate scaling factors if canvas is resized by CSS (e.g., width: 100%)
    // This ensures drawing on the correct internal canvas pixel, not just the rendered CSS pixel.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Return coordinates relative to the canvas's top-left corner
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []); // No dependencies for getCoordinates as canvas ref is stable

  // Event handler for when drawing starts (mouse down or touch start)
  // Memoized with useCallback to keep it stable for event listener setup
  const startDrawing = useCallback((event) => {
    // Prevent default touch behaviors like scrolling or zooming which can cause flickering
    if (event.type === 'touchstart') {
      event.preventDefault();
    }
    isDrawingRef.current = true; // Set drawing flag to true
    const coordinates = getCoordinates(event); // Get starting coordinates

    // Clear the undo stack when a new drawing action begins
    setUndoStack([]);

    // Add a new path object to the `paths` state
    setPaths(prevPaths => [
      ...prevPaths,
      {
        tool: selectedToolRef.current, // Use current tool from ref
        size: brushSizeRef.current,    // Use current brush size from ref
        color: drawingColorRef.current, // Use current color from ref
        points: [coordinates]          // Start with the initial point
      }
    ]);
  }, [getCoordinates]); // `getCoordinates` is a dependency

  // Event handler for drawing movement (mouse move or touch move)
  // Memoized with useCallback
  const draw = useCallback((event) => {
    if (!isDrawingRef.current) return; // Only draw if drawing is active
    // Prevent default touch behaviors like scrolling or zooming which can cause flickering
    if (event.type === 'touchmove') {
      event.preventDefault();
    }
    const coordinates = getCoordinates(event); // Get current coordinates
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Update the `paths` state by adding the new point to the last path
    setPaths(prevPaths => {
      const lastPathIndex = prevPaths.length - 1;
      if (lastPathIndex < 0) return prevPaths; // Should not happen if startDrawing was called

      const updatedPaths = [...prevPaths];
      // Create a new array for points to ensure immutability for React state updates
      const currentPathPoints = [...updatedPaths[lastPathIndex].points, coordinates];
      updatedPaths[lastPathIndex] = {
        ...updatedPaths[lastPathIndex],
        points: currentPathPoints // Update points for the current path
      };

      // Immediate drawing on the canvas for a smooth, responsive drawing experience
      // This draws the segment from the previous point to the current point
      if (currentPathPoints.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = drawingColorRef.current; // Use current color from ref

        // Determine line width based on the current tool
        const lineWidth = selectedToolRef.current === 'pen' ? 2 : brushSizeRef.current;
        ctx.lineWidth = lineWidth;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Set globalCompositeOperation for eraser functionality during live drawing
        ctx.globalCompositeOperation = selectedToolRef.current === 'eraser' ? 'destination-out' : 'source-over';

        const lastPoint = currentPathPoints[currentPathPoints.length - 2]; // Get the previous point
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(coordinates.x, coordinates.y);
        ctx.stroke(); // Render the segment
      }
      return updatedPaths; // Return the updated paths array
    });
  }, [getCoordinates]);

  // Event handler for when drawing ends (mouse up, touch end, mouse leave, touch cancel)
  // Memoized with useCallback
  const endDrawing = useCallback(() => {
    isDrawingRef.current = false; // Set drawing flag to false
    // After drawing, redraw the entire canvas from the `paths` state to ensure consistent rendering
    redrawCanvas();
  }, [redrawCanvas]);

  // Effect hook to set up and clean up event listeners on the canvas
  // This effect only sets up listeners once because its dependencies (`startDrawing`, `draw`, `endDrawing`) are stable (memoized with useCallback)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseleave', endDrawing); // Stop drawing if mouse leaves canvas area

    // Touch event listeners for mobile devices
    canvas.addEventListener('touchstart', startDrawing, { passive: false }); // Add { passive: false } for preventDefault
    canvas.addEventListener('touchmove', draw, { passive: false });     // Add { passive: false } for preventDefault
    canvas.addEventListener('touchend', endDrawing);
    canvas.addEventListener('touchcancel', endDrawing); // Handle interruptions like calls/notifications

    // Cleanup function: removes event listeners when the component unmounts or dependencies change
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', endDrawing);
      canvas.removeEventListener('mouseleave', endDrawing);

      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', endDrawing);
      canvas.removeEventListener('touchcancel', endDrawing);
    };
  }, [startDrawing, draw, endDrawing]); // These useCallback functions are stable dependencies

  // Handler for clearing the canvas (now "Reset")
  const handleResetCanvas = () => {
    setPaths([]); // Clear all paths
    setUndoStack([]); // Clear undo stack as well
  };

  // Handler for Undo action
  const handleUndo = () => {
    setPaths(prevPaths => {
      if (prevPaths.length === 0) return prevPaths; // Nothing to undo

      const lastPath = prevPaths[prevPaths.length - 1]; // Get the last drawn path
      setUndoStack(prevUndoStack => [...prevUndoStack, lastPath]); // Add it to the undo stack
      const newPaths = prevPaths.slice(0, -1); // Remove it from the paths array
      return newPaths;
    });
  };

  // Handler for Redo action
  const handleRedo = () => {
    setUndoStack(prevUndoStack => {
      if (prevUndoStack.length === 0) return prevUndoStack; // Nothing to redo

      const lastUndonePath = prevUndoStack[prevUndoStack.length - 1]; // Get the last undone path
      setPaths(prevPaths => [...prevPaths, lastUndonePath]); // Add it back to the paths array
      const newUndoStack = prevUndoStack.slice(0, -1); // Remove it from the undo stack
      return newUndoStack;
    });
  };

  // Handler for "Done" button (placeholder as functionality is not specified)
  const handleDone = () => {
    // You can implement saving the drawing, exporting it, etc., here.
    console.log("Drawing finished!");
    // For now, let's just alert a message (will replace with a modal later if needed)
    // alert("Drawing completed!"); // Avoid alert() as per instructions, will remove or replace
  };

  return (
    <>
      {/* Inline styles for the component */}
      <style>
        {`
        body {
            margin: 0;
            overflow-x: hidden; /* Prevent horizontal scroll on small screens */
        }
        .drawing-app-container {
          display: flex;
          flex-direction: column; /* Default to column for small screens */
          align-items: center;
          padding: 1rem; /* p-4 */
          min-height: 100vh;
          background-color: #fce7f3; /* bg-pink-50 */
          font-family: sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @media (min-width: 768px) { /* md breakpoint */
            .drawing-app-container {
                flex-direction: row; /* Change to row for larger screens */
                align-items: flex-start; /* Align items to the top */
                justify-content: center; /* Center content horizontally */
                gap: 2rem; /* Add some space between canvas and controls */
                padding-top: 1rem; /* Adjust padding for side-by-side layout */
            }
        }

        .app-title {
          font-size: 2.25rem; /* text-4xl */
          font-weight: 800; /* font-extrabold */
          color: #1f2937; /* text-gray-800 */
          margin-bottom: 1.5rem; /* mb-6 */
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* drop-shadow-md */
          text-align: center; /* Center title */
          width: 100%; /* Ensure title takes full width */
        }

        @media (min-width: 768px) {
            .app-title {
                position: absolute; /* Position title absolutely */
                top: 1rem; /* Adjust top margin */
                left: 50%; /* Center horizontally */
                transform: translateX(-50%); /* Adjust for horizontal centering */
                margin-bottom: 0; /* Remove bottom margin if positioned absolutely */
                width: auto; /* Allow title to shrink to content width */
            }
        }


        .controls-section {
          display: flex;
          flex-direction: column; /* flex-col */
          align-items: center;
          gap: 1rem; /* gap-4 */
          padding: 1.5rem; /* p-6 */
          background-color: #fff; /* bg-white */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          margin-bottom: 2rem; /* mb-8 */
          max-width: 24rem; /* max-w-sm */
          width: 100%;
          border: 2px solid #fbcfe8; /* border border-pink-200 */
        }

        @media (min-width: 768px) {
            .controls-section {
                max-width: 24rem; /* Set a fixed max-width for controls on larger screens */
                margin-bottom: 0; /* Remove bottom margin when next to canvas */
                flex-shrink: 0; /* Prevent shrinking */
                order: 2; /* Place controls on the right */
            }
        }

        .section-title {
          font-size: 1.25rem; /* text-xl */
          font-weight: 700; /* font-bold */
          color: #374151; /* text-gray-700 */
          margin-bottom: 0.75rem; /* mb-3 */
          text-align: center;
        }

        .tool-buttons-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem; /* gap-3 */
          width: 100%;
        }

        .tool-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem; /* w-16 */
          height: 4rem; /* h-16 */
          border-radius: 0.75rem; /* rounded-xl */
          font-weight: 600; /* font-semibold */
          transition: all 300ms ease-in-out; /* transition duration-300 ease-in-out */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
        }

        .tool-button:hover {
          transform: scale(1.05); /* hover:scale-105 */
        }

        .tool-button svg {
          width: 2rem; /* w-8 */
          height: 2rem; /* h-8 */
        }

        /* Tool button specific styles */
        .tool-button.active-pen {
          background-color: #ec4899; /* bg-pink-500 */
          color: #fff; /* text-white */
          box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3), 0 4px 6px -2px rgba(236, 72, 153, 0.2); /* shadow-pink-300 */
        }
        .tool-button.inactive-pen {
          background-color: #fbcfe8; /* bg-pink-100 */
          color: #be185d; /* text-pink-800 */
        }
        .tool-button.inactive-pen:hover {
          background-color: #fbcfe8; /* hover:bg-pink-200 */
        }

        /* Reusing styles for brush and eraser as they share the same inactive state */
        .tool-button.active-brush, .tool-button.active-eraser {
          background-color: #ec4899;
          color: #fff;
          box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3), 0 4px 6px -2px rgba(236, 72, 153, 0.2);
        }
        .tool-button.inactive-brush, .tool-button.inactive-eraser {
          background-color: #fbcfe8;
          color: #be185d;
        }
        .tool-button.inactive-brush:hover, .tool-button.inactive-eraser:hover {
          background-color: #fbcfe8;
        }

        .thickness-options-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem; /* gap-2 */
          flex-wrap: wrap;
        }

        .thickness-button {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px; /* rounded-full */
          transition: all 200ms ease-in-out; /* transition duration-200 ease-in-out */
        }

        .thickness-button:hover {
          background-color: #d1d5db; /* hover:bg-gray-300 */
        }

        .thickness-button.active {
          background-color: #ec4899; /* bg-pink-500 */
          box-shadow: 0 0 0 2px #fbcfe8; /* ring-2 ring-pink-300 */
        }
        .thickness-button.inactive {
          background-color: #e5e7eb; /* bg-gray-200 */
        }
        .thickness-button .inner-circle {
          border-radius: 9999px; /* rounded-full */
          background-color: #fff; /* bg-white */
          border: 1px solid #9ca3af; /* border border-gray-400 */
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr)); /* grid-cols-6 */
          gap: 0.5rem; /* gap-2 */
          justify-items: center;
        }

        .color-swatch {
          width: 2rem; /* w-8 */
          height: 2rem; /* h-8 */
          border-radius: 0.375rem; /* rounded-md */
          border: 2px solid;
          transition: all 200ms ease-in-out;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
        }

        .color-swatch:hover {
          transform: scale(1.1); /* hover:scale-110 */
        }

        .color-swatch.active {
          border-color: #ec4899; /* border-pink-500 */
          box-shadow: 0 0 0 2px #fbcfe8; /* ring-2 ring-pink-300 */
        }
        .color-swatch.inactive {
          border-color: #d1d5db; /* border-gray-300 */
        }

        .action-buttons-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem; /* gap-3 */
          width: 100%;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem; /* px-4 py-2 */
          border-radius: 0.75rem; /* rounded-xl */
          font-weight: 600; /* font-semibold */
          transition: all 300ms ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
        }

        .action-button:hover {
          transform: scale(1.05);
        }

        .action-button:disabled {
          opacity: 0.5; /* disabled:opacity-50 */
          cursor: not-allowed; /* disabled:cursor-not-allowed */
        }

        .action-button.undo-redo {
          background-color: #e5e7eb; /* bg-gray-200 */
          color: #374151; /* text-gray-800 */
        }
        .action-button.undo-redo:hover:not(:disabled) {
          background-color: #d1d5db; /* hover:bg-gray-300 */
        }

        .action-button.reset {
          padding: 0.75rem 1.5rem; /* px-6 py-3 */
          font-weight: 700; /* font-bold */
          background-color: #ef4444; /* bg-red-500 */
          color: #fff; /* text-white */
        }
        .action-button.reset:hover {
          background-color: #dc2626; /* hover:bg-red-600 */
        }

        .action-button.done {
          padding: 0.75rem 1.5rem; /* px-6 py-3 */
          font-weight: 700; /* font-bold */
          background-color: #ec4899; /* bg-pink-500 */
          color: #fff; /* text-white */
        }
        .action-button.done:hover {
          background-color: #db2777; /* hover:bg-pink-600 */
        }

        .canvas-container {
          border-radius: 0.75rem; /* rounded-xl */
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); /* shadow-2xl */
          background-color: #fff;
          width: 100%;
          max-width: 100%; /* max-w-full */
          flex-grow: 1; /* Allow canvas to grow and take available space */
          margin-top: 1rem; /* Margin from title for small screens */
        }

        @media (min-width: 768px) {
            .canvas-container {
                max-width: 64rem; /* md:max-w-screen-lg */
                margin-top: 0; /* Remove top margin when next to controls */
                order: 1; /* Place canvas on the left */
            }
        }
        @media (min-width: 1024px) { /* lg breakpoint */
          .canvas-container {
            max-width: 80rem; /* lg:max-w-screen-xl */
          }
        }
        `}
      </style>

      {/* Main container for the application, styled with standard CSS */}
      <div className="drawing-app-container">
        {/* Application Title */}
        <h1 className="app-title">
          Sam's Drawing Canvas
        </h1>

        {/* Canvas Container */}
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            // Applying direct inline style for border and background color
            style={{
              border: '5px solid #FBCFE8', // Light pink border
              backgroundColor: '#FFFFFF', // Plain white canvas
              display: 'block',
              width: '100%',
              height: 'auto',
              boxSizing: 'border-box',
            }}
          ></canvas>
        </div>

        {/* Controls Section */}
        <div className="controls-section">

          {/* Brushes Section */}
          <div style={{ width: '100%' }}>
            <h2 className="section-title">Brushes</h2>
            <div className="tool-buttons-container">
              {/* Pen Tool Button */}
              <button
                onClick={() => setSelectedTool('pen')}
                className={`tool-button ${selectedTool === 'pen' ? 'active-pen' : 'inactive-pen'}`}
                title="Pen Tool"
              >
                <Pencil style={{ width: '2rem', height: '2rem' }} />
              </button>
              {/* Brush Tool Button */}
              <button
                onClick={() => setSelectedTool('brush')}
                className={`tool-button ${selectedTool === 'brush' ? 'active-brush' : 'inactive-brush'}`}
                title="Brush Tool"
              >
                <Paintbrush style={{ width: '2rem', height: '2rem' }} />
              </button>
              {/* Eraser Tool Button */}
              <button
                onClick={() => setSelectedTool('eraser')}
                className={`tool-button ${selectedTool === 'eraser' ? 'active-eraser' : 'inactive-eraser'}`}
                title="Eraser Tool"
              >
                <Eraser style={{ width: '2rem', height: '2rem' }} />
              </button>
            </div>
          </div>

          {/* Thickness Section */}
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <h2 className="section-title">Thickness</h2>
            <div className="thickness-options-container">
              {brushSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`thickness-button ${brushSize === size ? 'active' : 'inactive'}`}
                  style={{
                    width: `${size + 18}px`, // Adjust size for visual distinction and padding
                    height: `${size + 18}px`,
                    minWidth: '24px', // Minimum size for very small brushes
                    minHeight: '24px',
                    padding: `${size / 4}px`, // Dynamic padding
                  }}
                  title={`${size}px`}
                >
                  <div
                    className="inner-circle"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      minWidth: '6px', // Minimum size for the inner circle
                      minHeight: '6px',
                    }}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Section */}
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <h2 className="section-title">Color</h2>
            <div className="color-grid">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setDrawingColor(color)}
                  className={`color-swatch ${drawingColor === color ? 'active' : 'inactive'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>

          {/* Action Section */}
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <h2 className="section-title">Action</h2>
            <div className="action-buttons-container">
              <button
                onClick={handleUndo}
                disabled={paths.length === 0}
                className="action-button undo-redo"
                title="Undo"
              >
                <Undo2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={undoStack.length === 0}
                className="action-button undo-redo"
                title="Redo"
              >
                <Redo2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} /> Redo
              </button>
            </div>
            <div className="action-buttons-container" style={{ marginTop: '0.75rem' }}>
              <button
                onClick={handleResetCanvas}
                className="action-button reset"
                title="Reset Canvas"
              >
                <Trash2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} /> Reset
              </button>
              <button
                onClick={handleDone}
                className="action-button done"
                title="Done"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanvasDrawingApp;
