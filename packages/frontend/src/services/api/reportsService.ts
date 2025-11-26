import { apiClient } from './client';

// Report Types
export interface PerformanceData {
  month: string;
  trips: number;
  onTime: number;
  students: number;
  fuel: number;
  cost: number;
}

export interface RouteAnalysis {
  route: string;
  efficiency: number;
  cost: number;
  distance: number;
  students: number;
}

export interface MaintenanceData {
  type: string;
  count: number;
  cost: number;
  color: string;
}

export interface DriverPerformance {
  name: string;
  trips: number;
  onTime: number;
  rating: number;
  violations: number;
}

export interface ReportStats {
  totalTrips: number;
  activeStudents: number;
  totalRevenue: number;
  onTimePercentage: number;
  totalBuses: number;
  activeDrivers: number;
}

// Reports Service
export const reportsService = {
  // Get performance data
  async getPerformanceData(params?: {
    startDate?: string;
    endDate?: string;
    schoolId?: number;
  }): Promise<PerformanceData[]> {
    try {
      const response = await apiClient.get('/reports/performance', { params });
      const payload = response.data as any;
      // Unwrap backend response envelope { success, data }
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      return []; // Return empty array on error
    }
  },

  // Get route analysis
  async getRouteAnalysis(params?: {
    schoolId?: number;
    period?: string;
  }): Promise<RouteAnalysis[]> {
    try {
      const response = await apiClient.get('/reports/routes', { params });
      const payload = response.data as any;
      // Unwrap backend response envelope { success, data }
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (error) {
      console.error('Error fetching route analysis:', error);
      return []; // Return empty array on error
    }
  },

  // Get maintenance data
  async getMaintenanceData(params?: {
    schoolId?: number;
    period?: string;
  }): Promise<MaintenanceData[]> {
    try {
      const response = await apiClient.get('/reports/maintenance', { params });
      const payload = response.data as any;
      // Unwrap backend response envelope { success, data }
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      return []; // Return empty array on error
    }
  },

  // Get driver performance
  async getDriverPerformance(params?: {
    schoolId?: number;
    period?: string;
  }): Promise<DriverPerformance[]> {
    try {
      const response = await apiClient.get('/reports/drivers', { params });
      const payload = response.data as any;
      // Unwrap backend response envelope { success, data }
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (error) {
      console.error('Error fetching driver performance:', error);
      return []; // Return empty array on error
    }
  },

  // Get report statistics
  async getReportStats(): Promise<ReportStats> {
    try {
      // Try to get real data from multiple endpoints
      const [busesResponse, driversResponse, studentsResponse] = await Promise.allSettled([
        apiClient.get('/buses'),
        apiClient.get('/drivers'), 
        apiClient.get('/students')
      ]);

      // Unwrap responses properly
      const getBusesData = () => {
        if (busesResponse.status !== 'fulfilled') return [];
        const payload = (busesResponse.value as any)?.data;
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      };

      const getDriversData = () => {
        if (driversResponse.status !== 'fulfilled') return [];
        const payload = (driversResponse.value as any)?.data;
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      };

      const getStudentsData = () => {
        if (studentsResponse.status !== 'fulfilled') return [];
        const payload = (studentsResponse.value as any)?.data;
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      };

      const buses = getBusesData().length;
      const drivers = getDriversData().length;
      const students = getStudentsData().length;

      return {
        totalTrips: 0, // TODO: Get from API if available
        activeStudents: students,
        totalRevenue: 0, // TODO: Get from API if available
        onTimePercentage: 0, // TODO: Get from API if available
        totalBuses: buses,
        activeDrivers: drivers
      };
    } catch (error) {
      console.error('Error fetching report stats:', error);
      return {
        totalTrips: 0,
        activeStudents: 0,
        totalRevenue: 0,
        onTimePercentage: 0,
        totalBuses: 0,
        activeDrivers: 0
      };
    }
  }
};

export default reportsService;