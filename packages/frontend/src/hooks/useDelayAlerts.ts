// Hook for monitoring delays and sending alerts
import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import type { Bus, Schedule, RouteDetail, BusLocation } from '../types';
import {
  calculateArrivalTimes,
  shouldSendAlert,
  type BusArrivalInfo,
  type AlertInfo,
} from '../services/api/arrivalTimeService';
import notificationService from '../services/api/notificationService';

interface BusLocationData {
  ma_xe: number;
  vi_do: number | null;
  kinh_do: number | null;
  toc_do?: number | null;
  thoi_gian?: string;
}

interface UseDelayAlertsOptions {
  buses: Bus[];
  schedules: Schedule[];
  routeDetailsMap: Map<number, RouteDetail[]>;
  busLocations: Map<number, BusLocationData | BusLocation>;
  enabled?: boolean;
  checkInterval?: number; // Interval in milliseconds (default: 30 seconds)
}

export function useDelayAlerts({
  buses,
  schedules,
  routeDetailsMap,
  busLocations,
  enabled = true,
  checkInterval = 30000, // 30 seconds
}: UseDelayAlertsOptions) {
  const { user } = useAuth();
  const socketContext = useSocket();
  const emit = socketContext.emit;
  const lastAlertTimesRef = useRef<Map<number, Date>>(new Map());
  const processedAlertsRef = useRef<Set<string>>(new Set());

  // Calculate arrival times and check for delays
  const checkDelays = useCallback(() => {
    if (!enabled || !user) return;

    const today = new Date().toISOString().split('T')[0];
    const activeSchedules = schedules.filter(
      (schedule) =>
        schedule.ngay_chay === today &&
        schedule.ma_tuyen !== null &&
        schedule.ma_xe !== null &&
        (schedule.trang_thai_lich === 'dang_chay' || schedule.trang_thai_lich === 'cho_chay')
    );

    for (const schedule of activeSchedules) {
      const bus = buses.find((b) => b.ma_xe === schedule.ma_xe);
      if (!bus || !schedule.ma_tuyen) continue;

      const routeDetails = routeDetailsMap.get(schedule.ma_tuyen);
      if (!routeDetails || routeDetails.length === 0) continue;

      const busLocationData = busLocations.get(bus.ma_xe);
      if (!busLocationData || !busLocationData.vi_do || !busLocationData.kinh_do) continue;

      // Convert to BusLocation format expected by calculateArrivalTimes
      const busLocation: BusLocation = {
        ma_vitri: 0,
        ma_xe: bus.ma_xe,
        vi_do: busLocationData.vi_do,
        kinh_do: busLocationData.kinh_do,
        toc_do: busLocationData.toc_do || null,
        thoi_gian: busLocationData.thoi_gian || new Date().toISOString(),
      };

      try {
        // Calculate arrival times
        const arrivalInfo: BusArrivalInfo = calculateArrivalTimes(
          bus,
          schedule,
          routeDetails,
          busLocation
        );

        // Process alerts
        for (const alert of arrivalInfo.alerts) {
          const alertKey = `${bus.ma_xe}-${alert.ma_tram}-${alert.type}`;

          // Skip if already processed
          if (processedAlertsRef.current.has(alertKey)) continue;

          // Check if should send alert
          if (!shouldSendAlert(alert, lastAlertTimesRef.current)) continue;

          // Send alert
          sendAlert(alert, arrivalInfo, bus, schedule);

          // Mark as processed
          processedAlertsRef.current.add(alertKey);
          lastAlertTimesRef.current.set(alert.ma_tram, new Date());

          // Clean up old processed alerts (older than 1 hour)
          if (processedAlertsRef.current.size > 100) {
            processedAlertsRef.current.clear();
          }
        }
      } catch (error) {
        console.error(`Error checking delays for bus ${bus.ma_xe}:`, error);
      }
    }
  }, [
    enabled,
    user,
    buses,
    schedules,
    routeDetailsMap,
    busLocations,
    emit,
  ]);

  // Send alert via socket and notification service
  const sendAlert = useCallback(
    async (
      alert: AlertInfo,
      arrivalInfo: BusArrivalInfo,
      bus: Bus,
      schedule: Schedule
    ) => {
      const alertPayload = {
        type: alert.type,
        ma_xe: bus.ma_xe,
        bien_so: bus.bien_so,
        ma_tuyen: schedule.ma_tuyen,
        ma_lich: schedule.ma_lich,
        ma_tram: alert.ma_tram,
        ten_tram: alert.ten_tram,
        estimatedArrival: alert.estimatedArrival.toISOString(),
        scheduledTime: alert.scheduledTime?.toISOString(),
        delayMinutes: alert.delayMinutes,
        message: alert.message,
        severity: alert.severity,
        timestamp: new Date().toISOString(),
      };

      // Emit socket event for real-time notifications
      emit('delayAlert', alertPayload);

      // Create notification in database
      try {
        // Get affected parents (students on this schedule/route)
        // This would typically be fetched from the schedule's assignments
        // For now, we'll send to all admins and notify parents via socket

        // Send notification to admin
        if (user?.role === 'admin') {
          await notificationService.createNotification({
            noi_dung: alert.message,
            thoi_gian: new Date().toISOString(),
            ma_phu_huynh: null,
            ma_tai_xe: schedule.ma_tai_xe || null,
          });
        }

        console.log('📢 Delay alert sent:', alertPayload);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    },
    [emit, user]
  );

  // Set up interval to check for delays
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    checkDelays();

    // Set up interval
    const interval = setInterval(checkDelays, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, checkInterval, checkDelays]);

  return {
    checkDelays,
  };
}

