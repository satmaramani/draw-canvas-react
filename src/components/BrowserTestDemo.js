import React, { useState } from 'react';
import { ADMIN_CONFIG } from '../config/adminConfig';

const BrowserTestDemo = () => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [message, setMessage] = useState('');

  const handleClick = () => {
    const currentTime = Date.now();
    
    // Reset if more than 2 seconds between clicks
    if (currentTime - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(currentTime);
    
    // Show message based on click count
    if (clickCount === 0) {
      setMessage('First click! Click 2 more times quickly to trigger admin access.');
    } else if (clickCount === 1) {
      setMessage('Second click! One more click within 2 seconds...');
    } else if (clickCount === 2) {
      setMessage('Third click! Admin access should be triggered now!');
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      setClickCount(0);
      setMessage('');
    }, 2000);
  };

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h2>🖥️ Browser Testing Demo</h2>
      
      <div style={{
        width: '300px',
        height: '200px',
        border: '3px dashed #007bff',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: '#f8f9fa',
        margin: '20px 0',
        transition: 'all 0.3s ease'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#e3f2fd'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
      >
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🖱️</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
          Click Here
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
          {clickCount}/3 clicks
        </div>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '8px',
          margin: '20px 0',
          maxWidth: '400px'
        }}>
          {message}
        </div>
      )}

      <div style={{
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        maxWidth: '500px',
        marginTop: '20px'
      }}>
        <h4>📋 Instructions:</h4>
        <ol style={{ textAlign: 'left' }}>
          <li>Click the box above 3 times quickly (within 2 seconds)</li>
          <li>This will trigger the admin access modal</li>
          <li>Enter the PIN: <strong>{ADMIN_CONFIG.PIN}</strong></li>
          <li>The app will close upon successful entry</li>
        </ol>
        
        <p style={{ fontSize: '12px', color: '#856404', marginTop: '10px' }}>
          <strong>Note:</strong> This is only for browser testing. In production, 
          only the 2-finger long press on touch devices will work.
        </p>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Current Configuration:</strong><br />
        Browser Testing: {ADMIN_CONFIG.ENABLE_BROWSER_TESTING ? '✅ Enabled' : '❌ Disabled'}<br />
        PIN: {ADMIN_CONFIG.PIN}<br />
        Timer Display: {ADMIN_CONFIG.SHOW_TIMER ? '✅ Enabled' : '❌ Disabled'}
      </div>
    </div>
  );
};

export default BrowserTestDemo;
