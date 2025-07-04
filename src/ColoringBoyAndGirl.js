import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
  '#000000', '#2F4F4F', '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#FFFFFF',
  '#FF0000', '#FF6347', '#FF4500', '#DC143C', '#B22222', '#8B0000',
  '#FFA500', '#FFD700', '#FFFF00', '#F0E68C', '#EEE8AA', '#BDB76B',
  '#00FF00', '#7CFC00', '#7FFF00', '#32CD32', '#00FA9A', '#228B22', '#006400',
  '#00FFFF', '#00CED1', '#20B2AA', '#48D1CC', '#40E0D0', '#5F9EA0', '#4682B4',
  '#0000FF', '#1E90FF', '#4169E1', '#00008B', '#191970', '#6495ED', '#87CEFA',
  '#8A2BE2', '#9932CC', '#8B008B', '#800080', '#DA70D6', '#DDA0DD', '#FF00FF',
  '#F5DEB3', '#DEB887', '#D2B48C', '#BC8F8F', '#A0522D', '#8B4513', '#CD853F'
];

const ColoringBoyAndGirl = () => {
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
      255
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

  const colorsMatch = (a, b, tolerance = 32) => {
    return (
      Math.abs(a[0] - b[0]) <= tolerance &&
      Math.abs(a[1] - b[1]) <= tolerance &&
      Math.abs(a[2] - b[2]) <= tolerance &&
      Math.abs(a[3] - b[3]) <= tolerance
    );
  };

  const floodFill = (ctx, x, y, fillColor) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const targetColor = getPixel(imageData, x, y);
    if (colorsMatch(targetColor, fillColor)) return;

    const stack = [[x, y]];
    const visited = new Set();

    const width = imageData.width;
    const height = imageData.height;

    const getIndex = (x, y) => y * width + x;

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      const index = getIndex(cx, cy);
      if (visited.has(index)) continue;
      visited.add(index);

      const currentColor = getPixel(imageData, cx, cy);
      if (!colorsMatch(currentColor, targetColor)) continue;

      setPixel(imageData, cx, cy, fillColor);

      if (cx > 0) stack.push([cx - 1, cy]);
      if (cx < width - 1) stack.push([cx + 1, cy]);
      if (cy > 0) stack.push([cx, cy - 1]);
      if (cy < height - 1) stack.push([cx, cy + 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
  
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
  
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
  
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
            maxWidth: '100%',
            cursor: 'crosshair',
          }}
        />
        <img
          ref={imageRef}
          src="/picaso.png" // Change this to your Picasso-style PNG image path
          alt="Coloring"
          style={{ display: 'none' }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
};

export default ColoringBoyAndGirl;
