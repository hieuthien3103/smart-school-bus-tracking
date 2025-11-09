
import { apiClient } from './client';
import type { Schedule, ScheduleStatus } from '../../types';

export type CreateScheduleDto = Omit<Schedule, 'ma_lich'>;
export type UpdateScheduleDto = Partial<CreateScheduleDto>;

export const scheduleService = {
  // Get all schedules
  async getSchedules(params?: {
    page?: number;
    limit?: number;
    trang_thai_lich?: ScheduleStatus;
    ma_tuyen?: number;
    ma_xe?: number;
    ma_tai_xe?: number;
    ngay_chay?: string;
  }): Promise<Schedule[]> {
    const response = await apiClient.get('/lichtrinh', { params });
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  },

  // Get schedule by ID
  async getScheduleById(ma_lich: number): Promise<Schedule> {
    const response = await apiClient.get(`/lichtrinh/${ma_lich}`);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Create new schedule
  async createSchedule(data: CreateScheduleDto): Promise<Schedule> {
    const response = await apiClient.post('/lichtrinh', data);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Update schedule
  async updateSchedule(ma_lich: number, data: UpdateScheduleDto): Promise<Schedule> {
    const response = await apiClient.put(`/lichtrinh/${ma_lich}`, data);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Delete schedule
  async deleteSchedule(ma_lich: number): Promise<void> {
    await apiClient.delete<void>(`/lichtrinh/${ma_lich}`);
  }
};
