import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AdminSettingsProvider } from './context/AdminSettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

const UserLayout = lazy(() => import('./components/layouts/UserLayout'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const App: React.FC = () => {
  return (
    <AdminSettingsProvider>
      <ProductProvider>
        <CartProvider>
          <ToastProvider>
            <ThemeProvider>
              <HashRouter>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/admin/*" element={<AdminLayout />} />
                    <Route path="/*" element={<UserLayout />} />
                  </Routes>
                </Suspense>
              </HashRouter>
            </ThemeProvider>
          </ToastProvider>
        </CartProvider>
      </ProductProvider>
    </AdminSettingsProvider>
  );
};

export default App;