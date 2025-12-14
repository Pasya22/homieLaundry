// src/components/android/AndroidSideMenu.tsx
import React from 'react';
import { 
    X, 
    Home, 
    ShoppingBag, 
    Tag, 
    Users,  // Hapus RefreshCw dari sini
    Package,
    DollarSign,
    Settings,
    HelpCircle,
    FileText,
    LogOut,
    User,
    Bell,
    Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AndroidSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const AndroidSideMenu: React.FC<AndroidSideMenuProps> = ({ isOpen, onClose }) => {
    const MenuItem = ({ 
        icon: Icon, 
        label, 
        to,
        badge
    }: { 
        icon: React.ElementType; 
        label: string; 
        to: string;
        badge?: number;
    }) => (
        <Link
            to={to}
            onClick={onClose}
            className="flex items-center justify-between py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 font-medium">{label}</span>
            </div>
            {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {badge}
                </span>
            )}
        </Link>
    );

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
                    isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Side Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Homie Laundry</h1>
                                <p className="text-sm text-gray-500">Aplikasi Manajemen Laundry</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                            aria-label="Tutup menu"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-gray-900">Admin Homie</h2>
                            <p className="text-sm text-gray-500">admin@homielaundry.com</p>
                        </div>
                        <Bell className="w-5 h-5 text-gray-500" />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Menu Utama
                        </div>
                        
                        <MenuItem icon={Home} label="Dashboard" to="/dashboard" />
                        <MenuItem icon={ShoppingBag} label="Transaksi" to="/orders" badge={3} />
                        <MenuItem icon={Package} label="Order Proses" to="/process" badge={5} />
                        <MenuItem icon={Users} label="Member" to="/customers" />
                        <MenuItem icon={Tag} label="Layanan & Harga" to="/services" />
                        <MenuItem icon={DollarSign} label="Laporan Keuangan" to="/reports" />

                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                            Pengaturan
                        </div>
                        
                        <MenuItem icon={Settings} label="Pengaturan Aplikasi" to="/settings" />
                        <MenuItem icon={Shield} label="Hak Akses" to="/permissions" />
                        <MenuItem icon={FileText} label="Backup Data" to="/backup" />
                        <MenuItem icon={HelpCircle} label="Bantuan & Support" to="/help" />
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                    <button
                        onClick={() => {
                            onClose();
                            // Handle logout
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Keluar</span>
                    </button>
                    
                    <div className="text-center text-xs text-gray-500 mt-3">
                        <p>Homie Laundry v1.0.0</p>
                        <p className="mt-1">© 2024 All rights reserved</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AndroidSideMenu;