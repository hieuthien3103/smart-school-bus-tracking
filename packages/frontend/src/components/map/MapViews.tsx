import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useBuses } from '../../contexts/BusesContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useAutoLocationUpdate } from '../../hooks/useAutoLocationUpdate';
import routeService from '../../services/api/routeService';
import busService from '../../services/api/busService';
import { getRouteDirections, interpolateRoute } from '../../services/api/directionsService';
import { useDelayAlerts } from '../../hooks/useDelayAlerts';
import type { Route, RouteDetail, Bus, Schedule } from '../../types';

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Bus icon (custom icon for moving buses)
const BusIcon = L.divIcon({
  className: 'bus-marker',
  html: `<div style="
    width: 30px;
    height: 30px;
    background-color: #EF4444;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  ">🚌</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Helper function to get coordinates from stop detail or generate fallback
const getStopCoordinates = (
  detail: RouteDetail,
  stopIndex: number,
  totalStops: number,
  defaultLat: number = 10.762913,
  defaultLng: number = 106.682171
): [number, number] | null => {
  // Use real coordinates from database if available
  if (detail.vi_do !== null && detail.vi_do !== undefined && 
      detail.kinh_do !== null && detail.kinh_do !== undefined) {
    return [Number(detail.vi_do), Number(detail.kinh_do)];
  }
  
  // Fallback: use coordinates from nested tram object if available
  if (detail.tram?.vi_do !== null && detail.tram?.vi_do !== undefined &&
      detail.tram?.kinh_do !== null && detail.tram?.kinh_do !== undefined) {
    return [Number(detail.tram.vi_do), Number(detail.tram.kinh_do)];
  }
  
  // Last resort: generate mock coordinates (for stops without coordinates)
  const latOffset = (stopIndex / totalStops) * 0.05;
  const lngOffset = (stopIndex / totalStops) * 0.05;
  return [defaultLat + latOffset, defaultLng + lngOffset];
};

// Component to fit map bounds to show all routes
const MapBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  const hasZoomed = useRef(false); // Thêm ref để track đã zoom chưa
  
  useEffect(() => {
    // Chỉ zoom lần đầu tiên
    if (positions.length > 0 && !hasZoomed.current) {
      map.fitBounds(positions, { padding: [50, 50] });
      hasZoomed.current = true; // Đánh dấu đã zoom
    }
  }, [map, positions]);
  
  return null;
};
interface MapViewsProps {
  height?: string;
  onBusClick?: (bus: Bus) => void;
}

interface BusLocation {
  ma_xe: number;
  bien_so: string;
  vi_do: number;
  kinh_do: number;
  toc_do?: number | null;
  thoi_gian?: string;
  driver?: string;
}

const MapViews: React.FC<MapViewsProps> = ({ height = '600px', onBusClick }) => {
  const { user } = useAuth();
  const { onLocationUpdate, offLocationUpdate, joinRoom } = useSocket();
  const { buses } = useBuses();
  const { schedules } = useSchedules();
  
  // Enable auto location updates for bus movement simulation
  useAutoLocationUpdate(true, 5000);

  // Helper function to check if a schedule is currently active (within time window)
  const isScheduleActive = useCallback((schedule: Schedule): boolean => {
    if (!schedule) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (schedule.ngay_chay !== today) return false;

    // If schedule is 'dang_chay', consider it active (more lenient)
    if (schedule.trang_thai_lich === 'dang_chay') {
      const now = new Date();
      const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      // Parse schedule times
      const parseTime = (timeStr: string): number => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0);
      };

      const startTime = parseTime(schedule.gio_bat_dau);
      const endTime = schedule.gio_ket_thuc ? parseTime(schedule.gio_ket_thuc) : startTime + 3600 * 12; // Default 12 hours if no end time

      // Check if current time is within schedule window
      const isInTimeWindow = currentTime >= startTime && currentTime <= endTime;
      
      // If not in time window but schedule is 'dang_chay', still consider it active (for flexibility)
      if (!isInTimeWindow && schedule.trang_thai_lich === 'dang_chay') {
        console.log(`[MapViews] Schedule ${schedule.ma_lich} is 'dang_chay' but outside time window (${schedule.gio_bat_dau}-${schedule.gio_ket_thuc}), showing anyway`);
        return true;
      }
      
      return isInTimeWindow;
    }

    // For 'cho_chay' status, check if it's within time window
    if (schedule.trang_thai_lich === 'cho_chay') {
      const now = new Date();
      const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      const parseTime = (timeStr: string): number => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0);
      };

      const startTime = parseTime(schedule.gio_bat_dau);
      // For 'cho_chay', show if within 30 minutes before start time
      return currentTime >= (startTime - 1800) && currentTime <= startTime;
    }

    return false;
  }, []);

  // State declarations (must be before useMemo that depends on them)
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeDetails, setRouteDetails] = useState<Map<number, RouteDetail[]>>(new Map());
  const [routePolylines, setRoutePolylines] = useState<Map<number, [number, number][]>>(new Map());
  const [busLocations, setBusLocations] = useState<Map<number, BusLocation>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get active buses (buses with active schedules) - FILTERED BY DISPLAYED ROUTES
  const activeBuses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get route IDs from displayed routes
    const displayedRouteIds = new Set(routes.map(route => route.ma_tuyen));
    
    if (displayedRouteIds.size === 0) {
      // No routes displayed yet, return empty array
      return [];
    }
    
    console.log('[MapViews] Displayed routes:', Array.from(displayedRouteIds));
    console.log('[MapViews] Total schedules:', schedules.length);
    console.log('[MapViews] Total buses:', buses.length);
    
    // First, try to get buses with active schedules that belong to displayed routes
    const activeSchedules = schedules.filter((schedule: Schedule) => 
      schedule.ngay_chay === today && 
      isScheduleActive(schedule) &&
      schedule.ma_xe !== null &&
      schedule.ma_tuyen !== null &&
      displayedRouteIds.has(schedule.ma_tuyen) // FILTER BY ROUTE
    );
    
    const activeBusIds = new Set(activeSchedules.map((s: Schedule) => s.ma_xe));
    const filteredBuses = buses.filter((bus: Bus) => activeBusIds.has(bus.ma_xe));
    
    // If no active buses found, fallback to buses with schedules today that are 'dang_chay' or 'cho_chay' for displayed routes
    if (filteredBuses.length === 0) {
      const todaySchedules = schedules.filter((schedule: Schedule) => 
        schedule.ngay_chay === today && 
        schedule.ma_xe !== null &&
        schedule.ma_tuyen !== null &&
        displayedRouteIds.has(schedule.ma_tuyen) && // FILTER BY ROUTE
        (schedule.trang_thai_lich === 'dang_chay' || schedule.trang_thai_lich === 'cho_chay')
      );
      const todayBusIds = new Set(todaySchedules.map((s: Schedule) => s.ma_xe));
      const todayBuses = buses.filter((bus: Bus) => todayBusIds.has(bus.ma_xe));
      
      console.log('[MapViews] No active buses in time window, using today buses with status dang_chay/cho_chay for displayed routes:', todayBuses.length);
      
      // If still no buses, try to get any buses with schedules for displayed routes (any status, any date)
      if (todayBuses.length === 0) {
        const routeSchedules = schedules.filter((schedule: Schedule) => 
          schedule.ma_xe !== null &&
          schedule.ma_tuyen !== null &&
          displayedRouteIds.has(schedule.ma_tuyen)
        );
        const routeBusIds = new Set(routeSchedules.map((s: Schedule) => s.ma_xe));
        const routeBuses = buses.filter((bus: Bus) => routeBusIds.has(bus.ma_xe));
        
        console.log('[MapViews] No today buses found, using any buses with schedules for displayed routes:', routeBuses.length);
        return routeBuses;
      }
      
      return todayBuses;
    }
    
    console.log('[MapViews] Active buses for displayed routes:', filteredBuses.length, 'schedules:', activeSchedules.length);
    return filteredBuses;
  }, [buses, schedules, isScheduleActive, routes]); // Added routes to dependencies

  // Monitor delays and send alerts (after state is declared)
  useDelayAlerts({
    buses: activeBuses,
    schedules,
    routeDetailsMap: routeDetails,
    busLocations: busLocations,
    enabled: !!user,
    checkInterval: 30000, // Check every 30 seconds
  });

  // Default center (Hanoi)
  const defaultCenter: [number, number] = [21.0285, 105.8542];
  const defaultZoom = 12;

  // Colors for different routes
  const routeColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ];

  // Handle real-time location updates from socket
  useEffect(() => {
    const handleLocationUpdate = (payload: any) => {
      const ma_xe = payload.ma_xe ?? payload.busId ?? payload.id;
      if (!ma_xe) return;

      const vi_do = payload.vi_do ?? payload.latitude;
      const kinh_do = payload.kinh_do ?? payload.longitude;
      
      // Update location for any bus that has valid coordinates
      // Don't restrict to activeBuses only, as buses might be displayed from schedules
      if (vi_do != null && kinh_do != null) {
        console.log(`[MapViews] Received location update for bus ${ma_xe}:`, { vi_do, kinh_do, toc_do: payload.toc_do ?? payload.speed });
        setBusLocations(prev => {
          const updated = new Map(prev);
          updated.set(Number(ma_xe), {
            ma_xe: Number(ma_xe),
            bien_so: payload.bien_so ?? payload.busNumber ?? `Xe ${ma_xe}`,
            vi_do: Number(vi_do),
            kinh_do: Number(kinh_do),
            toc_do: payload.toc_do ?? payload.speed ?? undefined,
            thoi_gian: payload.thoi_gian ?? payload.timestamp ?? new Date().toISOString(),
            driver: payload.driver ?? payload.tai_xe?.ho_ten ?? undefined,
          });
          return updated;
        });
      }
    };

    // Join socket room
    if (user) {
      joinRoom({ role: user.role as 'admin' | 'driver' | 'parent' });
    }

    // Subscribe to location updates
    onLocationUpdate(handleLocationUpdate);

    return () => {
      offLocationUpdate(handleLocationUpdate);
    };
  }, [user, onLocationUpdate, offLocationUpdate, joinRoom, activeBuses]);

  // Initialize bus locations from active buses only and auto-refresh
  useEffect(() => {
    const updateBusLocations = async () => {
      const initialLocations = new Map<number, BusLocation>();
      
      // Only update locations for active buses
      for (const bus of activeBuses) {
        // Try to get latest location from database
        try {
          const locations = await busService.getBusLocation(bus.ma_xe);
          if (locations && locations.length > 0) {
            const latest = locations[0];
            if (latest.vi_do && latest.kinh_do) {
              initialLocations.set(bus.ma_xe, {
                ma_xe: bus.ma_xe,
                bien_so: bus.bien_so,
                vi_do: Number(latest.vi_do),
                kinh_do: Number(latest.kinh_do),
                toc_do: latest.toc_do ?? undefined,
                thoi_gian: latest.thoi_gian ?? undefined,
                driver: bus.tai_xe?.ho_ten ?? undefined,
              });
              continue;
            }
          }
        } catch (error) {
          console.error(`Error fetching location for bus ${bus.ma_xe}:`, error);
        }

        // Fallback to bus.vi_tri_hien_tai if available
        if (bus.vi_tri_hien_tai?.vi_do && bus.vi_tri_hien_tai?.kinh_do) {
          initialLocations.set(bus.ma_xe, {
            ma_xe: bus.ma_xe,
            bien_so: bus.bien_so,
            vi_do: Number(bus.vi_tri_hien_tai.vi_do),
            kinh_do: Number(bus.vi_tri_hien_tai.kinh_do),
            toc_do: bus.vi_tri_hien_tai.toc_do ?? undefined,
            thoi_gian: bus.vi_tri_hien_tai.thoi_gian ?? undefined,
            driver: bus.tai_xe?.ho_ten ?? undefined,
          });
        }
      }

      setBusLocations(prev => {
        const merged = new Map(prev);
        initialLocations.forEach((value, key) => {
          merged.set(key, value);
        });
        return merged;
      });
    };

    updateBusLocations();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(updateBusLocations, 5000);
    
    return () => clearInterval(interval);
  }, [activeBuses]);

  // Fetch routes based on user role
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        let fetchedRoutes: Route[] = [];
        
        // Get routes based on role
        if (user.role === 'admin') {
          fetchedRoutes = await routeService.getRoutesForRole('admin');
        } else if (user.role === 'driver') {
          const driverId = (user as any).ma_tai_xe;
          if (!driverId) {
            throw new Error('Không tìm thấy ID tài xế');
          }
          fetchedRoutes = await routeService.getRoutesForRole('driver', driverId);
        } else if (user.role === 'parent') {
          const parentId = (user as any).ma_phu_huynh;
          if (!parentId) {
            throw new Error('Không tìm thấy ID phụ huynh');
          }
          fetchedRoutes = await routeService.getRoutesForRole('parent', parentId);
        }

        setRoutes(fetchedRoutes);

        // Fetch details and directions for each route
        const detailsMap = new Map<number, RouteDetail[]>();
        const polylinesMap = new Map<number, [number, number][]>();

        for (const route of fetchedRoutes) {
          try {
            // Get route details (stops)
            const details = await routeService.getRouteDetails(route.ma_tuyen);
            detailsMap.set(route.ma_tuyen, details);

            // Get stop coordinates
            const waypoints: [number, number][] = details
              .map((detail, idx) => getStopCoordinates(detail, idx, details.length))
              .filter((pos): pos is [number, number] => pos !== null);

            if (waypoints.length >= 2) {
              try {
                // Get real route directions
                const directions = await getRouteDirections(waypoints);
                // Convert from [lng, lat] to [lat, lng] for Leaflet
                const positions: [number, number][] = directions.coordinates.map(
                  ([lng, lat]) => [lat, lng]
                );
                polylinesMap.set(route.ma_tuyen, positions);
              } catch (err) {
                console.warn(`Failed to get directions for route ${route.ma_tuyen}, using interpolation:`, err);
                // Fallback: use interpolated route
                const interpolated = interpolateRoute(waypoints, 5);
                polylinesMap.set(route.ma_tuyen, interpolated);
              }
            } else if (waypoints.length > 0) {
              polylinesMap.set(route.ma_tuyen, waypoints);
            }
          } catch (err) {
            console.error(`Error fetching details for route ${route.ma_tuyen}:`, err);
          }
        }

        setRouteDetails(detailsMap);
        setRoutePolylines(polylinesMap);
      } catch (err: any) {
        console.error('Error fetching routes:', err);
        setError(err.message || 'Không thể tải dữ liệu tuyến đường');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user]);

  // Get all positions for bounds calculation
  const allPositions = useMemo(() => {
    const positions: [number, number][] = [];
    
    // Add route positions
    routePolylines.forEach((routePositions) => {
      positions.push(...routePositions);
    });
    
    // Add bus positions
    busLocations.forEach((bus) => {
      positions.push([bus.vi_do, bus.kinh_do]);
    });
    
    return positions.length > 0 ? positions : [defaultCenter];
  }, [routePolylines, busLocations]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center bg-red-50 rounded-lg" style={{ height }}>
        <div className="text-center text-red-600">
          <p className="font-semibold">Lỗi</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Always show map, even if no routes
  if (routes.length === 0) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative" style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-[1000]">
          <div className="text-center text-gray-500 bg-white rounded-lg p-4 shadow-lg">
            <p className="font-semibold mb-2">Không có tuyến đường nào để hiển thị</p>
            <p className="text-sm">Vui lòng kiểm tra lại dữ liệu lịch trình hoặc phân công</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds positions={allPositions} />

        {/* Render polylines for each route with real directions */}
        {routes.map((route, index) => {
          const details = routeDetails.get(route.ma_tuyen) || [];
          const positions = routePolylines.get(route.ma_tuyen) || [];
          const color = routeColors[index % routeColors.length];
          
          if (positions.length === 0) return null;
          
          return (
            <React.Fragment key={route.ma_tuyen}>
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight: 4,
                  opacity: 0.7,
                }}
              />
              
              {/* Render markers for stops */}
              {details.map((stopDetail, detailIndex) => {
                const position = getStopCoordinates(stopDetail, detailIndex, details.length);
                if (!position) return null;
                
                return (
                  <Marker key={`${route.ma_tuyen}-${stopDetail.ma_tram}-${detailIndex}`} position={position}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{route.ten_tuyen}</p>
                        <p>Trạm: {stopDetail.ten_tram || stopDetail.tram?.ten_tram || `Trạm ${detailIndex + 1}`}</p>
                        <p>Thứ tự: {stopDetail.thu_tu}</p>
                        {(stopDetail.dia_chi || stopDetail.tram?.dia_chi) && (
                          <p>Địa chỉ: {stopDetail.dia_chi || stopDetail.tram?.dia_chi}</p>
                        )}
                        {stopDetail.vi_do && stopDetail.kinh_do && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tọa độ: {Number(stopDetail.vi_do).toFixed(6)}, {Number(stopDetail.kinh_do).toFixed(6)}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Render bus markers for real-time tracking */}
        {(() => {
          // Use activeBuses if available, otherwise try to show buses from displayed routes
          let busesToRender = activeBuses;
          
          if (busesToRender.length === 0 && routes.length > 0) {
            // Fallback: try to get any buses that have schedules for displayed routes
            const displayedRouteIds = new Set(routes.map(route => route.ma_tuyen));
            const routeSchedules = schedules.filter((schedule: Schedule) => 
              schedule.ma_xe !== null &&
              schedule.ma_tuyen !== null &&
              displayedRouteIds.has(schedule.ma_tuyen)
            );
            const routeBusIds = new Set(routeSchedules.map((s: Schedule) => s.ma_xe));
            busesToRender = buses.filter((bus: Bus) => routeBusIds.has(bus.ma_xe));
            
            if (busesToRender.length > 0) {
              console.log(`[MapViews] Using fallback: rendering ${busesToRender.length} buses from displayed routes`);
            }
          }
          
          if (busesToRender.length === 0) {
            console.log('[MapViews] No buses to render');
            return null;
          }
          
          console.log(`[MapViews] Rendering ${busesToRender.length} bus markers`);
          
          return busesToRender.map((bus: Bus) => {
              // Get location from busLocations map or fallback to bus.vi_tri_hien_tai
              const location = busLocations.get(bus.ma_xe);
              let position: [number, number] | null = null;
              
              if (location) {
                position = [location.vi_do, location.kinh_do];
              } else if (bus.vi_tri_hien_tai?.vi_do && bus.vi_tri_hien_tai?.kinh_do) {
                position = [Number(bus.vi_tri_hien_tai.vi_do), Number(bus.vi_tri_hien_tai.kinh_do)];
              } else {
                // Fallback: use first stop of the route if available
                // Try to get route from active schedules
                const today = new Date().toISOString().split('T')[0];
                const busSchedule = schedules.find((s: Schedule) => 
                  s.ma_xe === bus.ma_xe && s.ngay_chay === today
                ) || schedules.find((s: Schedule) => s.ma_xe === bus.ma_xe);
                
                if (busSchedule?.ma_tuyen) {
                  const details = routeDetails.get(busSchedule.ma_tuyen);
                  if (details && details.length > 0) {
                    const firstStop = getStopCoordinates(details[0], 0, details.length);
                    if (firstStop) {
                      position = firstStop;
                    }
                  }
                }
                
                // If still no position, try to use first route's first stop
                if (!position && routes.length > 0) {
                  const firstRoute = routes[0];
                  const details = routeDetails.get(firstRoute.ma_tuyen);
                  if (details && details.length > 0) {
                    const firstStop = getStopCoordinates(details[0], 0, details.length);
                    if (firstStop) {
                      position = firstStop;
                    }
                  }
                }
                
                // If still no position, use default center
                if (!position) {
                  position = defaultCenter;
                }
              }
              
              // Always render if we have activeBuses (even with default position)
              if (!position) {
                console.warn(`[MapViews] No position found for bus ${bus.ma_xe}, using default center`);
                position = defaultCenter;
              }
              
              console.log(`[MapViews] Rendering bus ${bus.ma_xe} (${bus.bien_so}) at position:`, position);
              
              return (
                <Marker
                  key={`bus-${bus.ma_xe}`}
                  position={position}
                  icon={BusIcon}
                  eventHandlers={{
                    click: () => {
                      if (onBusClick) {
                        onBusClick(bus);
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">🚌 {bus.bien_so}</p>
                      {location?.driver || bus.tai_xe?.ho_ten ? (
                        <p>Tài xế: {location?.driver || bus.tai_xe?.ho_ten}</p>
                      ) : null}
                      {(location?.toc_do != null || bus.vi_tri_hien_tai?.toc_do != null) && (
                        <p>Tốc độ: {Number(location?.toc_do ?? bus.vi_tri_hien_tai?.toc_do ?? 0).toFixed(1)} km/h</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Tọa độ: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                      </p>
                      {location?.thoi_gian && (
                        <p className="text-xs text-gray-400 mt-1">
                          Cập nhật: {new Date(location.thoi_gian).toLocaleTimeString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            });
        })()}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
        <h3 className="font-semibold text-sm mb-2">Chú thích</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Tuyến đường:</p>
            {routes.map((route, index) => {
              const positions = routePolylines.get(route.ma_tuyen);
              if (!positions || positions.length === 0) return null;
              const color = routeColors[index % routeColors.length];
              return (
                <div key={route.ma_tuyen} className="flex items-center text-xs">
                  <div
                    className="w-4 h-1 mr-2 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{route.ten_tuyen}</span>
                </div>
              );
            })}
          </div>
          {activeBuses.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <span>Xe đang di chuyển ({activeBuses.length})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapViews;
