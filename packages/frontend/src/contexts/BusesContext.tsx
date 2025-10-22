import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Bus } from '../types';
import busService from '../services/api/busService';

interface BusesContextType {
  busesData: Bus[];
  setBusesData: React.Dispatch<React.SetStateAction<Bus[]>>;
  addBus: (bus: Omit<Bus, 'id'>) => Promise<void>;
  updateBus: (busId: number, bus: Partial<Bus>) => Promise<void>;
  deleteBus: (busId: number) => Promise<void>;
}

const BusesContext = createContext<BusesContextType | undefined>(undefined);

export const BusesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [busesData, setBusesData] = useState<Bus[]>([]);

  const addBus = useCallback(async (bus: Omit<Bus, 'id'>) => {
    // ...implement API call and state update...
  }, []);

  const updateBus = useCallback(async (busId: number, bus: Partial<Bus>) => {
    // ...implement API call and state update...
  }, []);

  const deleteBus = useCallback(async (busId: number) => {
    // ...implement API call and state update...
  }, []);

  return (
    <BusesContext.Provider value={{ busesData, setBusesData, addBus, updateBus, deleteBus }}>
      {children}
    </BusesContext.Provider>
  );
};

export const useBuses = () => {
  const context = useContext(BusesContext);
  if (!context) throw new Error('useBuses must be used within a BusesProvider');
  return context;
};
