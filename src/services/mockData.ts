// Mock Data Service for Smart School Bus System
import type { BusLocation, User, Schedule, Student, Driver, Bus, Notification } from '../types';

export const mockBusLocations: BusLocation[] = [
  {
    id: 1,
    busNumber: 'BS001',
    driver: 'Nguyễn Văn A',
    route: 'Tuyến A1',
    lat: 21.0285,
    lng: 105.8542,
    speed: 25,
    direction: 45,
    status: 'Đang di chuyển',
    students: 23,
    lastUpdate: '2 phút trước',
    nextStop: 'Trường THCS Giảng Võ',
    estimatedArrival: '8 phút',
    routeStops: ['Trường THCS Giảng Võ', 'UBND Phường', 'Chợ Hôm', 'Bệnh viện Bạch Mai'],
    currentStopIndex: 0
  },
  {
    id: 2,
    busNumber: 'BS002',
    driver: 'Trần Thị B',
    route: 'Tuyến B2',
    lat: 21.0245,
    lng: 105.8412,
    speed: 0,
    direction: 90,
    status: 'Dừng đón khách',
    students: 18,
    lastUpdate: '1 phút trước',
    nextStop: 'Trường THPT Chu Văn An',
    estimatedArrival: '12 phút',
    routeStops: ['Trường THPT Chu Văn An', 'Công viên Thống Nhất', 'Ga Hà Nội', 'Chợ Đồng Xuân'],
    currentStopIndex: 2
  },
  {
    id: 3,
    busNumber: 'BS003',
    driver: 'Lê Văn C',
    route: 'Tuyến C3',
    lat: 21.0311,
    lng: 105.8372,
    speed: 35,
    direction: 180,
    status: 'Đang di chuyển',
    students: 31,
    lastUpdate: '30 giây trước',
    nextStop: 'Bệnh viện Bạch Mai',
    estimatedArrival: '15 phút',
    routeStops: ['Bệnh viện Bạch Mai', 'Trường ĐH Bách Khoa', 'Chợ Trời', 'TTTM Vincom'],
    currentStopIndex: 1
  }
];

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@schoolbus.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
  },
  {
    id: 'parent-1',
    name: 'Phụ huynh',
    email: 'parent@schoolbus.com',
    role: 'parent',
    avatar: 'https://ui-avatars.com/api/?name=Parent&background=10b981&color=fff'
  },
  {
    id: 'driver-1',
    name: 'Tài xế',
    email: 'driver@schoolbus.com',
    role: 'driver',
    avatar: 'https://ui-avatars.com/api/?name=Driver&background=f59e0b&color=fff'
  }
];

export const mockScheduleData: Schedule[] = [
  { id: 1, route: 'Tuyến A1', time: '07:00', students: 15, driver: 'Nguyễn Văn A', bus: 'BS001', status: 'Hoạt động' },
  { id: 2, route: 'Tuyến B2', time: '07:15', students: 12, driver: 'Trần Thị B', bus: 'BS002', status: 'Hoạt động' },
  { id: 3, route: 'Tuyến C3', time: '07:30', students: 18, driver: 'Lê Văn C', bus: 'BS003', status: 'Tạm dừng' }
];

export const mockStudentsData: Student[] = [
  { id: 1, name: 'Nguyễn Minh An', grade: 'Lớp 6A', bus: 'BS001', pickup: '123 Đường ABC', dropoff: 'Trường THCS XYZ', parent: 'Nguyễn Văn X', phone: '0901234567', status: 'Đã lên xe' },
  { id: 2, name: 'Trần Thị Bình', grade: 'Lớp 7B', bus: 'BS002', pickup: '456 Đường DEF', dropoff: 'Trường THCS ABC', parent: 'Trần Văn Y', phone: '0907654321', status: 'Chờ xe' },
  { id: 3, name: 'Lê Văn Cường', grade: 'Lớp 8C', bus: 'BS003', pickup: '789 Đường GHI', dropoff: 'Trường THCS DEF', parent: 'Lê Thị Z', phone: '0903456789', status: 'Đã xuống xe' }
];

export const mockDriversData: Driver[] = [
  { id: 1, name: 'Nguyễn Văn A', license: 'D123456', phone: '0901111111', bus: 'BS001', experience: '5 năm', rating: 4.8, status: 'Đang hoạt động' },
  { id: 2, name: 'Trần Thị B', license: 'D234567', phone: '0902222222', bus: 'BS002', experience: '3 năm', rating: 4.6, status: 'Đang hoạt động' },
  { id: 3, name: 'Lê Văn C', license: 'D345678', phone: '0903333333', bus: 'BS003', experience: '7 năm', rating: 4.9, status: 'Nghỉ phép' }
];

export const mockBusesData: Bus[] = [
  { id: 1, number: 'BS001', capacity: 35, driver: 'Nguyễn Văn A', route: 'Tuyến A1', status: 'Hoạt động', lastMaintenance: '2024-01-15', nextMaintenance: '2024-04-15' },
  { id: 2, number: 'BS002', capacity: 40, driver: 'Trần Thị B', route: 'Tuyến B2', status: 'Hoạt động', lastMaintenance: '2024-02-10', nextMaintenance: '2024-05-10' },
  { id: 3, number: 'BS003', capacity: 30, driver: 'Lê Văn C', route: 'Tuyến C3', status: 'Bảo trì', lastMaintenance: '2024-03-05', nextMaintenance: '2024-06-05' }
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Xe buýt trễ giờ',
    message: 'Xe BS001 trễ 10 phút do kẹt xe',
    timestamp: '10:30 AM',
    read: false,
    busNumber: 'BS001',
    route: 'Tuyến A1'
  },
  {
    id: 2,
    type: 'success',
    title: 'Đón học sinh thành công',
    message: 'Tất cả học sinh tuyến B2 đã lên xe',
    timestamp: '8:15 AM',
    read: true,
    busNumber: 'BS002',
    route: 'Tuyến B2'
  },
  {
    id: 3,
    type: 'error',
    title: 'Sự cố xe buýt',
    message: 'Xe BS003 gặp sự cố kỹ thuật',
    timestamp: '7:45 AM',
    read: false,
    busNumber: 'BS003',
    route: 'Tuyến C3'
  }
];