// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  RefreshCw,
  Tag,
  Users,
  Download,
  CloudOff,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
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
    const userData = authService.getUser();
    setUser(userData);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const NavItem = ({
    icon: Icon,
    label,
    to,
  }: {
    icon: React.ElementType;
    label: string;
    to: string;
  }) => {
    const isActive =
      location.pathname === to ||
      (to === '/dashboard' && location.pathname === '/');

    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all duration-200 ${isActive
            ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md scale-105'
            : 'text-sky-600 hover:bg-sky-50 hover:text-sky-700'
          }`}
      >
        <Icon
          className={`w-5 h-5 ${isActive ? 'stroke-white' : 'stroke-sky-600'
            }`}
        />
        <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-semibold'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white pb-24">
      {/* Header - Sky Blue Theme */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b-2 border-sky-100">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="p-1 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl border border-sky-200 shadow-sm group-hover:shadow transition-all">
                <img src="/Logo-min.png" alt="Homie Laundry" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 group-hover:opacity-85 text-transparent bg-clip-text block leading-tight">
                  Homie Laundry
                </span>
                <span className="text-[11px] font-medium text-sky-500 hidden sm:block">
                  Sistem Manajemen Laundry
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {/* Offline Indicator */}
              {isOffline && (
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <CloudOff className="w-3.5 h-3.5" />
                  Offline
                </span>
              )}

              {/* Install Button */}
              {isInstallable && (
                <button
                  onClick={handleInstall}
                  className="text-xs bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 font-bold"
                  title="Install Aplikasi"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install</span>
                </button>
              )}

              {/* Online Indicator */}
              {!isOffline && (
                <span className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="hidden xs:inline">Online</span>
                </span>
              )}

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-2 rounded-xl transition-all duration-200 shadow-sm"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="hidden sm:inline font-bold text-sky-800">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-sky-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-sky-100 py-2 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-white border-b border-sky-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sky-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-sky-500 truncate">{user?.email || 'user@homie.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-sky-800 hover:bg-sky-50 transition-colors duration-200"
                      >
                        <User className="w-4 h-4 text-sky-500" />
                        <span>Profile Saya</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>

                    {/* App Info */}
                    <div className="px-4 py-2 bg-sky-50/60 border-t border-sky-100">
                      <p className="text-[11px] font-medium text-sky-500 text-center">
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
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-2 rounded-2xl shadow-lg z-40 flex items-center gap-2">
          <CloudOff className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold">Anda sedang offline</span>
        </div>
      )}

      {/* Bottom Navigation - Sky Blue Theme */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-sky-100 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-2">
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