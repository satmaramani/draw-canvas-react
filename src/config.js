// Configuration file for Replicate API
export const REPLICATE_CONFIG = {
  // Get API token from environment variable only
  API_TOKEN: process.env.REPLICATE_API_TOKEN || "",
  
  // Default model ID for image generation (using a more reliable model)
  DEFAULT_MODEL: "prompthero/openjourney:ad59ca21177f9e217b9075edf5d5a844a4b0eb9ceaf4c4e8d9734462e1d5bc6e",
  
  // Alternative models you can use (updated with latest working versions)
  MODELS: {
    SDXL: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b6",
    SDXL_TURBO: "stability-ai/sdxl:1bfb924045802467cf8869d96b231a12e6aa994abfe37e337c63a4a2fd53d4e4b",
    MIDJOURNEY: "midjourney/diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    KANDINSKY: "ai-forever/kandinsky-2.2:ea1addaab376f4dc22767b3f0d5a7b51a7b31a7f6c12f014e0d2c540c4c33212",
    OPENJOURNEY: "prompthero/openjourney:ad59ca21177f9e217b9075edf5d5a844a4b0eb9ceaf4c4e8d9734462e1d5bc6e"
  },
  
  // CORS proxy options for development
  CORS_PROXIES: {
    CORS_PROXY_IO: "https://corsproxy.io/?",
    CORS_ANYWHERE: "https://cors-anywhere.herokuapp.com/",
    CORS_PROXY_DEV: "https://cors.bridged.cc/",
    NONE: "" // For production when you have a backend
  },
  
  // Current CORS proxy to use (switched to more reliable option)
  CURRENT_CORS_PROXY: "" // No proxy needed for Vercel deployment
}; 