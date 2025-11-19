
import { apiClient } from './client';
import type { Stop, StopType } from '../../types';

export type CreateStopDto = Omit<Stop, 'ma_tram'>;
export type UpdateStopDto = Partial<CreateStopDto>;

export const stopService = {
    // Get all stops
    async getStops(params?: {
        page?: number;
        limit?: number;
        loai_tram?: StopType;
        search?: string;
    }): Promise<Stop[]> {
        const response = await apiClient.get('/tramxe', { params });
        const payload = response.data as any;
        return Array.isArray(payload) ? payload : payload?.data ?? [];
    },

    // Get stop by ID
    async getStopById(ma_tram: number): Promise<Stop> {
        const response = await apiClient.get(`/tramxe/${ma_tram}`);
        const payload = response.data as any;
        return payload?.data ?? payload;
    },

    // Create new stop
    async createStop(data: CreateStopDto): Promise<Stop> {
        const response = await apiClient.post('/tramxe', data);
        const payload = response.data as any;
        return payload?.data ?? payload;
    },

    // Update stop
    async updateStop(ma_tram: number, data: UpdateStopDto): Promise<Stop> {
        const response = await apiClient.put(`/tramxe/${ma_tram}`, data);
        const payload = response.data as any;
        return payload?.data ?? payload;
    },

    // Delete stop
    async deleteStop(ma_tram: number): Promise<void> {
        await apiClient.delete<void>(`/tramxe/${ma_tram}`);
    }
};