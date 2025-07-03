import React, { useState } from "react";

function App() {
  const [originalUrl, setOriginalUrl] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [merging, setMerging] = useState(false);

  // Update to your actual file names
  const backgrounds = [
    "/backgrounds/room.jpg",
    "/backgrounds/studio.jpg",
    "/backgrounds/nature.jpg",
    "/backgrounds/abstract.jpg",
    "/backgrounds/desk.jpg",
  ];

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOutputUrl(null);
    setMergedUrl(null);
    setSelectedBg(null);
    setLoading(true);

    const original = URL.createObjectURL(file);
    setOriginalUrl(original);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Background removal failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mergeImages = async (bgPath) => {
    if (!outputUrl || !bgPath) return;

    setSelectedBg(bgPath);
    setMerging(true);
    setMergedUrl(null);

    const bgImg = new Image();
    const fgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    fgImg.crossOrigin = "anonymous";

    bgImg.src = bgPath;
    fgImg.src = outputUrl;

    await Promise.all([
      new Promise((resolve) => (bgImg.onload = resolve)),
      new Promise((resolve) => (fgImg.onload = resolve)),
    ]);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Use foreground image's dimensions
    const width = fgImg.width;
    const height = fgImg.height;
    canvas.width = width;
    canvas.height = height;

    // Draw background scaled to cover the canvas
    ctx.drawImage(bgImg, 0, 0, width, height);
    // Draw the foreground (no scaling)
    ctx.drawImage(fgImg, 0, 0);

    const finalUrl = canvas.toDataURL("image/png");
    setMergedUrl(finalUrl);
    setMerging(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧹 Background Remover & Replacer</h2>
      <input type="file" accept="image/*" onChange={handleChange} />

      {(originalUrl || outputUrl || loading) && (
        <div style={{ marginTop: 20, display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {originalUrl && (
            <div>
              <h4>Original Image</h4>
              <img src={originalUrl} alt="Original" style={{ maxWidth: 300 }} />
            </div>
          )}
          <div>
            <h4>Background Removed</h4>
            <div
              style={{
                width: 300,
                height: 300,
                position: "relative",
                border: "1px dashed #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {loading && (
                <div className="scanner-overlay">
                  <div className="scan-bar" />
                  <span className="scan-text">Removing background...</span>
                </div>
              )}
              {!loading && outputUrl && (
                <img
                  src={outputUrl}
                  alt="Output"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transition: "opacity 0.5s ease-in",
                  }}
                />
              )}
            </div>

            {!loading && outputUrl && (
              <div style={{ marginTop: 8 }}>
                <a href={outputUrl} download="output.png">⬇️ Download Transparent</a>
              </div>
            )}
          </div>
        </div>
      )}

      {outputUrl && (
        <div style={{ marginTop: "20px" }}>
          <h4>Select New Background</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {backgrounds.map((bg, i) => (
              <img
                key={i}
                src={bg}
                alt={`bg${i}`}
                onClick={() => mergeImages(bg)}
                style={{
                  width: 80,
                  height: 80,
                  border: selectedBg === bg ? "3px solid #007bff" : "1px solid #ccc",
                  cursor: "pointer",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {merging && (
        <div className="scanner-overlay" style={{ marginTop: 20 }}>
          <div className="scan-bar" />
          <span className="scan-text">Merging with background...</span>
        </div>
      )}

      {mergedUrl && !merging && (
        <div style={{ marginTop: 20 }}>
          <h4>Final Image with New Background</h4>
          <img src={mergedUrl} alt="Merged" style={{ maxWidth: 400 }} />
          <div style={{ marginTop: 8 }}>
            <a href={mergedUrl} download="final.png">⬇️ Download Final Image</a>
          </div>
        </div>
      )}

      <style>{`
        .scanner-overlay {
          position: relative;
          width: 100%;
          text-align: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px dashed #ccc;
          margin-top: 10px;
        }

        .scan-bar {
          width: 80%;
          height: 4px;
          margin: 0 auto 10px;
          background: linear-gradient(to right, #4caf50, #00bcd4);
          animation: scan 1.2s infinite ease-in-out;
          border-radius: 2px;
        }

        .scan-text {
          font-size: 14px;
          color: #555;
          animation: blink 1.5s infinite;
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default App;
