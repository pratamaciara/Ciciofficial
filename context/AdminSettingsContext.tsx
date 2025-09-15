
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AdminSettingsContextType {
  whatsAppNumber: string;
  setWhatsAppNumber: (number: string) => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export const AdminSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whatsAppNumber, setWhatsAppNumberState] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem('whatsAppNumber');
      return item ? JSON.parse(item) : '';
    } catch (error) {
      console.error(error);
      return '';
    }
  });

  useEffect(() => {
    try {
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
