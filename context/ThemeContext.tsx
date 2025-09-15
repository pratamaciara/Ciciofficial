
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

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
    const settingsDocRef = doc(db, 'settings', 'theme');
    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<ThemeSettings>;
        // Merge with defaults to ensure all keys are present
        setSettings(prev => ({
          ...defaultSettings,
          ...prev, // Keep current state to avoid flickering before new data
          ...data,
          popupSettings: { ...defaultSettings.popupSettings, ...(data.popupSettings || {}) }
        }));
      } else {
        // If no settings in DB, use defaults
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching theme settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateThemeSettings = async (newSettings: Partial<ThemeSettings>) => {
    try {
      const settingsDocRef = doc(db, 'settings', 'theme');
      await setDoc(settingsDocRef, newSettings, { merge: true });
    } catch (error) {
      console.error("Error updating theme settings:", error);
    }
  };

  const resetBackgroundImage = async () => {
    try {
      const settingsDocRef = doc(db, 'settings', 'theme');
      await updateDoc(settingsDocRef, { backgroundImage: '' });
    } catch(error) {
      console.error("Error resetting background image:", error);
    }
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