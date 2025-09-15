import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Header from '../Header';
import ProductList from '../ProductList';
import CartView from '../CartView';
import CheckoutView from '../CheckoutView';
import AdminView from '../AdminView';
import ToastContainer from '../ToastContainer';
import ProductPreview from '../ProductPreview';
import PromotionPopup from '../PromotionPopup';

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
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:productId" element={<ProductPreview />} />
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<CheckoutView />} />
        </Routes>
      </main>
      <ToastContainer />
      <PromotionPopup />
    </div>
  );
};

export default UserLayout;
