import React, { createContext, useContext, useState } from 'react';

const ActivePageContext = createContext();

export const useActivePage = () => {
  const context = useContext(ActivePageContext);
  if (!context) {
    throw new Error('useActivePage must be used within an ActivePageProvider');
  }
  return context;
};

export const ActivePageProvider = ({ children }) => {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <ActivePageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </ActivePageContext.Provider>
  );
};