import React, { useRef, useState, useEffect } from 'react';
import { FaTrash, FaExpandAlt, FaCompressAlt, FaRedo, FaUndo, FaEdit } from 'react-icons/fa';

const MultiTextCanvasEditor = () => {
  const canvasRef = useRef(null);
  const [texts, setTexts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    texts.forEach((textObj) => {
      const { x, y, text, fontSize, rotation } = textObj;
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

  useEffect(() => {
    draw();
  }, [texts]);

  const addText = () => {
    const newText = {
      id: Date.now(),
      x: 150,
      y: 150,
      text: 'Edit Me',
      fontSize: 30,
      rotation: 0,
    };
    setTexts([...texts, newText]);
    setSelectedId(newText.id);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.icon-toolbar')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (Math.sqrt(dx * dx + dy * dy) < t.fontSize * 1.2) {
        setSelectedId(t.id);
        canvasRef.current.dataset.dragging = t.id;
        canvasRef.current.dataset.offsetX = dx;
        canvasRef.current.dataset.offsetY = dy;
        return;
      }
    }
    setSelectedId(null);
  };

  const handleMouseMove = (e) => {
    const draggingId = canvasRef.current.dataset.dragging;
    if (!draggingId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - Number(canvasRef.current.dataset.offsetX);
    const y = e.clientY - rect.top - Number(canvasRef.current.dataset.offsetY);

    setTexts((prev) =>
      prev.map((t) =>
        t.id === Number(draggingId) ? { ...t, x, y } : t
      )
    );
  };

  const handleMouseUp = () => {
    canvasRef.current.dataset.dragging = '';
  };

  const updateText = (id, changes) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  };

  const deleteText = (id) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
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

  return (
    <div style={{ padding: 20 }}>
      <button onClick={addText} style={{ marginBottom: 10 }}>
        ➕ Add Text
      </button>
      <div
        style={{ position: 'relative', width: '100%', maxWidth: 600 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{ border: '1px solid black', width: '100%' }}
        />
        {texts.map((t) => (
          <div
            key={t.id}
            className="icon-toolbar"
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y - t.fontSize - 30,
              transform: 'translate(-50%, -50%)',
              display: selectedId === t.id ? 'flex' : 'none',
              gap: '6px',
              background: 'rgba(255,255,255,0.95)',
              padding: '4px 8px',
              borderRadius: '6px',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <FaEdit
              onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
              title="Edit Text"
              style={{ cursor: 'pointer', color: '#007bff' }}
            />
            <FaUndo
              onClick={(e) => { e.stopPropagation(); updateText(t.id, { rotation: t.rotation - 10 }); }}
              title="Rotate Left"
              style={{ cursor: 'pointer', color: '#6f42c1' }}
            />
            <FaRedo
              onClick={(e) => { e.stopPropagation(); updateText(t.id, { rotation: t.rotation + 10 }); }}
              title="Rotate Right"
              style={{ cursor: 'pointer', color: '#28a745' }}
            />
            <FaCompressAlt
              onClick={(e) => { e.stopPropagation(); updateText(t.id, { fontSize: Math.max(10, t.fontSize - 4) }); }}
              title="Decrease Size"
              style={{ cursor: 'pointer', color: '#17a2b8' }}
            />
            <FaExpandAlt
              onClick={(e) => { e.stopPropagation(); updateText(t.id, { fontSize: t.fontSize + 4 }); }}
              title="Increase Size"
              style={{ cursor: 'pointer', color: '#ffc107' }}
            />
            <FaTrash
              onClick={(e) => { e.stopPropagation(); deleteText(t.id); }}
              title="Delete"
              style={{ cursor: 'pointer', color: '#dc3545' }}
            />
          </div>
        ))}

        {editingId && (
          <form
            onSubmit={handleEditSubmit}
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 20
            }}
          >
            <input
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              style={{ padding: '6px', width: '200px' }}
            />
            <button type="submit" style={{ marginLeft: '10px' }}>Save</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MultiTextCanvasEditor;
