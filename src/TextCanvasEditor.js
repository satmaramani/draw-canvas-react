import React, { useRef, useState, useEffect } from 'react';
import {
  FaTrash,
  FaExpandAlt,
  FaCompressAlt,
  FaRedo,
  FaUndo,
  FaEdit,
  FaImage,
  FaDownload
} from 'react-icons/fa';

const MultiTextCanvasEditor = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'text' or 'image'
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // 🔽 Fill white background to fix black background issue on export
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
  
  useEffect(() => {
    draw();
  }, [texts, images]);

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
      const maxWidth = 150; // Smaller image width
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

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // PRIORITIZE TEXT SELECTION FIRST
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

    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      const dx = x - img.x;
      const dy = y - img.y;
      if (Math.abs(dx) < img.width / 2 && Math.abs(dy) < img.height / 2) {
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
    const draggingId = canvasRef.current.dataset.dragging;
    const type = canvasRef.current.dataset.type;
    if (!draggingId || !type) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - Number(canvasRef.current.dataset.offsetX);
    const y = e.clientY - rect.top - Number(canvasRef.current.dataset.offsetY);

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
    canvasRef.current.dataset.dragging = '';
    canvasRef.current.dataset.type = '';
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

  return (
    <div style={{ padding: 20 }}>
      <button onClick={addText}>➕ Add Text</button>
      <button onClick={() => fileInputRef.current.click()} style={{ marginLeft: 10 }}>
        🖼️ Upload Image
      </button>
      <button onClick={handleDownload} style={{ marginLeft: 10 }}>
        <FaDownload /> Download as Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      <div
        style={{ position: 'relative', width: '100%', maxWidth: 700 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
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

        {images.map((img) => (
          <div
            key={img.id}
            className="icon-toolbar"
            style={{
              position: 'absolute',
              left: img.x,
              top: img.y - img.height / 2 - 30,
              transform: 'translate(-50%, -50%)',
              display: selectedId === img.id && selectedType === 'image' ? 'flex' : 'none',
              gap: '6px',
              background: 'rgba(255,255,255,0.95)',
              padding: '4px 8px',
              borderRadius: '6px',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <FaUndo onClick={(e) => { e.stopPropagation(); updateImage(img.id, { rotation: img.rotation - 10 }); }} title="Rotate Left" style={{ cursor: 'pointer' }} />
            <FaRedo onClick={(e) => { e.stopPropagation(); updateImage(img.id, { rotation: img.rotation + 10 }); }} title="Rotate Right" style={{ cursor: 'pointer' }} />
            <FaCompressAlt onClick={(e) => { e.stopPropagation(); updateImage(img.id, { width: img.width * 0.9, height: img.height * 0.9 }); }} title="Shrink" style={{ cursor: 'pointer' }} />
            <FaExpandAlt onClick={(e) => { e.stopPropagation(); updateImage(img.id, { width: img.width * 1.1, height: img.height * 1.1 }); }} title="Enlarge" style={{ cursor: 'pointer' }} />
            <FaImage onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.onchange = (ev) => handleImageUpload(ev, img.id);
              fileInputRef.current.click();
            }} title="Reupload" style={{ cursor: 'pointer' }} />
            <FaTrash onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }} title="Delete" style={{ cursor: 'pointer', color: 'red' }} />
          </div>
        ))}

        {editingId && (
          <form onSubmit={handleEditSubmit} style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            background: '#fff', padding: '10px', borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 20
          }}>
            <input value={editingText} onChange={(e) => setEditingText(e.target.value)} style={{ padding: '6px', width: '200px' }} />
            <button type="submit" style={{ marginLeft: '10px' }}>Save</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MultiTextCanvasEditor;
