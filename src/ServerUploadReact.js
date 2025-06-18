import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mosida-node-backend-production.up.railway.app';
const REACT_APP_FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://draw-canvas-react-6zn6.vercel.app';

// const sessionId = 'museum123';

function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const sessionFromURL = params.get('session');

  // If session param exists in URL, use it
  if (sessionFromURL) {
    return sessionFromURL;
  }

  // Otherwise, generate new one
  return `session_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

const sessionId = getSessionId();
console.log("This is session id ", sessionId)

function ServerUploadReact() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    console.log('📡 Connecting to socket at:', REACT_APP_BACKEND_URL);

    const socket = io(REACT_APP_BACKEND_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('imageUploaded', ({ sessionId: sid, imageUrl }) => {
      console.log('📦 Received image from socket:', imageUrl);
      if (sid === sessionId) {
        setImages(prev => [...prev, imageUrl]);
      }
    });

    return () => {
      console.log('👋 Disconnecting socket');
      socket.disconnect();
    };
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      const res = await axios.post(`${REACT_APP_BACKEND_URL}/upload`, formData);
      console.log('✅ Image uploaded:', res.data.imageUrl);
    } catch (err) {
      console.error('❌ Upload failed:', err.message || err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🖼️ Upload Page / Museum Display</h1>
      <h3>📱 Scan QR to Upload from Mobile</h3>
      <QRCodeCanvas value={`${REACT_APP_FRONTEND_URL}/ServerUploadReact?session=${sessionId}`} size={128} />
      {/* <QRCodeCanvas value={`${REACT_APP_FRONTEND_URL}/ServerUploadReact`} size={128} /> */}
      
      <h3>🖥️ OR Upload from this page</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <h3>🧾 Uploaded Images:</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {images.map((url, idx) => (
          <img key={idx} src={url} alt={`Uploaded-${idx}`} width="200" />
        ))}
      </div>
    </div>
  );
}

export default ServerUploadReact;
