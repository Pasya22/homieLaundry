// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, RefreshCw, Tag, Users, Download, CloudOff, LogOut, User, ChevronDown, NotebookText } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userData = authService.getUser();
    setUser(userData);

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

    // Close user menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('click', handleClickOutside);
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

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      try {
        await authService.logout();
        // authService.logout() will automatically redirect to /login
      } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if API call fails
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
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
        className={`flex flex-col items-center justify-center w-16 ${isActive
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
              {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md"> */}
              {/* <ShoppingBag className="w-6 h-6 text-white" /> */}
              <img src="../../../public/Logo-min-asli.png" alt="" className="w-12 h-12 " />
              {/* </div> */}
              <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 hover:opacity-80 text-transparent bg-clip-text">
                Homie Laundry
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Offline Indicator */}
              {isOffline && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <CloudOff className="w-3 h-3" />
                  Offline
                </span>
              )}

              {/* Install Button */}
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

              {/* Live Indicator */}
              {!isOffline && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </span>
              )}

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition duration-200"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-60">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || 'user@homie.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition duration-200"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Profile Saya</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>

                    {/* App Info */}
                    <div className="px-4 py-2 border-t border-gray-200 mt-1">
                      <p className="text-xs text-gray-500 text-center">
                        Homie Laundry v1.0.0
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-40 flex items-center gap-2 animate-fade-in">
          <CloudOff className="w-4 h-4" />
          <span className="text-sm font-medium">Anda sedang offline</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <NavItem icon={Home} label="Home" to="/dashboard" />
          {/* <NavItem icon={NotebookText} label="History" to="/history" /> */}
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