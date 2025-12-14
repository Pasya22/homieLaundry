// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, RefreshCw, Tag, Users, Download, CloudOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check for PWA installability
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check online status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const NavItem = ({ 
    icon: Icon, 
    label, 
    to 
  }: { 
    icon: React.ElementType; 
    label: string; 
    to: string; 
  }) => {
    const isActive = location.pathname === to || 
                    (to === '/dashboard' && location.pathname === '/');
    
    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center w-16 ${
          isActive 
            ? 'text-blue-500' 
            : 'text-gray-500 hover:text-blue-500'
        } transition duration-200`}
      >
        <Icon className={`w-6 h-6 ${isActive ? 'stroke-blue-500' : 'stroke-gray-500'}`} />
        <span className="text-xs mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <Link to="/dashboard" className="text-xl font-bold text-blue-700 bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Homie Laundry
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {isOffline && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <CloudOff className="w-3 h-3" />
                  Offline
                </span>
              )}
              {isInstallable && (
                <button
                  onClick={handleInstall}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition duration-200 flex items-center gap-1"
                  title="Install Aplikasi"
                >
                  <Download className="w-3 h-3" />
                  Install
                </button>
              )}
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Live
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Offline Warning */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-40 flex items-center gap-2">
          <CloudOff className="w-4 h-4" />
          <span className="text-sm font-medium">Anda sedang offline</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <NavItem icon={Home} label="Home" to="/dashboard" />
          <NavItem icon={ShoppingBag} label="Transaksi" to="/orders" />
          <NavItem icon={RefreshCw} label="Proses" to="/process" />
          <NavItem icon={Tag} label="Harga" to="/services" />
          <NavItem icon={Users} label="Member" to="/customers" />
        </div>
      </nav>
    </div>
  );
};

export default Layout;