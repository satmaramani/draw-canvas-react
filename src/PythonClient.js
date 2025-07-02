import React, { useState } from "react";

function App() {
  const [originalUrl, setOriginalUrl] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous output & set original preview
    setOutputUrl(null);
    setLoading(true);
    const original = URL.createObjectURL(file);
    setOriginalUrl(original);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/remove-bg", {
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

  return (
    <div style={{ padding: 20 }}>
      <h2>🧹 Background Remover (Side-by-Side Preview)</h2>
      <input type="file" accept="image/*" onChange={handleChange} />
      {loading && <p style={{ color: "orange" }}>Processing image, please wait...</p>}

      {(originalUrl || outputUrl) && (
        <div style={{ marginTop: 20, display: "flex", gap: "20px" }}>
          {originalUrl && (
            <div>
              <h4>Original Image</h4>
              <img src={originalUrl} alt="Original" style={{ maxWidth: 300 }} />
            </div>
          )}
          {outputUrl && (
            <div>
              <h4>Background Removed</h4>
              <img src={outputUrl} alt="Output" style={{ maxWidth: 300 }} />
              <br />
              <a href={outputUrl} download="output.png">⬇️ Download</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
