import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useBuses } from '../contexts/BusesContext';
import { useSchedules } from '../contexts/SchedulesContext';
import busService from '../services/api/busService';
import routeService from '../services/api/routeService';
import {
  initializeBusSimulation,
  calculateNextPosition,
  getRoutePathFromStops,
  type BusSimulationState,
  type RoutePath,
} from '../services/routeSimulationService';
import type { Schedule, Bus } from '../types';

/**
 * Hook to automatically send location updates every 5 seconds for active buses
 * Xe sẽ di chuyển theo tuyến đường thực tế thay vì di chuyển ngẫu nhiên
 */
export const useAutoLocationUpdate = (enabled: boolean = true, intervalMs: number = 5000) => {
  const { sendLocationUpdate, isConnected } = useSocket();
  const { buses } = useBuses();
  const { schedules } = useSchedules();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Lưu trữ trạng thái giả lập cho mỗi xe
  const [busSimulations, setBusSimulations] = useState<Map<number, BusSimulationState>>(new Map());
  // Lưu trữ tuyến đường đã tải
  const [routePaths, setRoutePaths] = useState<Map<number, RoutePath>>(new Map());

  // Helper function to normalize date to YYYY-MM-DD format
  const normalizeDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    try {
      // Handle ISO string format (2025-11-23T17:00:00.000Z)
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      // Handle YYYY-MM-DD format
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateStr.split('T')[0].split(' ')[0];
      }
      return null;
    }
  };

  // Helper function to check if a schedule is currently active
  const isScheduleActive = (schedule: Schedule): boolean => {
    if (!schedule) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const scheduleDate = normalizeDate(schedule.ngay_chay);
    if (!scheduleDate || scheduleDate !== today) return false;

    // Nếu schedule có trạng thái 'dang_chay', luôn coi như đang hoạt động
    if (schedule.trang_thai_lich === 'dang_chay') {
      console.log(`[useAutoLocationUpdate] Schedule ${schedule.ma_lich} is active (dang_chay)`);
      return true;
    }

    // Nếu schedule có trạng thái 'cho_chay', kiểm tra xem có gần đến giờ bắt đầu không
    if (schedule.trang_thai_lich === 'cho_chay') {
      const now = new Date();
      const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      const parseTime = (timeStr: string): number => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0);
      };

      const startTime = parseTime(schedule.gio_bat_dau);
      // Cho phép 30 phút trước giờ bắt đầu và sau giờ bắt đầu 4 giờ (để đảm bảo xe có thể di chuyển)
      const isInWindow = currentTime >= (startTime - 1800) && currentTime <= (startTime + 14400);
      
      if (isInWindow) {
        console.log(`[useAutoLocationUpdate] Schedule ${schedule.ma_lich} is active (cho_chay, within time window)`);
      } else {
        console.log(`[useAutoLocationUpdate] Schedule ${schedule.ma_lich} is not active (cho_chay, outside time window):`, {
          currentTime: `${Math.floor(currentTime / 3600)}:${Math.floor((currentTime % 3600) / 60)}`,
          startTime: `${Math.floor(startTime / 3600)}:${Math.floor((startTime % 3600) / 60)}`,
          window: `${Math.floor((startTime - 1800) / 3600)}:${Math.floor(((startTime - 1800) % 3600) / 60)} - ${Math.floor((startTime + 14400) / 3600)}:${Math.floor(((startTime + 14400) % 3600) / 60)}`
        });
      }
      
      return isInWindow;
    }

    // Các trạng thái khác (hoan_thanh, huy) không được coi là active
    console.log(`[useAutoLocationUpdate] Schedule ${schedule.ma_lich} is not active (trang_thai_lich: ${schedule.trang_thai_lich})`);
    return false;
  };

  // Khởi tạo giả lập cho các xe
  useEffect(() => {
    if (!enabled) return;

    const initializeSimulations = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Debug: Log tất cả schedules
      console.log(`[useAutoLocationUpdate] Total schedules loaded: ${schedules.length}`);
      console.log(`[useAutoLocationUpdate] Today date: ${today}`);
      if (schedules.length > 0) {
        console.log(`[useAutoLocationUpdate] All schedules:`, schedules.map(s => ({
          ma_lich: s.ma_lich,
          ma_xe: s.ma_xe,
          ma_tuyen: s.ma_tuyen,
          ngay_chay: s.ngay_chay,
          ngay_chay_normalized: normalizeDate(s.ngay_chay),
          trang_thai_lich: s.trang_thai_lich,
          gio_bat_dau: s.gio_bat_dau,
          gio_ket_thuc: s.gio_ket_thuc
        })));
      }
      
      // Debug: Log tất cả schedules hôm nay (sử dụng normalizeDate)
      const todaySchedules = schedules.filter((schedule: Schedule) => {
        const scheduleDate = normalizeDate(schedule.ngay_chay);
        return scheduleDate === today;
      });
      console.log(`[useAutoLocationUpdate] Initializing simulations. Today schedules (${todaySchedules.length}):`, todaySchedules.map(s => ({
        ma_lich: s.ma_lich,
        ma_xe: s.ma_xe,
        ma_tuyen: s.ma_tuyen,
        trang_thai_lich: s.trang_thai_lich,
        gio_bat_dau: s.gio_bat_dau,
        gio_ket_thuc: s.gio_ket_thuc
      })));
      
      // CHỈ lấy các xe có schedule active (đang hoạt động theo lịch trình)
      const activeSchedules = schedules.filter((schedule: Schedule) => {
        const scheduleDate = normalizeDate(schedule.ngay_chay);
        const isToday = scheduleDate === today;
        const isActive = isScheduleActive(schedule);
        const hasBus = schedule.ma_xe !== null;
        const hasRoute = schedule.ma_tuyen !== null;
        
        if (isToday && hasBus && hasRoute && !isActive) {
          console.log(`[useAutoLocationUpdate] Schedule ${schedule.ma_lich} for bus ${schedule.ma_xe} is not active:`, {
            trang_thai_lich: schedule.trang_thai_lich,
            gio_bat_dau: schedule.gio_bat_dau,
            gio_ket_thuc: schedule.gio_ket_thuc,
            ngay_chay: schedule.ngay_chay,
            ngay_chay_normalized: scheduleDate
          });
        }
        
        return isToday && isActive && hasBus && hasRoute;
      });

      console.log(`[useAutoLocationUpdate] Active schedules for simulation: ${activeSchedules.length}`, activeSchedules.map(s => ({
        ma_lich: s.ma_lich,
        ma_xe: s.ma_xe,
        ma_tuyen: s.ma_tuyen,
        trang_thai_lich: s.trang_thai_lich
      })));

      if (activeSchedules.length === 0) {
        console.warn(`[useAutoLocationUpdate] No active schedules found for today (${today})`);
        console.warn(`[useAutoLocationUpdate] Available schedules:`, schedules.map(s => ({
          ma_lich: s.ma_lich,
          ma_xe: s.ma_xe,
          ma_tuyen: s.ma_tuyen,
          ngay_chay: s.ngay_chay,
          ngay_chay_normalized: normalizeDate(s.ngay_chay),
          trang_thai_lich: s.trang_thai_lich
        })));
        
        // FALLBACK: Nếu không có schedule hôm nay, thử dùng schedule gần nhất có trạng thái 'dang_chay' hoặc 'cho_chay'
        const fallbackSchedules = schedules.filter((schedule: Schedule) => 
          schedule.ma_xe !== null &&
          schedule.ma_tuyen !== null &&
          (schedule.trang_thai_lich === 'dang_chay' || schedule.trang_thai_lich === 'cho_chay')
        );
        
        if (fallbackSchedules.length > 0) {
          console.warn(`[useAutoLocationUpdate] Using FALLBACK: ${fallbackSchedules.length} schedules with 'dang_chay' or 'cho_chay' status (not checking date)`);
          // Sử dụng fallback schedules
          const fallbackActiveSchedules = fallbackSchedules;
          const fallbackActiveBusIds = new Set(fallbackActiveSchedules.map((s: Schedule) => s.ma_xe));
          const fallbackBusesToSimulate = buses.filter((bus: Bus) => 
            fallbackActiveBusIds.has(bus.ma_xe) && 
            (bus.trang_thai === 'dang_su_dung' || bus.trang_thai === 'san_sang')
          );
          
          if (fallbackBusesToSimulate.length > 0) {
            console.log(`[useAutoLocationUpdate] Found ${fallbackBusesToSimulate.length} buses for fallback simulation`);
            // Tiếp tục với fallback schedules
            activeSchedules.push(...fallbackActiveSchedules);
          } else {
            console.log(`[useAutoLocationUpdate] No active schedules found, skipping simulation initialization`);
            return;
          }
        } else {
          console.log(`[useAutoLocationUpdate] No active schedules found, skipping simulation initialization`);
          return;
        }
      }

      // Chỉ giả lập cho các xe có schedule active VÀ trạng thái phù hợp (dang_su_dung hoặc san_sang)
      const activeBusIds = new Set(activeSchedules.map((s: Schedule) => s.ma_xe));
      console.log(`[useAutoLocationUpdate] Active bus IDs from schedules:`, Array.from(activeBusIds));
      console.log(`[useAutoLocationUpdate] Available buses:`, buses.map(b => ({ ma_xe: b.ma_xe, bien_so: b.bien_so, trang_thai: b.trang_thai })));
      
      const busesToSimulate = buses.filter((bus: Bus) => 
        activeBusIds.has(bus.ma_xe) && 
        (bus.trang_thai === 'dang_su_dung' || bus.trang_thai === 'san_sang')
      );
      
      console.log(`[useAutoLocationUpdate] Found ${busesToSimulate.length} buses with active schedules and valid status to simulate:`, busesToSimulate.map(b => ({ ma_xe: b.ma_xe, bien_so: b.bien_so, trang_thai: b.trang_thai })));
      if (busesToSimulate.length < activeBusIds.size) {
        const excludedBuses = buses.filter((bus: Bus) => 
          activeBusIds.has(bus.ma_xe) && 
          bus.trang_thai !== 'dang_su_dung' && 
          bus.trang_thai !== 'san_sang'
        );
        console.log(`[useAutoLocationUpdate] Excluded ${excludedBuses.length} buses with status 'bao_duong' or other:`, excludedBuses.map(b => ({ ma_xe: b.ma_xe, bien_so: b.bien_so, trang_thai: b.trang_thai })));
      }

      const newSimulations = new Map<number, BusSimulationState>();
      const newRoutePaths = new Map<number, RoutePath>();

      for (const bus of busesToSimulate) {
        // Nếu đã có simulation state, bỏ qua
        if (newSimulations.has(bus.ma_xe)) continue;

        try {
          // Tìm schedule active cho xe này (chỉ từ activeSchedules)
          const activeSchedule = activeSchedules.find((s: Schedule) => s.ma_xe === bus.ma_xe);

          if (!activeSchedule || !activeSchedule.ma_tuyen) {
            console.log(`[useAutoLocationUpdate] Bus ${bus.ma_xe} không có lịch trình đang hoạt động`);
            continue;
          }

          const routeId = activeSchedule.ma_tuyen;
          console.log(`[useAutoLocationUpdate] Initializing simulation for bus ${bus.ma_xe} on route ${routeId}`);

          // Kiểm tra xem đã có route path chưa
          let routePath: RoutePath | undefined = newRoutePaths.get(routeId);
          if (!routePath) {
            // Lấy chi tiết tuyến đường (các trạm)
            const routeDetails = await routeService.getRouteDetails(routeId);
            
            // Tạo route path từ các trạm
            // Convert RouteDetail[] to format expected by getRoutePathFromStops
            const stopsForPath = routeDetails.map(detail => ({
              vi_do: detail.vi_do ?? detail.tram?.vi_do ?? null,
              kinh_do: detail.kinh_do ?? detail.tram?.kinh_do ?? null
            }));
            const pathResult = await getRoutePathFromStops(routeId, stopsForPath);
            
            if (!pathResult) {
              console.warn(`Không thể tạo route path cho tuyến ${routeId}`);
              continue;
            }
            
            routePath = pathResult;
            newRoutePaths.set(routeId, routePath);
            console.log(`[useAutoLocationUpdate] Created route path for route ${routeId} with ${routePath.coordinates.length} coordinates`);
          }

          // Lấy vị trí hiện tại của xe
          let currentLat: number | undefined;
          let currentLng: number | undefined;

          try {
            const locations = await busService.getBusLocation(bus.ma_xe);
            if (locations && locations.length > 0) {
              const latest = locations[0];
              currentLat = Number(latest.vi_do);
              currentLng = Number(latest.kinh_do);
            } else if (bus.vi_tri_hien_tai?.vi_do && bus.vi_tri_hien_tai?.kinh_do) {
              currentLat = Number(bus.vi_tri_hien_tai.vi_do);
              currentLng = Number(bus.vi_tri_hien_tai.kinh_do);
            }
          } catch (error) {
            console.error(`Error getting location for bus ${bus.ma_xe}:`, error);
          }

          // Khởi tạo simulation state
          const simulation = initializeBusSimulation(
            bus.ma_xe,
            routeId,
            routePath,
            currentLat,
            currentLng
          );

          newSimulations.set(bus.ma_xe, simulation);
          console.log(`[useAutoLocationUpdate] Successfully initialized simulation for bus ${bus.ma_xe}:`, {
            routeId,
            currentIndex: simulation.currentIndex,
            speed: simulation.speed.toFixed(2),
            direction: simulation.direction,
            routePathLength: routePath.coordinates.length,
            initialPosition: currentLat && currentLng ? `(${currentLat.toFixed(6)}, ${currentLng.toFixed(6)})` : 'from route start'
          });
        } catch (error) {
          console.error(`[useAutoLocationUpdate] Error initializing simulation for bus ${bus.ma_xe}:`, error);
        }
      }
      
      console.log(`[useAutoLocationUpdate] Initialized ${newSimulations.size} bus simulations`);

      setBusSimulations((prev) => {
        const merged = new Map(prev);
        newSimulations.forEach((value, key) => merged.set(key, value));
        return merged;
      });
      setRoutePaths((prev) => {
        const merged = new Map(prev);
        newRoutePaths.forEach((value, key) => merged.set(key, value));
        return merged;
      });
    };

    initializeSimulations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, buses.length, schedules.length]);

  useEffect(() => {
    if (!enabled || !isConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateLocations = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Debug: Log tất cả schedules
      if (schedules.length === 0) {
        console.warn(`[useAutoLocationUpdate] No schedules loaded at all! Check SchedulesContext.`);
      }
      
      // Debug: Log tất cả schedules hôm nay (sử dụng normalizeDate)
      const todaySchedules = schedules.filter((schedule: Schedule) => {
        const scheduleDate = normalizeDate(schedule.ngay_chay);
        return scheduleDate === today;
      });
      console.log(`[useAutoLocationUpdate] Today schedules (${todaySchedules.length}):`, todaySchedules.map(s => ({
        ma_lich: s.ma_lich,
        ma_xe: s.ma_xe,
        ma_tuyen: s.ma_tuyen,
        trang_thai_lich: s.trang_thai_lich,
        gio_bat_dau: s.gio_bat_dau,
        gio_ket_thuc: s.gio_ket_thuc,
        ngay_chay: s.ngay_chay,
        ngay_chay_normalized: normalizeDate(s.ngay_chay)
      })));
      
      // Nếu không có schedule hôm nay, log để debug
      if (todaySchedules.length === 0 && schedules.length > 0) {
        const uniqueDates = [...new Set(schedules.map(s => normalizeDate(s.ngay_chay)).filter(d => d))];
        console.warn(`[useAutoLocationUpdate] No schedules for today (${today}), but found schedules for other dates:`, uniqueDates);
      }
      
      // CHỈ cập nhật vị trí cho các xe có schedule active (đang hoạt động theo lịch trình)
      const activeSchedules = schedules.filter((schedule: Schedule) => {
        const scheduleDate = normalizeDate(schedule.ngay_chay);
        const isToday = scheduleDate === today;
        const isActive = isScheduleActive(schedule);
        const hasBus = schedule.ma_xe !== null;
        
        if (isToday && hasBus && !isActive) {
          console.log(`[useAutoLocationUpdate] Schedule ${schedule.ma_lich} for bus ${schedule.ma_xe} is not active:`, {
            trang_thai_lich: schedule.trang_thai_lich,
            gio_bat_dau: schedule.gio_bat_dau,
            gio_ket_thuc: schedule.gio_ket_thuc,
            ngay_chay: schedule.ngay_chay
          });
        }
        
        return isToday && isActive && hasBus;
      });

      console.log(`[useAutoLocationUpdate] Active schedules: ${activeSchedules.length}`, activeSchedules.map(s => ({
        ma_lich: s.ma_lich,
        ma_xe: s.ma_xe,
        ma_tuyen: s.ma_tuyen,
        trang_thai_lich: s.trang_thai_lich
      })));

      if (activeSchedules.length === 0) {
        console.warn(`[useAutoLocationUpdate] No active schedules for today (${today})`);
        
        // FALLBACK: Nếu không có schedule hôm nay, thử dùng schedule gần nhất có trạng thái 'dang_chay' hoặc 'cho_chay'
        const fallbackSchedules = schedules.filter((schedule: Schedule) => 
          schedule.ma_xe !== null &&
          (schedule.trang_thai_lich === 'dang_chay' || schedule.trang_thai_lich === 'cho_chay')
        );
        
        if (fallbackSchedules.length > 0) {
          console.warn(`[useAutoLocationUpdate] Using FALLBACK: ${fallbackSchedules.length} schedules with 'dang_chay' or 'cho_chay' status (not checking date)`);
          activeSchedules.push(...fallbackSchedules);
        } else {
          console.log(`[useAutoLocationUpdate] No active schedules, skipping location updates`);
          return;
        }
      }

      // Chỉ cập nhật cho các xe có schedule active VÀ trạng thái phù hợp (dang_su_dung hoặc san_sang)
      const activeBusIds = new Set(activeSchedules.map((s: Schedule) => s.ma_xe));
      const busesToUpdate = buses.filter((bus: Bus) => 
        activeBusIds.has(bus.ma_xe) && 
        (bus.trang_thai === 'dang_su_dung' || bus.trang_thai === 'san_sang')
      );
      
      console.log(`[useAutoLocationUpdate] Updating locations for ${busesToUpdate.length} buses with active schedules and valid status`);
      if (busesToUpdate.length < activeBusIds.size) {
        const excludedBuses = buses.filter((bus: Bus) => 
          activeBusIds.has(bus.ma_xe) && 
          bus.trang_thai !== 'dang_su_dung' && 
          bus.trang_thai !== 'san_sang'
        );
        console.log(`[useAutoLocationUpdate] Excluded ${excludedBuses.length} buses with status 'bao_duong' or other:`, excludedBuses.map(b => ({ ma_xe: b.ma_xe, bien_so: b.bien_so, trang_thai: b.trang_thai })));
      }

      const locationUpdates: Array<{
        busId: number;
        lat: number;
        lng: number;
        speed: number;
        bien_so: string;
      }> = [];

      setBusSimulations((prevSimulations) => {
        const updatedSimulations = new Map(prevSimulations);

        for (const bus of busesToUpdate) {
          try {
            const simulation = updatedSimulations.get(bus.ma_xe);

            if (!simulation) {
              // Nếu chưa có simulation, log và bỏ qua (sẽ được khởi tạo ở effect trên)
              console.log(`[useAutoLocationUpdate] No simulation state for bus ${bus.ma_xe}, skipping update`);
              continue;
            }

            // Tính toán vị trí mới dựa trên tuyến đường
            const timeElapsed = intervalMs / 1000; // seconds
            const nextPosition = calculateNextPosition(simulation, timeElapsed);
            
            console.log(`[useAutoLocationUpdate] Bus ${bus.ma_xe} moving from index ${simulation.currentIndex} to ${nextPosition.newIndex}, new position: (${nextPosition.lat.toFixed(6)}, ${nextPosition.lng.toFixed(6)})`);

            // Cập nhật simulation state
            const updatedSimulation: BusSimulationState = {
              ...simulation,
              currentIndex: nextPosition.newIndex,
              speed: nextPosition.newSpeed,
              direction: nextPosition.newDirection,
              lastUpdateTime: Date.now(),
            };

            updatedSimulations.set(bus.ma_xe, updatedSimulation);

            // Lưu thông tin để gửi location update sau
            locationUpdates.push({
              busId: bus.ma_xe,
              lat: nextPosition.lat,
              lng: nextPosition.lng,
              speed: nextPosition.newSpeed,
              bien_so: bus.bien_so,
            });
          } catch (error) {
            console.error(`Error updating location for bus ${bus.ma_xe}:`, error);
          }
        }

        return updatedSimulations;
      });

      // Gửi location updates sau khi state đã được cập nhật
      if (locationUpdates.length > 0) {
        console.log(`[useAutoLocationUpdate] Sending ${locationUpdates.length} location updates`);
        locationUpdates.forEach((update) => {
          const locationData = {
            busId: update.busId,
            ma_xe: update.busId,
            latitude: update.lat,
            longitude: update.lng,
            vi_do: update.lat,
            kinh_do: update.lng,
            speed: update.speed,
            toc_do: update.speed,
            heading: 0, // Default heading, can be calculated from direction if needed
            bien_so: update.bien_so,
            busNumber: update.bien_so,
          };
          console.log(`[useAutoLocationUpdate] Sending location update for bus ${update.busId}:`, locationData);
          sendLocationUpdate(locationData);
        });
      } else {
        console.log(`[useAutoLocationUpdate] No location updates to send (${busesToUpdate.length} buses, ${busSimulations.size} simulations)`);
      }
    };

    // Initial update
    updateLocations();

    // Set up interval
    intervalRef.current = setInterval(updateLocations, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
   }, [enabled, isConnected, buses, schedules, sendLocationUpdate, intervalMs]);
};

