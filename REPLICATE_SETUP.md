# Replicate Image Generator Setup Guide

## Overview
This feature allows users to generate AI images using Replicate.com's API directly from your React app. Users can:
- Generate images from text prompts
- Transform existing images using AI
- Choose from different AI models
- Download generated images

## Setup Instructions

### 1. Get Your Replicate API Token
1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in to your account
3. Go to your account settings
4. Copy your API token

### 2. Configure the API Token
1. Open `src/config.js`
2. Replace `"YOUR_REPLICATE_API_TOKEN_HERE"` with your actual token:
   ```javascript
   API_TOKEN: "r8_your_actual_token_here",
   ```

### 3. Available AI Models
The app includes three pre-configured models:
- **Stable Diffusion XL**: Best quality, good for most use cases
- **Midjourney Style**: Artistic, creative style
- **Kandinsky 2.2**: Abstract, artistic style

### 4. How It Works
- **Text to Image**: Enter a prompt and generate a new image
- **Image to Image**: Upload an image and describe how you want it transformed
- The app polls the Replicate API every 5 seconds until generation is complete
- Generated images can be downloaded directly

### 5. API Usage
- Each image generation costs credits on Replicate
- Check your Replicate dashboard for usage and billing
- The app handles rate limiting and errors gracefully

### 6. Security Notes
- Never commit your API token to version control
- Consider using environment variables for production
- The token is currently stored in the frontend (acceptable for demo/development)

### 7. Customization
You can easily add more models by:
1. Adding them to `src/config.js`
2. Updating the model selector in `ReplicateImageGenerator.js`
3. Adjusting the input parameters for each model

### 8. Troubleshooting
- **"Invalid API token"**: Check your token in `config.js`
- **"Model not found"**: Verify the model ID in the config
- **Generation fails**: Check your Replicate account for credits/limits
- **CORS errors**: The app should work directly with Replicate's API

## Features
- ✅ Text-to-image generation
- ✅ Image-to-image transformation
- ✅ Multiple AI model support
- ✅ Real-time progress tracking
- ✅ Error handling
- ✅ Responsive design
- ✅ Image preview and download
- ✅ No backend server required

## File Structure
```
src/
├── ReplicateImageGenerator.js    # Main component
├── ReplicateImageGenerator.css   # Styling
├── config.js                     # API configuration
└── Router.js                     # Route integration
```

## Usage Example
1. Navigate to "AI Image Generator" in your app
2. Enter a detailed prompt (e.g., "A majestic dragon flying over a medieval castle at sunset")
3. Select your preferred AI model
4. Optionally upload an image to transform
5. Click "Generate Image"
6. Wait for the AI to create your image
7. Download the result

## Cost Considerations
- Replicate charges per image generation
- Prices vary by model and complexity
- Check [replicate.com/pricing](https://replicate.com/pricing) for current rates
- Consider implementing user limits or paywalls for production use 