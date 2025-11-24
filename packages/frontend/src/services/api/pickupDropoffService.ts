import apiClient from './client';
import type { PickupDropoffLog, ApiResponse } from '../../types';

const pickupDropoffService = {
  // Lấy nhật ký đón trả theo mã lịch trình
  async getLogsBySchedule(ma_lich: number): Promise<ApiResponse<PickupDropoffLog[]>> {
    try {
      // Try Vietnamese endpoint first
      const response = await apiClient.get<ApiResponse<PickupDropoffLog[]>>(`/nhatkydontra/lich/${ma_lich}`);
      return response.data;
    } catch (error: any) {
      // If 404, endpoint doesn't exist - return empty array silently
      // This is expected if the backend hasn't implemented this endpoint yet
      if (error?.response?.status === 404) {
        console.log(`[pickupDropoffService] Endpoint /nhatkydontra/lich/${ma_lich} not found, returning empty array`);
        return { success: true, data: [], message: 'Endpoint chưa được triển khai' } as ApiResponse<PickupDropoffLog[]>;
      }
      // For other errors, try fallback
      try {
        const response = await apiClient.get<ApiResponse<PickupDropoffLog[]>>(`/pickup-dropoff-logs?scheduleId=${ma_lich}`);
        return response.data;
      } catch (fallbackError: any) {
        if (fallbackError?.response?.status === 404) {
          console.log(`[pickupDropoffService] Fallback endpoint also not found, returning empty array`);
          return { success: true, data: [], message: 'Endpoint chưa được triển khai' } as ApiResponse<PickupDropoffLog[]>;
        }
        console.error('Error fetching pickup-dropoff logs:', fallbackError);
        return { success: false, data: [], message: 'Không thể tải nhật ký đón trả' } as ApiResponse<PickupDropoffLog[]>;
      }
    }
  },

  // Cập nhật trạng thái đón/trả học sinh
  async updateLogStatus(ma_nhat_ky: number, data: Partial<PickupDropoffLog>): Promise<ApiResponse<PickupDropoffLog>> {
    try {
      // Try Vietnamese endpoint first
      const response = await apiClient.put<ApiResponse<PickupDropoffLog>>(`/nhatkydontra/${ma_nhat_ky}/status`, data);
      return response.data;
    } catch (error: any) {
      // Fallback to English endpoint
      if (error?.response?.status === 404) {
        try {
          const response = await apiClient.put<ApiResponse<PickupDropoffLog>>(`/pickup-dropoff-logs/${ma_nhat_ky}`, data);
          return response.data;
        } catch (fallbackError) {
          console.error('Error updating pickup-dropoff log:', fallbackError);
          throw fallbackError;
        }
      }
      throw error;
    }
  }
};

export default pickupDropoffService;
