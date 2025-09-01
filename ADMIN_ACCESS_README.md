# Museum Kiosk Admin Access System

This system provides a hidden admin access mechanism for museum kiosk applications, allowing authorized personnel to exit the app while preventing accidental exits by visitors.

## Features

### 🔐 Hidden Admin Access
- **2-Finger Long Press**: Press any part of the screen with exactly 2 fingers for 10 seconds
- **3-Click Browser Testing**: Click anywhere 3 times quickly (within 2 seconds) for development testing
- **4-Digit PIN Entry**: Enter the configured PIN to access admin functions
- **Global Activation**: Works from any page or component in the app

### 🛡️ App Exit Prevention
- **Fullscreen Mode**: App runs in fullscreen to prevent access to device UI
- **Keyboard Shortcut Blocking**: Prevents common exit shortcuts (F11, Alt+F4, Ctrl+W, etc.)
- **Context Menu Disabled**: Right-click is disabled to prevent browser menu access
- **Back Button Prevention**: Prevents mobile back button from exiting the app
- **Tab/Window Close Prevention**: Shows confirmation dialog when trying to close

### ⏱️ Development Timer
- **Countdown Display**: Shows a reverse timer during the 2-finger long press (configurable)
- **Visual Progress Bar**: Displays progress of the long press duration
- **Development Mode**: Can be disabled for production

## Configuration

Edit `src/config/adminConfig.js` to customize the system:

```javascript
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
```

## How to Use

### For Museum Employees:
1. **Activate Admin Mode**: Press any part of the screen with exactly 2 fingers
2. **Hold for 10 Seconds**: Keep both fingers pressed for the full duration
3. **Enter PIN**: When the modal appears, enter the 4-digit PIN (default: 1234)
4. **Exit App**: Upon successful PIN entry, the app will close

### For Developers:
- **Browser Testing**: Set `ENABLE_BROWSER_TESTING: true` to enable 3-click testing in browsers
- **Timer Display**: Set `SHOW_TIMER: true` to see the countdown during development
- **PIN Change**: Modify `PIN` in the config file to set your desired admin PIN
- **Duration Adjustment**: Change `LONG_PRESS_DURATION` to adjust the required hold time
- **Finger Count**: Modify `REQUIRED_FINGERS` if you want a different number of fingers

## Security Features

### Hidden Activation
- The 2-finger long press is not obvious to regular users
- No visible UI elements indicate the admin access feature
- Works from any page, making it accessible throughout the app

### PIN Protection
- 4-digit numeric PIN required for access
- PIN is configurable and can be changed easily
- Failed attempts show error message and reset input

### Exit Prevention
- Multiple layers of protection against accidental exits
- Fullscreen mode prevents access to device UI
- Keyboard shortcuts are blocked
- Browser navigation is restricted

## Technical Implementation

### Components
- **AdminAccess.js**: Handles touch detection, PIN entry, and timer display
- **KioskMode.js**: Manages fullscreen mode and exit prevention
- **adminConfig.js**: Centralized configuration file

### Service Worker
- **sw.js**: Enhances PWA functionality and offline capabilities
- Caches app resources for better performance
- Handles background sync and app lifecycle

### PWA Configuration
- **manifest.json**: Configured for fullscreen kiosk mode
- Landscape orientation for better kiosk display
- Standalone mode to hide browser UI

## Browser Compatibility

### Supported Features
- ✅ Touch events (mobile/tablet)
- ✅ Fullscreen API
- ✅ Service Workers
- ✅ PWA features

### Limitations
- ⚠️ Some exit prevention features may not work in all browsers
- ⚠️ Fullscreen mode requires user interaction
- ⚠️ Service Worker requires HTTPS in production

## Troubleshooting

### Timer Not Showing
- Check `SHOW_TIMER` setting in config
- Ensure you're using exactly 2 fingers
- Verify touch events are working on your device

### PIN Not Working
- Verify the PIN in `adminConfig.js`
- Ensure you're entering exactly 4 digits
- Check for any typos in the configuration

### App Still Exits
- Some browsers may override exit prevention
- Physical device buttons may still work
- Consider using a dedicated kiosk browser

## Production Deployment

### Recommended Settings
```javascript
export const ADMIN_CONFIG = {
  PIN: 'YOUR_SECURE_PIN', // Change to a secure PIN
  SHOW_TIMER: false,      // Disable timer for production
  ENABLE_BROWSER_TESTING: false, // Disable browser testing for production
  LONG_PRESS_DURATION: 10000,
  REQUIRED_FINGERS: 2,
  PREVENT_EXIT: true,
  KIOSK_MODE: {
    fullscreen: true,
    preventExit: true,
    disableBackButton: true
  }
};
```

### Security Considerations
- Change the default PIN before deployment
- Disable timer display in production
- Consider using a dedicated kiosk device
- Regularly update the PIN for security

## Support

For technical support or questions about the admin access system, please refer to the development team or check the configuration file for customization options.
