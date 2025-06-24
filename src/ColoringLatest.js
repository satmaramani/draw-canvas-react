import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
  '#0099FF', '#0000FF', '#FF0000', '#FF00FF', '#FFFF00',
  '#FFDAB9', '#8B4513', '#00FFFF', '#00FF00', '#228B22',
  '#FFFFFF', '#C0C0C0', '#000000', '#800080', '#FFA500'
];

const ColoringCanvas = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, []);

  const hexToRgba = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255,
      255,
    ];
  };

  const getPixel = (imageData, x, y) => {
    const i = (y * imageData.width + x) * 4;
    return imageData.data.slice(i, i + 4);
  };

  const setPixel = (imageData, x, y, color) => {
    const i = (y * imageData.width + x) * 4;
    imageData.data[i + 0] = color[0];
    imageData.data[i + 1] = color[1];
    imageData.data[i + 2] = color[2];
    imageData.data[i + 3] = color[3];
  };

  const colorsMatch = (a, b) =>
    a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

  const floodFill = (ctx, x, y, fillColor) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const targetColor = getPixel(imageData, x, y);
    if (colorsMatch(targetColor, fillColor)) return;

    const stack = [[x, y]];

    while (stack.length) {
      const [cx, cy] = stack.pop();
      const currentColor = getPixel(imageData, cx, cy);

      if (!colorsMatch(currentColor, targetColor)) continue;

      setPixel(imageData, cx, cy, fillColor);

      if (cx > 0) stack.push([cx - 1, cy]);
      if (cx < imageData.width - 1) stack.push([cx + 1, cy]);
      if (cy > 0) stack.push([cx, cy - 1]);
      if (cy < imageData.height - 1) stack.push([cx, cy + 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const fillColor = hexToRgba(selectedColor);
    floodFill(ctx, x, y, fillColor);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Color Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'sans-serif', fontWeight: 'bold' }}>Colors</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 30px)',
          gap: '10px',
          marginBottom: '10px'
        }}>
          {COLORS.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: color,
                border: selectedColor === color ? '3px solid black' : '1px solid #888',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
  ref={canvasRef}
  onClick={handleCanvasClick}
  style={{
    border: '1px solid black',
    cursor: 'url("/pencil_cursor.png") 4 4, auto',
    maxWidth: '100%',
  }}
/>
        <img
          ref={imageRef}
          src="/random.png" // <-- your original working image
          alt="Coloring"
          style={{ display: 'none' }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
};

export default ColoringCanvas;
