import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Paintbrush, Eraser, ZoomIn, ZoomOut, Trash2 } from 'lucide-react'; // Importing icons

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
  const [zoomLevel, setZoomLevel] = useState(1); // Current zoom level for the canvas content

  // State to store all drawn paths. Each path is an object containing tool, size, color, and points.
  // This allows redrawing the canvas content when its size changes or when cleared/restored.
  const [paths, setPaths] = useState([]); // Array of { tool, size, color, points: [{x, y}] }

  // Effect to keep refs synchronized with their corresponding state values
  // This ensures event handlers (which use refs) always have the latest tool, size, and color
  useEffect(() => {
    selectedToolRef.current = selectedTool;
    brushSizeRef.current = brushSize;
    drawingColorRef.current = drawingColor;
  }, [selectedTool, brushSize, drawingColor]);

  // useCallback memoizes the redrawCanvas function. It will only be re-created if `paths` or `zoomLevel` changes.
  // This function iterates through all stored paths and redraws them on the canvas, applying the current zoom.
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas is available
    const ctx = canvas.getContext('2d'); // Get the 2D rendering context

    // Clear the entire canvas before redrawing all paths
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // Save the current state of the canvas context

    // Apply the zoom transformation to the canvas context
    ctx.scale(zoomLevel, zoomLevel);

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

      // Determine line width based on the tool and adjust for zoom level
      // Eraser uses the brush size for its stroke width
      const lineWidth = path.tool === 'pen' ? 2 : path.size;
      ctx.lineWidth = lineWidth / zoomLevel;

      ctx.lineCap = 'round';       // Make line endings rounded
      ctx.lineJoin = 'round';      // Make line joins rounded

      // Set globalCompositeOperation for eraser functionality
      // 'destination-out' makes new shapes transparent where they overlap with existing ones.
      ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.stroke();                // Render the path
    });

    ctx.restore(); // Restore the canvas context state (removes the scaling and composite operation)
  }, [paths, zoomLevel]); // `paths` and `zoomLevel` are dependencies because `redrawCanvas` reads from them

  // Effect hook to re-render the canvas content whenever `canvasWidth`, `canvasHeight` change
  // or when `paths` or `zoomLevel` are updated (handled by `redrawCanvas`'s dependencies).
  useEffect(() => {
    redrawCanvas();
  }, [canvasWidth, canvasHeight, redrawCanvas]); // `redrawCanvas` is a dependency

  // Helper function to get mouse/touch coordinates relative to the canvas,
  // accounting for canvas scaling and current zoom level.
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
      clientY = event.clientX; // This was a bug: should be event.clientY
    }

    // Corrected clientY assignment
    if (event.touches && event.touches.length > 0) {
      clientY = event.touches[0].clientY;
    } else {
      clientY = event.clientY;
    }

    // Calculate scaling factors if canvas is resized by CSS (e.g., width: 100%)
    // This ensures drawing on the correct internal canvas pixel, not just the rendered CSS pixel.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Return coordinates relative to the canvas's top-left corner, adjusted for zoom
    return {
      x: (clientX - rect.left) * scaleX / zoomLevel,
      y: (clientY - rect.top) * scaleY / zoomLevel,
    };
  }, [zoomLevel]); // `zoomLevel` is a dependency here

  // Event handler for when drawing starts (mouse down or touch start)
  // Memoized with useCallback to keep it stable for event listener setup
  const startDrawing = useCallback((event) => {
    isDrawingRef.current = true; // Set drawing flag to true
    const coordinates = getCoordinates(event); // Get starting coordinates

    // Add a new path object to the `paths` state
    setPaths(prevPaths => [
      ...prevPaths,
      {
        tool: selectedToolRef.current, // Use current tool from ref
        size: brushSizeRef.current,   // Use current brush size from ref
        color: drawingColorRef.current, // Use current color from ref
        points: [coordinates]         // Start with the initial point
      }
    ]);
  }, [getCoordinates]); // `getCoordinates` is a dependency

  // Event handler for drawing movement (mouse move or touch move)
  // Memoized with useCallback
  const draw = useCallback((event) => {
    if (!isDrawingRef.current) return; // Only draw if drawing is active
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

            // Determine line width based on the current tool and adjust for zoom level
            const lineWidth = selectedToolRef.current === 'pen' ? 2 : brushSizeRef.current;
            ctx.lineWidth = lineWidth / zoomLevel;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Set globalCompositeOperation for eraser functionality during live drawing
            ctx.globalCompositeOperation = selectedToolRef.current === 'eraser' ? 'destination-out' : 'source-over';

            const lastPoint = currentPathPoints[currentPathPoints.length - 2]; // Get the previous point
            // Apply zoom for live drawing to match the scaled context
            ctx.moveTo(lastPoint.x * zoomLevel, lastPoint.y * zoomLevel);
            ctx.lineTo(coordinates.x * zoomLevel, coordinates.y * zoomLevel);
            ctx.stroke(); // Render the segment
        }
        return updatedPaths; // Return the updated paths array
    });
  }, [getCoordinates, zoomLevel]); // `getCoordinates` and `zoomLevel` are dependencies

  // Event handler for when drawing ends (mouse up, touch end, mouse leave, touch cancel)
  // Memoized with useCallback
  const endDrawing = useCallback(() => {
    isDrawingRef.current = false; // Set drawing flag to false
    // After drawing, redraw the entire canvas from the `paths` state to ensure consistent rendering
    redrawCanvas();
  }, [redrawCanvas]); // `redrawCanvas` is a dependency

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
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
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

  // Handler for clearing the canvas
  const clearCanvas = () => {
    setPaths([]); // Reset the paths array, which will trigger `redrawCanvas` to clear the visual canvas
  };

  // Handler for enlarging/zooming in the canvas content
  const handleEnlargeCanvas = () => {
    setZoomLevel(prevZoom => prevZoom * 1.1); // Increase zoom level by 10%
  };

  // Handler for shrinking/zooming out the canvas content
  const handleShrinkCanvas = () => {
    setZoomLevel(prevZoom => Math.max(0.25, prevZoom / 1.1)); // Decrease zoom level by 10%, with a minimum of 25%
  };

  return (
    // Main container for the application, styled with Tailwind CSS for responsiveness and aesthetics
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100 font-sans antialiased">
      {/* Application Title */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 drop-shadow-md">
        React Canvas Drawing App
      </h1>

      {/* Controls Section */}
      <div className="flex flex-wrap justify-center items-center gap-4 p-4 bg-white rounded-xl shadow-lg mb-8 max-w-4xl w-full">
        {/* Pen Tool Button */}
        <button
          onClick={() => setSelectedTool('pen')}
          className={`flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition duration-300 ease-in-out transform hover:scale-105
            ${selectedTool === 'pen' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`
          }
          title="Pen Tool"
        >
          <Pencil className="w-5 h-5 mr-2" /> Pen
        </button>
        {/* Brush Tool Button */}
        <button
          onClick={() => setSelectedTool('brush')}
          className={`flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition duration-300 ease-in-out transform hover:scale-105
            ${selectedTool === 'brush' ? 'bg-green-600 text-white shadow-md' : 'bg-green-100 text-green-800 hover:bg-green-200'}`
          }
          title="Brush Tool"
        >
          <Paintbrush className="w-5 h-5 mr-2" /> Brush
        </button>
        {/* Eraser Tool Button */}
        <button
          onClick={() => setSelectedTool('eraser')}
          className={`flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition duration-300 ease-in-out transform hover:scale-105
            ${selectedTool === 'eraser' ? 'bg-yellow-600 text-white shadow-md' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`
          }
          title="Eraser Tool"
        >
          <Eraser className="w-5 h-5 mr-2" /> Eraser
        </button>

        {/* Brush Size Slider */}
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg shadow-sm">
          <label htmlFor="brushSize" className="text-gray-700 font-medium whitespace-nowrap">Brush Size:</label>
          <input
            type="range"
            id="brushSize"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-600"
          />
          <span className="text-gray-700 font-bold">{brushSize}px</span>
        </div>

        {/* Color Picker */}
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg shadow-sm">
          <label htmlFor="drawingColor" className="text-gray-700 font-medium">Color:</label>
          <input
            type="color"
            id="drawingColor"
            value={drawingColor}
            onChange={(e) => setDrawingColor(e.target.value)}
            className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 shadow-inner"
          />
        </div>

        {/* Enlarge Canvas Button (Zoom In) */}
        <button
          onClick={handleEnlargeCanvas}
          className="flex items-center justify-center px-4 py-2 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 mr-2" /> Zoom In ({Math.round(zoomLevel * 100)}%)
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={handleShrinkCanvas}
          className="flex items-center justify-center px-4 py-2 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-600 transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 mr-2" /> Zoom Out
        </button>

        {/* Clear Canvas Button */}
        <button
          onClick={clearCanvas}
          className="flex items-center justify-center px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5 mr-2" /> Clear Canvas
        </button>
      </div>

      {/* Canvas Container */}
      <div className="border-4 border-gray-300 rounded-xl overflow-hidden shadow-2xl bg-white w-full max-w-full md:max-w-screen-lg lg:max-w-screen-xl">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="bg-white block w-full h-auto" // Canvas fills its container width, height adjusts proportionally
        ></canvas>
      </div>
    </div>
  );
};

export default CanvasDrawingApp;
