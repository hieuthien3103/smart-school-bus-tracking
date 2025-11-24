// Service for calculating arrival times and detecting delays
import type { Bus, Schedule, RouteDetail, BusLocation } from '../../types';

export interface StopETA {
  ma_tram: number;
  ten_tram: string;
  thu_tu: number;
  scheduledTime?: string | null; // Thời gian lịch trình dự kiến (HH:mm:ss)
  estimatedArrival: Date; // Thời gian dự kiến đến
  distance: number; // Khoảng cách còn lại (km)
  isDelayed: boolean; // Có bị trễ không
  delayMinutes?: number; // Số phút trễ
}

export interface BusArrivalInfo {
  ma_xe: number;
  bien_so: string;
  ma_tuyen: number;
  ma_lich: number;
  currentLocation: {
    vi_do: number;
    kinh_do: number;
    toc_do: number;
    thoi_gian: Date;
  };
  stopsETA: StopETA[];
  isOnTime: boolean; // Tất cả các trạm có đúng giờ không
  nextStop?: StopETA;
  alerts: AlertInfo[];
}

export interface AlertInfo {
  type: 'delay' | 'early' | 'on_time';
  ma_tram: number;
  ten_tram: string;
  estimatedArrival: Date;
  scheduledTime?: Date;
  delayMinutes?: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate estimated time of arrival for all stops on a route
 */
export function calculateArrivalTimes(
  bus: Bus,
  schedule: Schedule,
  routeDetails: RouteDetail[],
  currentLocation: BusLocation
): BusArrivalInfo {
  const sortedStops = [...routeDetails].sort((a, b) => a.thu_tu - b.thu_tu);
  
  const currentLat = Number(currentLocation.vi_do);
  const currentLng = Number(currentLocation.kinh_do);
  const currentSpeed = currentLocation.toc_do || 30; // Default to 30 km/h if no speed data
  const currentTime = new Date(currentLocation.thoi_gian || new Date());
  
  // Find current position index in route (which stop the bus has passed or is closest to)
  let currentStopIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < sortedStops.length; i++) {
    const stop = sortedStops[i];
    if (stop.vi_do && stop.kinh_do) {
      const distance = haversineDistance(
        currentLat,
        currentLng,
        Number(stop.vi_do),
        Number(stop.kinh_do)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        currentStopIndex = i;
      }
    }
  }
  
  // Calculate ETA for remaining stops
  const stopsETA: StopETA[] = [];
  const alerts: AlertInfo[] = [];
  let isOnTime = true;
  
  // Calculate expected time to first remaining stop
  let cumulativeDistance = minDistance; // Distance to current closest stop
  let cumulativeTime = cumulativeDistance / Math.max(currentSpeed, 1); // Time in hours
  
