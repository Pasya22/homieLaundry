// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register service worker - REMOVE PROD CHECK for development testing
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use dynamic scope based on current location
    const scope = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) || '/';
    
    navigator.serviceWorker.register('/sw.js', { scope })
      .then((registration) => {
        console.log('✅ SW registered successfully:', registration);
        console.log('📍 Scope:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error('❌ SW registration failed:', error);
      });
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);