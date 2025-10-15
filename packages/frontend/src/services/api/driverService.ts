import { apiClient } from './client';

// Driver Types
export interface Driver {
  id: number;
  name: string;
  phone: string;
  license_number: string;
  experience: number;
  hire_date: string;
  current_bus_id?: number;
  status: 'active' | 'inactive' | 'on_leave';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDriverDto {
  name: string;
  phone: string;
  license_number: string;
  experience: number;
  hire_date: string;
  current_bus_id?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateDriverDto {
  name?: string;
  phone?: string;
  license_number?: string;
  experience?: number;
  hire_date?: string;
  current_bus_id?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  notes?: string;
}

// Driver Service
export const driverService = {
  // Get all drivers
  async getDrivers(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    return apiClient.get('/drivers', { params });
  },

  // Get driver by ID
  async getDriverById(id: number) {
    return apiClient.get(`/drivers/${id}`);
  },

  // Create new driver
  async createDriver(data: CreateDriverDto) {
    return apiClient.post('/drivers', data);
  },

  // Update driver
  async updateDriver(id: number, data: UpdateDriverDto) {
    return apiClient.put(`/drivers/${id}`, data);
  },

  // Delete driver
  async deleteDriver(id: number) {
    return apiClient.delete(`/drivers/${id}`);
  }
};

export default driverService;