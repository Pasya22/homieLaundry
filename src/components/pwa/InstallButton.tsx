// src/components/pwa/InstallButton.tsx
import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Info, AlertTriangle } from 'lucide-react';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [showHTTPSWarning, setShowHTTPSWarning] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    userAgent: '',
    isSecureContext: false,
    hasSW: false,
    swState: '',
    manifestLoaded: false,
    protocol: '',
    hostname: '',
  });

  useEffect(() => {
    // Collect debug info
    const ua = window.navigator.userAgent;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const isSecure = window.isSecureContext;
    
    setDebugInfo({
      userAgent: ua,
      isSecureContext: isSecure,
      hasSW: 'serviceWorker' in navigator,
      swState: 'checking',
      manifestLoaded: false,
      protocol,
      hostname,
    });

    // Check if not secure and not localhost
    if (!isSecure && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setShowHTTPSWarning(true);
      console.warn('⚠️ PWA requires HTTPS or localhost!');
    }

    // Check if app is already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                             (window.navigator as any).standalone === true;
    
    if (isStandaloneMode) {
      setIsStandalone(true);
      console.log('✅ App running in standalone mode');
      return;
    }

    // Check for iOS
    const isIOSDevice = /iphone|ipad|ipod/.test(ua.toLowerCase());
    setIsIOS(isIOSDevice);

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          console.log('✅ Service Worker registered:', registrations);
          setDebugInfo(prev => ({ ...prev, swState: 'registered' }));
        } else {
          console.log('⚠️ No Service Worker registered');
          setDebugInfo(prev => ({ ...prev, swState: 'not registered' }));
        }
      });

      navigator.serviceWorker.ready
        // .then(registration => {
        //   console.log('✅ Service Worker ready');
        //   setDebugInfo(prev => ({ ...prev, swState: 'ready' }));
        // })
        // .catch(err => {
        //   console.error('❌ Service Worker error:', err);
        //   setDebugInfo(prev => ({ ...prev, swState: 'error' }));
        // });
    }

    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifestUrl = manifestLink.getAttribute('href');
      fetch(manifestUrl || '/manifest.json')
        .then(res => res.json())
        .then(data => {
          console.log('✅ Manifest loaded:', data);
          setDebugInfo(prev => ({ ...prev, manifestLoaded: true }));
        })
        .catch(err => {
          console.error('❌ Manifest error:', err);
          setDebugInfo(prev => ({ ...prev, manifestLoaded: false }));
        });
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎉 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowHTTPSWarning(false);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('✅ App installed successfully!');
      setIsInstallable(false);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Log state
    console.log('🔍 PWA Debug Info:');
    console.log('- Secure Context:', isSecure);
    console.log('- Protocol:', protocol);
    console.log('- Hostname:', hostname);
    console.log('- iOS:', isIOSDevice);
    console.log('- Standalone:', isStandaloneMode);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ No deferred prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install error:', err);
    }
  };

  const handleIOSInstructions = () => {
    alert(
      '📱 Cara Install di iOS (Safari):\n\n' +
      '1. Tap tombol Share (📤) di bagian bawah browser\n' +
      '2. Scroll ke bawah dan pilih "Add to Home Screen"\n' +
      '3. Tap "Add" di pojok kanan atas\n' +
      '4. Aplikasi akan muncul di home screen!\n\n' +
      '⚠️ Catatan: Harus menggunakan Safari browser'
    );
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Debug Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Info"
      >
        <Info className="w-4 h-4" />
      </button>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed bottom-16 left-4 z-50 bg-white rounded-lg shadow-2xl p-4 max-w-sm text-xs border-2 border-gray-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-sm">🔍 PWA Debug</h3>
            <button 
              onClick={() => setShowDebug(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Secure Context:</span>
              <span className={debugInfo.isSecureContext ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {debugInfo.isSecureContext ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="font-mono">{debugInfo.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span>Hostname:</span>
              <span className="font-mono text-[10px]">{debugInfo.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span>Standalone:</span>
              <span>{isStandalone ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>iOS:</span>
              <span>{isIOS ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Installable:</span>
              <span>{isInstallable ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>SW Support:</span>
              <span>{debugInfo.hasSW ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>SW State:</span>
              <span className="font-mono text-[10px]">{debugInfo.swState}</span>
            </div>
            <div className="flex justify-between">
              <span>Manifest:</span>
              <span>{debugInfo.manifestLoaded ? '✅' : '❌'}</span>
            </div>
          </div>

          {!debugInfo.isSecureContext && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-red-600 text-xs font-semibold">
                ⚠️ PWA requires HTTPS!
              </p>
              <p className="text-gray-600 text-[10px] mt-1">
                Use localhost or deploy to HTTPS hosting
              </p>
            </div>
          )}
        </div>
      )}

      {/* HTTPS Warning */}
      {showHTTPSWarning && !isIOS && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm">
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-2">⚠️ HTTPS Required</h3>
                <p className="text-sm text-amber-800 mb-3">
                  PWA install memerlukan HTTPS. Saat ini Anda mengakses via HTTP.
                </p>
                <div className="text-xs text-amber-700 space-y-1 mb-3">
                  <p><strong>Solusi:</strong></p>
                  <p>1. Deploy ke hosting dengan HTTPS (Vercel/Netlify)</p>
                  <p>2. Atau akses via <code className="bg-amber-100 px-1 rounded">localhost</code></p>
                </div>
                <button
                  onClick={() => setShowHTTPSWarning(false)}
                  className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install Button (Android/Chrome) */}
      {isInstallable && (
        <div className="fixed bottom-20 right-4 z-50">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 animate-pulse"
          >
            <Download className="w-6 h-6" />
            <div className="text-left">
              <div className="font-bold text-sm">Install App</div>
              <div className="text-xs opacity-90">Tap untuk install</div>
            </div>
          </button>
        </div>
      )}

      {/* iOS Instructions */}
      {isIOS && !isStandalone && (
        <div className="fixed bottom-20 right-4 z-50 max-w-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold text-blue-700">Install App iOS</h3>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Untuk install, tap tombol <span className="font-bold text-blue-600">Share (📤)</span> di Safari,
              lalu pilih <span className="font-bold text-blue-600">"Add to Home Screen"</span>
            </p>
            
            <button
              onClick={handleIOSInstructions}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              📋 Lihat Petunjuk Detail
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;