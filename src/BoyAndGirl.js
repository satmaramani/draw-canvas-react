import React, { useState } from "react";

const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#FFC0CB", "#FFFFFF"];

export default function ColoringPage() {
  const [selectedColor, setSelectedColor] = useState("#000000");

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handlePartClick = (e) => {
    if (e.target.tagName === "path" || e.target.tagName === "g") {
      e.target.setAttribute("fill", selectedColor);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Walking Boy & Girl Coloring Page</h2>

      {/* Color Palette */}
      <div style={{ marginBottom: "10px" }}>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorChange(color)}
            style={{
              backgroundColor: color,
              width: 30,
              height: 30,
              margin: "0 5px",
              border: selectedColor === color ? "3px solid black" : "1px solid gray",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* SVG coloring area */}
      <div onClick={handlePartClick}>
        {/* Insert the actual SVG below. For demo purposes, this is a simplified placeholder. Replace this with the real SVG from the RoomRecess game */}
        <svg
          viewBox="0 0 300 300"
          width="300"
          height="300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Replace these shapes with real SVG parts from the game */}
          <g>
            <path d="M50 50 H150 V150 H50 Z" fill="#ffffff" stroke="#000000" />
            <path d="M160 50 H260 V150 H160 Z" fill="#ffffff" stroke="#000000" />
          </g>
        </svg>
      </div>
    </div>
  );
}
