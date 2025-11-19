
import { apiClient } from './client';
import type { Driver } from '../../types';

// DTOs for create/update
export type CreateDriverDto = Omit<Driver, 'ma_tai_xe'>;
export type UpdateDriverDto = Partial<CreateDriverDto>;

export const driverService = {
  // Get all drivers
  async getDrivers(params?: {
    page?: number;
    limit?: number;
    trang_thai?: 'san_sang' | 'dang_chay' | 'nghi';
  }): Promise<Driver[]> {
    const response = await apiClient.get('/taixe', { params });
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  },

  // Get driver by ID
  async getDriverById(ma_tai_xe: number): Promise<Driver> {
    const response = await apiClient.get(`/taixe/${ma_tai_xe}`);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Create new driver
  async createDriver(data: CreateDriverDto): Promise<Driver> {
    const response = await apiClient.post('/taixe', data);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Update driver
  async updateDriver(ma_tai_xe: number, data: UpdateDriverDto): Promise<Driver> {
    const response = await apiClient.put(`/taixe/${ma_tai_xe}`, data);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Delete driver
  async deleteDriver(ma_tai_xe: number): Promise<void> {
    await apiClient.delete<void>(`/taixe/${ma_tai_xe}`);
  }
};

export default driverService;