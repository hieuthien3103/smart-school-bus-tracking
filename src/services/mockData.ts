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
    students: 15,
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
    students: 15,
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
    students: 15,
    lastUpdate: '30 giây trước',
    nextStop: 'Trường THCS Chu Văn An',
    estimatedArrival: '15 phút',
    routeStops: ['Trường THCS Chu Văn An', 'Trường ĐH Bách Khoa', 'Chợ Trời', 'TTTM Vincom'],
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
  { id: 2, route: 'Tuyến B2', time: '07:15', students: 15, driver: 'Trần Thị B', bus: 'BS002', status: 'Hoạt động' },
  { id: 3, route: 'Tuyến C3', time: '07:30', students: 15, driver: 'Lê Văn C', bus: 'BS003', status: 'Hoạt động' }
];

export const mockStudentsData: Student[] = [
  // Xe BS001 - Tuyến A1 (15 học sinh)
  { id: 1, name: 'Nguyễn Minh An', grade: 'Lớp 6A', bus: 'BS001', pickup: '123 Ngõ Láng Hạ', dropoff: 'Trường THCS Giảng Võ', parent: 'Nguyễn Văn Tuấn', phone: '0901234567', status: 'Đã lên xe' },
  { id: 2, name: 'Trần Thúy Linh', grade: 'Lớp 6B', bus: 'BS001', pickup: '45 Phố Thái Thịnh', dropoff: 'Trường THCS Giảng Võ', parent: 'Trần Văn Hải', phone: '0902345678', status: 'Chờ xe' },
  { id: 3, name: 'Lê Hoàng Nam', grade: 'Lớp 7A', bus: 'BS001', pickup: '67 Đường Đống Đa', dropoff: 'Trường THCS Giảng Võ', parent: 'Lê Thị Mai', phone: '0903456789', status: 'Đã lên xe' },
  { id: 4, name: 'Phạm Thu Hà', grade: 'Lớp 7B', bus: 'BS001', pickup: '89 Phố Huế', dropoff: 'Trường THCS Giảng Võ', parent: 'Phạm Văn Đức', phone: '0904567890', status: 'Chờ xe' },
  { id: 5, name: 'Vũ Đức Anh', grade: 'Lớp 8A', bus: 'BS001', pickup: '12 Ngõ Quỳnh', dropoff: 'Trường THCS Giảng Võ', parent: 'Vũ Thị Lan', phone: '0905678901', status: 'Đã lên xe' },
  { id: 6, name: 'Hoàng Minh Quân', grade: 'Lớp 8B', bus: 'BS001', pickup: '34 Phố Tôn Đức Thắng', dropoff: 'Trường THCS Giảng Võ', parent: 'Hoàng Văn Minh', phone: '0906789012', status: 'Chờ xe' },
  { id: 7, name: 'Ngô Thị Hương', grade: 'Lớp 9A', bus: 'BS001', pickup: '56 Đường Bà Triệu', dropoff: 'Trường THCS Giảng Võ', parent: 'Ngô Văn Thành', phone: '0907890123', status: 'Đã lên xe' },
  { id: 8, name: 'Đặng Văn Khoa', grade: 'Lớp 9B', bus: 'BS001', pickup: '78 Ngõ Hàng Bạc', dropoff: 'Trường THCS Giảng Võ', parent: 'Đặng Thị Hoa', phone: '0908901234', status: 'Chờ xe' },
  { id: 9, name: 'Bùi Thị Nga', grade: 'Lớp 6C', bus: 'BS001', pickup: '90 Phố Hàng Gai', dropoff: 'Trường THCS Giảng Võ', parent: 'Bùi Văn Long', phone: '0909012345', status: 'Đã lên xe' },
  { id: 10, name: 'Lương Đức Thành', grade: 'Lớp 7C', bus: 'BS001', pickup: '11 Đường Lý Thường Kiệt', dropoff: 'Trường THCS Giảng Võ', parent: 'Lương Thị Kim', phone: '0910123456', status: 'Chờ xe' },
  { id: 11, name: 'Phan Thị Mai', grade: 'Lớp 8C', bus: 'BS001', pickup: '22 Ngõ Trần Hưng Đạo', dropoff: 'Trường THCS Giảng Võ', parent: 'Phan Văn Tùng', phone: '0911234567', status: 'Đã lên xe' },
  { id: 12, name: 'Cao Minh Đức', grade: 'Lớp 9C', bus: 'BS001', pickup: '33 Phố Đinh Tiên Hoàng', dropoff: 'Trường THCS Giảng Võ', parent: 'Cao Thị Nhung', phone: '0912345678', status: 'Chờ xe' },
  { id: 13, name: 'Nguyễn Thu Trang', grade: 'Lớp 6D', bus: 'BS001', pickup: '44 Đường Lê Lợi', dropoff: 'Trường THCS Giảng Võ', parent: 'Nguyễn Văn Toàn', phone: '0913456789', status: 'Đã lên xe' },
  { id: 14, name: 'Trần Đức Hiếu', grade: 'Lớp 7D', bus: 'BS001', pickup: '55 Ngõ Nguyễn Du', dropoff: 'Trường THCS Giảng Võ', parent: 'Trần Thị Loan', phone: '0914567890', status: 'Chờ xe' },
  { id: 15, name: 'Lê Thị Hồng', grade: 'Lớp 8D', bus: 'BS001', pickup: '66 Phố Hàng Khay', dropoff: 'Trường THCS Giảng Võ', parent: 'Lê Văn Hùng', phone: '0915678901', status: 'Đã lên xe' },

  // Xe BS002 - Tuyến B2 (15 học sinh)
  { id: 16, name: 'Phạm Minh Tuấn', grade: 'Lớp 6A', bus: 'BS002', pickup: '77 Đường Hoàng Diệu', dropoff: 'Trường THPT Chu Văn An', parent: 'Phạm Thị Dung', phone: '0916789012', status: 'Đã lên xe' },
  { id: 17, name: 'Vũ Thu Hương', grade: 'Lớp 6B', bus: 'BS002', pickup: '88 Ngõ Lê Duẩn', dropoff: 'Trường THPT Chu Văn An', parent: 'Vũ Văn Sơn', phone: '0917890123', status: 'Chờ xe' },
  { id: 18, name: 'Hoàng Văn Lâm', grade: 'Lớp 7A', bus: 'BS002', pickup: '99 Phố Tràng Tiền', dropoff: 'Trường THPT Chu Văn An', parent: 'Hoàng Thị Linh', phone: '0918901234', status: 'Đã lên xe' },
  { id: 19, name: 'Ngô Thị Lan', grade: 'Lớp 7B', bus: 'BS002', pickup: '10 Đường Nguyễn Thái Học', dropoff: 'Trường THPT Chu Văn An', parent: 'Ngô Văn Đạt', phone: '0919012345', status: 'Chờ xe' },
  { id: 20, name: 'Đặng Minh Hoàng', grade: 'Lớp 8A', bus: 'BS002', pickup: '21 Ngõ Hàng Bông', dropoff: 'Trường THPT Chu Văn An', parent: 'Đặng Thị Thu', phone: '0920123456', status: 'Đã lên xe' },
  { id: 21, name: 'Bùi Thị Quỳnh', grade: 'Lớp 8B', bus: 'BS002', pickup: '32 Phố Cầu Gỗ', dropoff: 'Trường THPT Chu Văn An', parent: 'Bùi Văn Trung', phone: '0921234567', status: 'Chờ xe' },
  { id: 22, name: 'Lương Văn Hải', grade: 'Lớp 9A', bus: 'BS002', pickup: '43 Đường Hàng Bài', dropoff: 'Trường THPT Chu Văn An', parent: 'Lương Thị Vân', phone: '0922345678', status: 'Đã lên xe' },
  { id: 23, name: 'Phan Thị Ngọc', grade: 'Lớp 9B', bus: 'BS002', pickup: '54 Ngõ Lò Sũ', dropoff: 'Trường THPT Chu Văn An', parent: 'Phan Văn Bình', phone: '0923456789', status: 'Chờ xe' },
  { id: 24, name: 'Cao Đức Thắng', grade: 'Lớp 6C', bus: 'BS002', pickup: '65 Phố Nhà Thờ', dropoff: 'Trường THPT Chu Văn An', parent: 'Cao Thị Phương', phone: '0924567890', status: 'Đã lên xe' },
  { id: 25, name: 'Nguyễn Thị Uyên', grade: 'Lớp 7C', bus: 'BS002', pickup: '76 Đường Hàng Ngang', dropoff: 'Trường THPT Chu Văn An', parent: 'Nguyễn Văn Thịnh', phone: '0925678901', status: 'Chờ xe' },
  { id: 26, name: 'Trần Minh Nhật', grade: 'Lớp 8C', bus: 'BS002', pickup: '87 Ngõ Hàng Đào', dropoff: 'Trường THPT Chu Văn An', parent: 'Trần Thị Hạnh', phone: '0926789012', status: 'Đã lên xe' },
  { id: 27, name: 'Lê Thị Bích', grade: 'Lớp 9C', bus: 'BS002', pickup: '98 Phố Lý Quốc Sư', dropoff: 'Trường THPT Chu Văn An', parent: 'Lê Văn Cường', phone: '0927890123', status: 'Chờ xe' },
  { id: 28, name: 'Phạm Văn Tú', grade: 'Lớp 6D', bus: 'BS002', pickup: '19 Đường Hàng Trống', dropoff: 'Trường THPT Chu Văn An', parent: 'Phạm Thị Xuân', phone: '0928901234', status: 'Đã lên xe' },
  { id: 29, name: 'Vũ Thị Phương', grade: 'Lớp 7D', bus: 'BS002', pickup: '20 Ngõ Đinh Lễ', dropoff: 'Trường THPT Chu Văn An', parent: 'Vũ Văn Khang', phone: '0929012345', status: 'Chờ xe' },
  { id: 30, name: 'Hoàng Đức Mạnh', grade: 'Lớp 8D', bus: 'BS002', pickup: '31 Phố Hàng Mã', dropoff: 'Trường THPT Chu Văn An', parent: 'Hoàng Thị Nga', phone: '0930123456', status: 'Đã lên xe' },

  // Xe BS003 - Tuyến C3 (15 học sinh)
  { id: 31, name: 'Ngô Minh Đức', grade: 'Lớp 6A', bus: 'BS003', pickup: '42 Đường Kim Mã', dropoff: 'Trường THCS Chu Văn An', parent: 'Ngô Thị Bích', phone: '0931234567', status: 'Đã lên xe' },
  { id: 32, name: 'Đặng Thị Yến', grade: 'Lớp 6B', bus: 'BS003', pickup: '53 Ngõ Linh Lang', dropoff: 'Trường THCS Chu Văn An', parent: 'Đặng Văn Tài', phone: '0932345678', status: 'Chờ xe' },
  { id: 33, name: 'Bùi Văn Thành', grade: 'Lớp 7A', bus: 'BS003', pickup: '64 Phố Nguyễn Chí Thanh', dropoff: 'Trường THCS Chu Văn An', parent: 'Bùi Thị Lan', phone: '0933456789', status: 'Đã lên xe' },
  { id: 34, name: 'Lương Thị Hoa', grade: 'Lớp 7B', bus: 'BS003', pickup: '75 Đường Cầu Giấy', dropoff: 'Trường THCS Chu Văn An', parent: 'Lương Văn Phong', phone: '0934567890', status: 'Chờ xe' },
  { id: 35, name: 'Phan Đức Long', grade: 'Lớp 8A', bus: 'BS003', pickup: '86 Ngõ Đào Tấn', dropoff: 'Trường THCS Chu Văn An', parent: 'Phan Thị Hương', phone: '0935678901', status: 'Đã lên xe' },
  { id: 36, name: 'Cao Thị Nhã', grade: 'Lớp 8B', bus: 'BS003', pickup: '97 Phố Thụy Khuê', dropoff: 'Trường THCS Chu Văn An', parent: 'Cao Văn Dũng', phone: '0936789012', status: 'Chờ xe' },
  { id: 37, name: 'Nguyễn Văn Kiên', grade: 'Lớp 9A', bus: 'BS003', pickup: '18 Đường Hoàng Hoa Thám', dropoff: 'Trường THCS Chu Văn An', parent: 'Nguyễn Thị Thảo', phone: '0937890123', status: 'Đã lên xe' },
  { id: 38, name: 'Trần Thị Thu', grade: 'Lớp 9B', bus: 'BS003', pickup: '29 Ngõ Láng Thượng', dropoff: 'Trường THCS Chu Văn An', parent: 'Trần Văn Quang', phone: '0938901234', status: 'Chờ xe' },
  { id: 39, name: 'Lê Minh Tâm', grade: 'Lớp 6C', bus: 'BS003', pickup: '30 Phố Văn Cao', dropoff: 'Trường THCS Chu Văn An', parent: 'Lê Thị Mỹ', phone: '0939012345', status: 'Đã lên xe' },
  { id: 40, name: 'Phạm Thị Diệu', grade: 'Lớp 7C', bus: 'BS003', pickup: '41 Đường Trần Duy Hưng', dropoff: 'Trường THCS Chu Văn An', parent: 'Phạm Văn Bằng', phone: '0940123456', status: 'Chờ xe' },
  { id: 41, name: 'Vũ Đức Trung', grade: 'Lớp 8C', bus: 'BS003', pickup: '52 Ngõ Nguyễn Khánh Toàn', dropoff: 'Trường THCS Chu Văn An', parent: 'Vũ Thị Hồng', phone: '0941234567', status: 'Đã lên xe' },
  { id: 42, name: 'Hoàng Thị Linh', grade: 'Lớp 9C', bus: 'BS003', pickup: '63 Phố Dịch Vọng', dropoff: 'Trường THCS Chu Văn An', parent: 'Hoàng Văn Tuấn', phone: '0942345678', status: 'Chờ xe' },
  { id: 43, name: 'Ngô Văn Hưng', grade: 'Lớp 6D', bus: 'BS003', pickup: '74 Đường Xuân Thủy', dropoff: 'Trường THCS Chu Văn An', parent: 'Ngô Thị Sương', phone: '0943456789', status: 'Đã lên xe' },
  { id: 44, name: 'Đặng Thị Thanh', grade: 'Lớp 7D', bus: 'BS003', pickup: '85 Ngõ Phạm Văn Đồng', dropoff: 'Trường THCS Chu Văn An', parent: 'Đặng Văn Lộc', phone: '0944567890', status: 'Chờ xe' },
  { id: 45, name: 'Bùi Minh Quang', grade: 'Lớp 8D', bus: 'BS003', pickup: '96 Phố Cầu Giấy', dropoff: 'Trường THCS Chu Văn An', parent: 'Bùi Thị Tuyết', phone: '0945678901', status: 'Đã lên xe' }
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