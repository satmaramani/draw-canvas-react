import React, { useEffect, useState, useCallback } from 'react';

// A simple SVG outline for demonstration purposes.
// In a real application, this would be a more complex coloring page SVG
// where each fillable area is a distinct <path> or other shape element with a unique 'id'.
const DEFAULT_SVG_CONTENT = `
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- House Body -->
  <path id="house-body" d="M150 250 L150 400 H350 V250 Z" stroke="black" strokeWidth="2"/>
  <!-- House Roof -->
  <path id="house-roof" d="M150 250 L250 150 L350 250 Z" stroke="black" strokeWidth="2"/>
  <!-- Door -->
  <path id="house-door" d="M220 300 V400 H280 V300 Z" stroke="black" strokeWidth="2"/>
  <!-- Window Left -->
  <rect id="window-left" x="170" y="270" width="30" height="30" stroke="black" strokeWidth="2"/>
  <!-- Window Right -->
  <rect id="window-right" x="300" y="270" width="30" height="30" stroke="black" strokeWidth="2"/>
  <!-- Cloud 1 -->
  <path id="cloud-1" d="M400 100 C380 70, 350 70, 330 100 C300 110, 300 130, 330 140 C350 170, 380 170, 400 140 C430 130, 430 110, 400 100 Z" stroke="black" strokeWidth="2"/>
  <!-- Cloud 2 -->
  <path id="cloud-2" d="M500 150 C480 120, 450 120, 430 150 C400 160, 400 180, 430 190 C450 220, 480 220, 500 190 C530 180, 530 160, 500 150 Z" stroke="black" strokeWidth="2"/>
</svg>
`;


