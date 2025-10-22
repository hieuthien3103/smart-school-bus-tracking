// Central type definitions for Smart School Bus System

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'parent' | 'driver';
  permissions?: string[];  // Added permissions property for API integration
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusLocation {
  id: number;
  busNumber: string;
  driver: string;
  route: string;
  lat: number;
  lng: number;
  speed: number;
  direction: number;
  status: 'Đang di chuyển' | 'Dừng đón khách' | 'Sự cố' | 'Nghỉ trưa';
  students: number;
  lastUpdate: string;
  nextStop: string;
  estimatedArrival: string;
  routeStops: string[];
  currentStopIndex: number;
}

export interface Schedule {
  // Database fields (used for API operations)
  id: number;
  route_id: number;           // ma_tuyen - ID của tuyến đường
  driver_id: number;          // ma_tai_xe - ID của tài xế
  bus_id: number;             // ma_xe - ID của xe buýt
  schedule_date: string;      // ngay_chay - Ngày thực hiện (YYYY-MM-DD)
  start_time: string;         // gio_bat_dau - Giờ bắt đầu (HH:mm:ss)
  end_time: string;           // gio_ket_thuc - Giờ kết thúc (HH:mm:ss)
  status: 'cho_chay' | 'dang_chay' | 'hoan_thanh' | 'huy'; // trang_thai_lich
  
  // Display fields (used for UI - populated from API joins)
  route?: string;              // ten_tuyen - Tên tuyến từ JOIN
  driver?: string;             // driver_name - Tên tài xế từ JOIN
  bus?: string;                // bus_number - Biển số xe từ JOIN
  students?: number;           // so_hoc_sinh - Số học sinh từ COUNT()
  time?: string;               // gio_bat_dau (alias for display)
  
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: number; // ma_hs
  name: string; // ho_ten
  class: string | null; // lop
  parent_id: number; // ma_phu_huynh
  pickup_stop_id: number; // ma_diem_don
  dropoff_stop_id: number; // ma_diem_tra
  status: 'hoat_dong' | 'nghi'; // enum trong DB

  //cac truong mo rong sau nay neu muon 
  grade?: string; // mở rộng: khối học
  gender?: 'male' | 'female';
  date_of_birth?: string;
  address?: string;
  medical_notes?: string;
  allergies?: string;
  photo?: string;
  emergency_instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  license: string;
  experience: number;
  hire_date: string;
  current_bus_id?: number;
  status: 'san_sang' | 'dang_chay' | 'nghi';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bus {
  // Database fields (xebuyt table)
  id: number;                    // ma_xe
  license_plate: string;         // bien_so - Biển số xe
  capacity: number;              // suc_chua - Sức chứa
  status: 'san_sang' | 'dang_su_dung' | 'bao_duong'; // trang_thai
  driver_id?: number;            // ma_tai_xe - ID tài xế (nullable)
  
  // Display fields (from JOINs or computed)
  driver_name?: string;          // Tên tài xế từ JOIN
  route_name?: string;           // Tên tuyến từ JOIN
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  busNumber?: string;
  route?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'time' | 'number' | 'select' | 'date' | 'textarea';
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string | number;
}

