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
  id: number;
  route_id: number;
  driver_id: number;
  bus_id: number;
  schedule_date: string;
  schedule_type: 'morning' | 'afternoon';
  start_time: string;
  end_time: string;
  total_students: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: number;
  student_code: string;
  name: string;
  grade: string;
  class: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  address: string;
  pickup_address: string;
  dropoff_address: string;
  school_id: number;
  route_id?: number;
  stop_id?: number;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  medical_notes?: string;
  allergies?: string;
  emergency_instructions?: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface Bus {
  id: number;
  number: string;
  capacity: number;
  driver: string;
  route: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance: string;
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