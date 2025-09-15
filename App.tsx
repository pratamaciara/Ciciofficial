import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AdminSettingsProvider } from './context/AdminSettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

const App: React.FC = () => {
  return (
    <AdminSettingsProvider>
      <ProductProvider>
        <CartProvider>
          <ToastProvider>
            <ThemeProvider>
              <HashRouter>
                <Routes>
                  <Route path="/admin/*" element={<AdminLayout />} />
                  <Route path="/*" element={<UserLayout />} />
                </Routes>
              </HashRouter>
            </ThemeProvider>
          </ToastProvider>
        </CartProvider>
      </ProductProvider>
    </AdminSettingsProvider>
  );
};

export default App;
