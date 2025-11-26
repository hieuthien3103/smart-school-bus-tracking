
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Schedule } from '../types';
import { scheduleService } from '../services/api/scheduleService';

interface SchedulesContextType {
  schedules: Schedule[];
  fetchSchedules: () => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'ma_lich'>) => Promise<void>;
  updateSchedule: (ma_lich: number, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (ma_lich: number) => Promise<void>;
}

const SchedulesContext = createContext<SchedulesContextType | undefined>(undefined);

export const SchedulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (isFetching) return; // Prevent concurrent fetches
    
    setIsFetching(true);
    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (err: any) {
      console.error('SchedulesProvider.fetchSchedules error', err);
      // Don't clear schedules on error, keep existing data
      if (err?.response?.status === 429) {
        console.warn('Rate limited, will retry later');
      }
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'ma_lich'>) => {
    await scheduleService.createSchedule(schedule);
    // Debounce refetch
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchSchedules(), 500);
  }, [fetchSchedules]);

  const updateSchedule = useCallback(async (ma_lich: number, schedule: Partial<Schedule>) => {
    await scheduleService.updateSchedule(ma_lich, schedule);
    // Debounce refetch
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchSchedules(), 500);
  }, [fetchSchedules]);

  const deleteSchedule = useCallback(async (ma_lich: number) => {
    await scheduleService.deleteSchedule(ma_lich);
    // Debounce refetch
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchSchedules(), 500);
  }, [fetchSchedules]);

  useEffect(() => {
    fetchSchedules();
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []); // Only fetch once on mount

  return (
    <SchedulesContext.Provider value={{ schedules, fetchSchedules, addSchedule, updateSchedule, deleteSchedule }}>
      {children}
    </SchedulesContext.Provider>
  );
};

export const useSchedules = () => {
  const context = useContext(SchedulesContext);
  if (!context) throw new Error('useSchedules must be used within a SchedulesProvider');
  return context;
};
