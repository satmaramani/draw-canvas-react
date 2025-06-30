import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mosida-node-backend-production.up.railway.app';
const REACT_APP_FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://draw-canvas-react-6zn6.vercel.app';

function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const sessionFromURL = params.get('session');
  if (sessionFromURL) return sessionFromURL;
  return `session_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function isMobileClient() {
  const params = new URLSearchParams(window.location.search);
  return params.get('role') === 'mobile';
}

const sessionId = getSessionId();
const isMobile = isMobileClient();
console.log("📌 Session ID:", sessionId);
console.log("📱 Mobile mode:", isMobile);

function ServerUploadReact() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
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
      if (sid === sessionId) {
        setImages(prev => [...prev, imageUrl]);
      }
    });

    return () => {
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
      {!isMobile && (
        <>
          <h1>🖼️ Upload Page / Museum Display</h1>
          <h3>📱 Scan QR to Upload from Mobile</h3>
          <QRCodeCanvas
            value={`${REACT_APP_FRONTEND_URL}/ServerUploadReact?session=${sessionId}&role=mobile`}
            size={128}
          />
          <h3>🖥️ OR Upload from this page</h3>
        </>
      )}

      <input type="file" onChange={e => setFile(e.target.files[0])} /><br /><br /><br />
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
