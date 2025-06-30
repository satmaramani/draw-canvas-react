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

function ServerUploadReact() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadDisabled, setUploadDisabled] = useState(false);

  // ✅ Add/remove body class based on QR role
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-only');
    } else {
      document.body.classList.remove('mobile-only');
    }
  }, []);

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
        setUploadDisabled(true); // Disallow more uploads
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 👇 Compress image before upload
  async function compressImage(file, maxWidth = 1024, quality = 0.7) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed);
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an image to upload.');
      return;
    }

    if (uploadDisabled) {
      alert('Only one image can be uploaded.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('sessionId', sessionId);

      const res = await axios.post(`${REACT_APP_BACKEND_URL}/upload`, formData);
      console.log('✅ Compressed image uploaded:', res.data.imageUrl);
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

      <input
        type="file"
        disabled={uploadDisabled}
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br /><br />
      <button onClick={handleUpload} disabled={uploadDisabled}>
        {uploadDisabled ? 'Upload Complete' : 'Upload'}
      </button>

      <h3>🧾 Uploaded Image:</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {images.map((url, idx) => (
          <img key={idx} src={url} alt={`Uploaded-${idx}`} width="200" />
        ))}
      </div>
    </div>
  );
}

export default ServerUploadReact;
