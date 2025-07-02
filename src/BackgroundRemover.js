import React, { useRef, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

const BackgroundRemover = () => {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [originalImageURL, setOriginalImageURL] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setImageLoaded(false);

    const imgURL = URL.createObjectURL(file);
    setOriginalImageURL(imgURL);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgURL;

    img.onload = async () => {
      const net = await bodyPix.load();
      const segmentation = await net.segmentPerson(img);
      const mask = bodyPix.toMask(segmentation);

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas element not found");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bodyPix.drawMask(
        canvas,
        img,
        mask,
        { r: 255, g: 255, b: 255, a: 255 }, // white background
        1,
        0,
        false
      );

      setLoading(false);
      setImageLoaded(true);
    };
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Background Remover - See Before & After</h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={loading}
        style={{ marginBottom: '20px' }}
      />

      {loading && (
        <div>
          <div className="spinner" style={{ margin: '20px auto' }}></div>
          <p>Processing image, please wait...</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
        {originalImageURL && (
          <div>
            <h4>Original Image</h4>
            <img
              src={originalImageURL}
              alt="Original"
              style={{ maxWidth: '300px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>
        )}

        <div>
          <h4>Background Removed</h4>
          <canvas
            ref={canvasRef}
            style={{
              border: '1px solid #ccc',
              borderRadius: '6px',
              maxWidth: '300px',
              display: originalImageURL ? 'block' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;
