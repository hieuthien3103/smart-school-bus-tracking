import { apiClient } from "./client";
import type {
  Bus,
  BusLocation,
  BusStatus,
  BusTrackingData,
} from "../../types";

export type CreateBusDto = Omit<Bus, "ma_xe">;
export type UpdateBusDto = Partial<CreateBusDto>;

const busService = {
  // Get all buses
  async getBuses(params?: {
    page?: number;
    limit?: number;
    trang_thai?: BusStatus;
    ma_tai_xe?: number;
  }): Promise<Bus[]> {
    const res = await apiClient.get("/xebuyt", { params });
    const payload = res.data as any;
    // Unwrap backend response envelope { success, data }
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  // Get bus by ID
  async getBusById(ma_xe: number): Promise<Bus> {
    const res = await apiClient.get(`/xebuyt/${ma_xe}`);
    const payload = res.data as any;
    return payload?.data ?? payload;
  },

  // Create new bus
  async createBus(data: CreateBusDto): Promise<Bus> {
    const res = await apiClient.post("/xebuyt", data);
    const payload = res.data as any;
    return payload?.data ?? payload;
  },

  // Update bus
  async updateBus(ma_xe: number, data: UpdateBusDto): Promise<Bus> {
    const res = await apiClient.put(`/xebuyt/${ma_xe}`, data);
    const payload = res.data as any;
    return payload?.data ?? payload;
  },

  // Delete bus
  async deleteBus(ma_xe: number): Promise<void> {
    await apiClient.delete(`/xebuyt/${ma_xe}`);
  },

  // Get bus location history / latest positions for a bus
  async getBusLocation(ma_xe: number): Promise<BusLocation[]> {
    try {
      // Try new endpoint first
      const res = await apiClient.get(`/bus-locations/${ma_xe}/history`, { params: { limit: 1 } });
      const payload = res.data as any;
      if (payload?.data && Array.isArray(payload.data)) {
        return payload.data;
      }
      if (Array.isArray(payload)) {
        return payload;
      }
    } catch (error) {
      // Fallback to old endpoint
      try {
        const res = await apiClient.get(`/vitrixe`, { params: { ma_xe } });
        const payload = res.data as any;
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      } catch (fallbackError) {
        console.error('Error fetching bus location:', fallbackError);
        return [];
      }
    }
    return [];
  },

  // If backend provides tracking data endpoint (optional)
  async getRealtimeTracking(params?: { schoolId?: number }): Promise<BusTrackingData[]> {
    const res = await apiClient.get("/tracking", { params });
    const payload = res.data as any;
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },
};

export default busService;
export { busService };