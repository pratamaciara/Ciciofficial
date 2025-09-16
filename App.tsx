import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AdminSettingsProvider } from './context/AdminSettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './utils/formatter';

const UserLayout = lazy(() => import('./components/layouts/UserLayout'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const ConfigurationError = () => (
  <div className="bg-red-50 min-h-screen flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl text-center border-t-4 border-red-500">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Kesalahan Konfigurasi Database</h1>
      <p className="text-gray-700 mb-2">
        URL Supabase yang dimasukkan tidak valid. URL harus dimulai dengan <code className="bg-gray-200 px-1 rounded">https://</code>.
      </p>
      <p className="text-gray-600 mb-6">
        Harap periksa kembali kredensial Supabase Anda di dashboard pada bagian <span className="font-semibold">Settings &gt; API</span> dan pastikan Anda menyalin nilai yang benar.
      </p>
      <div className="bg-gray-100 p-4 rounded-md text-left text-sm text-gray-800 space-y-3">
        <strong className="block">Untuk Developer:</strong>
        <p>Buka file <code className="font-mono bg-gray-200 px-1 rounded">utils/formatter.ts</code> dan pastikan nilainya sesuai format di bawah ini:</p>
        <div>
          <label className="font-semibold block">supabaseUrl:</label>
          <code className="font-mono bg-gray-200 px-1 rounded break-all">const supabaseUrl = 'https://abcdefghijk.supabase.co';</code>
          <span className="text-xs text-gray-500 block"> (Ini adalah Project URL Anda)</span>
        </div>
        <div>
          <label className="font-semibold block">supabaseAnonKey:</label>
          <code className="font-mono bg-gray-200 px-1 rounded break-all">const supabaseAnonKey = 'eyJh...';</code>
          <span className="text-xs text-gray-500 block"> (Ini adalah Project API Key Anda yang berlabel `anon` dan `public`)</span>
        </div>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  if (!supabase) {
    return <ConfigurationError />;
  }
  
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