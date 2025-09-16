
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AdminSettingsContextType {
  whatsAppNumber: string;
  setWhatsAppNumber: (number: string) => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

// Default WhatsApp number to ensure it's never empty for new users.
// This value should be updated in the code when the store owner finalizes their number.
const defaultWhatsAppNumber = '6281234567890'; // Ganti dengan nomor WA default Anda

export const AdminSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whatsAppNumber, setWhatsAppNumberState] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem('whatsAppNumber');
      // If there's a stored value, use it. Otherwise, use the hardcoded default.
      return item ? JSON.parse(item) : defaultWhatsAppNumber;
    // Fix: Added curly braces to the catch block to properly scope its statements.
    } catch (error) {
      console.error(error);
      return defaultWhatsAppNumber;
    }
  });

  useEffect(() => {
    try {
      // Save any changes to localStorage for the admin's convenience.
      window.localStorage.setItem('whatsAppNumber', JSON.stringify(whatsAppNumber));
    } catch (error) {
      console.error(error);
    }
  }, [whatsAppNumber]);

  const setWhatsAppNumber = (number: string) => {
    setWhatsAppNumberState(number);
  };

  return (
    <AdminSettingsContext.Provider value={{ whatsAppNumber, setWhatsAppNumber }}>
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
