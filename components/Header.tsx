import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12.52.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.15 3.05.27 4.58.59-.28 1.16-.58 1.71-.91.1-.05.21-.09.3-.15.34-.17.65-.38.91-.62.21-.2.37-.45.5-.72.03-.06.05-.12.08-.18.02-.03.04-.06.05-.09.34-.63.03-1.48-.63-1.78-.17-.08-.36-.11-.55-.11-.29 0-.58.05-.86.16-.3.11-.57.28-.83.47-.36.26-.72.53-1.08.79-.18.13-.35.26-.53.39-.34.25-.67.51-1.01.76-.23.17-.46.33-.7.5-.59.42-1.17.85-1.76 1.27-.08.06-.15.11-.23.17-.23.16-.45.33-.68.49-.23.17-.46.33-.69.5-.23.16-.46.33-.68.49-.24.17-.48.34-.71.52-.25.18-.5.37-.75.55-.38.28-.76.57-1.14.85-.22.16-.43.33-.65.49-.3.22-.6.45-.9.67-.16.12-.32.24-.48.36-.2.15-.4.3-.6.45-.2.15-.4.3-.6.45-.14.1-.28.21-.42.31-.5.37-1.01.74-1.52 1.11-.08.06-.16.12-.24.18-.18.13-.36.27-.54.4-.1.08-.2.15-.3.23-.21.16-.42.33-.62.5-.2.17-.39.35-.58.53-.19.18-.38.36-.56.55-.1.1-.19.2-.29.3-.12.13-.24.26-.35.4-.18.23-.34.47-.49.73-.21.35-.32.75-.32 1.15 0 .2.02.4.05.6.09.52.33 1.01.71 1.38.1.1.2.19.3.29.3.31.65.57 1.02.78.18.1.37.19.56.27.2.08.39.15.59.21.33.1.66.16 1 .2.38.04.76.07 1.14.09 2.4.14 4.8.21 7.2.22.16 0 .32 0 .48-.02-1.43-1.54-2.79-3.15-4.1-4.83.1-3.17.15-6.32.26-9.47zm-1.12 6.55c.19 2.58.33 5.16.48 7.74-.25-.16-.49-.33-.73-.5-1.13-.8-2.2-1.68-3.21-2.62-1.02-.95-1.95-1.99-2.77-3.1-.38-.52-.71-1.07-.98-1.67-.09-.2-.17-.4-.24-.61-.06-.18-.1-.36-.14-.54-.04-.2-.07-.4-.08-.61-.02-.3.04-.6.16-.88.19-.44.51-.81.93-1.07.2-.12.42-.21.64-.28.43-.13.88-.19 1.33-.19.33 0 .66.04.98.11.48.11.95.29 1.4.53.47.25.92.53 1.36.83.45.3.88.63 1.31.96z"></path>
    </svg>
);


const Header: React.FC = () => {
    const { getCartItemCount } = useCart();
    const { storeName, storeDescription, instagramUrl, facebookUrl, tiktokUrl } = useTheme();
    const cartCount = getCartItemCount();

    const navLinkClasses = "text-gray-600 hover:text-primary transition-colors";
    const activeNavLinkClasses = "text-primary font-semibold";

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                        <NavLink to="/" className="text-xl sm:text-2xl font-bold text-primary truncate">
                            {storeName || 'TokoKoo'}
                        </NavLink>
                         {storeDescription && <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{storeDescription}</p>}
                    </div>
                    <nav className="flex items-center space-x-4 sm:space-x-6">
                        <div className="hidden sm:flex items-center space-x-3">
                            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={navLinkClasses}><InstagramIcon/></a>}
                            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={navLinkClasses}><FacebookIcon/></a>}
                            {tiktokUrl && <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className={navLinkClasses}><TikTokIcon/></a>}
                        </div>
                        <NavLink to="/cart" className={({ isActive }) => `${isActive ? activeNavLinkClasses : navLinkClasses} relative`}>
                            <CartIcon />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </NavLink>
                    </nav>
                </div>
                <div className="flex sm:hidden items-center justify-center space-x-4 mt-2 border-t pt-2">
                    {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={navLinkClasses}><InstagramIcon/></a>}
                    {facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={navLinkClasses}><FacebookIcon/></a>}
                    {tiktokUrl && <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className={navLinkClasses}><TikTokIcon/></a>}
                </div>
            </div>
        </header>
    );
};

export default Header;