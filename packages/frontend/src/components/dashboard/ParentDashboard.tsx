import { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, User, Bus, Route, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentsContext } from '../../contexts/StudentsContext';
import { useParentsContext } from '../../contexts/ParentsContext';
import { useBuses } from '../../contexts/BusesContext';
import { useDrivers } from '../../contexts/DriversContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useStops } from '../../contexts/StopsContext';
import { useSocket } from '../../contexts/SocketContext';
import { useAutoLocationUpdate } from '../../hooks/useAutoLocationUpdate';
import busService from '../../services/api/busService';
import MapViews from '../map/MapViews';


interface StudentInfo {
  id: number;
  name: string;
  grade: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  pickupStop: string;
  dropoffStop: string;
  pickupTime: string;
  dropoffTime: string;
  currentStatus: 'at_home' | 'waiting_pickup' | 'on_bus' | 'at_school' | 'going_home';
}

interface BusLocationInfo {
  busNumber: string;
  currentLocation: string;
  distanceToPickup: number;
  distanceToDropoff: number;
  estimatedPickupTime: string;
  estimatedDropoffTime: string;
  isOnRoute: boolean;
  lastUpdated: string;
}

/**
 * Defensive helper: call a hook and return fallback on error (e.g. provider missing).
 * This prevents the whole app from crashing while you work on wiring providers.
 */
function safeHook<T>(hook: () => T, fallback: T): T {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return hook();
  } catch {
    return fallback;
  }
}

