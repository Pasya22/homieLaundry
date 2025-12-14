// src/components/android/SwipeableListItem.tsx
import React, { useRef, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface SwipeableListItemProps {
    children: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
    children,
    onEdit,
    onDelete
}) => {
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        // Only allow left swipe
        if (diff > 0) {
            setCurrentX(-Math.min(diff, 120)); // Max 120px swipe
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);

        // If swiped more than 60px, snap to full swipe
        if (currentX < -60) {
            setCurrentX(-120);
        } else {
            // Otherwise, snap back
            setCurrentX(0);
        }
    };

    const handleReset = () => {
        setCurrentX(0);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Actions */}
            <div className="absolute right-0 top-0 bottom-0 flex">
                {onEdit && (
                    <button
                        onClick={() => {
                            onEdit();
                            handleReset();
                        }}
                        className="w-20 bg-blue-500 flex items-center justify-center"
                        aria-label="Edit"
                    >
                        <Edit className="w-5 h-5 text-white" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => {
                            onDelete();
                            handleReset();
                        }}
                        className="w-20 bg-red-500 flex items-center justify-center"
                        aria-label="Hapus"
                    >
                        <Trash2 className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div
                ref={itemRef}
                className="relative bg-white transition-transform duration-300"
                style={{ transform: `translateX(${currentX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => {
                    setStartX(e.clientX);
                    setIsSwiping(true);
                }}
                onMouseMove={(e) => {
                    if (!isSwiping) return;
                    const diff = startX - e.clientX;
                    if (diff > 0) {
                        setCurrentX(-Math.min(diff, 120));
                    }
                }}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};

export default SwipeableListItem;