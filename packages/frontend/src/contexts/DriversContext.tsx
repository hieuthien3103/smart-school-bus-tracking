import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Driver } from '../types';
import driverService from '../services/api/driverService';

interface DriversContextType {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (driverId: number, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (driverId: number) => Promise<void>;
}

const DriversContext = createContext<DriversContextType | undefined>(undefined);

export const DriversProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Helper: Map backend enum to UI status (Vietnamese)
  const statusToVN = (status: string) => {
    switch (status) {
      case 'san_sang': return 'Sẵn sàng';
      case 'dang_chay': return 'Đang lái';
      case 'nghi': return 'Nghỉ phép';
      default: return 'Không hoạt động';
    }
  };
  // Helper: Map UI status (Vietnamese) to backend enum
  const statusToEnum = (status: string): "san_sang" | "dang_chay" | "nghi" => {
    switch (status) {
      case 'Sẵn sàng': return 'san_sang';
      case 'Đang lái': return 'dang_chay';
      case 'Nghỉ phép': return 'nghi';
      default: return 'nghi';
    }
  };

  // Load all drivers from backend
  const loadDrivers = useCallback(async () => {
    const res = await driverService.getDrivers() as { data: any };
    const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
    setDrivers(arr.map((d: any) => ({
      id: d.id || d.ma_tai_xe,
      name: d.name || d.ho_ten,
      phone: d.phone || d.so_dien_thoai,
      license: d.license || d.so_gplx,
      status: d.status === 'active' ? 'Sẵn sàng' : 'Nghỉ phép',
    })));
  }, []);

  // Add driver
  const addDriver = useCallback(async (driver: Omit<Driver, 'id'>) => {
    // Map UI status to backend status
    const payload = {
      name: driver.name,
      email: driver.email || '', // Add email property
      phone: driver.phone,
      status: driver.status === 'active' ? 'inactive' : 'on_leave',
      license_number: driver.license || '',
      experience: 0, // hoặc giá trị thực tế, ví dụ từ form
      hire_date: new Date().toISOString(), // hoặc giá trị từ form
    };
    
    await driverService.createDriver(payload);
    await loadDrivers();
  }, [loadDrivers]);

  // Update driver
  const updateDriver = useCallback(async (driverId: number, driver: Partial<Driver>) => {
    const payload: any = {};
    if (driver.name) payload.name = driver.name;
    if (driver.phone) payload.phone = driver.phone;
    if (driver.license) payload.license_number = driver.license;
    if (driver.status) payload.status = driver.status === 'active' ? 'inactive' : 'on_leave';
    await driverService.updateDriver(driverId, payload);
    await loadDrivers();
  }, [loadDrivers]);

  // Delete driver
  const deleteDriver = useCallback(async (driverId: number) => {
    await driverService.deleteDriver(driverId);
    await loadDrivers();
  }, [loadDrivers]);

  // Initial load
  React.useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  return (
  <DriversContext.Provider value={{ drivers, setDrivers, addDriver, updateDriver, deleteDriver }}>
      {children}
    </DriversContext.Provider>
  );
};

export const useDrivers = () => {
  const context = useContext(DriversContext);
  if (!context) throw new Error('useDrivers must be used within a DriversProvider');
  return context;
};
