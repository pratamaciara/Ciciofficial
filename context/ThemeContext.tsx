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
  updateThemeSettings: (newSettings: Partial<ThemeSettings>) => Promise<void>;
  resetBackgroundImage: () => Promise<void>;
  loading: boolean;
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

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      if (!supabase) {
        console.warn("Supabase client not initialized. Using default theme.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'themeSettings')
        .single();
      
      if (data && data.value) {
        setSettings({ ...defaultSettings, ...(data.value as Partial<ThemeSettings>) });
      } else if (error && error.code !== 'PGRST116') {
        console.error("Error fetching theme settings:", error.message || error);
      }
      setLoading(false);
    };

    fetchTheme();
  }, []);
  
  const updateThemeSettings = async (newSettings: Partial<ThemeSettings>) => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot save theme.");
      return;
    }
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings); // Optimistic update

    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'themeSettings', value: updatedSettings });
    
    if (error) {
      console.error("Error saving theme settings:", error.message || error);
    }
  };

  const resetBackgroundImage = async () => {
    await updateThemeSettings({ backgroundImage: '' });
  }

  return (
    <ThemeContext.Provider value={{ ...settings, updateThemeSettings, resetBackgroundImage, loading }}>
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