// Admin Access Configuration
export const ADMIN_CONFIG = {
  // 4-digit PIN for admin access (default: 1234)
  PIN: '1234',
  
  // Show countdown timer during long press (for development)
  SHOW_TIMER: true,
  
  // Long press duration in milliseconds (10 seconds)
  LONG_PRESS_DURATION: 10000,
  
  // Number of fingers required for admin access
  REQUIRED_FINGERS: 2,
  
  // Enable browser testing with 3 clicks (for development)
  ENABLE_BROWSER_TESTING: true,
  
  // Prevent app exit
  PREVENT_EXIT: true,
  
  // Kiosk mode settings
  KIOSK_MODE: {
    fullscreen: true,
    preventExit: true,
    disableBackButton: true
  }
};

// Development settings
export const DEV_CONFIG = {
  DEBUG_MODE: false,
  SHOW_TOUCH_INDICATORS: false
};
