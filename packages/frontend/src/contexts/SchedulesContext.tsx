import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Schedule } from '../types';
import scheduleService from '../services/api/scheduleService';

interface SchedulesContextType {
  schedulesData: Schedule[];
  setSchedulesData: React.Dispatch<React.SetStateAction<Schedule[]>>;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (scheduleId: number, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (scheduleId: number) => Promise<void>;
}

const SchedulesContext = createContext<SchedulesContextType | undefined>(undefined);

export const SchedulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedulesData, setSchedulesData] = useState<Schedule[]>([]);

  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id'>) => {
    // ...implement API call and state update...
  }, []);

  const updateSchedule = useCallback(async (scheduleId: number, schedule: Partial<Schedule>) => {
    // ...implement API call and state update...
  }, []);

  const deleteSchedule = useCallback(async (scheduleId: number) => {
    // ...implement API call and state update...
  }, []);

  return (
    <SchedulesContext.Provider value={{ schedulesData, setSchedulesData, addSchedule, updateSchedule, deleteSchedule }}>
      {children}
    </SchedulesContext.Provider>
  );
};

export const useSchedules = () => {
  const context = useContext(SchedulesContext);
  if (!context) throw new Error('useSchedules must be used within a SchedulesProvider');
  return context;
};
