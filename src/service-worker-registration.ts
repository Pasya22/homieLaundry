// src/service-worker-registration.ts
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available. Please refresh.');
                  
                  // Show update notification
                  if (window.confirm('Update tersedia! Muat ulang aplikasi?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Network status detection
export function setupNetworkStatus() {
  // Update online/offline status
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    const event = new CustomEvent('network-status', {
      detail: { isOnline }
    });
    window.dispatchEvent(event);
    
    if (!isOnline) {
      console.log('You are offline. Some features may not work.');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}