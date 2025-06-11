// ColoringPage.js
import React, { useState } from 'react';
import WalkingKidsSvg from './WalkingKidsSvg';

const COLORS = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fff', '#000'];

const ColoringPage = () => {
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [fillMap, setFillMap] = useState({});

  const pickColor = color => setCurrentColor(color);

  const handleSectionClick = id => {
    setFillMap(prev => ({
      ...prev,
      [id]: prev[id] === currentColor ? '#fff' : currentColor, // toggle or fill
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => pickColor(c)}
            style={{
              background: c,
              width: 30,
              height: 30,
              margin: 2,
              border: currentColor === c ? '3px solid #000' : '1px solid #ccc',
            }}
          />
        ))}
      </div>

      <div style={{ border: '1px solid #ccc', width: 'max-content' }}>
        <WalkingKidsSvg
          onSectionClick={handleSectionClick}
          fillMap={fillMap}
        />
      </div>
    </div>
  );
};

export default ColoringPage;
