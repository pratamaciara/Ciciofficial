import React, { lazy, Suspense, useContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider, useProducts, ProductContext } from './context/ProductContext';
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

const PermissionError = () => {
    const sqlScript = `-- 1. Izinkan menambah (INSERT) produk baru
CREATE POLICY "Allow anonymous inserts for products"
ON public.products
FOR INSERT
WITH CHECK (true);

-- 2. Izinkan mengubah (UPDATE) produk yang ada
CREATE POLICY "Allow anonymous updates for products"
ON public.products
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 3. Izinkan menghapus (DELETE) produk
CREATE POLICY "Allow anonymous deletes for products"
ON public.products
FOR DELETE
USING (true);

-- 4. Izinkan menambah/mengubah (UPSERT) pengaturan
CREATE POLICY "Allow anonymous inserts for settings"
ON public.settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anonymous updates for settings"
ON public.settings
FOR UPDATE
USING (true)
WITH CHECK (true);
`;
  return (
    <div className="bg-orange-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl text-left border-t-4 border-orange-500">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">Aksi Diperlukan: Atur Izin Database</h1>
        <p className="text-gray-700 mb-4">
          Aplikasi Anda berhasil terhubung ke database, tetapi tidak memiliki izin untuk menambah, mengubah, atau menghapus data. Ini adalah fitur keamanan Supabase yang disebut "Row Level Security".
        </p>
        <p className="text-gray-600 mb-6">
          Untuk memperbaikinya, Anda hanya perlu menjalankan skrip SQL di bawah ini <strong>satu kali</strong> di dashboard Supabase Anda.
        </p>
        <div className="space-y-4">
          <p><strong>Langkah 1:</strong> Buka proyek Anda di Supabase, lalu navigasi ke menu <strong>SQL Editor</strong>.</p>
          <p><strong>Langkah 2:</strong> Klik <strong>+ New query</strong>, lalu salin dan tempel seluruh kode di bawah ini.</p>
          <p><strong>Langkah 3:</strong> Klik tombol <strong>RUN</strong>.</p>
        </div>
        <div className="mt-6">
          <textarea
            readOnly
            value={sqlScript}
            rows={10}
            className="w-full p-3 font-mono text-sm bg-gray-900 text-green-400 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => navigator.clipboard.writeText(sqlScript)}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold"
          >
            Salin Kode
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-500">Setelah menjalankan skrip, muat ulang (refresh) halaman ini.</p>
      </div>
    </div>
  );
};


const AppContent = () => {
  const { error: productError } = useProducts();
  
  // Periksa kode error spesifik dari Supabase (Postgres) untuk 'permission denied'
  if (productError && productError.code === '42501') {
    return <PermissionError />;
  }

  return (
    <HashRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/*" element={<UserLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};


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
              <AppContent />
            </ThemeProvider>
          </ToastProvider>
        </CartProvider>
      </ProductProvider>
    </AdminSettingsProvider>
  );
};

export default App;