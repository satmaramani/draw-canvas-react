import React, { useState, useEffect, useRef } from 'react';
import './AdminAccess.css';
import { ADMIN_CONFIG } from '../config/adminConfig';

const AdminAccess = () => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  
  const touchStartTime = useRef(null);
  const touchCount = useRef(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  
  // Browser testing variables
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const lastClickTime = useRef(0);
  
  // Configuration from adminConfig.js
  const ADMIN_PIN = ADMIN_CONFIG.PIN;
  const SHOW_TIMER = ADMIN_CONFIG.SHOW_TIMER;
  const LONG_PRESS_DURATION = ADMIN_CONFIG.LONG_PRESS_DURATION;
  const REQUIRED_FINGERS = ADMIN_CONFIG.REQUIRED_FINGERS;
  const ENABLE_BROWSER_TESTING = ADMIN_CONFIG.ENABLE_BROWSER_TESTING;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length === REQUIRED_FINGERS) {
        touchCount.current = e.touches.length;
        touchStartTime.current = Date.now();
        setIsLongPressActive(true);
        
        if (SHOW_TIMER) {
          setIsTimerVisible(true);
          setTimeLeft(LONG_PRESS_DURATION / 1000);
        }
        
        // Start countdown timer
        countdownRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    const handleTouchEnd = (e) => {
      if (touchCount.current === REQUIRED_FINGERS && touchStartTime.current) {
        const pressDuration = Date.now() - touchStartTime.current;
        
        if (pressDuration >= LONG_PRESS_DURATION) {
          setShowPinModal(true);
          setPin('');
          setError('');
        }
      }
      
      // Reset everything
      touchCount.current = 0;
      touchStartTime.current = null;
      setIsLongPressActive(false);
      setIsTimerVisible(false);
      setTimeLeft(10);
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };

    const handleTouchMove = (e) => {
      // Reset if finger count changes
      if (e.touches.length !== REQUIRED_FINGERS) {
        touchCount.current = 0;
        touchStartTime.current = null;
        setIsLongPressActive(false);
        setIsTimerVisible(false);
        setTimeLeft(LONG_PRESS_DURATION / 1000);
        
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      }
    };

    // Browser testing: 3 consecutive clicks within 2 seconds
    const handleClick = (e) => {
      const currentTime = Date.now();
      
      // Reset if more than 2 seconds between clicks
      if (currentTime - lastClickTime.current > 2000) {
        clickCount.current = 0;
      }
      
      clickCount.current++;
      lastClickTime.current = currentTime;
      
      // Clear previous timer
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
      
      // Set timer to reset click count
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 2000);
      
      // Check if we have 3 clicks
      if (clickCount.current === 3) {
        setShowPinModal(true);
        setPin('');
        setError('');
        clickCount.current = 0;
        
        if (clickTimer.current) {
          clearTimeout(clickTimer.current);
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Add click listener for browser testing (only if enabled)
    if (ENABLE_BROWSER_TESTING) {
      document.addEventListener('click', handleClick);
    }

    // Prevent app exit
    const preventExit = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', preventExit);
    
    // Prevent back button on mobile
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      if (ENABLE_BROWSER_TESTING) {
        document.removeEventListener('click', handleClick);
      }
      window.removeEventListener('beforeunload', preventExit);
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
    };
  }, [SHOW_TIMER, REQUIRED_FINGERS, LONG_PRESS_DURATION, ENABLE_BROWSER_TESTING]);

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      setShowPinModal(false);
      setPin('');
      setError('');
      
      // Close the app or navigate to admin panel
      if (window.navigator && window.navigator.app) {
        // For Android WebView
        window.navigator.app.exitApp();
      } else {
        // For regular browsers, close the window
        window.close();
        // Fallback: redirect to a blank page
        window.location.href = 'about:blank';
      }
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    }
  };

  return (
    <>
      {/* Timer Display */}
      {isTimerVisible && SHOW_TIMER && (
        <div className="admin-timer">
          <div className="timer-content">
            <div className="timer-text">Admin Access: {timeLeft}s</div>
            <div className="timer-progress">
              <div 
                className="timer-bar" 
                style={{ width: `${((LONG_PRESS_DURATION / 1000 - timeLeft) / (LONG_PRESS_DURATION / 1000)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Admin Access</h3>
            </div>
            <div className="admin-modal-body">
              <p>Enter 4-digit PIN:</p>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyPress={handleKeyPress}
                placeholder="****"
                maxLength="4"
                className="pin-input"
                autoFocus
              />
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="admin-modal-footer">
              <button 
                onClick={() => setShowPinModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handlePinSubmit}
                className="submit-btn"
                disabled={pin.length !== 4}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAccess;
