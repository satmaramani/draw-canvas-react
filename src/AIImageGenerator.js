import React, { useState } from "react";
import "./AIImageGenerator.css";

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImageUrl("");

    try {
      const response = await fetch("http://localhost:5001/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.success && data.imageUrl) {
        // Convert relative URL to absolute URL
        const fullImageUrl = `http://localhost:5001${data.imageUrl}`;
        setGeneratedImageUrl(fullImageUrl);
        setError("");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message || "Failed to generate image");
      console.error("Error generating image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (generatedImageUrl) {
      try {
        // Fetch the image as a blob
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        
        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `ai-generated-${Date.now()}.png`;
        
        // Append to DOM, click, and cleanup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Error downloading image:', error);
        // Fallback to the old method if blob download fails
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `ai-generated-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="ai-image-generator">
      <div className="ai-header">
        <h1>AI Image Generator</h1>
        <p>Generate unique images using AI based on your text descriptions</p>
      </div>

      <div className="ai-form">
        <div className="form-group">
          <label htmlFor="prompt">Describe the image you want to generate:</label>
          <textarea
            id="prompt"
            rows={4}
            placeholder="e.g., A beautiful sunset over mountains with a lake in the foreground, digital art style"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            className="prompt-input"
          />
          <small className="form-help">
            Be descriptive and specific for better results. Include details about style, mood, colors, and composition.
          </small>
        </div>

        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || !prompt.trim()}
          className="generate-btn"
        >
          {isGenerating ? (
            <>
              <div className="spinner"></div>
              Generating Image...
            </>
          ) : (
            "Generate Image"
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {generatedImageUrl && (
        <div className="result-container">
          <h3>Generated Image</h3>
          <div className="image-container">
            <img
              src={generatedImageUrl}
              alt="AI Generated"
              className="generated-image"
            />
          </div>
          <div className="action-buttons">
            <button
              onClick={handleDownloadImage}
              className="download-btn"
            >
              Download Image
            </button>
            <button
              onClick={() => {
                setGeneratedImageUrl("");
                setPrompt("");
              }}
              className="reset-btn"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>How it works:</h4>
        <ul>
          <li>Enter a detailed description of the image you want</li>
          <li>Click "Generate Image" to create your AI artwork</li>
          <li>Download the generated image or create another one</li>
        </ul>
        <div className="note">
          <strong>Note:</strong> This tool uses advanced AI to generate images based on your descriptions. 
          Generated images are unique and can be used for personal or commercial purposes.
        </div>
      </div>
    </div>
  );
}
