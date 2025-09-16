import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../utils/formatter';

interface PopupSettings {
  enabled: boolean;
  imageUrl: string;
  linkProductId: string | null;
}

interface ThemeSettings {
  storeName: string;
  storeDescription: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  backgroundImage: string;
  popupSettings: PopupSettings;
}

interface ThemeContextType extends ThemeSettings {
  updateThemeSettings: (newSettings: Partial<ThemeSettings>) => Promise<{ success: boolean; error?: any; }>;
  resetBackgroundImage: () => Promise<{ success: boolean; error?: any; }>;
  loading: boolean;
  error: any | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultSettings: ThemeSettings = {
    storeName: 'CICI NYEMIL',
    storeDescription: 'Yuk jajan di cici nyemil di jamin ketagihan',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    backgroundImage: '',
    popupSettings: {
        enabled: false,
        imageUrl: '',
        linkProductId: null,
    }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      setError(null);
      if (!supabase) {
        console.warn("Supabase client not initialized. Using default theme.");
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'themeSettings')
        .single();
      
      if (data && data.value) {
        setSettings({ ...defaultSettings, ...(data.value as Partial<ThemeSettings>) });
      } else if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching theme settings:", fetchError.message || fetchError);
        setError(fetchError);
      }
      setLoading(false);
    };

    fetchTheme();
  }, []);
  
  const updateThemeSettings = async (newSettings: Partial<ThemeSettings>) => {
    setError(null);
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot save theme.");
      console.error(err);
      setError(err);
      return { success: false, error: err };
    }
    const oldSettings = settings;
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings); // Optimistic update

    const { error: upsertError } = await supabase
      .from('settings')
      .upsert({ key: 'themeSettings', value: updatedSettings });
    
    if (upsertError) {
      console.error("Error saving theme settings:", upsertError.message || upsertError);
      setError(upsertError);
      setSettings(oldSettings); // Rollback
      return { success: false, error: upsertError };
    }
    return { success: true };
  };

  const resetBackgroundImage = async () => {
    return await updateThemeSettings({ backgroundImage: '' });
  }

  return (
    <ThemeContext.Provider value={{ ...settings, updateThemeSettings, resetBackgroundImage, loading, error }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
