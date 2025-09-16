import { createClient } from '@supabase/supabase-js';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- PENTING: ISI DETAIL SUPABASE ANDA DI SINI ---
// Ganti placeholder di bawah ini dengan kredensial Anda yang sebenarnya dari dashboard Supabase.
// Anda bisa mendapatkannya di bagian Settings > API.
// FIX: Add explicit string types to prevent TypeScript from inferring literal types,
// which causes an error on the credential check below once placeholders are replaced.
const supabaseUrl: string = 'https://lejagnbwthpdbsmuptbw.supabase.co'; 
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlamFnbmJ3dGhwZGJzbXVwdGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzk1MzAsImV4cCI6MjA3MzYxNTUzMH0.RWjoer0i9pzDHf5ug5THcLdMvLRvQBShiY9BoKuPtts'; 

const areCredentialsSet = supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' && supabaseUrl && supabaseAnonKey;

// Inisialisasi Supabase client hanya jika kredensial sudah diatur.
// Jika tidak, client akan bernilai null dan aplikasi akan menampilkan pesan error.
export const supabase = areCredentialsSet ? createClient(supabaseUrl, supabaseAnonKey) : null;