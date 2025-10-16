import apiClient from './client';

// Interface for creating schedule (English names for frontend)
export interface ScheduleCreateData {
  route_id: number;      // ma_tuyen
  bus_id: number;        // ma_xe
  driver_id: number;     // ma_tai_xe
  schedule_date: string; // ngay_chay
  start_time: string;    // gio_bat_dau
  end_time: string;      // gio_ket_thuc
  status?: string;       // trang_thai_lich
}

// Interface for Vietnamese backend
interface ScheduleBackendData {
  ma_tuyen: number;
  ma_xe: number;
  ma_tai_xe: number;
  ngay_chay: string;
  gio_bat_dau: string;
  gio_ket_thuc: string;
  trang_thai_lich?: string;
}

// Map frontend data to backend format
function mapToBackend(data: ScheduleCreateData): ScheduleBackendData {
  return {
    ma_tuyen: data.route_id,
    ma_xe: data.bus_id,
    ma_tai_xe: data.driver_id,
    ngay_chay: data.schedule_date,
    gio_bat_dau: data.start_time,
    gio_ket_thuc: data.end_time,
    trang_thai_lich: data.status || 'cho_chay'
  };
}

class ScheduleService {
  // Get all schedules
  async getAllSchedules(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/schedules');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  // Get schedule by ID
  async getScheduleById(id: number): Promise<any | null> {
    try {
      const response = await apiClient.get<any>(`/schedules/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  // Create new schedule
  async createSchedule(scheduleData: ScheduleCreateData): Promise<any> {
    try {
      const backendData = mapToBackend(scheduleData);
      const response = await apiClient.post<any>('/schedules', backendData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  // Update schedule
  async updateSchedule(id: number, scheduleData: Partial<ScheduleCreateData>): Promise<any> {
    try {
      const backendData = mapToBackend(scheduleData as ScheduleCreateData);
      const response = await apiClient.put<any>(`/schedules/${id}`, backendData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Delete schedule
  async deleteSchedule(id: number): Promise<void> {
    try {
      await apiClient.delete(`/schedules/${id}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
}

export default new ScheduleService();