const ColoringBookApp = () => {
  // State to store the currently selected color for painting
  const [selectedColor, setSelectedColor] = useState('#FF0000'); // Default to red

  // State to store the fill color for each SVG path (keyed by path 'id')
  const [filledPaths, setFilledPaths] = useState({});

  // States for custom RGB color mixing
  const [redValue, setRedValue] = useState(0);
  const [greenValue, setGreenValue] = useState(0);
  const [blueValue, setBlueValue] = useState(0);

  // Predefined color palette as seen in the screenshot
  const colors = [
    '#FF0000', '#0000FF', '#008000', '#FFFF00', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000000', '#FFFFFF', '#ADD8E6',
    '#FFD700', '#DAA520', '#B0C4DE', '#E6E6FA', '#7CFC00', '#00FFFF',
    '#FF6347', '#4682B4', '#DDA0DD', '#F0E68C', '#F5DEB3', '#D3D3D3'
  ];

  // Callback function to handle clicking on an SVG path
  const handleSvgPathClick = useCallback((event) => {
    // Get the ID of the clicked SVG element
    const pathId = event.target.id;
    if (pathId) {
      // Update the fill color for the clicked path
      setFilledPaths(prevFilledPaths => ({
        ...prevFilledPaths,
        [pathId]: selectedColor, // Set the fill color to the currently selected color
      }));
    }
  }, [selectedColor]); // Recreate this function if selectedColor changes

  // Effect to update the combined selectedColor when RGB values change
  useEffect(() => {
    const r = Math.min(255, Math.max(0, parseInt(redValue)));
    const g = Math.min(255, Math.max(0, parseInt(greenValue)));
    const b = Math.min(255, Math.max(0, parseInt(blueValue)));
    const hexColor = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
    setSelectedColor(hexColor);
  }, [redValue, greenValue, blueValue]);


  return (
    <>
      {/* Inline styles for the component */}
      <style>
        {`
        body {
            margin: 0;
            overflow-x: hidden; /* Prevent horizontal scroll on small screens */
        }
        .coloring-app-container {
          display: flex;
          flex-direction: column; /* Default to column for small screens */
          align-items: center;
          padding: 1rem;
          min-height: 100vh;
          background-color: #fce7f3; /* Light pink background */
          font-family: 'Inter', sans-serif; /* Using Inter font */
          color: #333;
          position: relative; /* For absolute positioning of title */
        }

        @media (min-width: 768px) { /* md breakpoint */
            .coloring-app-container {
                flex-direction: row; /* Change to row for larger screens */
                align-items: flex-start; /* Align items to the top */
                justify-content: center; /* Center content horizontally */
                gap: 2rem; /* Space between canvas and controls */
                padding-top: 5rem; /* Adjust padding for absolute title */
            }
        }

        .app-title {
          font-size: 2.5rem; /* Larger title */
          font-weight: 800;
          color: #1a202c; /* Darker gray for prominence */
          text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem; /* More space below title on small screens */
        }

        @media (min-width: 768px) {
            .app-title {
                position: absolute;
                top: 1rem;
                left: 50%;
                transform: translateX(-50%);
                margin-bottom: 0;
            }
        }

        .image-container {
          flex-grow: 1; /* Allows image to take available space */
          max-width: 100%;
          border: 4px solid #fbcfe8; /* Light pink border */
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem; /* Space on small screens */
        }

        @media (min-width: 768px) {
            .image-container {
                max-width: 60%; /* Canvas takes more space on larger screens */
                margin-bottom: 0;
            }
        }

        .coloring-svg {
            display: block;
            width: 100%;
            height: auto;
            max-height: calc(100vh - 100px); /* Adjust based on header/footer */
        }

        .coloring-svg path, .coloring-svg rect {
            cursor: pointer; /* Indicate clickable areas */
            transition: fill 0.2s ease-in-out; /* Smooth color transition */
        }

        .controls-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Increased gap for sections */
          padding: 1.5rem;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          max-width: 300px; /* Fixed width for controls */
          width: 100%;
          border: 2px solid #fbcfe8;
          flex-shrink: 0; /* Prevent shrinking */
        }

        .section-header {
            font-size: 1.15rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 0.75rem;
            text-align: center;
        }

        .color-palette-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr); /* 4 columns for colors */
          gap: 0.75rem; /* Gap between swatches */
          justify-items: center;
        }

        .color-swatch {
          width: 40px; /* Larger swatches */
          height: 40px;
          border-radius: 50%; /* Circular swatches */
          border: 2px solid #ccc;
          cursor: pointer;
          transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .color-swatch:hover {
          transform: scale(1.1);
        }

        .color-swatch.active {
          border-color: #ec4899; /* Pink border for active */
          box-shadow: 0 0 0 3px #fbcfe8; /* Ring for active */
        }

        .rgb-slider-group {
            margin-top: 1rem;
            padding: 0.75rem;
            border: 1px solid #eee;
            border-radius: 8px;
            background-color: #f9f9f9;
        }

        .rgb-slider-group label {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #555;
        }

        .rgb-slider-group input[type="range"] {
            width: 100%;
            height: 8px;
            border-radius: 5px;
            -webkit-appearance: none;
            margin-left: 0.5rem;
        }

        .rgb-slider-group input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid #ccc;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            margin-top: -5px; /* Adjust thumb position */
        }

        .rgb-slider-group input[type="range"].red-slider::-webkit-slider-runnable-track { background: linear-gradient(to right, #ccc, red); }
        .rgb-slider-group input[type="range"].green-slider::-webkit-slider-runnable-track { background: linear-gradient(to right, #ccc, green); }
        .rgb-slider-group input[type="range"].blue-slider::-webkit-slider-runnable-track { background: linear-gradient(to right, #ccc, blue); }

        .rgb-value-display {
            margin-left: 0.5rem;
            font-weight: bold;
            min-width: 25px; /* Ensure space for values */
            text-align: right;
        }

        .action-button-group {
          display: flex;
          flex-direction: column; /* Buttons stacked */
          gap: 0.75rem; /* Gap between action buttons */
          margin-top: 1rem;
        }

        .action-button {
          padding: 0.75rem 1.25rem; /* Larger padding */
          border-radius: 8px; /* Slightly less rounded */
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: none; /* No default button border */
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
        }

        .action-button.reset {
          background-color: #ef4444; /* Red */
          color: #fff;
        }
        .action-button.reset:hover {
          background-color: #dc2626; /* Darker red */
        }

        .action-button.done {
          background-color: #ec4899; /* Pink */
          color: #fff;
        }
        .action-button.done:hover {
          background-color: #db2777; /* Darker pink */
        }

        /* "More Pages" styled as a prominent button */
        .more-pages-button {
            background-color: #4CAF50; /* Green */
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s ease, transform 0.2s ease;
            margin-bottom: 2rem; /* Space below it */
        }

        .more-pages-button:hover {
            background-color: #45a049;
            transform: translateY(-2px);
        }
        `}
      </style>

      <div className="coloring-app-container">
        {/* Application Title - Positioned absolutely for wider screens */}
        <h1 className="app-title">
          Girl & Boy Walking in the Park
        </h1>

        {/* More Pages Button - Placed above the main content area */}
        <div className="more-pages-button" onClick={() => console.log("More Pages clicked!")}>
            More Pages
        </div>


        {/* Image Container (Canvas equivalent for SVG) */}
        <div className="image-container">
          {/* Dynamically set innerHTML to render SVG content */}
          <div
            className="coloring-svg"
            dangerouslySetInnerHTML={{
              __html: DEFAULT_SVG_CONTENT.replace(/id="([^"]+)"/g, (match, id) => {
                // Apply fill color from state, default to transparent if not colored
                const fillColor = filledPaths[id] || 'transparent';
                // Also ensure outlines are black, not replaced by fill
                return `id="${id}" fill="${fillColor}" stroke="black" strokeWidth="2"`;
              })
            }}
            // Attach click listener to the container and use event delegation
            onClick={handleSvgPathClick}
          ></div>
        </div>

        {/* Controls Panel (Right side) */}
        <div className="controls-panel">
          <h2 className="section-header">Pick a color, then click on a section of the picture.</h2>

          {/* Colors Section */}
          <div>
            <h3 className="section-header">Colors</h3>
            <div className="color-palette-grid">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                ></div>
              ))}
            </div>
          </div>

          {/* Mix Your Own Color Section */}
          <div>
            <h3 className="section-header">Mix your own color</h3>
            <div className="rgb-slider-group">
              <label>
                Red:
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={redValue}
                  onChange={(e) => setRedValue(parseInt(e.target.value))}
                  className="red-slider"
                />
                <span className="rgb-value-display">{redValue}</span>
              </label>
              <label>
                Green:
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={greenValue}
                  onChange={(e) => setGreenValue(parseInt(e.target.value))}
                  className="green-slider"
                />
                <span className="rgb-value-display">{greenValue}</span>
              </label>
              <label>
                Blue:
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={blueValue}
                  onChange={(e) => setBlueValue(parseInt(e.target.value))}
                  className="blue-slider"
                />
                <span className="rgb-value-display">{blueValue}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div>
            <h3 className="section-header">Action</h3>
            <div className="action-button-group">
              <button
                onClick={() => setFilledPaths({})} // Clear all colors
                className="action-button reset"
                title="Reset All Colors"
              >
                Reset
              </button>
              <button
                onClick={() => console.log("Done with coloring!", filledPaths)}
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

export default ColoringBookApp;
