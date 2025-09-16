import React from 'react';

const PermissionError: React.FC = () => {
    const sqlScript = `-- SALIN DAN JALANKAN SEMUA KODE DI BAWAH INI UNTUK MERESET DAN MENGKONFIGURASI ULANG DATABASE ANDA --

-- === BAGIAN 1: PERSIAPAN DATABASE (Hanya dijalankan jika ada error) ===
-- Mengaktifkan ekstensi yang diperlukan untuk membuat ID unik (UUID).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- === BAGIAN 2: RESET DAN BUAT ULANG TABEL DENGAN STRUKTUR YANG LEBIH BAIK ===
-- Menghapus tabel lama untuk memastikan tidak ada sisa konfigurasi yang salah.
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.settings;

-- Membuat tabel 'products' baru dengan ID unik (UUID) yang dibuat otomatis oleh database.
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  originalPrice NUMERIC,
  salesCount INTEGER,
  stock INTEGER NOT NULL,
  category TEXT,
  imageUrl TEXT NOT NULL,
  whatsappImageUrl TEXT,
  variants JSONB
);

-- Membuat tabel 'settings'.
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB
);


-- === BAGIAN 3: ATUR SEMUA IZIN KEAMANAN (ROW LEVEL SECURITY) SECARA EKSPLISIT ===
-- Mengaktifkan keamanan untuk semua tabel.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Memberi izin SEMUA ORANG untuk MELIHAT (READ) data.
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);

-- Memberi izin APLIKASI untuk MENAMBAH (INSERT) data baru.
DROP POLICY IF EXISTS "Allow anonymous insert for products" ON public.products;
CREATE POLICY "Allow anonymous insert for products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous insert for settings" ON public.settings;
CREATE POLICY "Allow anonymous insert for settings" ON public.settings FOR INSERT WITH CHECK (true);

-- Memberi izin APLIKASI untuk MENGUBAH (UPDATE) data yang ada.
DROP POLICY IF EXISTS "Allow anonymous update for products" ON public.products;
CREATE POLICY "Allow anonymous update for products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anonymous update for settings" ON public.settings;
CREATE POLICY "Allow anonymous update for settings" ON public.settings FOR UPDATE USING (true);

-- Memberi izin APLIKASI untuk MENGHAPUS (DELETE) data.
DROP POLICY IF EXISTS "Allow anonymous delete for products" ON public.products;
CREATE POLICY "Allow anonymous delete for products" ON public.products FOR DELETE USING (true);
DROP POLICY IF EXISTS "Allow anonymous delete for settings" ON public.settings;
CREATE POLICY "Allow anonymous delete for settings" ON public.settings FOR DELETE USING (true);


-- === BAGIAN 4: ATUR IZIN UNTUK PENYIMPANAN GAMBAR (STORAGE) ===
-- Membuat 'lemari' (bucket) untuk gambar jika belum ada.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Memberi izin SEMUA ORANG untuk MELIHAT gambar.
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
CREATE POLICY "Allow public read access on product images" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
-- Memberi izin APLIKASI untuk MENGUNGGAH gambar.
DROP POLICY IF EXISTS "Allow anonymous uploads on product images" ON storage.objects;
CREATE POLICY "Allow anonymous uploads on product images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );
-- Memberi izin APLIKASI untuk MENGHAPUS gambar.
DROP POLICY IF EXISTS "Allow anonymous deletes on product images" ON storage.objects;
CREATE POLICY "Allow anonymous deletes on product images" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' );


-- === BAGIAN 5: ISI DATA AWAL AGAR TOKO TIDAK KOSONG ===
-- Memasukkan data pengaturan default.
INSERT INTO public.settings (key, value)
VALUES 
  ('whatsAppNumber', '"6281234567890"'),
  ('themeSettings', '{
    "storeName": "CICI NYEMIL",
    "storeDescription": "Yuk jajan di cici nyemil di jamin ketagihan",
    "instagramUrl": "",
    "facebookUrl": "",
    "tiktokUrl": "",
    "backgroundImage": "",
    "popupSettings": {
      "enabled": false,
      "imageUrl": "",
      "linkProductId": null
    }
  }')
ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value;

-- Memasukkan data produk contoh.
INSERT INTO public.products (name, description, price, stock, category, imageUrl, variants)
VALUES
  ('basreng cili oil', 'Basreng (Bakso Goreng) renyah dengan bumbu chili oil pedas yang bikin nagih!', 10000, 15, 'Cemilan Pedas', 'https://i.postimg.cc/fLtmmqGB/Whats-App-Image-2025-09-15-at-14-35-13.jpg', '[{"id": "v1", "name": "Original", "priceModifier": 0}]'),
  ('ALPUKAT KOCOK', 'Minuman segar dari alpukat mentega asli yang dikocok, creamy dan menyehatkan.', 10000, 20, 'Minuman', 'https://i.postimg.cc/HLLQskBG/Whats-App-Image-2025-09-15-at-09-43-03.jpg', '[{"id": "v2", "name": "Original", "priceModifier": 0}]');
`;
  return (
    <div className="bg-orange-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl text-left border-t-4 border-orange-500">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">Langkah Terakhir: Atur Izin Database Anda</h1>
        <p className="text-gray-700 mb-4">
          Selamat! Website Anda sudah berhasil terhubung ke database. Langkah terakhir adalah memberikan izin kepada Panel Admin Anda agar bisa menambah, mengubah, dan menghapus produk.
        </p>
        <p className="text-gray-600 mb-6">
          Ini adalah fitur keamanan standar dari Supabase. Anda hanya perlu menjalankan skrip di bawah ini <strong>satu kali saja</strong> untuk mengatur semuanya secara otomatis.
        </p>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg mb-6">
          <p><strong className="font-bold">Perhatian:</strong> Skrip ini akan mereset daftar produk Anda ke data contoh awal untuk memastikan semuanya kembali sinkron dan bebas dari error.</p>
        </div>
        <div className="space-y-4">
          <p><strong>Langkah 1:</strong> Buka proyek Anda di Supabase, lalu navigasi ke menu <strong>SQL Editor</strong>.</p>
          <p><strong>Langkah 2:</strong> Klik <strong>+ New query</strong>, lalu salin dan tempel seluruh kode di bawah ini.</p>
          <p><strong>Langkah 3:</strong> Klik tombol <strong>RUN</strong>. Ini mungkin memakan waktu beberapa detik.</p>
        </div>
        <div className="mt-6">
          <textarea
            readOnly
            value={sqlScript}
            rows={15}
            className="w-full p-3 font-mono text-sm bg-gray-900 text-green-400 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(sqlScript);
              alert('Kode SQL telah disalin ke clipboard!');
            }}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold"
          >
            Salin Kode
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-500">Setelah berhasil menjalankan skrip, muat ulang (refresh) halaman ini. Semuanya akan berfungsi dengan normal.</p>
      </div>
    </div>
  );
};

export default PermissionError;