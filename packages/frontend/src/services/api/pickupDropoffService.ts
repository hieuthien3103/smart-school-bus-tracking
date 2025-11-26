import apiClient from './client';
import type { PickupDropoffLog, ApiResponse } from '../../types';

const pickupDropoffService = {
  // Lấy nhật ký đón trả theo mã lịch trình
  async getLogsBySchedule(ma_lich: number): Promise<ApiResponse<PickupDropoffLog[]>> {
    const response = await apiClient.get<ApiResponse<PickupDropoffLog[]>>(`/pickup-dropoff-logs?scheduleId=${ma_lich}`);
    return response.data;
  },

  // Cập nhật trạng thái đón/trả học sinh
  async updateLogStatus(ma_nhat_ky: number, data: Partial<PickupDropoffLog>): Promise<ApiResponse<PickupDropoffLog>> {
    const response = await apiClient.put<ApiResponse<PickupDropoffLog>>(`/pickup-dropoff-logs/${ma_nhat_ky}`, data);
    return response.data;
  }
};

export default pickupDropoffService;
