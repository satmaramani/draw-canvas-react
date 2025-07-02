import React, { useRef, useState } from 'react';

const BackgroundRemoverCDN = () => {
  const canvasRef = useRef(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imgURL = URL.createObjectURL(file);
    setOriginalImageUrl(imgURL);
    setLoading(true);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imgURL;

    image.onload = () => {
      const selfieSegmentation = new window.SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      selfieSegmentation.setOptions({
        modelSelection: 1, // better quality model
      });

      selfieSegmentation.onResults((results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw mask
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

        // Only draw foreground (person)
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        setLoading(false);
      });

      selfieSegmentation.initialize().then(() => {
        selfieSegmentation.send({ image });
      });
    };
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Background Remover (MediaPipe via CDN)</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} />
      {loading && <p>Processing image...</p>}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
        {originalImageUrl && (
          <div>
            <h4>Original Image</h4>
            <img src={originalImageUrl} alt="Original" style={{ maxWidth: '300px', border: '1px solid #ccc' }} />
          </div>
        )}
        <div>
          <h4>Background Removed</h4>
          <canvas ref={canvasRef} style={{ border: '1px solid #ccc', maxWidth: '300px' }} />
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemoverCDN;
