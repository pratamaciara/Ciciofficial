import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

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
  updateThemeSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetBackgroundImage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialThemeSettings = (): ThemeSettings => {
    const defaultSettings = {
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

    try {
      const item = window.localStorage.getItem('themeSettings');
      if (item) {
        const storedSettings = JSON.parse(item);
        // Merge stored settings with defaults to ensure new properties are present
        return {
          ...defaultSettings,
          ...storedSettings,
          popupSettings: {
            ...defaultSettings.popupSettings,
            ...(storedSettings.popupSettings || {})
          }
        };
      }
      return defaultSettings;
    } catch (error) {
      console.error(error);
      return defaultSettings;
    }
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(getInitialThemeSettings);

  useEffect(() => {
    try {
      window.localStorage.setItem('themeSettings', JSON.stringify(settings));
    } catch (error) {
      console.error(error);
    }
  }, [settings]);

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetBackgroundImage = () => {
    setSettings(prev => ({ ...prev, backgroundImage: '' }));
  }

  return (
    <ThemeContext.Provider value={{ ...settings, updateThemeSettings, resetBackgroundImage }}>
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