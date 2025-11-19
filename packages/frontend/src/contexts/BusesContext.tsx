import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Bus } from '../types';
import busService from '../services/api/busService';

interface BusesContextType {
  buses: Bus[];
  fetchBuses: () => Promise<void>;
  addBus: (bus: Omit<Bus, 'ma_xe'>) => Promise<void>;
  updateBus: (ma_xe: number, bus: Partial<Bus>) => Promise<void>;
  deleteBus: (ma_xe: number) => Promise<void>;
}

const BusesContext = createContext<BusesContextType | undefined>(undefined);

export const BusesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>([]);

  const fetchBuses = useCallback(async () => {
    try {
      const data = await busService.getBuses();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  }, []);

  const addBus = useCallback(async (bus: Omit<Bus, 'ma_xe'>) => {
    try {
      await busService.createBus(bus);
      await fetchBuses();
    } catch (error) {
      console.error('Error adding bus:', error);
      throw error;
    }
  }, [fetchBuses]);

  const updateBus = useCallback(async (ma_xe: number, bus: Partial<Bus>) => {
    try {
      await busService.updateBus(ma_xe, bus);
      await fetchBuses();
    } catch (error) {
      console.error('Error updating bus:', error);
      throw error;
    }
  }, [fetchBuses]);

  const deleteBus = useCallback(async (ma_xe: number) => {
    try {
      await busService.deleteBus(ma_xe);
      await fetchBuses();
    } catch (error) {
      console.error('Error deleting bus:', error);
      throw error;
    }
  }, [fetchBuses]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  return (
    <BusesContext.Provider value={{ buses, fetchBuses, addBus, updateBus, deleteBus }}>
      {children}
    </BusesContext.Provider>
  );
};

export const useBuses = () => {
  const context = useContext(BusesContext);
  if (!context) throw new Error('useBuses must be used within a BusesProvider');
  return context;
};

// Added alias for backward compatibility with code importing `useBusesContext`
export const useBusesContext = () => {
  const context = useContext(BusesContext);
  if (!context) throw new Error('useBusesContext must be used within a BusesProvider');
  return context;
};