// src/components/android/AndroidCard.tsx
import React from 'react';

interface AndroidCardProps {
    children: React.ReactNode;
    className?: string;
    elevation?: 'low' | 'medium' | 'high';
    onClick?: () => void;
}

const AndroidCard: React.FC<AndroidCardProps> = ({ 
    children, 
    className = '',
    elevation = 'medium',
    onClick 
}) => {
    const elevationClasses = {
        low: 'shadow-sm',
        medium: 'shadow',
        high: 'shadow-lg'
    };

    return (
        <div 
            className={`
                bg-white rounded-xl border border-gray-200
                ${elevationClasses[elevation]}
                ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default AndroidCard;