  for (let i = currentStopIndex; i < sortedStops.length; i++) {
    const stop = sortedStops[i];
    
    if (!stop.vi_do || !stop.kinh_do) continue;
    
    // Calculate distance from previous stop (or current position for first stop)
    if (i > currentStopIndex) {
      const prevStop = sortedStops[i - 1];
      if (prevStop.vi_do && prevStop.kinh_do) {
        const segmentDistance = haversineDistance(
          Number(prevStop.vi_do),
          Number(prevStop.kinh_do),
          Number(stop.vi_do),
          Number(stop.kinh_do)
        );
        cumulativeDistance += segmentDistance;
        // Assume average speed of 35 km/h in urban areas (can be adjusted)
        const avgSpeed = 35;
        cumulativeTime += segmentDistance / avgSpeed;
      }
    }
    
    // Calculate ETA
    const etaDate = new Date(currentTime.getTime() + cumulativeTime * 60 * 60 * 1000);
    
    // Estimate scheduled time based on schedule start time and stop order
    // This is a simplified calculation - in real implementation, you'd have actual scheduled times per stop
    const scheduleStartTime = parseScheduleTime(schedule.gio_bat_dau);
    const estimatedScheduleTime = estimateStopScheduleTime(
      scheduleStartTime,
      i,
      sortedStops.length,
      cumulativeDistance
    );
    
    // Check if delayed (if scheduled time is available)
    let isDelayed = false;
    let delayMinutes: number | undefined;
    
    if (estimatedScheduleTime) {
      const delayMs = etaDate.getTime() - estimatedScheduleTime.getTime();
      delayMinutes = delayMs / (60 * 1000);
      
      // Consider delayed if more than 5 minutes late
      if (delayMinutes > 5) {
        isDelayed = true;
        isOnTime = false;
        
        // Create alert for delay
        alerts.push({
          type: 'delay',
          ma_tram: stop.ma_tram,
          ten_tram: stop.ten_tram || `Trạm ${stop.thu_tu}`,
          estimatedArrival: etaDate,
          scheduledTime: estimatedScheduleTime,
          delayMinutes,
          message: `Xe ${bus.bien_so} dự kiến đến trạm ${stop.ten_tram || `Trạm ${stop.thu_tu}`} trễ ${Math.round(delayMinutes)} phút`,
          severity: delayMinutes > 15 ? 'high' : delayMinutes > 10 ? 'medium' : 'low',
        });
      } else if (delayMinutes < -5) {
        // Early arrival (more than 5 minutes early)
        alerts.push({
          type: 'early',
          ma_tram: stop.ma_tram,
          ten_tram: stop.ten_tram || `Trạm ${stop.thu_tu}`,
          estimatedArrival: etaDate,
          scheduledTime: estimatedScheduleTime,
          delayMinutes,
          message: `Xe ${bus.bien_so} dự kiến đến trạm ${stop.ten_tram || `Trạm ${stop.thu_tu}`} sớm ${Math.round(Math.abs(delayMinutes))} phút`,
          severity: 'low',
        });
      }
    }
    
    stopsETA.push({
      ma_tram: stop.ma_tram,
      ten_tram: stop.ten_tram || stop.tram?.ten_tram || `Trạm ${stop.thu_tu}`,
      thu_tu: stop.thu_tu,
      scheduledTime: estimatedScheduleTime?.toTimeString().slice(0, 8),
      estimatedArrival: etaDate,
      distance: cumulativeDistance,
      isDelayed,
      delayMinutes: delayMinutes ? Math.round(delayMinutes) : undefined,
    });
  }
  
  const nextStop = stopsETA.length > 0 ? stopsETA[0] : undefined;
  
  return {
    ma_xe: bus.ma_xe,
    bien_so: bus.bien_so,
    ma_tuyen: schedule.ma_tuyen || 0,
    ma_lich: schedule.ma_lich,
    currentLocation: {
      vi_do: currentLat,
      kinh_do: currentLng,
      toc_do: currentSpeed,
      thoi_gian: currentTime,
    },
    stopsETA,
    isOnTime,
    nextStop,
    alerts,
  };
}

/**
 * Parse schedule time string (HH:mm:ss) to Date
 */
function parseScheduleTime(timeStr: string): Date {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const today = new Date();
  today.setHours(hours || 0, minutes || 0, seconds || 0, 0);
  return today;
}

/**
 * Estimate scheduled time for a stop based on route progression
 * This is a simplified calculation - real implementation should use actual schedule data
 */
function estimateStopScheduleTime(
  startTime: Date,
  stopIndex: number,
  totalStops: number,
  distance: number
): Date {
  // Simplified: assume equal time intervals between stops
  // In real implementation, this would use actual schedule data
  const avgSpeed = 30; // km/h
  const timePerKm = 60 / avgSpeed; // minutes per km
  
  const estimatedMinutes = (distance * timePerKm);
  const estimatedTime = new Date(startTime.getTime() + estimatedMinutes * 60 * 1000);
  
  return estimatedTime;
}

/**
 * Check if alert should be sent (to avoid spam)
 */
export function shouldSendAlert(alert: AlertInfo, lastAlertTimes: Map<number, Date>): boolean {
  const lastAlertTime = lastAlertTimes.get(alert.ma_tram);
  const now = new Date();
  
  if (!lastAlertTime) return true;
  
  // Don't send same alert within 5 minutes
  const timeSinceLastAlert = (now.getTime() - lastAlertTime.getTime()) / (60 * 1000);
  return timeSinceLastAlert >= 5;
}

