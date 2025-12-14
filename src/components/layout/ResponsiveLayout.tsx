// src/components/layout/ResponsiveLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    ShoppingBag,
    RefreshCw,
    Tag,
    Users,
    Menu,
    X,
    Search,
    ArrowLeft,
    Bell,
    Settings,
    LogOut
} from 'lucide-react';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    showSearch?: boolean;
    onSearch?: (value: string) => void;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
    children,
    title = 'Homie Laundry',
    showBack = false,
    showSearch = false,
    onSearch
}) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Navigation items
    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: ShoppingBag, label: 'Transaksi', path: '/orders' },
        { icon: RefreshCw, label: 'Proses', path: '/process' },
        { icon: Tag, label: 'Layanan', path: '/services' },
        { icon: Users, label: 'Member', path: '/customers' },
    ];

    const isActive = (path: string) => {
        return location.pathname === path || 
               (path === '/dashboard' && location.pathname === '/');
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col z-30">
                {/* Logo */}
                <div className="p-6 border-b">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                Homie Laundry
                            </h1>
                            <p className="text-xs text-gray-500">Business Management</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                                        active
                                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'stroke-blue-500' : 'stroke-gray-500'}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile & Settings */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition duration-200 cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">Admin</p>
                            <p className="text-xs text-gray-500">admin@homielaundry.com</p>
                        </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200">
                            <Settings className="w-5 h-5 stroke-gray-500" />
                            <span>Pengaturan</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200">
                            <LogOut className="w-5 h-5 stroke-red-500" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {showBack ? (
                                <button 
                                    onClick={() => window.history.back()}
                                    className="text-gray-600 hover:text-gray-900 p-1"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="text-gray-600 hover:text-gray-900 p-1"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                            )}
                            
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button className="text-gray-600 hover:text-gray-900 p-2">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar (Mobile) */}
                    {showSearch && (
                        <div className="mt-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Cari..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Homie Laundry</h1>
                                <p className="text-xs text-gray-500">Business Management</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">AD</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Admin</p>
                            <p className="text-sm text-gray-500">admin@homielaundry.com</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                                        active
                                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'stroke-blue-500' : 'stroke-gray-500'}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                    
                    {/* Settings */}
                    <div className="mt-8 space-y-1">
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200">
                            <Settings className="w-5 h-5 stroke-gray-500" />
                            <span className="font-medium">Pengaturan</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition duration-200">
                            <LogOut className="w-5 h-5 stroke-red-500" />
                            <span className="font-medium">Keluar</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`lg:ml-64 pt-16 lg:pt-0 ${isSidebarOpen ? 'blur-sm' : ''}`}>
                <div className="p-4 lg:p-6 min-h-screen">
                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                <p className="text-gray-600 mt-1">Selamat datang kembali, Admin!</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {showSearch && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={searchValue}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Cari..."
                                            className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                                
                                <button className="text-gray-600 hover:text-gray-900 p-2 relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center cursor-pointer">
                                    <span className="text-white font-bold text-sm">AD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content */}
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-16 ${
                                    active ? 'text-blue-500' : 'text-gray-500'
                                }`}
                            >
                                <div className={`p-2 rounded-lg ${
                                    active ? 'bg-blue-50' : ''
                                }`}>
                                    <Icon className={`w-5 h-5 ${active ? 'stroke-blue-500' : 'stroke-gray-500'}`} />
                                </div>
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom padding for mobile navigation */}
            <div className="lg:hidden h-16"></div>
        </div>
    );
};

export default ResponsiveLayout;