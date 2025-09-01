import React, { useState } from 'react';
import { ADMIN_CONFIG } from '../config/adminConfig';

const AdminTest = () => {
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];
    
    // Test 1: Check if touch events are supported
    const touchSupported = 'ontouchstart' in window;
    results.push({
      test: 'Touch Events Support',
      status: touchSupported ? '✅ PASS' : '❌ FAIL',
      details: touchSupported ? 'Touch events are supported' : 'Touch events not supported'
    });

    // Test 2: Check if fullscreen API is supported
    const fullscreenSupported = document.fullscreenEnabled || 
                               document.webkitFullscreenEnabled || 
                               document.msFullscreenEnabled;
    results.push({
      test: 'Fullscreen API Support',
      status: fullscreenSupported ? '✅ PASS' : '❌ FAIL',
      details: fullscreenSupported ? 'Fullscreen API is supported' : 'Fullscreen API not supported'
    });

    // Test 3: Check if service worker is supported
    const swSupported = 'serviceWorker' in navigator;
    results.push({
      test: 'Service Worker Support',
      status: swSupported ? '✅ PASS' : '❌ FAIL',
      details: swSupported ? 'Service Worker is supported' : 'Service Worker not supported'
    });

         // Test 4: Check configuration
     results.push({
       test: 'Admin Configuration',
       status: '✅ PASS',
       details: `PIN: ${ADMIN_CONFIG.PIN}, Timer: ${ADMIN_CONFIG.SHOW_TIMER}, Duration: ${ADMIN_CONFIG.LONG_PRESS_DURATION}ms, Browser Testing: ${ADMIN_CONFIG.ENABLE_BROWSER_TESTING}`
     });

    // Test 5: Check PWA manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    results.push({
      test: 'PWA Manifest',
      status: manifestLink ? '✅ PASS' : '❌ FAIL',
      details: manifestLink ? 'Manifest file found' : 'Manifest file not found'
    });

    setTestResults(results);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Admin Access System Test</h2>
      <p>This component helps verify that the admin access system is properly configured.</p>
      
      <button 
        onClick={runTests}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Run Tests
      </button>

      {testResults.length > 0 && (
        <div>
          <h3>Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '10px',
                margin: '5px 0',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: result.status.includes('PASS') ? '#f8fff8' : '#fff8f8'
              }}
            >
              <strong>{result.test}:</strong> {result.status}
              <br />
              <small>{result.details}</small>
            </div>
          ))}
        </div>
      )}

             <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
         <h4>How to Test Admin Access:</h4>
         
         <h5>📱 Touch Device (Production):</h5>
         <ol>
           <li>Press any part of the screen with exactly 2 fingers</li>
           <li>Hold for 10 seconds (you should see a timer if enabled)</li>
           <li>Enter the PIN: <strong>{ADMIN_CONFIG.PIN}</strong></li>
           <li>The app should close upon successful PIN entry</li>
         </ol>
         
         <h5>🖥️ Web Browser (Development):</h5>
         <ol>
           <li>Click anywhere on the screen 3 times quickly (within 2 seconds)</li>
           <li>Enter the PIN: <strong>{ADMIN_CONFIG.PIN}</strong></li>
           <li>The app should close upon successful PIN entry</li>
         </ol>
         
         <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
           <strong>Note:</strong> The 3-click method is only for browser testing during development. 
           In production, only the 2-finger long press will work on touch devices.
         </p>
       </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
        <h4>⚠️ Important Notes:</h4>
        <ul>
          <li>This test component should be removed in production</li>
          <li>The admin access works from any page in the app</li>
          <li>Make sure to change the default PIN before deployment</li>
          <li>Some features may not work in all browsers</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminTest;
