// Global data context for Smart School Bus System
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BusLocation, Schedule, Driver, Student, Bus } from '../types';
// Mock data imports removed - using API data only
import { busService } from '../services/api/busService';
import { driverService } from '../services/api/driverService';
import { studentService } from '../services/api/studentService';
import scheduleService from '../services/api/scheduleService';

interface AppDataContextType {
  // Bus tracking data
  busLocations: BusLocation[];
  setBusLocations: React.Dispatch<React.SetStateAction<BusLocation[]>>;
  updateBusLocations: (newBuses: any[]) => void;
  
  // Schedule data
  scheduleData: Schedule[];
  setScheduleData: React.Dispatch<React.SetStateAction<Schedule[]>>;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (scheduleId: number, schedule: Partial<Schedule>) => void;
  deleteSchedule: (scheduleId: number) => void;
  
  // Driver data  
  driversData: Driver[];
  setDriversData: React.Dispatch<React.SetStateAction<Driver[]>>;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driverId: number, driver: Partial<Driver>) => void;
  deleteDriver: (driverId: number) => void;
  
  // Bus data
  busesData: Bus[];
  setBusesData: React.Dispatch<React.SetStateAction<Bus[]>>;
  addBus: (bus: Omit<Bus, 'id'>) => void;
  updateBus: (busId: number, bus: Partial<Bus>) => void;
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
  const [busesData, setBusesData] = useState<Bus[]>([]);
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
        const driversArray = Array.isArray(drivers) ? drivers as any[] : (drivers as any)?.data || [];
        const transformedDrivers = driversArray.map((driver: any) => ({
          id: driver.ma_tai_xe,
          name: driver.ho_ten || `Tài xế ${driver.ma_tai_xe}`,
          phone: driver.so_dien_thoai || 'Chưa có SĐT',
          license: driver.so_gplx || 'Chưa có GPLX',
          experience: '5 năm', // Mock data
          status: driver.trang_thai === 'san_sang' ? 'Hoạt động' : 
                  driver.trang_thai === 'dang_chay' ? 'Đang chạy' :
                  driver.trang_thai === 'nghi' ? 'Nghỉ việc' : 'Không rõ',
          bus: `BS${String(driver.ma_tai_xe || '000').padStart(3, '0')}`,
          hire_date: '01/01/2020' // Mock data
        }));
        setDriversData(transformedDrivers);
        
        // Transform students data to match Student interface
        const studentsArray = Array.isArray(students) ? students as any[] : (students as any)?.data || [];
        const transformedStudents = studentsArray.map((student: any) => ({
          id: student.ma_hs,
          name: student.ho_ten,
          grade: student.lop || 'Không rõ',
          bus: 'Chưa phân tuyến', // TODO: Get from route assignment
          pickup: student.tram_don || 'Chưa xác định',
          dropoff: student.tram_tra || 'Trường',
          pickupTime: '07:00', // TODO: Get from schedule
          dropoffTime: '11:30', // TODO: Get from schedule
          parent: student.ten_phu_huynh || 'Phụ huynh',
          phone: student.sdt_phu_huynh || '0123456789',
          status: 'Hoạt động' // Default status
        }));
        setStudentsData(transformedStudents);
        
        // Transform schedules to match the expected format
        const schedulesArray = Array.isArray(schedules) ? schedules as any[] : (schedules as any)?.data || [];
        console.log('🔍 DEBUG schedules raw response:', schedules);
        console.log('🔍 DEBUG schedulesArray:', schedulesArray);
        
        const transformedSchedules = schedulesArray.map((schedule: any) => {
          console.log('🔍 DEBUG transforming schedule:', schedule);
          const transformed = {
            id: schedule.ma_lich,
            route: schedule.ten_tuyen || `Tuyến ${schedule.ma_tuyen}`,
            time: schedule.gio_bat_dau || '07:00',
            students: schedule.so_hoc_sinh || 0,
            driver: schedule.driver_name || `Driver ${schedule.ma_tai_xe}`,
            bus: schedule.bus_number || `Bus ${schedule.ma_xe}`,
            status: schedule.trang_thai === 'cho_chay' ? 'Hoạt động' : 
                    schedule.trang_thai === 'dang_chay' ? 'Đang chạy' :
                    schedule.trang_thai === 'hoan_thanh' ? 'Hoàn thành' : 'Tạm dừng'
          };
          console.log('🔍 DEBUG transformed schedule result:', transformed);
          return transformed;
        });
        console.log('🔍 DEBUG transformedSchedules:', transformedSchedules);
        setScheduleData(transformedSchedules);

        // Transform bus data to AdminApp format and set
        const busesArray = Array.isArray(buses) ? buses as any[] : (buses as any)?.data || [];
        const transformedBuses = busesArray.map((bus: any) => ({
          id: bus.ma_xe,
          license_plate: bus.bien_so || `BUS${bus.ma_xe}`,
          capacity: bus.suc_chua || 40,
          status: (bus.trang_thai || 'san_sang') as 'san_sang' | 'dang_su_dung' | 'bao_duong',
          driver_id: bus.ma_tai_xe || undefined
        }));
        
        // Update buses with driver names from JOIN or lookup
        const busesWithDrivers = transformedBuses.map((bus: any) => {
          const rawBusData = busesArray.find((b: any) => b.ma_xe === bus.id);
          const assignedDriver = transformedDrivers.find((driver: any) => 
            driver.id === rawBusData?.ma_tai_xe
          );
          return {
            ...bus,
            driver_name: assignedDriver ? assignedDriver.name : undefined
          };
        });
        
        setBusesData(busesWithDrivers);

        // Generate bus locations from bus data with all required properties
        const locations: BusLocation[] = busesWithDrivers.map((bus: any) => ({
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
          drivers: transformedDrivers.length,
          students: transformedStudents.length,
          schedules: transformedSchedules.length,
          busLocations: uniqueLocations.length
        });
        setBusLocations(uniqueLocations);

      } catch (err) {
        console.error('❌ Error loading initial data:', err);
        setError('❌ Không thể kết nối với server. Vui lòng kiểm tra kết nối backend API.');
        
        // ✅ NO FALLBACK TO MOCK DATA - Keep data empty until API works
        setBusLocations([]);
        setScheduleData([]);
        setDriversData([]);
        setStudentsData([]);
        setBusesData([]);
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

  // Student CRUD operations with API integration
  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    try {
      // Map frontend format to backend format
      const studentData: any = {
        name: student.name,
        student_code: (student as any).student_code,      // ✅ NEW: Required field
        date_of_birth: (student as any).date_of_birth,    // ✅ NEW: Required field
        gender: (student as any).gender,                  // ✅ NEW: Required field
        grade: student.grade,
        parent_name: student.parent,
        parent_phone: student.phone,
        status: student.status?.toLowerCase() || 'active',
        school_id: 1 // Default school, should get from context
      };

      // Call API to create student
      const response: any = await studentService.createStudent(studentData);
      
      if (response.data?.success || response.success) {
        // Update local state with the new student from server
        const newStudent = response.data?.data || response.data;
        setStudentsData(prev => [...prev, {
          id: newStudent.id,
          name: newStudent.name,
          grade: newStudent.grade,
          bus: student.bus || '',
          pickup: student.pickup || '',
          dropoff: student.dropoff || '',
          pickupTime: student.pickupTime || '',
          dropoffTime: student.dropoffTime || '',
          parent: newStudent.parent_name || student.parent,
          phone: newStudent.parent_phone || student.phone,
          status: newStudent.status || student.status
        }]);
        console.log('✅ Student created successfully:', newStudent);
      }
    } catch (error) {
      console.error('❌ Error creating student:', error);
      // Fallback to local state if API fails
      setStudentsData(prev => {
        const newId = Math.max(...prev.map(s => s.id), 0) + 1;
        return [...prev, { ...student, id: newId }];
      });
    }
  }, []);

  const updateStudent = useCallback(async (studentId: number, student: Partial<Student>) => {
    try {
      // Map frontend format to backend format
      const studentData: any = {};
      if (student.name) studentData.name = student.name;
      if (student.grade) studentData.grade = student.grade;
      if (student.parent) studentData.parent_name = student.parent;
      if (student.phone) studentData.parent_phone = student.phone;
      if (student.status) studentData.status = student.status.toLowerCase();

      // Call API to update student
      const response: any = await studentService.updateStudent(studentId, studentData);
      
      if (response.data?.success || response.success) {
        // Update local state
        setStudentsData(prev => 
          prev.map(s => 
            s.id === studentId 
              ? { ...s, ...student }
              : s
          )
        );
        console.log('✅ Student updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating student:', error);
      // Fallback to local state if API fails
      setStudentsData(prev => 
        prev.map(s => 
          s.id === studentId 
            ? { ...s, ...student }
            : s
        )
      );
    }
  }, []);

  const deleteStudent = useCallback(async (studentId: number) => {
    try {
      // Call API to delete student
      const response: any = await studentService.deleteStudent(studentId);
      
      if (response.data?.success || response.success) {
        // Update local state
        setStudentsData(prev => prev.filter(s => s.id !== studentId));
        console.log('✅ Student deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      // Fallback to local state if API fails
      setStudentsData(prev => prev.filter(s => s.id !== studentId));
    }
  }, []);

  // Driver CRUD operations with API integration
  const addDriver = useCallback(async (driver: Omit<Driver, 'id'>) => {
    try {
      // Map frontend format to backend format
      const driverData: any = {
        name: driver.name,
        user_id: (driver as any).user_id || 1,              // ✅ NEW: Required field
        employee_id: (driver as any).employee_id,           // ✅ NEW: Required field
        license_number: driver.license,
        license_type: (driver as any).license_type,         // ✅ NEW: Required field
        license_expiry: (driver as any).license_expiry,     // ✅ NEW: Required field
        phone: driver.phone,
        status: driver.status?.toLowerCase() || 'active',
        email: `${driver.name.toLowerCase().replace(/\s+/g, '.')}@schoolbus.com` // Generate email
      };

      // Call API to create driver
      const response: any = await driverService.createDriver(driverData);
      
      if (response.data?.success || response.success) {
        // Update local state with the new driver from server
        const newDriver = response.data?.data || response.data;
        setDriversData(prev => [...prev, {
          id: newDriver.id,
          name: newDriver.name,
          license: newDriver.license_number || driver.license,
          phone: newDriver.phone,
          bus: driver.bus || '',
          experience: driver.experience || '',
          rating: driver.rating || 5.0,
          status: newDriver.status || driver.status
        }]);
        console.log('✅ Driver created successfully:', newDriver);
      }
    } catch (error) {
      console.error('❌ Error creating driver:', error);
      // Fallback to local state if API fails
      setDriversData(prev => {
        const newId = Math.max(...prev.map(d => d.id), 0) + 1;
        return [...prev, { ...driver, id: newId }];
      });
    }
  }, []);

  const updateDriver = useCallback(async (driverId: number, driver: Partial<Driver>) => {
    try {
      // Map frontend format to backend format
      const driverData: any = {};
      if (driver.name) driverData.name = driver.name;
      if (driver.license) driverData.license_number = driver.license;
      if (driver.phone) driverData.phone = driver.phone;
      if (driver.status) driverData.status = driver.status.toLowerCase();

      // Call API to update driver
      const response: any = await driverService.updateDriver(driverId, driverData);
      
      if (response.data?.success || response.success) {
        // Update local state
        setDriversData(prev => 
          prev.map(d => 
            d.id === driverId 
              ? { ...d, ...driver }
              : d
          )
        );
        console.log('✅ Driver updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating driver:', error);
      // Fallback to local state if API fails
      setDriversData(prev => 
        prev.map(d => 
          d.id === driverId 
            ? { ...d, ...driver }
            : d
        )
      );
    }
  }, []);

  const deleteDriver = useCallback(async (driverId: number) => {
    try {
      // Call API to delete driver
      const response: any = await driverService.deleteDriver(driverId);
      
      if (response.data?.success || response.success) {
        // Update local state
        setDriversData(prev => prev.filter(d => d.id !== driverId));
        console.log('✅ Driver deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting driver:', error);
      // Fallback to local state if API fails
      setDriversData(prev => prev.filter(d => d.id !== driverId));
    }
  }, []);

  // Bus CRUD operations
  const addBus = useCallback(async (bus: Omit<Bus, 'id'>) => {
    try {
      // Map frontend format to backend format
      const busData = {
        bien_so: bus.license_plate,
        suc_chua: bus.capacity,
        trang_thai: bus.status || 'san_sang',
        ma_tai_xe: bus.driver_id || null
      };

      console.log('📤 Creating bus with data:', busData);

      // Call API to create bus
      const response: any = await busService.createBus(busData);
      
      if (response.success || response.data?.success) {
        console.log('✅ Bus created successfully:', response.data);
        // Refresh bus list from server
        const buses = await busService.getBuses();
        const busesArray = Array.isArray(buses) ? buses as any[] : (buses as any)?.data || [];
        const transformedBuses = busesArray.map((b: any) => ({
          id: b.ma_xe,
          license_plate: b.bien_so,
          capacity: b.suc_chua,
          status: b.trang_thai as 'san_sang' | 'dang_su_dung' | 'bao_duong',
          driver_id: b.ma_tai_xe || undefined
        }));
        setBusesData(transformedBuses);
      }
    } catch (error) {
      console.error('❌ Error creating bus:', error);
      throw error;
    }
  }, []);

  const updateBus = useCallback(async (busId: number, bus: Partial<Bus>) => {
    try {
      // Map frontend format to backend format
      const busData: any = {};
      if (bus.license_plate) busData.bien_so = bus.license_plate;
      if (bus.capacity) busData.suc_chua = bus.capacity;
      if (bus.status) busData.trang_thai = bus.status;
      if (bus.driver_id !== undefined) busData.ma_tai_xe = bus.driver_id || null;

      console.log('📤 Updating bus', busId, 'with data:', busData);

      // Call API to update bus
      const response: any = await busService.updateBus(busId, busData);
      
      if (response.success || response.data?.success) {
        console.log('✅ Bus updated successfully');
        // Refresh bus list from server
        const buses = await busService.getBuses();
        const busesArray = Array.isArray(buses) ? buses as any[] : (buses as any)?.data || [];
        const transformedBuses = busesArray.map((b: any) => ({
          id: b.ma_xe,
          license_plate: b.bien_so,
          capacity: b.suc_chua,
          status: b.trang_thai as 'san_sang' | 'dang_su_dung' | 'bao_duong',
          driver_id: b.ma_tai_xe || undefined
        }));
        setBusesData(transformedBuses);
      }
    } catch (error) {
      console.error('❌ Error updating bus:', error);
      throw error;
    }
  }, []);

  const deleteBus = useCallback(async (busId: number) => {
    try {
      console.log('🗑️ Deleting bus:', busId);
      
      // Call API to delete bus
      await busService.deleteBus(busId);
      
      console.log('✅ Bus deleted successfully');
      // Refresh bus list from server
      const buses = await busService.getBuses();
      const busesArray = Array.isArray(buses) ? buses as any[] : (buses as any)?.data || [];
      const transformedBuses = busesArray.map((b: any) => ({
        id: b.ma_xe,
        license_plate: b.bien_so,
        capacity: b.suc_chua,
        status: b.trang_thai as 'san_sang' | 'dang_su_dung' | 'bao_duong',
        driver_id: b.ma_tai_xe || undefined
      }));
      setBusesData(transformedBuses);
    } catch (error) {
      console.error('❌ Error deleting bus:', error);
      throw error;
    }
  }, []);

  // Helper function to fetch and transform schedules from API
  const fetchSchedules = useCallback(async () => {
    try {
      const schedules = await scheduleService.getAllSchedules();
      const schedulesArray = Array.isArray(schedules) ? schedules as any[] : (schedules as any)?.data || [];
      
      const transformedSchedules = schedulesArray.map((schedule: any) => ({
        id: schedule.ma_lich,
        route: schedule.ten_tuyen || `Tuyến ${schedule.ma_tuyen}`,
        time: schedule.gio_bat_dau || '07:00',
        students: schedule.so_hoc_sinh || 0,
        driver: schedule.driver_name || `Driver ${schedule.ma_tai_xe}`,
        bus: schedule.bus_number || `Bus ${schedule.ma_xe}`,
        status: schedule.trang_thai === 'cho_chay' ? 'Hoạt động' : 
                schedule.trang_thai === 'dang_chay' ? 'Đang chạy' :
                schedule.trang_thai === 'hoan_thanh' ? 'Hoàn thành' : 'Tạm dừng'
      }));
      
      setScheduleData(transformedSchedules);
      console.log('✅ Schedules refreshed:', transformedSchedules.length);
    } catch (error) {
      console.error('❌ Error fetching schedules:', error);
      throw error;
    }
  }, []);

  // Schedule CRUD operations with API integration
  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id'>) => {
    try {
      // Map Schedule interface to ScheduleCreateData for API
      const scheduleData = {
        route_id: schedule.route_id,
        bus_id: schedule.bus_id,
        driver_id: schedule.driver_id,
        schedule_date: schedule.schedule_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        status: schedule.status || 'cho_chay'
      };

      console.log('📤 Creating schedule with data:', scheduleData);

      // Call API to create schedule (scheduleService handles backend mapping)
      const response: any = await scheduleService.createSchedule(scheduleData);
      
      if (response.success) {
        console.log('✅ Schedule created successfully:', response.data);
        // Refresh schedule list from server to get updated data
        await fetchSchedules();
      }
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(async (scheduleId: number, schedule: Partial<Schedule>) => {
    try {
      // Map Schedule interface to ScheduleCreateData for API
      const scheduleData: any = {};
      
      if (schedule.route_id !== undefined) scheduleData.route_id = schedule.route_id;
      if (schedule.bus_id !== undefined) scheduleData.bus_id = schedule.bus_id;
      if (schedule.driver_id !== undefined) scheduleData.driver_id = schedule.driver_id;
      if (schedule.schedule_date) scheduleData.schedule_date = schedule.schedule_date;
      if (schedule.start_time) scheduleData.start_time = schedule.start_time;
      if (schedule.end_time) scheduleData.end_time = schedule.end_time;
      if (schedule.status) scheduleData.status = schedule.status;

      console.log('📤 Updating schedule', scheduleId, 'with data:', scheduleData);

      // Call API to update schedule (scheduleService handles backend mapping)
      const response: any = await scheduleService.updateSchedule(scheduleId, scheduleData);
      
      if (response.success) {
        console.log('✅ Schedule updated successfully');
        // Refresh schedule list from server to get updated data
        await fetchSchedules();
      }
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      throw error;
    }
  }, []);

  const deleteSchedule = useCallback(async (scheduleId: number) => {
    try {
      console.log('🗑️ Deleting schedule:', scheduleId);
      
      // Call API to delete schedule
      await scheduleService.deleteSchedule(scheduleId);
      
      console.log('✅ Schedule deleted successfully');
      // Refresh schedule list from server
      await fetchSchedules();
    } catch (error) {
      console.error('❌ Error deleting schedule:', error);
      throw error;
    }
  }, []);

  const contextValue: AppDataContextType = {
    busLocations,
    setBusLocations,
    updateBusLocations,
    scheduleData,
    setScheduleData,
    addSchedule,
    updateSchedule,
    deleteSchedule,
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