const ParentDashboard = () => {
  const { user } = useAuth();
  const { onLocationUpdate, offLocationUpdate } = useSocket();
  
  // Enable auto location updates for bus movement
  useAutoLocationUpdate(true, 5000);
  
  // Use safeHook to avoid throwing if a provider is not mounted yet
  const studentsCtx = safeHook(useStudentsContext, { students: [], fetchStudents: async () => { } } as any);
  const parentsCtx = safeHook(useParentsContext, { parents: [], fetchParents: async () => { } } as any);
  const busesCtx = safeHook(useBuses, { buses: [], busLocations: {} } as any);
  const driversCtx = safeHook(useDrivers, { drivers: [] } as any);
  const schedulesCtx = safeHook(useSchedules, { schedules: [] } as any);
  const stopsCtx = safeHook(useStops, { stops: [] } as any);

  // Filter students for current logged-in parent
  const currentStudent = useMemo(() => {
    const studentsData = studentsCtx.students ?? [];
    const parentsData = parentsCtx.parents ?? [];
    
    console.log('[ParentDashboard] Finding student for user:', {
      user,
      userId: (user as any)?.id,
      username: (user as any)?.username,
      ma_phu_huynh: (user as any)?.ma_phu_huynh,
      totalStudents: studentsData.length,
      totalParents: parentsData.length
    });
    
    // Priority 1: Try to get parentId from user object
    let parentId = (user as any)?.ma_phu_huynh;
    
    // Priority 2: If not in user, try to find parent by username or id
    if (!parentId && (user as any)?.username) {
      const parent = parentsData.find((p: any) => 
        p.tai_khoan === (user as any)?.username || 
        p.ma_phu_huynh === (user as any)?.id
      );
      if (parent) {
        parentId = parent.ma_phu_huynh;
        console.log('[ParentDashboard] Found parent by username/id:', parent);
      }
    }
    
    // Priority 3: If still no parentId, try to find parent by matching user.ten with parent.ho_ten
    if (!parentId && (user as any)?.ten) {
      const parent = parentsData.find((p: any) => 
        p.ho_ten && (user as any)?.ten && (
          p.ho_ten.toLowerCase().includes((user as any).ten.toLowerCase()) ||
          (user as any).ten.toLowerCase().includes(p.ho_ten.toLowerCase())
        )
      );
      if (parent) {
        parentId = parent.ma_phu_huynh;
        console.log('[ParentDashboard] Found parent by name matching:', parent);
      }
    }
    
    console.log('[ParentDashboard] Final parentId:', parentId);
    console.log('[ParentDashboard] Students data:', studentsData.map((s: any) => ({
      ma_hs: s.ma_hs,
      ho_ten: s.ho_ten,
      ma_phu_huynh: s.ma_phu_huynh
    })));
    
    if (!parentId) {
      console.warn('[ParentDashboard] No parentId found, trying fallback');
      // Fallback: return first student if available
      if (studentsData.length > 0) {
        console.log('[ParentDashboard] Using first student as fallback:', studentsData[0]);
        return studentsData[0];
      }
      return null;
    }
    
    // Find students belonging to this parent
    const student = studentsData.find((s: any) => s.ma_phu_huynh === parentId);
    
    if (student) {
      console.log('[ParentDashboard] Found student for parent:', student);
      return student;
    }
    
    console.warn('[ParentDashboard] No student found for parentId:', parentId);
    // Fallback: return first student if available
    if (studentsData.length > 0) {
      console.log('[ParentDashboard] Using first student as fallback:', studentsData[0]);
      return studentsData[0];
    }
    
    return null;
  }, [studentsCtx.students, parentsCtx.parents, user]);

  // Get stops from student data or stops context
  const pickupStopObj = useMemo(() => {
    if (!currentStudent) return null;
    // Priority 1: Get from student.diem_don if it's a full object
    if (currentStudent.diem_don && typeof currentStudent.diem_don === 'object') {
      return currentStudent.diem_don as any;
    }
    // Priority 2: Get from stops context using ma_diem_don
    if (currentStudent.ma_diem_don) {
      const stop = stopsCtx.stops?.find((s: any) => s.ma_tram === currentStudent.ma_diem_don);
      if (stop) return stop;
    }
    return null;
  }, [currentStudent, stopsCtx.stops]);
  
  const dropoffStopObj = useMemo(() => {
    if (!currentStudent) return null;
    // Priority 1: Get from student.diem_tra if it's a full object
    if (currentStudent.diem_tra && typeof currentStudent.diem_tra === 'object') {
      return currentStudent.diem_tra as any;
    }
    // Priority 2: Get from stops context using ma_diem_tra
    if (currentStudent.ma_diem_tra) {
      const stop = stopsCtx.stops?.find((s: any) => s.ma_tram === currentStudent.ma_diem_tra);
      if (stop) return stop;
    }
    return null;
  }, [currentStudent, stopsCtx.stops]);
  
  const pickupStop = pickupStopObj?.ten_tram || '';
  const dropoffStop = dropoffStopObj?.ten_tram || '';

  // Fetch schedule from API if not found in context
  const [scheduleFromApi, setScheduleFromApi] = useState<any>(null);
  
  useEffect(() => {
    if (!currentStudent?.ma_hs) {
      setScheduleFromApi(null);
      return;
    }
    
    // Try to find schedule by checking each schedule's students
    const findScheduleForStudent = async () => {
      const schedules = schedulesCtx.schedules ?? [];
      for (const schedule of schedules) {
        try {
          const { apiClient } = await import('../../services/api/client');
          const response = await apiClient.get(`/lichtrinh/${schedule.ma_lich}/students`);
          const payload = response.data as any;
          const students = Array.isArray(payload) ? payload : (payload?.data ?? []);
          const hasStudent = students.some((s: any) => (s.ma_hs || s.ma_hoc_sinh) === currentStudent.ma_hs);
          if (hasStudent) {
            console.log('[ParentDashboard] Found schedule from API:', schedule.ma_lich);
            setScheduleFromApi(schedule);
            return;
          }
        } catch (error) {
          // Continue to next schedule
        }
      }
      setScheduleFromApi(null);
    };
    
    findScheduleForStudent();
  }, [currentStudent?.ma_hs, schedulesCtx.schedules]);

  // Find current schedule for this student (MUST be before currentBus as currentBus depends on it)
  const currentSchedule = useMemo(() => {
    if (!currentStudent) return null;
    const today = new Date().toISOString().split('T')[0];
    const schedules = schedulesCtx.schedules ?? [];
    
    console.log('[ParentDashboard] Finding schedule for student:', currentStudent.ma_hs);
    console.log('[ParentDashboard] Available schedules:', schedules.length);
    console.log('[ParentDashboard] Student phan_cong:', currentStudent.phan_cong);
    
    // Priority 1: Use schedule from API fetch
    if (scheduleFromApi) {
      console.log('[ParentDashboard] Using schedule from API:', scheduleFromApi.ma_lich);
      return scheduleFromApi;
    }
    
    // Priority 2: Try to get from phan_cong relation
    if (currentStudent.phan_cong && Array.isArray(currentStudent.phan_cong)) {
      for (const pc of currentStudent.phan_cong) {
        if (pc.lich_trinh) {
          console.log('[ParentDashboard] Found schedule from phan_cong:', pc.lich_trinh.ma_lich);
          return pc.lich_trinh;
        }
        // If phan_cong has ma_lich, find schedule by ma_lich
        if (pc.ma_lich) {
          const schedule = schedules.find((s: any) => s.ma_lich === pc.ma_lich);
          if (schedule) {
            console.log('[ParentDashboard] Found schedule by ma_lich from phan_cong:', schedule.ma_lich);
            return schedule;
          }
        }
      }
    }
    
    // Priority 3: Find schedule that has this student in phan_cong
    const scheduleWithStudent = schedules.find((s: any) => {
      if (s.ngay_chay !== today) return false;
      // Check if schedule has phan_cong with this student
      if (s.phan_cong && Array.isArray(s.phan_cong)) {
        return s.phan_cong.some((pc: any) => pc.ma_hs === currentStudent.ma_hs);
      }
      return false;
    });
    
    if (scheduleWithStudent) {
      console.log('[ParentDashboard] Found schedule with student in phan_cong:', scheduleWithStudent.ma_lich);
      return scheduleWithStudent;
    }
    
    // Priority 4: Find any schedule for today (fallback)
    const todaySchedule = schedules.find((s: any) => s.ngay_chay === today);
    if (todaySchedule) {
      console.log('[ParentDashboard] Using today schedule as fallback:', todaySchedule.ma_lich);
      return todaySchedule;
    }
    
    console.log('[ParentDashboard] No schedule found');
    return null;
  }, [currentStudent, schedulesCtx.schedules, scheduleFromApi]);

  // Get bus from schedule first, then fallback to other methods (MUST be after currentSchedule)
  const currentBus = useMemo(() => {
    if (!currentStudent) {
      console.log('[ParentDashboard] No currentStudent');
      return null;
    }
    
    const buses = busesCtx.buses ?? [];
    console.log('[ParentDashboard] Available buses:', buses.length, buses.map((b: any) => b.bien_so));
    console.log('[ParentDashboard] Current schedule:', currentSchedule);
    console.log('[ParentDashboard] Current student:', currentStudent);
    
    // Priority 1: Get bus from current schedule
    if (currentSchedule) {
      if (currentSchedule.ma_xe) {
        const busFromSchedule = buses.find((b: any) => b.ma_xe === currentSchedule.ma_xe);
        if (busFromSchedule) {
          console.log('[ParentDashboard] Found bus from schedule.ma_xe:', busFromSchedule.bien_so);
          return busFromSchedule;
        }
      }
      
      // Priority 2: Get bus from schedule relation
      if (currentSchedule.xe) {
        console.log('[ParentDashboard] Found bus from schedule.xe:', currentSchedule.xe.bien_so);
        return currentSchedule.xe;
      }
      
      // Priority 5: Try to find bus by matching route from schedule
      if (currentSchedule.ma_tuyen) {
        const busByRoute = buses.find((b: any) => b.ma_tuyen === currentSchedule.ma_tuyen);
        if (busByRoute) {
          console.log('[ParentDashboard] Found bus by route:', busByRoute.bien_so);
          return busByRoute;
        }
      }
    }
    
    // Priority 3: Try to get bus from phan_cong -> lich_trinh -> xe
    if (currentStudent.phan_cong && Array.isArray(currentStudent.phan_cong)) {
      const schedule = currentStudent.phan_cong[0]?.lich_trinh;
      if (schedule?.xe) {
        console.log('[ParentDashboard] Found bus from phan_cong->lich_trinh->xe:', schedule.xe.bien_so);
        return schedule.xe;
      }
      if (schedule?.ma_xe) {
        const busFromSchedule = buses.find((b: any) => b.ma_xe === schedule.ma_xe);
        if (busFromSchedule) {
          console.log('[ParentDashboard] Found bus from phan_cong->lich_trinh->ma_xe:', busFromSchedule.bien_so);
          return busFromSchedule;
        }
      }
    }
    
    // Priority 4: Try to get bus from diem_don relation
    if (currentStudent.diem_don && typeof currentStudent.diem_don === 'object' && 'xe' in currentStudent.diem_don) {
      const busFromStop = (currentStudent.diem_don as any).xe;
      console.log('[ParentDashboard] Found bus from diem_don:', busFromStop?.bien_so);
      return busFromStop;
    }
    
    // Priority 6: Find any bus assigned to today's schedule
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedulesCtx.schedules?.filter((s: any) => s.ngay_chay === today) || [];
    for (const todaySchedule of todaySchedules) {
      // Check if this schedule has student in phan_cong
      if (todaySchedule.phan_cong && Array.isArray(todaySchedule.phan_cong)) {
        const hasStudent = todaySchedule.phan_cong.some((pc: any) => pc.ma_hs === currentStudent.ma_hs);
        if (hasStudent && todaySchedule.ma_xe) {
          const busFromTodaySchedule = buses.find((b: any) => b.ma_xe === todaySchedule.ma_xe);
          if (busFromTodaySchedule) {
            console.log('[ParentDashboard] Found bus from today schedule with student:', busFromTodaySchedule.bien_so);
            return busFromTodaySchedule;
          }
        }
      }
      // Or just use any schedule with ma_xe
      if (todaySchedule.ma_xe) {
        const busFromTodaySchedule = buses.find((b: any) => b.ma_xe === todaySchedule.ma_xe);
        if (busFromTodaySchedule) {
          console.log('[ParentDashboard] Found bus from any today schedule:', busFromTodaySchedule.bien_so);
          return busFromTodaySchedule;
        }
      }
    }
    
    // Priority 7: Use first available bus as last resort (for testing)
    if (buses.length > 0) {
      console.log('[ParentDashboard] Using first available bus as fallback:', buses[0].bien_so);
      return buses[0];
    }
    
    console.log('[ParentDashboard] Could not find bus');
    return null;
  }, [currentStudent, currentSchedule, busesCtx.buses, schedulesCtx.schedules]);

  const currentDriver = useMemo(() => {
    if (!currentBus) return null;
    // Try to get driver from bus relation
    if (currentBus.tai_xe) return currentBus.tai_xe;
    // Try to find driver from drivers context
    const drivers = driversCtx.drivers ?? [];
    return drivers.find((d: any) => d.ma_tai_xe === currentBus.ma_tai_xe) || null;
  }, [currentBus, driversCtx.drivers]);

  // Compose student info for display
  const studentInfo: StudentInfo | null = currentStudent
    ? {
      id: currentStudent.ma_hs,
      name: currentStudent.ho_ten,
      grade: currentStudent.lop ?? '---',
      busNumber: currentBus?.bien_so ?? '',
      driverName: currentDriver?.ho_ten ?? '',
      driverPhone: currentDriver?.so_dien_thoai ?? '',
      pickupStop: pickupStopObj?.ten_tram || pickupStop || 'Chưa có thông tin',
      dropoffStop: dropoffStopObj?.ten_tram || dropoffStop || 'Chưa có thông tin',
      pickupTime: currentSchedule?.gio_bat_dau ?? '',
      dropoffTime: currentSchedule?.gio_ket_thuc ?? '',
      currentStatus: ((): StudentInfo['currentStatus'] => {
        // Map backend status to UI status
        const st = (currentStudent.trang_thai ?? '').toString().toLowerCase();
        if (st === 'hoat_dong') return 'at_school';
        if (st === 'nghi') return 'at_home';
        return 'at_home';
      })(),
    }
    : null;

  const [busLocation, setBusLocation] = useState<BusLocationInfo>({
    busNumber: currentBus?.bien_so ?? '',
    currentLocation: 'Chưa có vị trí',
    distanceToPickup: 0,
    distanceToDropoff: 0,
    estimatedPickupTime: currentSchedule?.gio_bat_dau ?? '',
    estimatedDropoffTime: currentSchedule?.gio_ket_thuc ?? '',
    isOnRoute: false,
    lastUpdated: 'Chưa cập nhật',
  });

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update bus location info when currentBus changes
  useEffect(() => {
    if (currentBus) {
      setBusLocation(prev => ({
        ...prev,
        busNumber: currentBus.bien_so ?? prev.busNumber,
        isOnRoute: currentBus.trang_thai === 'dang_su_dung',
      }));
    }
  }, [currentBus]);

  // Fetch bus location from database and calculate distances
  useEffect(() => {
    if (!currentBus?.ma_xe || !currentStudent) {
      console.log('[ParentDashboard] Missing currentBus or currentStudent:', { 
        hasBus: !!currentBus, 
        hasStudent: !!currentStudent,
        busId: currentBus?.ma_xe 
      });
      return;
    }

    const fetchBusLocation = async () => {
      try {
        console.log('[ParentDashboard] Fetching bus location for bus:', currentBus.ma_xe);
        const locations = await busService.getBusLocation(currentBus.ma_xe);
        console.log('[ParentDashboard] Bus locations received:', locations);
        
        if (locations && locations.length > 0) {
          const latest = locations[0];
          const busLat = Number(latest.vi_do);
          const busLng = Number(latest.kinh_do);
          
          console.log('[ParentDashboard] Bus coordinates:', { busLat, busLng });
          
          if (!busLat || !busLng || isNaN(busLat) || isNaN(busLng)) {
            console.warn('[ParentDashboard] Invalid bus coordinates:', { busLat, busLng });
            return;
          }

          // Get pickup and dropoff stop coordinates (use the memoized objects)
          const pickupStop = pickupStopObj;
          const dropoffStop = dropoffStopObj;
          
          console.log('[ParentDashboard] Pickup stop:', pickupStop);
          console.log('[ParentDashboard] Dropoff stop:', dropoffStop);
          
          let distanceToPickup = 0;
          let distanceToDropoff = 0;

          // Calculate distance to pickup stop
          if (pickupStop) {
            const pickupLat = pickupStop.vi_do ? Number(pickupStop.vi_do) : null;
            const pickupLng = pickupStop.kinh_do ? Number(pickupStop.kinh_do) : null;
            
            if (pickupLat !== null && pickupLng !== null && !isNaN(pickupLat) && !isNaN(pickupLng)) {
              distanceToPickup = calculateDistance(busLat, busLng, pickupLat, pickupLng);
              console.log('[ParentDashboard] Distance to pickup:', distanceToPickup.toFixed(2), 'km');
            } else {
              console.warn('[ParentDashboard] Pickup stop missing or invalid coordinates:', { 
                pickupLat, 
                pickupLng,
                stop: pickupStop 
              });
            }
          } else {
            console.warn('[ParentDashboard] Pickup stop object not found');
          }

          // Calculate distance to dropoff stop
          if (dropoffStop) {
            const dropoffLat = dropoffStop.vi_do ? Number(dropoffStop.vi_do) : null;
            const dropoffLng = dropoffStop.kinh_do ? Number(dropoffStop.kinh_do) : null;
            
            if (dropoffLat !== null && dropoffLng !== null && !isNaN(dropoffLat) && !isNaN(dropoffLng)) {
              distanceToDropoff = calculateDistance(busLat, busLng, dropoffLat, dropoffLng);
              console.log('[ParentDashboard] Distance to dropoff:', distanceToDropoff.toFixed(2), 'km');
            } else {
              console.warn('[ParentDashboard] Dropoff stop missing or invalid coordinates:', { 
                dropoffLat, 
                dropoffLng,
                stop: dropoffStop 
              });
            }
          } else {
            console.warn('[ParentDashboard] Dropoff stop object not found');
          }

          // Estimate time based on distance (assuming average speed 40 km/h)
          const avgSpeed = 40; // km/h
          const estimatedPickupMinutes = Math.round((distanceToPickup / avgSpeed) * 60);
          const estimatedDropoffMinutes = Math.round((distanceToDropoff / avgSpeed) * 60);
          
          const now = new Date();
          const estimatedPickupTime = new Date(now.getTime() + estimatedPickupMinutes * 60000);
          const estimatedDropoffTime = new Date(now.getTime() + estimatedDropoffMinutes * 60000);

          setBusLocation(prev => ({
            ...prev,
            busNumber: currentBus.bien_so ?? prev.busNumber,
            currentLocation: `${busLat.toFixed(6)}, ${busLng.toFixed(6)}`,
            distanceToPickup,
            distanceToDropoff,
            estimatedPickupTime: estimatedPickupTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            estimatedDropoffTime: estimatedDropoffTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isOnRoute: currentBus.trang_thai === 'dang_su_dung',
            lastUpdated: latest.thoi_gian ? new Date(latest.thoi_gian).toLocaleTimeString('vi-VN') : 'Vừa cập nhật',
          }));
        }
      } catch (error) {
        console.error('Error fetching bus location:', error);
      }
    };

    fetchBusLocation();
    const interval = setInterval(fetchBusLocation, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [currentBus?.ma_xe, currentStudent, pickupStopObj, dropoffStopObj, calculateDistance]);

  // Listen to real-time location updates from socket
  useEffect(() => {
    if (!currentBus?.ma_xe) return;

    const handleLocationUpdate = (payload: any) => {
      const busId = payload.ma_xe ?? payload.busId;
      if (busId !== currentBus.ma_xe) return;

      const busLat = payload.vi_do ?? payload.latitude;
      const busLng = payload.kinh_do ?? payload.longitude;

      if (!isNaN(busLat) && !isNaN(busLng) && busLat !== 0 && busLng !== 0) {
        const pickupStop = pickupStopObj;
        const dropoffStop = dropoffStopObj;
        
        let distanceToPickup = 0;
        let distanceToDropoff = 0;

        // Calculate distance to pickup stop
        if (pickupStop) {
          const pickupLat = pickupStop.vi_do ? Number(pickupStop.vi_do) : null;
          const pickupLng = pickupStop.kinh_do ? Number(pickupStop.kinh_do) : null;
          
          if (pickupLat !== null && pickupLng !== null && !isNaN(pickupLat) && !isNaN(pickupLng)) {
            distanceToPickup = calculateDistance(busLat, busLng, pickupLat, pickupLng);
          }
        }

        // Calculate distance to dropoff stop
        if (dropoffStop) {
          const dropoffLat = dropoffStop.vi_do ? Number(dropoffStop.vi_do) : null;
          const dropoffLng = dropoffStop.kinh_do ? Number(dropoffStop.kinh_do) : null;
          
          if (dropoffLat !== null && dropoffLng !== null && !isNaN(dropoffLat) && !isNaN(dropoffLng)) {
            distanceToDropoff = calculateDistance(busLat, busLng, dropoffLat, dropoffLng);
          }
        }

        const avgSpeed = 40;
        const estimatedPickupMinutes = Math.round((distanceToPickup / avgSpeed) * 60);
        const estimatedDropoffMinutes = Math.round((distanceToDropoff / avgSpeed) * 60);
        
        const now = new Date();
        const estimatedPickupTime = new Date(now.getTime() + estimatedPickupMinutes * 60000);
        const estimatedDropoffTime = new Date(now.getTime() + estimatedDropoffMinutes * 60000);

        setBusLocation(prev => ({
          ...prev,
          currentLocation: `${Number(busLat).toFixed(6)}, ${Number(busLng).toFixed(6)}`,
          distanceToPickup,
          distanceToDropoff,
          estimatedPickupTime: estimatedPickupTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          estimatedDropoffTime: estimatedDropoffTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          lastUpdated: 'Vừa cập nhật',
        }));
      }
    };

    onLocationUpdate(handleLocationUpdate);
    return () => {
      offLocationUpdate(handleLocationUpdate);
    };
  }, [currentBus?.ma_xe, currentStudent, pickupStopObj, dropoffStopObj, onLocationUpdate, offLocationUpdate, calculateDistance]);

  const placeholderStudentInfo: StudentInfo = {
    id: 0,
    name: 'Chưa có thông tin',
    grade: '---',
    busNumber: '---',
    driverName: '---',
    driverPhone: '---',
    pickupStop: '---',
    dropoffStop: '---',
    pickupTime: '--:--',
    dropoffTime: '--:--',
    currentStatus: 'at_home',
  };

  const placeholderBusLocation: BusLocationInfo = {
    busNumber: '---',
    currentLocation: 'Chưa có thông tin vị trí',
    distanceToPickup: 0,
    distanceToDropoff: 0,
    estimatedPickupTime: '--:--',
    estimatedDropoffTime: '--:--',
    isOnRoute: false,
    lastUpdated: 'Chưa cập nhật',
  };

  const displayStudentInfo = studentInfo || placeholderStudentInfo;
  const displayBusLocation = busLocation || placeholderBusLocation;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'at_home':
        return {
          text: 'Đang ở nhà',
          color: 'text-gray-600 bg-gray-100',
          icon: <User className="h-4 w-4" />,
        };
      case 'waiting_pickup':
        return {
          text: 'Chờ xe đón',
          color: 'text-yellow-600 bg-yellow-100',
          icon: <Clock className="h-4 w-4" />,
        };
      case 'on_bus':
        return {
          text: 'Đang trên xe',
          color: 'text-blue-600 bg-blue-100',
          icon: <Bus className="h-4 w-4" />,
        };
      case 'at_school':
        return {
          text: 'Đã đến trường',
          color: 'text-green-600 bg-green-100',
          icon: <MapPin className="h-4 w-4" />,
        };
      case 'going_home':
        return {
          text: 'Đang về nhà',
          color: 'text-purple-600 bg-purple-100',
          icon: <Route className="h-4 w-4" />,
        };
      default:
        return {
          text: 'Không xác định',
          color: 'text-gray-600 bg-gray-100',
          icon: <AlertCircle className="h-4 w-4" />,
        };
    }
  };

  const statusInfo = getStatusInfo(displayStudentInfo.currentStatus);

  const shouldShowPickupAlert =
    displayBusLocation.distanceToPickup <= 1 && displayBusLocation.distanceToPickup > 0;
  const shouldShowDropoffAlert =
    displayBusLocation.distanceToDropoff <= 1 && displayBusLocation.distanceToDropoff > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng, Phụ huynh! 👋</h1>
        <p className="text-blue-100">Theo dõi hành trình đến trường của con bạn</p>
      </div>

      {/* Alerts */}
      {shouldShowPickupAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">🚌 Xe buýt sắp đến điểm đón!</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Xe {displayBusLocation.busNumber} cách điểm đón{' '}
                {displayBusLocation.distanceToPickup.toFixed(1)}km, dự kiến đến lúc{' '}
                {displayBusLocation.estimatedPickupTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {shouldShowDropoffAlert && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">🏫 Xe buýt sắp đến trường!</h3>
              <p className="text-green-700 text-sm mt-1">
                Xe {displayBusLocation.busNumber} cách trường{' '}
                {displayBusLocation.distanceToDropoff.toFixed(1)}km, dự kiến đến lúc{' '}
                {displayBusLocation.estimatedDropoffTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{displayStudentInfo.name}</h2>
                <p className="text-gray-600">{displayStudentInfo.grade}</p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${statusInfo.color}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bus Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Bus className="h-5 w-5 mr-2 text-blue-600" />
              Thông tin xe buýt
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số xe:</span>
                <span className="font-medium text-gray-900">{displayStudentInfo.busNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tài xế:</span>
                <span className="font-medium text-gray-900">{displayStudentInfo.driverName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Điện thoại:</span>
                <a
                  href={`tel:${displayStudentInfo.driverPhone}`}
                  className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {displayStudentInfo.driverPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Route className="h-5 w-5 mr-2 text-green-600" />
              Lộ trình
            </h3>

            <div className="space-y-4 text-sm">
              {/* Pickup Stop */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-gray-700 font-medium">Điểm đón:</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{displayStudentInfo.pickupTime || '--:--'}</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">{displayStudentInfo.pickupStop}</p>
                {pickupStopObj && (
                  <>
                    {pickupStopObj.dia_chi && (
                      <p className="text-xs text-gray-600 mt-1">📍 {pickupStopObj.dia_chi}</p>
                    )}
                    {pickupStopObj.vi_do && pickupStopObj.kinh_do && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tọa độ: {Number(pickupStopObj.vi_do).toFixed(6)}, {Number(pickupStopObj.kinh_do).toFixed(6)}
                      </p>
                    )}
                  </>
                )}
                {!pickupStopObj && currentStudent?.ma_diem_don && (
                  <p className="text-xs text-gray-500 mt-1 italic">Đang tải thông tin điểm đón...</p>
                )}
              </div>

              {/* Dropoff Stop */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Điểm trả:</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{displayStudentInfo.dropoffTime || '--:--'}</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">{displayStudentInfo.dropoffStop}</p>
                {dropoffStopObj && (
                  <>
                    {dropoffStopObj.dia_chi && (
                      <p className="text-xs text-gray-600 mt-1">📍 {dropoffStopObj.dia_chi}</p>
                    )}
                    {dropoffStopObj.vi_do && dropoffStopObj.kinh_do && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tọa độ: {Number(dropoffStopObj.vi_do).toFixed(6)}, {Number(dropoffStopObj.kinh_do).toFixed(6)}
                      </p>
                    )}
                  </>
                )}
                {!dropoffStopObj && currentStudent?.ma_diem_tra && (
                  <p className="text-xs text-gray-500 mt-1 italic">Đang tải thông tin điểm trả...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Tracking */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Vị trí xe buýt (Real-time)
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{displayBusLocation.lastUpdated}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Vị trí hiện tại:</span>
              <span className="font-medium text-gray-900">{displayBusLocation.currentLocation}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cách điểm đón:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {displayBusLocation.distanceToPickup > 0 
                      ? `${displayBusLocation.distanceToPickup.toFixed(2)} km`
                      : 'Chưa có dữ liệu'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, 100 - displayBusLocation.distanceToPickup * 20)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Dự kiến: {displayBusLocation.estimatedPickupTime}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cách điểm trả:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {displayBusLocation.distanceToDropoff > 0 
                      ? `${displayBusLocation.distanceToDropoff.toFixed(2)} km`
                      : 'Chưa có dữ liệu'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, 100 - displayBusLocation.distanceToDropoff * 10)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Dự kiến: {displayBusLocation.estimatedDropoffTime}</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Bản đồ theo dõi xe buýt
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Cập nhật mới nhất</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <MapViews height="500px" />

              <div className="text-center mt-4">
                <p className="text-gray-500 text-sm mb-4">
                  Hiển thị vị trí xe buýt và lộ trình di chuyển real-time
                </p>
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Xe buýt</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Điểm đón/trả</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Vị trí hiện tại</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;