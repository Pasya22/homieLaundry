// src/components/layout/AndroidLayout.tsx
import React, { useState } from 'react';
import AndroidHeader from '../android/AndroidHeader';
import AndroidNavBar from '../android/AndroidNavBar';
import AndroidSideMenu from '../android/AndroidSideMenu';

interface AndroidLayoutProps {
    children: React.ReactNode;
    title: string;
    showBack?: boolean;
    showSearch?: boolean;
    onSearch?: (value: string) => void;
}

const AndroidLayout: React.FC<AndroidLayoutProps> = ({
    children,
    title,
    showBack = false,
    showSearch = false,
    onSearch
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 safe-area-padding">
            {/* Side Menu */}
            <AndroidSideMenu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
            />

            {/* Header */}
            <AndroidHeader
                title={title}
                showBack={showBack}
                onBack={() => window.history.back()}
                showSearch={showSearch}
                onSearch={onSearch}
            />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>

            {/* Bottom Navigation */}
            <AndroidNavBar onMenuClick={() => setShowMenu(true)} />
        </div>
    );
};

export default AndroidLayout;