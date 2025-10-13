// Global data context for Smart School Bus System
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BusLocation, Schedule, Driver, Student } from '../types';
import { mockBusLocations, mockScheduleData, mockDriversData, mockStudentsData, mockBusesData } from '../services/mockData';
import { busService } from '../services/api/busService';
import { driverService } from '../services/api/driverService';
import { studentService } from '../services/api/studentService';
import { scheduleService } from '../services/api/scheduleService';

// AdminApp bus format
interface AdminBusData {
  id: number;
  busNumber: string;
  model: string;
  capacity: number;
  year: number;
  plateNumber: string;
  status: string;
  currentDriver: string;
  currentRoute: string;
  mileage: number;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  condition: string;
}

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
  setDriversData: React.Dispatch<React.SetStateAction<Driver[]>>;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driverId: number, driver: Partial<Driver>) => void;
  deleteDriver: (driverId: number) => void;
  
  // Bus data
  busesData: AdminBusData[];
  setBusesData: React.Dispatch<React.SetStateAction<AdminBusData[]>>;
  addBus: (bus: Omit<AdminBusData, 'id'>) => void;
  updateBus: (busId: number, bus: Partial<AdminBusData>) => void;
  deleteBus: (busId: number) => void;
  
  // Students data
  studentsData: Student[];
  setStudentsData: React.Dispatch<React.SetStateAction<Student[]>>;
  updateStudentStatus: (studentId: number, status: string) => void;
  getStudentsByDriver: (driverName: string) => Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (studentId: number, student: Partial<Student>) => void;
  deleteStudent: (studentId: number) => void;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Sync functions
  syncBusLocationFromSchedule: (schedules: Schedule[]) => void;
  generateBusLocationFromBus: (busData: any) => BusLocation;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  // Initialize with empty arrays, will load from API
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [driversData, setDriversData] = useState<Driver[]>([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [busesData, setBusesData] = useState<AdminBusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load all data in parallel
        const [buses, drivers, students, schedules] = await Promise.all([
          busService.getBuses().catch(() => []),
          driverService.getDrivers().catch(() => ({ data: [], total: 0, page: 1, totalPages: 1 })),
          studentService.getStudents().catch(() => ({ data: [], total: 0, page: 1, totalPages: 1 })),
          scheduleService.getAllSchedules().catch(() => [])
        ]);

        // Set drivers data (convert API format to expected format)
        const driversArray = Array.isArray(drivers) ? (drivers as any[]).map((driver: any) => ({
          id: driver.id,
          name: driver.user_id || `Tài xế ${driver.id}`,
          phone: driver.emergency_contact_phone || 'Chưa có SĐT',
          license: driver.license_number || 'Chưa có GPLX',
          experience: `${driver.experience_years || 0} năm`,
          status: driver.status === 'active' ? 'Hoạt động' : 'Nghỉ việc',
          bus: `BS${String(driver.current_bus_id || '000').padStart(3, '0')}`,
          hire_date: driver.hire_date ? new Date(driver.hire_date).toLocaleDateString('vi-VN') : 'Không rõ'
        })) : (drivers as any)?.data?.map((driver: any) => ({
          id: driver.id,
          name: driver.user_id || `Tài xế ${driver.id}`,
          phone: driver.emergency_contact_phone || 'Chưa có SĐT',
          license: driver.license_number || 'Chưa có GPLX',
          experience: `${driver.experience_years || 0} năm`,
          status: driver.status === 'active' ? 'Hoạt động' : 'Nghỉ việc',
          bus: `BS${String(driver.current_bus_id || '000').padStart(3, '0')}`,
          hire_date: driver.hire_date ? new Date(driver.hire_date).toLocaleDateString('vi-VN') : 'Không rõ'
        })) || [];
        setDriversData(driversArray);
        
        // Set students data
        const studentsArray = Array.isArray(students) ? students as any[] : (students as any)?.data || [];
        setStudentsData(studentsArray);
        
        // Transform schedules to match the expected format
        const schedulesArray = Array.isArray(schedules) ? (schedules as any[]).map((schedule: any) => ({
          id: schedule.id,
          route: schedule.route,
          time: schedule.departure || schedule.time || '07:00',
          students: schedule.students || 0,
          driver: schedule.driver,
          bus: schedule.bus,
          status: schedule.status
        })) : [];
        setScheduleData(schedulesArray);

        // Transform bus data to AdminApp format and set
        const transformedBuses = Array.isArray(buses) ? (buses as any[]).map((bus: any) => ({
          id: bus.id,
          busNumber: bus.bus_number || bus.license_plate || `BUS${bus.id}`,
          model: bus.model || 'Standard Bus',
          capacity: bus.capacity || 30,
          year: bus.year_manufactured || 2020,
          plateNumber: bus.license_plate || `${bus.bus_number}-SCHOOL`,
          status: bus.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
          currentDriver: 'Chưa phân công', // Will be updated from drivers data
          currentRoute: 'Chưa phân tuyến', // Will be updated from routes data
          mileage: Math.floor(Math.random() * 100000), // Mock data until we have real mileage
          fuelLevel: Math.floor(Math.random() * 100), // Mock data until we have real fuel level
          lastMaintenance: bus.last_maintenance_date ? 
            new Date(bus.last_maintenance_date).toLocaleDateString('vi-VN') : '2024-01-15',
          nextMaintenance: bus.next_maintenance_date ? 
            new Date(bus.next_maintenance_date).toLocaleDateString('vi-VN') : '2024-04-15',
          condition: 'Tốt'
        })) : [];
        
        // Update buses with driver assignments
        const busesWithDrivers = transformedBuses.map(bus => {
          const assignedDriver = driversArray.find((driver: any) => 
            driver.bus === bus.busNumber || 
            driver.bus === `BS${String(bus.id).padStart(3, '0')}`
          );
          return {
            ...bus,
            currentDriver: assignedDriver ? assignedDriver.name : 'Chưa phân công'
          };
        });
        
        setBusesData(busesWithDrivers);

        // Generate bus locations from bus data with all required properties
        const locations: BusLocation[] = busesWithDrivers.map(bus => ({
          id: bus.id,
          busNumber: bus.busNumber,
          driver: bus.currentDriver,
          route: bus.currentRoute,
          lat: 21.0285 + (Math.random() - 0.5) * 0.01, // Random location around Hanoi
          lng: 105.8542 + (Math.random() - 0.5) * 0.01,
          speed: bus.status === 'Hoạt động' ? Math.floor(Math.random() * 40) : 0,
          direction: Math.floor(Math.random() * 360),
          status: bus.status === 'Hoạt động' ? 'Đang di chuyển' : 'Dừng đón khách',
          students: Math.floor(Math.random() * bus.capacity),
          lastUpdate: new Date().toLocaleString('vi-VN'),
          nextStop: 'Điểm đón tiếp theo',
          estimatedArrival: '5 phút',
          routeStops: ['Điểm đón 1', 'Điểm đón 2', 'Trường học'],
          currentStopIndex: 0,
          studentsOnBoard: Math.floor(Math.random() * bus.capacity),
          emergencyAlert: false
        }));
        
        // Remove duplicates by ID before setting
        const uniqueLocations = locations.filter((location, index, self) => 
          index === self.findIndex(l => l.id === location.id)
        );
        
        console.log('✅ API Data loaded successfully:', {
          buses: busesWithDrivers.length,
          drivers: driversArray.length,
          students: studentsArray.length,
          schedules: schedulesArray.length,
          busLocations: uniqueLocations.length
        });
        setBusLocations(uniqueLocations);

      } catch (err) {
        console.error('❌ Error loading initial data:', err);
        console.warn('⚠️ Fallback to mock data activated');
        setError('Không thể tải dữ liệu. Sử dụng dữ liệu mặc định.');
        
        // Fallback to mock data on error
        setBusLocations(mockBusLocations);
        setScheduleData(mockScheduleData);
        setDriversData(mockDriversData);
        setStudentsData(mockStudentsData);
        setBusesData(mockBusesData.map(bus => ({
          id: bus.id,
          busNumber: bus.number,
          model: 'Standard Bus',
          capacity: bus.capacity,
          year: 2020,
          plateNumber: `${bus.number}-SCHOOL`,
          status: bus.status,
          currentDriver: bus.driver,
          currentRoute: bus.route,
          mileage: Math.floor(Math.random() * 100000),
          fuelLevel: Math.floor(Math.random() * 100),
          lastMaintenance: bus.lastMaintenance,
          nextMaintenance: bus.nextMaintenance,
          condition: 'Tốt'
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Run once on mount

  // Auto-sync schedule data whenever students data changes (only if not already loading)
  useEffect(() => {
    if (!isLoading && studentsData.length > 0 && scheduleData.length > 0) {
      setScheduleData(prev => {
        const updated = prev.map(schedule => {
          // Count students assigned to this bus
          const studentsInBus = studentsData.filter(student => student.bus === schedule.bus).length;
          // Only update if the count has changed
          if (schedule.students !== studentsInBus) {
            return {
              ...schedule,
              students: studentsInBus
            };
          }
          return schedule;
        });
        
        // Only update state if something actually changed
        const hasChanges = updated.some((schedule, index) => 
          !prev[index] || schedule.students !== prev[index].students
        );
        
        return hasChanges ? updated : prev;
      });
    }
  }, [studentsData, isLoading]); // Remove scheduleData from dependencies to prevent loops

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
        const existingIndex = merged.findIndex(bus => bus.id === newBus.id);
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
      
      // Remove buses that no longer exist and ensure no duplicates
      const filtered = merged.filter(bus => 
        newBuses.some(newBus => 
          (newBus.id || newBus.busNumber || newBus.number) === bus.id ||
          (newBus.busNumber || newBus.number) === bus.busNumber
        )
      );
      
      // Final duplicate removal by ID
      const uniqueFiltered = filtered.filter((bus, index, self) => 
        index === self.findIndex(b => b.id === bus.id)
      );
      
      console.log('UpdateBusLocations:', merged.length, '->', uniqueFiltered.length, 'buses');
      return uniqueFiltered;
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
        const existingBus = updatedBuses.find(bus => 
          bus.busNumber === schedule.bus || bus.id === schedule.id
        );
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

      const combined = [...updatedBuses, ...newBuses];
      
      // Final duplicate removal by ID
      const uniqueCombined = combined.filter((bus, index, self) => 
        index === self.findIndex(b => b.id === bus.id)
      );
      
      console.log('SyncBusLocationFromSchedule:', combined.length, '->', uniqueCombined.length, 'buses');
      return uniqueCombined;
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

  // Driver CRUD operations
  const addDriver = useCallback((driver: Omit<Driver, 'id'>) => {
    setDriversData(prev => {
      const newId = Math.max(...prev.map(d => d.id), 0) + 1;
      return [...prev, { ...driver, id: newId }];
    });
  }, []);

  const updateDriver = useCallback((driverId: number, driver: Partial<Driver>) => {
    setDriversData(prev => 
      prev.map(d => 
        d.id === driverId 
          ? { ...d, ...driver }
          : d
      )
    );
  }, []);

  const deleteDriver = useCallback((driverId: number) => {
    setDriversData(prev => prev.filter(d => d.id !== driverId));
  }, []);

  // Bus CRUD operations
  const addBus = useCallback((bus: Omit<AdminBusData, 'id'>) => {
    setBusesData(prev => {
      const newId = Math.max(...prev.map(b => b.id), 0) + 1;
      return [...prev, { ...bus, id: newId }];
    });
  }, []);

  const updateBus = useCallback((busId: number, bus: Partial<AdminBusData>) => {
    setBusesData(prev => 
      prev.map(b => 
        b.id === busId 
          ? { ...b, ...bus }
          : b
      )
    );
  }, []);

  const deleteBus = useCallback((busId: number) => {
    setBusesData(prev => prev.filter(b => b.id !== busId));
  }, []);

  const contextValue: AppDataContextType = {
    busLocations,
    setBusLocations,
    updateBusLocations,
    scheduleData,
    setScheduleData,
    driversData,
    setDriversData,
    addDriver,
    updateDriver,
    deleteDriver,
    busesData,
    setBusesData,
    addBus,
    updateBus,
    deleteBus,
    studentsData,
    setStudentsData,
    updateStudentStatus,
    getStudentsByDriver,
    addStudent,
    updateStudent,
    deleteStudent,
    isLoading,
    error,
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