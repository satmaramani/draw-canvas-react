import React, { useState } from "react";
import "./ReplicateImageGenerator.css";
import { REPLICATE_CONFIG } from "./config";

const ReplicateImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState(REPLICATE_CONFIG.DEFAULT_MODEL);
  const [currentCorsProxy, setCurrentCorsProxy] = useState(REPLICATE_CONFIG.CURRENT_CORS_PROXY);

  // Get API token from config
  const REPLICATE_API_TOKEN = REPLICATE_CONFIG.API_TOKEN;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!REPLICATE_API_TOKEN) {
      setError("❌ No API token found! Please set REPLICATE_API_TOKEN environment variable.");
      return;
    }
    
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");
    setResultUrl("");

    try {
      // If there's a file, we'll use an image-to-image model
      // If no file, we'll use text-to-image
      let predictionData;
      
             if (file) {
         // Convert file to base64 for Replicate API
         const base64 = await fileToBase64(file);
         predictionData = {
           version: selectedModel,
           input: {
             prompt: prompt,
             image: `data:image/jpeg;base64,${base64}`,
             strength: 0.8, // How much to transform the image (0-1)
             guidance_scale: 7.5
           }
         };
       } else {
         // Text to image
         predictionData = {
           version: selectedModel,
           input: {
             prompt: prompt,
             width: 1024,
             height: 1024,
             guidance_scale: 7.5,
             num_inference_steps: 50
           }
         };
       }

             // Use CORS proxy from state
       const corsProxy = currentCorsProxy;
       const apiUrl = "https://api.replicate.com/v1/predictions";
       
       // Debug: Log the request data
       console.log("Sending prediction data:", predictionData);
       console.log("Model version:", selectedModel);
       
              let response;
       // For CORS proxies that support custom headers
       if (corsProxy && corsProxy !== "") {
         response = await fetch(corsProxy + apiUrl, {
           method: "POST",
           headers: {
             "Authorization": `Token ${REPLICATE_API_TOKEN}`,
             "Content-Type": "application/json",
             "Origin": "http://localhost:4000"
           },
           body: JSON.stringify(predictionData),
         });
       } else {
         // Direct request (for production when you have a backend)
         response = await fetch(apiUrl, {
           method: "POST",
           headers: {
             "Authorization": `Token ${REPLICATE_API_TOKEN}`,
             "Content-Type": "application/json",
           },
           body: JSON.stringify(predictionData),
         });
       }

       if (!response.ok) {
         // Try to get detailed error message from response
         let errorMessage = `HTTP error! status: ${response.status}`;
         try {
           const errorData = await response.json();
           if (errorData.detail) {
             errorMessage += ` - ${JSON.stringify(errorData.detail)}`;
           }
         } catch (e) {
           // If we can't parse error response, just use status
         }
         throw new Error(errorMessage);
       }

      const prediction = await response.json();
      
      // Poll for results
      const result = await pollForResults(prediction.id);
      
      if (result && result.output && result.output.length > 0) {
        setResultUrl(result.output[0]);
      } else {
        throw new Error("No output generated");
      }

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const pollForResults = async (predictionId) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        // Use CORS proxy for polling requests too
        const corsProxy = currentCorsProxy;
        const apiUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
        
        let response;
        if (corsProxy && corsProxy !== "") {
          response = await fetch(corsProxy + apiUrl, {
            headers: {
              "Authorization": `Token ${REPLICATE_API_TOKEN}`,
              "Origin": "http://localhost:4000"
            },
          });
        } else {
          response = await fetch(apiUrl, {
            headers: {
              "Authorization": `Token ${REPLICATE_API_TOKEN}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const prediction = await response.json();

        if (prediction.status === "succeeded") {
          return prediction;
        } else if (prediction.status === "failed") {
          throw new Error("Image generation failed");
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;

      } catch (err) {
        console.error("Polling error:", err);
        throw err;
      }
    }

    throw new Error("Timeout waiting for image generation");
  };

  const testCorsProxy = async () => {
    try {
      setError("");
      const corsProxy = currentCorsProxy;
      const testUrl = "https://api.replicate.com/v1/models";
      
      let response;
      if (corsProxy && corsProxy !== "") {
        response = await fetch(corsProxy + testUrl, {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
            "Origin": "http://localhost:4000"
          },
        });
      } else {
        response = await fetch(testUrl, {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
          },
        });
      }
      
      if (response.ok) {
        setError("✅ CORS Proxy Test Successful! You can now generate images.");
      } else if (response.status === 429) {
        setError("❌ CORS Proxy Rate Limited! Try switching to a different proxy or wait a few minutes.");
      } else {
        setError(`❌ CORS Proxy Test Failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("❌ CORS Proxy Connection Failed! Try switching to a different proxy option.");
      } else {
        setError(`❌ CORS Proxy Test Error: ${err.message}`);
      }
      console.error("CORS Test Error:", err);
    }
  };

  const testModelVersion = async () => {
    try {
      setError("");
      const corsProxy = currentCorsProxy;
      const testUrl = `https://api.replicate.com/v1/models/${selectedModel}`;
      
      let response;
      if (corsProxy && corsProxy !== "") {
        response = await fetch(corsProxy + testUrl, {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
            "Origin": "http://localhost:4000"
          },
        });
      } else {
        response = await fetch(testUrl, {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
          },
        });
      }
      
      if (response.ok) {
        const modelData = await response.json();
        setError(`✅ Model Test Successful! Model: ${modelData.name}, Latest version: ${modelData.latest_version?.id || 'Unknown'}`);
        console.log("Model data:", modelData);
      } else if (response.status === 429) {
        setError("❌ CORS Proxy Rate Limited! Try switching to a different proxy or wait a few minutes.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`❌ Model Test Failed: ${response.status} - ${errorData.detail || response.statusText}`);
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("❌ CORS Proxy Connection Failed! Try switching to a different proxy option.");
      } else {
        setError(`❌ Model Test Error: ${err.message}`);
      }
      console.error("Model Test Error:", err);
    }
  };

  const discoverWorkingModels = async () => {
    try {
      setError("🔍 Discovering working models...");
      
      // Test each model in our config
      const models = Object.entries(REPLICATE_CONFIG.MODELS);
      let workingModels = [];
      
      for (const [name, version] of models) {
        try {
          const corsProxy = currentCorsProxy;
          const testUrl = `https://api.replicate.com/v1/models/${version}`;
          
          let response;
          if (corsProxy && corsProxy !== "") {
            response = await fetch(corsProxy + testUrl, {
              headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Origin": "http://localhost:4000"
              },
            });
          } else {
            response = await fetch(testUrl, {
              headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
              },
            });
          }
          
          if (response.ok) {
            workingModels.push({ name, version });
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (err) {
          console.log(`Model ${name} failed:`, err.message);
        }
      }
      
      if (workingModels.length > 0) {
        setError(`✅ Found ${workingModels.length} working models: ${workingModels.map(m => m.name).join(', ')}`);
        console.log("Working models:", workingModels);
      } else {
        setError("❌ No working models found. Check your API token and CORS proxy.");
      }
      
    } catch (err) {
      setError(`❌ Model Discovery Error: ${err.message}`);
      console.error("Model Discovery Error:", err);
    }
  };

  const clearForm = () => {
    setPrompt("");
    setFile(null);
    setResultUrl("");
    setError("");
    setPreviewUrl("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="replicate-generator">
      <div className="generator-header">
        <h1>AI Image Generator</h1>
        <p>Powered by Replicate.com - Generate amazing images from text prompts or transform existing images</p>
      </div>

      <div className="generator-container">
        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-group">
            <label htmlFor="prompt">Describe your image:</label>
            <textarea
              id="prompt"
              placeholder="Enter a detailed description of the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Select AI Model:</label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              <option value={REPLICATE_CONFIG.MODELS.SDXL}>Stable Diffusion XL (Best Quality)</option>
              <option value={REPLICATE_CONFIG.MODELS.MIDJOURNEY}>Midjourney Style</option>
              <option value={REPLICATE_CONFIG.MODELS.KANDINSKY}>Kandinsky 2.2</option>
            </select>
            <small>Choose the AI model that best fits your needs</small>
          </div>

          <div className="form-group">
            <label htmlFor="corsProxy">CORS Proxy (for development):</label>
                                      <select
               id="corsProxy"
               value={currentCorsProxy}
               onChange={(e) => {
                 setCurrentCorsProxy(e.target.value);
               }}
               className="model-select"
             >
               <option value="">No Proxy (Production/Vercel)</option>
               <option value={REPLICATE_CONFIG.CORS_PROXIES.CORS_PROXY_IO}>CORS Proxy.io (Development)</option>
               <option value={REPLICATE_CONFIG.CORS_PROXIES.CORS_ANYWHERE}>CORS Anywhere (Development)</option>
               <option value={REPLICATE_CONFIG.CORS_PROXIES.CORS_PROXY_DEV}>CORS Bridged (Development)</option>
             </select>
             <small>No proxy needed for Vercel deployment. Use proxies only for local development.</small>
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload an image (optional):</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <small>If you upload an image, it will be transformed according to your prompt</small>
          </div>

          {previewUrl && (
            <div className="image-preview">
              <h4>Image Preview:</h4>
              <img src={previewUrl} alt="Preview" />
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isLoading}
              className="generate-btn"
            >
              {isLoading ? "Generating..." : "Generate Image"}
            </button>
            <button 
              type="button" 
              onClick={clearForm}
              className="clear-btn"
            >
              Clear
            </button>
                         <button 
               type="button" 
               onClick={testCorsProxy}
               className="test-btn"
               style={{ background: '#f59e0b', color: 'white' }}
             >
               Test CORS Proxy
             </button>
             <button 
               type="button" 
               onClick={testModelVersion}
               className="test-btn"
               style={{ background: '#8b5cf6', color: 'white' }}
             >
               Test Model
             </button>
             <button 
               type="button" 
               onClick={discoverWorkingModels}
               className="test-btn"
               style={{ background: '#10b981', color: 'white' }}
             >
               Discover Models
             </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating your image... This may take a few minutes.</p>
          </div>
        )}

        {resultUrl && (
          <div className="result-section">
            <h2>Generated Image:</h2>
            <div className="result-image">
              <img src={resultUrl} alt="Generated" />
            </div>
            <div className="result-actions">
              <a 
                href={resultUrl} 
                download="generated-image.png"
                className="download-btn"
              >
                Download Image
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="instructions">
        <h3>How to use:</h3>
        <ul>
          <li><strong>Text to Image:</strong> Just enter a prompt describing what you want to see</li>
          <li><strong>Image to Image:</strong> Upload an image and describe how you want it transformed</li>
          <li><strong>Tips:</strong> Be specific and descriptive in your prompts for better results</li>
          <li><strong>Note:</strong> Make sure to replace the API token in the code with your actual Replicate token</li>
        </ul>
      </div>
    </div>
  );
};

export default ReplicateImageGenerator; 