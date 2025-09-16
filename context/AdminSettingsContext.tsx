import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../utils/formatter';

interface AdminSettingsContextType {
  whatsAppNumber: string;
  setWhatsAppNumber: (number: string) => Promise<{ success: boolean; error?: any; }>;
  loading: boolean;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

const defaultWhatsAppNumber = '6281234567890'; // Fallback number

export const AdminSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whatsAppNumber, setWhatsAppNumberState] = useState<string>(defaultWhatsAppNumber);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      if (!supabase) {
        console.warn("Supabase client not initialized. Using default settings.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'whatsAppNumber')
        .single();
      
      if (data && data.value) {
        setWhatsAppNumberState(data.value);
      } else if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Error fetching WhatsApp number:", error.message || error);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const setWhatsAppNumber = async (number: string) => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot save settings.");
      return { success: false, error: new Error("Supabase client not initialized") };
    }
    const oldNumber = whatsAppNumber;
    setWhatsAppNumberState(number); // Optimistic update
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'whatsAppNumber', value: number });

    if (error) {
      console.error("Error saving WhatsApp number:", error.message || error);
      setWhatsAppNumberState(oldNumber); // Rollback on error
      return { success: false, error };
    }
    return { success: true };
  };

  return (
    <AdminSettingsContext.Provider value={{ whatsAppNumber, setWhatsAppNumber, loading }}>
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