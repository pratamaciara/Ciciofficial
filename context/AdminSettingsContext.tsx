
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface AdminSettingsContextType {
  whatsAppNumber: string;
  setWhatsAppNumber: (number: string) => Promise<void>;
  loading: boolean;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export const AdminSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'admin');
    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWhatsAppNumber(data?.whatsAppNumber || '');
      } else {
        // Doc doesn't exist, maybe set a default or leave blank
        setWhatsAppNumber('');
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching admin settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetWhatsAppNumber = async (number: string) => {
    try {
      const settingsDocRef = doc(db, 'settings', 'admin');
      await setDoc(settingsDocRef, { whatsAppNumber: number }, { merge: true });
    } catch (error) {
      console.error("Error updating WhatsApp number:", error);
    }
  };

  return (
    <AdminSettingsContext.Provider value={{ whatsAppNumber, setWhatsAppNumber: handleSetWhatsAppNumber, loading }}>
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