import { apiClient } from './client';

export interface Schedule {
  id: number;
  bus: string;
  route: string;
  driver: string;
  departure: string;
  arrival: string;
  students: number;
  status: string;
  stops?: ScheduleStop[];
  capacity?: number;
  currentStop?: number;
}

export interface ScheduleStop {
  id: number;
  name: string;
  address: string;
  time: string;
  students: string[];
  lat?: number;
  lng?: number;
}

export interface ScheduleCreateData {
  bus: string;
  route: string;
  driver: string;
  departure: string;
  arrival: string;
  stops?: ScheduleStop[];
}

class ScheduleService {
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<Schedule[]>('/schedules');
      return response;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Return fallback mock data
      return [
        {
          id: 1,
          bus: 'BS001',
          route: 'Tuyến A1',
          driver: 'Nguyễn Văn A',
          departure: '07:00',
          arrival: '08:00',
          students: 25,
          status: 'Hoạt động',
          capacity: 30,
          currentStop: 0,
          stops: [
            {
              id: 1,
              name: 'Điểm đón 1',
              address: '123 Đường ABC',
              time: '07:00',
              students: ['Nguyễn Văn An', 'Trần Thị Bình']
            },
            {
              id: 2,
              name: 'Điểm đón 2',
              address: '456 Đường DEF',
              time: '07:15',
              students: ['Lê Văn C', 'Phạm Thị D']
            }
          ]
        },
        {
          id: 2,
          bus: 'BS002',
          route: 'Tuyến B1',
          driver: 'Trần Văn B',
          departure: '07:15',
          arrival: '08:15',
          students: 22,
          status: 'Hoạt động',
          capacity: 30,
          currentStop: 1
        }
      ];
    }
  }

  async getScheduleById(id: number): Promise<Schedule | null> {
    try {
      const response = await apiClient.get<Schedule>(`/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  }

  async createSchedule(scheduleData: ScheduleCreateData): Promise<Schedule> {
    try {
      const response = await apiClient.post<Schedule>('/schedules', scheduleData);
      return response;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(id: number, scheduleData: Partial<ScheduleCreateData>): Promise<Schedule> {
    try {
      const response = await apiClient.put<Schedule>(`/schedules/${id}`, scheduleData);
      return response;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    try {
      await apiClient.delete(`/schedules/${id}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  async getSchedulesByBus(busNumber: string): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<Schedule[]>(`/schedules/bus/${busNumber}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedules by bus:', error);
      return [];
    }
  }

  async getSchedulesByDriver(driverName: string): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<Schedule[]>(`/schedules/driver/${encodeURIComponent(driverName)}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedules by driver:', error);
      return [];
    }
  }

  async updateScheduleStatus(id: number, status: string): Promise<Schedule> {
    try {
      const response = await apiClient.put<Schedule>(`/schedules/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating schedule status:', error);
      throw error;
    }
  }

  async updateCurrentStop(id: number, stopId: number): Promise<Schedule> {
    try {
      const response = await apiClient.put<Schedule>(`/schedules/${id}/current-stop`, { currentStop: stopId });
      return response;
    } catch (error) {
      console.error('Error updating current stop:', error);
      throw error;
    }
  }

  async getActiveSchedules(): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<Schedule[]>('/schedules/active');
      return response;
    } catch (error) {
      console.error('Error fetching active schedules:', error);
      return [];
    }
  }
}

export const scheduleService = new ScheduleService();