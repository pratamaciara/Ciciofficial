import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../utils/formatter';

interface AdminSettingsContextType {
  whatsAppNumber: string;
  setWhatsAppNumber: (number: string) => Promise<{ success: boolean; error?: any; }>;
  loading: boolean;
  loadError: any | null; // Error saat memuat data awal
  actionError: any | null; // Error saat melakukan aksi (menyimpan)
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

const defaultWhatsAppNumber = '6281234567890'; // Fallback number

export const AdminSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whatsAppNumber, setWhatsAppNumberState] = useState<string>(defaultWhatsAppNumber);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<any | null>(null);
  const [actionError, setActionError] = useState<any | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setLoadError(null);
      if (!supabase) {
        console.warn("Supabase client not initialized. Using default settings.");
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'whatsAppNumber')
        .single();
      
      if (data && data.value) {
        setWhatsAppNumberState(data.value);
      } else if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Error fetching WhatsApp number:", fetchError.message || fetchError);
        setLoadError(fetchError);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const setWhatsAppNumber = async (number: string) => {
    setActionError(null); // Hapus error aksi sebelumnya
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot save settings.");
      const err = new Error("Supabase client not initialized");
      setActionError(err);
      return { success: false, error: err };
    }
    const oldNumber = whatsAppNumber;
    setWhatsAppNumberState(number); // Optimistic update
    const { error: upsertError } = await supabase
      .from('settings')
      .upsert({ key: 'whatsAppNumber', value: number });

    if (upsertError) {
      console.error("Error saving WhatsApp number:", upsertError.message || upsertError);
      setActionError(upsertError);
      setWhatsAppNumberState(oldNumber); // Rollback on error
      return { success: false, error: upsertError };
    }
    return { success: true };
  };

  return (
    <AdminSettingsContext.Provider value={{ whatsAppNumber, setWhatsAppNumber, loading, loadError, actionError }}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = (): AdminSettingsContextType => {
  const context = useContext(AdminSettingsContext);
  if (context === undefined) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
};