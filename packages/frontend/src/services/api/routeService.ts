
import { apiClient } from './client';
import type { Route, RouteDetail } from '../../types';

export type CreateRouteDto = Omit<Route, 'ma_tuyen'>;
export type UpdateRouteDto = Partial<CreateRouteDto>;

export const routeService = {
  // Get all routes
  async getRoutes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Route[]> {
    const response = await apiClient.get('/tuyenduong', { params });
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  },

  // Get route by ID
  async getRouteById(ma_tuyen: number): Promise<Route> {
    const response = await apiClient.get(`/tuyenduong/${ma_tuyen}`);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Create new route
  async createRoute(data: CreateRouteDto): Promise<Route> {
    const response = await apiClient.post('/tuyenduong', data);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Update route
  async updateRoute(ma_tuyen: number, data: UpdateRouteDto): Promise<Route> {
    const response = await apiClient.put(`/tuyenduong/${ma_tuyen}`, data);
    const payload = response.data as any;
    return payload?.data ?? payload;
  },

  // Delete route
  async deleteRoute(ma_tuyen: number): Promise<void> {
    await apiClient.delete<void>(`/tuyenduong/${ma_tuyen}`);
  },

  // Get route details (stops in route)
  async getRouteDetails(ma_tuyen: number): Promise<RouteDetail[]> {
    const response = await apiClient.get(`/tuyenduong/${ma_tuyen}/details`);
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  },

  // Get routes for specific role
  async getRoutesForRole(role: 'admin' | 'driver' | 'parent', userId?: number): Promise<Route[]> {
    const params: any = { role };
    if (userId) {
      params.userId = userId;
    }
    const response = await apiClient.get('/tuyenduong/for-role', { params });
    const payload = response.data as any;
    console.log('API Response for routes:', response.data);
    // Handle both response formats: {success, data, message} or direct array
    if (payload && payload.success && Array.isArray(payload.data)) {
      return payload.data;
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }
    console.warn('Unexpected response format:', payload);
    return [];
  }
};

export default routeService;