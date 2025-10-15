import apiClient from './client';
import type { Schedule } from '@smart-school-bus/shared';

// Interface for creating schedule
export interface ScheduleCreateData {
  route_id: number;
  bus_id: number;
  driver_id: number;
  schedule_date: string;
  schedule_type: 'morning' | 'afternoon';
  start_time: string;
  end_time: string;
  total_students: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

// Interface for updating schedule
export interface ScheduleUpdateData {
  route_id?: number;
  bus_id?: number;
  driver_id?: number;
  schedule_date?: string;
  schedule_type?: 'morning' | 'afternoon';
  start_time?: string;
  end_time?: string;
  total_students?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

class ScheduleService {
  // Get all schedules
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<Schedule[]>('/schedules');
      return response;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  // Get schedule by ID
  async getScheduleById(id: number): Promise<Schedule | null> {
    try {
      const response = await apiClient.get<Schedule>(`/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  // Create new schedule
  async createSchedule(scheduleData: ScheduleCreateData): Promise<Schedule> {
    try {
      const response = await apiClient.post<Schedule>('/schedules', scheduleData);
      return response;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  // Update schedule
  async updateSchedule(id: number, scheduleData: Partial<ScheduleCreateData>): Promise<Schedule> {
    try {
      const response = await apiClient.put<Schedule>(`/schedules/${id}`, scheduleData);
      return response;
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
