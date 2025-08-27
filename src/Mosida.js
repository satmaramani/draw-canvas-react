// mosida_coloring_tool.jsx
import React, { useRef, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { Canvas, Circle, Rect } from 'fabric';

export default function MosidaColoringTool() {
 const canvasRef = useRef(null);
 const [canvas, setCanvas] = useState(null);
 const [color, setColor] = useState('hashtag#FF5733');

 useEffect(() => {
 const canvasInstance = new Canvas('mosida-canvas', {
 isDrawingMode: true,
 backgroundColor: 'hashtag#ffffff',
 width: 600,
 height: 500,
 });
 canvasInstance.freeDrawingBrush.color = color;
 canvasInstance.freeDrawingBrush.width = 5;
 setCanvas(canvasInstance);
 }, []);

 useEffect(() => {
 if (canvas) {
 canvas.freeDrawingBrush.color = color;
 }
 }, [color]);

 const clearCanvas = () => {
 canvas.clear();
 canvas.backgroundColor = 'hashtag#ffffff';
 canvas.renderAll();
 };

 return (
 <div className="flex flex-col items-center gap-4 p-4">
 <h2 className="text-xl font-bold">TechySam Online Coloring Tool</h2>
 <SketchPicker color={color} onChangeComplete={(c) => setColor(c.hex)} />
 <canvas id="mosida-canvas" className="border border-gray-300 rounded"></canvas>
 <button onClick={clearCanvas} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
 Clear Canvas
 </button>
 </div>
 );
}