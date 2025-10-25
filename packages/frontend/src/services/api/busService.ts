
import { apiClient } from './client';
import type { Bus, BusLocation, BusStatus } from '../../types';

export type CreateBusDto = Omit<Bus, 'ma_xe'>;
export type UpdateBusDto = Partial<CreateBusDto>;

export const busService = {
  // Get all buses
  async getBuses(params?: {
    page?: number;
    limit?: number;
    trang_thai?: BusStatus;
    ma_tai_xe?: number;
  }): Promise<Bus[]> {
    return apiClient.get<Bus[]>('/xebuyt', { params });
  },

  // Get bus by ID
  async getBusById(ma_xe: number): Promise<Bus> {
    return apiClient.get<Bus>(`/xebuyt/${ma_xe}`);
  },

  // Create new bus
  async createBus(data: CreateBusDto): Promise<Bus> {
    return apiClient.post<Bus>('/xebuyt', data);
  },

  // Update bus
  async updateBus(ma_xe: number, data: UpdateBusDto): Promise<Bus> {
    return apiClient.put<Bus>(`/xebuyt/${ma_xe}`, data);
  },

  // Delete bus
  async deleteBus(ma_xe: number): Promise<void> {
    return apiClient.delete<void>(`/xebuyt/${ma_xe}`);
  },

  // Get bus location
  async getBusLocation(ma_xe: number): Promise<BusLocation[]> {
    return apiClient.get<BusLocation[]>(`/vitrixe?ma_xe=${ma_xe}`);
  }
};

export default busService;