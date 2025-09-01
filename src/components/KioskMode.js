import React, { useEffect } from 'react';
import { ADMIN_CONFIG } from '../config/adminConfig';

const KioskMode = () => {
  useEffect(() => {
    // Prevent app exit
    const preventExit = (e) => {
      if (ADMIN_CONFIG.PREVENT_EXIT) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    // Prevent back button on mobile
    const preventBackButton = (e) => {
      if (ADMIN_CONFIG.KIOSK_MODE.disableBackButton) {
        e.preventDefault();
        return false;
      }
    };

    // Handle visibility change (when user tries to switch apps)
    const handleVisibilityChange = () => {
      if (ADMIN_CONFIG.PREVENT_EXIT && document.hidden) {
        // Try to bring focus back to the app
        window.focus();
      }
    };

    // Handle beforeunload (when user tries to close tab/window)
    window.addEventListener('beforeunload', preventExit);
    
    // Handle popstate (back button)
    window.addEventListener('popstate', preventBackButton);
    
    // Handle visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Request fullscreen if supported
    const requestFullscreen = async () => {
      if (ADMIN_CONFIG.KIOSK_MODE.fullscreen) {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            await document.documentElement.msRequestFullscreen();
          }
        } catch (error) {
          console.log('Fullscreen request failed:', error);
        }
      }
    };

    // Request fullscreen on user interaction
    const handleUserInteraction = () => {
      requestFullscreen();
      // Remove the event listener after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Prevent context menu (right-click)
    const preventContextMenu = (e) => {
      if (ADMIN_CONFIG.KIOSK_MODE.preventExit) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);

    // Prevent keyboard shortcuts
    const preventKeyboardShortcuts = (e) => {
      if (ADMIN_CONFIG.KIOSK_MODE.preventExit) {
        // Prevent common exit shortcuts
        const exitShortcuts = [
          'F11', // Fullscreen toggle
          'Escape', // Exit fullscreen
          'Alt+F4', // Close window (Windows)
          'Cmd+W', // Close window (Mac)
          'Ctrl+W', // Close tab
          'Ctrl+Shift+W', // Close all tabs
          'Alt+Home', // Home
          'Alt+Left', // Back
          'F5', // Refresh
          'Ctrl+R', // Refresh
          'Ctrl+Shift+R', // Hard refresh
        ];

        const key = e.key;
        const isCtrl = e.ctrlKey;
        const isAlt = e.altKey;
        const isShift = e.shiftKey;

        if (exitShortcuts.includes(key) || 
            (isCtrl && (key === 'w' || key === 'r')) ||
            (isAlt && key === 'F4') ||
            (isCtrl && isShift && key === 'w')) {
          e.preventDefault();
          return false;
        }
      }
    };

    document.addEventListener('keydown', preventKeyboardShortcuts);

    // Service Worker registration for enhanced PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully');
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeunload', preventExit);
      window.removeEventListener('popstate', preventBackButton);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default KioskMode;
