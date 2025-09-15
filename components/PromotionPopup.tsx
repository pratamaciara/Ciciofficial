import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PromotionPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { popupSettings } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const hasBeenDismissed = sessionStorage.getItem('popupDismissed');
        
        // Only show the popup on the homepage ('/')
        if (
            location.pathname === '/' &&
            !hasBeenDismissed &&
            popupSettings.enabled &&
            popupSettings.imageUrl &&
            popupSettings.linkProductId
        ) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 500); // Delay to allow the page to render first
            return () => clearTimeout(timer);
        } else {
             setIsOpen(false);
        }
    }, [popupSettings, location.pathname]); // Re-check when path changes

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('popupDismissed', 'true');
    };

    const handleClick = () => {
        if (popupSettings.linkProductId) {
            navigate(`/product/${popupSettings.linkProductId}`);
            handleClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
             onClick={handleClose}
        >
            <div 
                className="relative bg-transparent rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the content
            >
                <style>{`
                    @keyframes fade-in-scale {
                        0% { opacity: 0; transform: scale(0.95); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in-scale {
                        animation: fade-in-scale 0.3s forwards;
                    }
                `}</style>
                <button
                    onClick={handleClose}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 text-gray-800 hover:text-black hover:bg-gray-200 z-10 shadow-lg"
                    aria-label="Tutup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div onClick={handleClick} className="cursor-pointer">
                    <img src={popupSettings.imageUrl} alt="Promosi" className="w-full h-auto object-contain rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export default PromotionPopup;