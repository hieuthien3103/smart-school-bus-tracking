// Global data context for Smart School Bus System
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BusLocation, Schedule, Driver, Student } from '../types';
import { mockBusLocations, mockScheduleData, mockDriversData, mockStudentsData } from '../services/mockData';

interface AppDataContextType {
  // Bus tracking data
  busLocations: BusLocation[];
  setBusLocations: React.Dispatch<React.SetStateAction<BusLocation[]>>;
  updateBusLocations: (newBuses: any[]) => void;
  
  // Schedule data
  scheduleData: Schedule[];
  setScheduleData: React.Dispatch<React.SetStateAction<Schedule[]>>;
  
  // Driver data  
  driversData: Driver[];
  setDriversData: (drivers: Driver[]) => void;
  
  // Students data
  studentsData: Student[];
  setStudentsData: React.Dispatch<React.SetStateAction<Student[]>>;
  updateStudentStatus: (studentId: number, status: string) => void;
  getStudentsByDriver: (driverName: string) => Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (studentId: number, student: Partial<Student>) => void;
  deleteStudent: (studentId: number) => void;
  
  // Sync functions
  syncBusLocationFromSchedule: (schedules: Schedule[]) => void;
  generateBusLocationFromBus: (busData: any) => BusLocation;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const [busLocations, setBusLocations] = useState<BusLocation[]>(mockBusLocations);
  const [scheduleData, setScheduleData] = useState<Schedule[]>(mockScheduleData);
  const [driversData, setDriversData] = useState<Driver[]>(mockDriversData);
  const [studentsData, setStudentsData] = useState<Student[]>(mockStudentsData);

  // Auto-sync schedule data whenever students data changes
  useEffect(() => {
    setScheduleData(prev => 
      prev.map(schedule => {
        // Count students assigned to this bus
        const studentsInBus = studentsData.filter(student => student.bus === schedule.bus).length;
        return {
          ...schedule,
          students: studentsInBus
        };
      })
    );
  }, [studentsData]);

  // Generate BusLocation from Bus data for tracking
  const generateBusLocationFromBus = useCallback((busData: any): BusLocation => {
    return {
      id: busData.id,
      busNumber: busData.busNumber || busData.number,
      driver: busData.currentDriver || busData.driver,
      route: busData.currentRoute || busData.route,
      lat: 21.0285 + (Math.random() - 0.5) * 0.01, // Random location around Hanoi
      lng: 105.8542 + (Math.random() - 0.5) * 0.01,
      speed: Math.floor(Math.random() * 40),
      direction: Math.floor(Math.random() * 360),
      status: busData.status === 'Hoạt động' ? 'Đang di chuyển' : 'Dừng đón khách',
      students: Math.floor(Math.random() * busData.capacity * 0.8),
      lastUpdate: new Date().toLocaleTimeString('vi-VN'),
      nextStop: 'Trường học',
      estimatedArrival: `${Math.floor(Math.random() * 15) + 5} phút`,
      routeStops: ['Điểm đầu tuyến', 'Trường học', 'Điểm cuối tuyến'],
      currentStopIndex: 0
    };
  }, []);

  // Update bus locations from new bus data  
  const updateBusLocations = useCallback((newBuses: any[]) => {
    const newBusLocations = newBuses.map(generateBusLocationFromBus);
    setBusLocations(prev => {
      // Merge with existing locations, keeping existing data for unchanged buses
      const merged = [...prev];
      
      newBusLocations.forEach(newBus => {
        const existingIndex = merged.findIndex(bus => bus.busNumber === newBus.busNumber);
        if (existingIndex >= 0) {
          // Update existing bus but preserve some dynamic data
          merged[existingIndex] = {
            ...merged[existingIndex],
            ...newBus,
            lat: merged[existingIndex].lat, // Keep current position
            lng: merged[existingIndex].lng,
            lastUpdate: newBus.lastUpdate
          };
        } else {
          // Add new bus
          merged.push(newBus);
        }
      });
      
      // Remove buses that no longer exist
      return merged.filter(bus => 
        newBuses.some(newBus => 
          (newBus.busNumber || newBus.number) === bus.busNumber
        )
      );
    });
  }, [generateBusLocationFromBus]);

  // Sync bus locations when schedule data changes
  const syncBusLocationFromSchedule = useCallback((schedules: Schedule[]) => {
    setBusLocations(prev => {
      const updatedBuses = prev.map(busLocation => {
        // Find matching schedule
        const schedule = schedules.find(s => s.bus === busLocation.busNumber);
        if (schedule) {
          return {
            ...busLocation,
            driver: schedule.driver,
            route: schedule.route,
            students: schedule.students,
            status: schedule.status === 'Hoạt động' ? 'Đang di chuyển' as const : 'Dừng đón khách' as const
          };
        }
        return busLocation;
      });

      // Add new buses from schedules that don't exist in busLocations yet
      const newBuses: BusLocation[] = [];
      schedules.forEach(schedule => {
        const existingBus = prev.find(bus => bus.busNumber === schedule.bus);
        if (!existingBus) {
          // Create new BusLocation from schedule
          const newBusLocation: BusLocation = {
            id: schedule.id,
            busNumber: schedule.bus,
            driver: schedule.driver,
            route: schedule.route,
            lat: 21.0285 + (Math.random() - 0.5) * 0.01,
            lng: 105.8542 + (Math.random() - 0.5) * 0.01,
            speed: Math.floor(Math.random() * 40),
            direction: Math.floor(Math.random() * 360),
            status: schedule.status === 'Hoạt động' ? 'Đang di chuyển' as const : 'Dừng đón khách' as const,
            students: schedule.students,
            lastUpdate: new Date().toLocaleTimeString('vi-VN'),
            nextStop: 'Đang cập nhật...',
            estimatedArrival: '-- phút',
            routeStops: ['Đang cập nhật...'],
            currentStopIndex: 0
          };
          newBuses.push(newBusLocation);
        }
      });

      return [...updatedBuses, ...newBuses];
    });
  }, []);

  // Student management functions
  const updateStudentStatus = useCallback((studentId: number, status: string) => {
    setStudentsData(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status }
          : student
      )
    );
  }, []);

  const getStudentsByDriver = useCallback((driverName: string) => {
    // Find the bus for this driver
    const driverBus = busLocations.find(bus => bus.driver === driverName);
    if (!driverBus) return [];
    
    // Return students assigned to this bus
    return studentsData.filter(student => student.bus === driverBus.busNumber);
  }, [busLocations, studentsData]);

  // Student CRUD operations
  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    setStudentsData(prev => {
      const newId = Math.max(...prev.map(s => s.id), 0) + 1;
      return [...prev, { ...student, id: newId }];
    });
  }, []);

  const updateStudent = useCallback((studentId: number, student: Partial<Student>) => {
    setStudentsData(prev => 
      prev.map(s => 
        s.id === studentId 
          ? { ...s, ...student }
          : s
      )
    );
  }, []);

  const deleteStudent = useCallback((studentId: number) => {
    setStudentsData(prev => prev.filter(s => s.id !== studentId));
  }, []);

  const contextValue: AppDataContextType = {
    busLocations,
    setBusLocations,
    updateBusLocations,
    scheduleData,
    setScheduleData,
    driversData,
    setDriversData,
    studentsData,
    setStudentsData,
    updateStudentStatus,
    getStudentsByDriver,
    addStudent,
    updateStudent,
    deleteStudent,
    syncBusLocationFromSchedule,
    generateBusLocationFromBus
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};