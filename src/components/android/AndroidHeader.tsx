// src/components/android/AndroidHeader.tsx
import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, Settings, User, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AndroidHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    showSearch?: boolean;
    onSearch?: (value: string) => void;
}

const AndroidHeader: React.FC<AndroidHeaderProps> = ({ 
    title, 
    showBack = false, 
    onBack,
    showSearch = false,
    onSearch 
}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 safe-area-padding-top">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <button
                                onClick={onBack}
                                className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                                aria-label="Kembali"
                            >
                                <ChevronDown className="w-6 h-6 text-gray-700 rotate-90" />
                            </button>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-500 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {showSearch && (
                            <div className="relative mr-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Cari..."
                                    className="pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                                />
                            </div>
                        )}

                        <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 relative">
                            <Bell className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-1 rounded-full active:bg-gray-100"
                            >
                                <div className="w-8 h-8 bg-blue-500 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-gray-200 w-48 py-2 z-50">
                                    <div className="px-4 py-3 border-b">
                                        <p className="font-semibold text-gray-900">Admin Homie</p>
                                        <p className="text-sm text-gray-500">admin@homielaundry.com</p>
                                    </div>
                                    
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <User className="w-5 h-5 text-gray-600" />
                                        <span>Profil</span>
                                    </Link>
                                    
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <span>Pengaturan</span>
                                    </Link>
                                    
                                    <div className="border-t my-2"></div>
                                    
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            // Handle logout
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AndroidHeader;