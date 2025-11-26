
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Driver } from '../types';
import driverService from '../services/api/driverService';

interface DriversContextType {
  drivers: Driver[];
  fetchDrivers: () => Promise<void>;
  addDriver: (driver: Omit<Driver, 'ma_tai_xe'>) => Promise<void>;
  updateDriver: (ma_tai_xe: number, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (ma_tai_xe: number) => Promise<void>;
}

const DriversContext = createContext<DriversContextType | undefined>(undefined);

export const DriversProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchDrivers = useCallback(async () => {
    if (isFetching) return; // Prevent concurrent fetches
    
    setIsFetching(true);
    try {
      const data = await driverService.getDrivers();
      setDrivers(data);
    } catch (err: any) {
      console.error('DriversProvider.fetchDrivers error', err);
      // Don't clear drivers on error, keep existing data
      if (err?.response?.status === 429) {
        console.warn('Rate limited, will retry later');
      }
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  const addDriver = useCallback(async (driver: Omit<Driver, 'ma_tai_xe'>) => {
    await driverService.createDriver(driver);
    // Debounce refetch
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchDrivers(), 500);
  }, [fetchDrivers]);

  const updateDriver = useCallback(async (ma_tai_xe: number, driver: Partial<Driver>) => {
    await driverService.updateDriver(ma_tai_xe, driver);
    // Debounce refetch
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchDrivers(), 500);
  }, [fetchDrivers]);

  const deleteDriver = useCallback(async (ma_tai_xe: number) => {
    await driverService.deleteDriver(ma_tai_xe);
    // Debounce refetch
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchDrivers(), 500);
  }, [fetchDrivers]);

  useEffect(() => {
    fetchDrivers();
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []); // Only fetch once on mount

  return (
    <DriversContext.Provider value={{ drivers, fetchDrivers, addDriver, updateDriver, deleteDriver }}>
      {children}
    </DriversContext.Provider>
  );
};

export const useDrivers = () => {
  const context = useContext(DriversContext);
  if (!context) throw new Error('useDrivers must be used within a DriversProvider');
  return context;
};
