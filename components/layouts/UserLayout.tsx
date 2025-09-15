import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Header from '../Header';
import ToastContainer from '../ToastContainer';
import PromotionPopup from '../PromotionPopup';

// Lazy load page-level components for better code splitting
const ProductList = lazy(() => import('../ProductList'));
const ProductPreview = lazy(() => import('../ProductPreview'));
const CartView = lazy(() => import('../CartView'));
const CheckoutView = lazy(() => import('../CheckoutView'));

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const UserLayout: React.FC = () => {
  const { backgroundImage } = useTheme();

  const appStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {};

  return (
    <div className="bg-gray-50 min-h-screen font-sans" style={appStyle}>
      <Header />
      <main className="container mx-auto p-4 pb-24">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:productId" element={<ProductPreview />} />
            <Route path="/cart" element={<CartView />} />
            <Route path="/checkout" element={<CheckoutView />} />
          </Routes>
        </Suspense>
      </main>
      <ToastContainer />
      <PromotionPopup />
    </div>
  );
};

export default UserLayout;
