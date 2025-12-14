// src/components/android/AndroidNavBar.tsx
import React from 'react';
import { 
    Home, 
    ShoppingBag, 
    RefreshCw, 
    Tag, 
    Users,
    PlusCircle,
    Menu
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AndroidNavBarProps {
    onMenuClick?: () => void;
}

const AndroidNavBar: React.FC<AndroidNavBarProps> = ({ onMenuClick }) => {
    const location = useLocation();
    
    const isActive = (path: string) => {
        return location.pathname === path || 
               (path === '/dashboard' && location.pathname === '/');
    };

    const NavItem = ({ 
        icon: Icon, 
        label, 
        to,
        showBadge = false
    }: { 
        icon: React.ElementType; 
        label: string; 
        to: string;
        showBadge?: boolean;
    }) => (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center flex-1 py-2 ${
                isActive(to) 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
            } transition-colors duration-200 active:bg-gray-100 rounded-lg`}
        >
            <div className="relative">
                <Icon className={`w-6 h-6 ${isActive(to) ? 'stroke-blue-600' : 'stroke-gray-500'}`} />
                {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
            </div>
            <span className="text-xs mt-1 font-medium">{label}</span>
            {isActive(to) && (
                <div className="w-1/2 h-1 bg-blue-600 rounded-full mt-1"></div>
            )}
        </Link>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-padding-bottom">
            {/* Floating Action Button */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <Link
                    to="/orders/create"
                    className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 hover:bg-blue-600 active:bg-blue-700"
                    aria-label="Buat transaksi baru"
                >
                    <PlusCircle className="w-7 h-7 text-white" />
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center h-16 px-2">
                <button
                    onClick={onMenuClick}
                    className="w-12 h-12 flex items-center justify-center rounded-full active:bg-gray-100"
                    aria-label="Menu"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                
                <div className="flex-1 flex items-center justify-around">
                    <NavItem icon={Home} label="Home" to="/dashboard" />
                    <NavItem icon={ShoppingBag} label="Transaksi" to="/orders" showBadge />
                    <div className="w-14"></div> {/* Spacer for FAB */}
                    <NavItem icon={RefreshCw} label="Proses" to="/process" />
                    <NavItem icon={Tag} label="Harga" to="/services" />
                    <NavItem icon={Users} label="Member" to="/customers" />
                </div>
            </div>
        </div>
    );
};

export default AndroidNavBar;