import { useState, useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import ScheduleManagement from './components/management/ScheduleManagement';
import StudentManagement from './components/management/StudentManagement';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Modal from './components/shared/Modal';
import Form from './components/shared/Form';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // States for dynamic data
  const [scheduleData, setScheduleData] = useState([
    { 
      id: 1, 
      route: 'Tuyến A1', 
      time: '07:00', 
      driver: 'Nguyễn Văn A', 
      bus: 'BS001', 
      students: 25, 
      status: 'Đang chạy',
      pickupPoints: ['Cầu Giấy', 'Mỹ Đình', 'Trung Hòa'],
      dropoffPoints: ['Trường THCS Giảng Võ', 'Trường THPT Chu Văn An'],
      estimatedTime: '45 phút',
      actualTime: '40 phút',
      distance: '12 km'
    },
    { 
      id: 2, 
      route: 'Tuyến B2', 
      time: '07:15', 
      driver: 'Trần Thị B', 
      bus: 'BS002', 
      students: 30, 
      status: 'Chờ khởi hành',
      pickupPoints: ['Cầu Nhật Tân', 'Tây Hồ', 'Ba Đình'],
      dropoffPoints: ['Trường THCS Trưng Vương', 'Trường THPT Nguyễn Trãi'],
      estimatedTime: '50 phút',
      actualTime: null,
      distance: '15 km'
    },
    { 
      id: 3, 
      route: 'Tuyến C3', 
      time: '07:30', 
      driver: 'Lê Văn C', 
      bus: 'BS003', 
      students: 22, 
      status: 'Hoàn thành',
      pickupPoints: ['Long Biên', 'Gia Lâm', 'Đông Anh'],
      dropoffPoints: ['Trường THCS Long Biên', 'Trường THPT Gia Lâm'],
      estimatedTime: '55 phút',
      actualTime: '52 phút',
      distance: '18 km'
    },
    { 
      id: 4, 
      route: 'Tuyến D4', 
      time: '06:45', 
      driver: 'Phạm Minh D', 
      bus: 'BS004', 
      students: 28, 
      status: 'Đang chạy',
      pickupPoints: ['Hà Đông', 'Thanh Xuân', 'Cầu Giấy'],
      dropoffPoints: ['Trường THCS Thanh Xuân', 'Trường THPT Nguyễn Huệ'],
      estimatedTime: '40 phút',
      actualTime: '38 phút',
      distance: '14 km'
    },
    { 
      id: 5, 
      route: 'Tuyến E5', 
      time: '13:00', 
      driver: 'Hoàng Thị E', 
      bus: 'BS005', 
      students: 35, 
      status: 'Sẵn sàng',
      pickupPoints: ['Trường THCS Giảng Võ', 'Trường THPT Chu Văn An'],
      dropoffPoints: ['Cầu Giấy', 'Mỹ Đình', 'Trung Hòa'],
      estimatedTime: '45 phút',
      actualTime: null,
      distance: '12 km'
    }
  ]);

  const [studentsData, setStudentsData] = useState([
    { id: 1, name: 'Nguyễn Minh An', class: '6A', route: 'Tuyến A1', status: 'Đang di chuyển' },
    { id: 2, name: 'Trần Thị Bình', class: '7B', route: 'Tuyến B2', status: 'Đã đến trường' },
    { id: 3, name: 'Lê Văn Cường', class: '8C', route: 'Tuyến C3', status: 'Chờ đón' },
    { id: 4, name: 'Phạm Thị Dung', class: '6B', route: 'Tuyến A1', status: 'Đang di chuyển' },
    { id: 5, name: 'Hoàng Văn Em', class: '9A', route: 'Tuyến D4', status: 'Chờ đón' },
    { id: 6, name: 'Võ Thị Phương', class: '7A', route: 'Tuyến E5', status: 'Đã đến trường' },
    { id: 7, name: 'Đỗ Minh Giang', class: '8B', route: 'Tuyến B2', status: 'Đang di chuyển' },
    { id: 8, name: 'Mai Thị Hoa', class: '6C', route: 'Tuyến F6', status: 'Chờ đón' },
    { id: 9, name: 'Bùi Văn Ích', class: '9B', route: 'Tuyến C3', status: 'Đã đến trường' },
    { id: 10, name: 'Ngô Thị Kim', class: '7C', route: 'Tuyến A1', status: 'Đang di chuyển' }
  ]);

  const [driversData, setDriversData] = useState([
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      phone: '0901234567', 
      bus: 'BS001', 
      status: 'Đang chạy',
      licenseNumber: 'B1-123456789',
      licenseClass: 'D',
      experience: 8,
      dateOfBirth: '1985-03-15',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      emergencyContact: '0987654321',
      joinDate: '2020-01-15'
    },
    { 
      id: 2, 
      name: 'Trần Thị B', 
      phone: '0901234568', 
      bus: 'BS002', 
      status: 'Sẵn sàng',
      licenseNumber: 'B2-987654321',
      licenseClass: 'D',
      experience: 5,
      dateOfBirth: '1990-07-22',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      emergencyContact: '0912345678',
      joinDate: '2021-06-10'
    },
    { 
      id: 3, 
      name: 'Lê Văn C', 
      phone: '0901234569', 
      bus: 'BS003', 
      status: 'Nghỉ',
      licenseNumber: 'B3-555666777',
      licenseClass: 'D',
      experience: 12,
      dateOfBirth: '1980-11-08',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      emergencyContact: '0909876543',
      joinDate: '2018-03-20'
    },
    { 
      id: 4, 
      name: 'Phạm Minh D', 
      phone: '0901234570', 
      bus: 'BS004', 
      status: 'Đang chạy',
      licenseNumber: 'B4-888999000',
      licenseClass: 'D',
      experience: 3,
      dateOfBirth: '1992-12-25',
      address: '101 Đường GHI, Quận 4, TP.HCM',
      emergencyContact: '0898765432',
      joinDate: '2022-09-01'
    },
    { 
      id: 5, 
      name: 'Hoàng Thị E', 
      phone: '0901234571', 
      bus: 'BS005', 
      status: 'Sẵn sàng',
      licenseNumber: 'B5-111222333',
      licenseClass: 'D',
      experience: 15,
      dateOfBirth: '1978-05-10',
      address: '202 Đường JKL, Quận 5, TP.HCM',
      emergencyContact: '0887654321',
      joinDate: '2017-02-14'
    },
    { 
      id: 6, 
      name: 'Võ Văn F', 
      phone: '0901234572', 
      bus: 'BS006', 
      status: 'Nghỉ',
      licenseNumber: 'B6-444555666',
      licenseClass: 'E',
      experience: 20,
      dateOfBirth: '1975-08-30',
      address: '303 Đường MNO, Quận 6, TP.HCM',
      emergencyContact: '0876543210',
      joinDate: '2015-11-20'
    }
  ]);

  const [busesData, setBusesData] = useState([
    {
      id: 1,
      busId: 'BS001',
      licensePlate: '29A-12345',
      model: 'Hyundai Universe',
      year: 2020,
      capacity: 45,
      fuel: 'Diesel',
      status: 'Đang chạy',
      maintenanceStatus: 'Tốt',
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2024-11-15',
      mileage: 125000,
      driver: 'Nguyễn Văn A',
      route: 'Tuyến A1',
      currentLocation: {
        lat: 21.0285,
        lng: 105.8542,
        address: 'Đường Láng, Đống Đa, Hà Nội',
        speed: 35,
        lastUpdate: '2024-09-25 14:32:15'
      }
    },
    {
      id: 2,
      busId: 'BS002',
      licensePlate: '29B-67890',
      model: 'Thaco TB120S',
      year: 2019,
      capacity: 47,
      fuel: 'Diesel',
      status: 'Sẵn sàng',
      maintenanceStatus: 'Tốt',
      lastMaintenance: '2024-09-01',
      nextMaintenance: '2024-12-01',
      mileage: 98000,
      driver: 'Trần Thị B',
      route: 'Tuyến B2',
      currentLocation: {
        lat: 21.0245,
        lng: 105.8412,
        address: 'Bến xe Mỹ Đình, Nam Từ Liêm, Hà Nội',
        speed: 0,
        lastUpdate: '2024-09-25 14:30:00'
      }
    },
    {
      id: 3,
      busId: 'BS003',
      licensePlate: '29C-11111',
      model: 'Samco Felix',
      year: 2021,
      capacity: 50,
      fuel: 'Diesel',
      status: 'Bảo dưỡng',
      maintenanceStatus: 'Cần bảo dưỡng',
      lastMaintenance: '2024-06-20',
      nextMaintenance: '2024-09-20',
      mileage: 75000,
      driver: 'Lê Văn C',
      route: 'Tuyến C3'
    },
    {
      id: 4,
      busId: 'BS004',
      licensePlate: '29D-22222',
      model: 'Isuzu NPR',
      year: 2022,
      capacity: 30,
      fuel: 'Diesel',
      status: 'Đang chạy',
      maintenanceStatus: 'Tốt',
      lastMaintenance: '2024-09-10',
      nextMaintenance: '2024-12-10',
      mileage: 45000,
      driver: 'Phạm Minh D',
      route: 'Tuyến D4'
    },
    {
      id: 5,
      busId: 'BS005',
      licensePlate: '29E-33333',
      model: 'Hino XZU720L',
      year: 2018,
      capacity: 40,
      fuel: 'Diesel',
      status: 'Sẵn sàng',
      maintenanceStatus: 'Tốt',
      lastMaintenance: '2024-07-25',
      nextMaintenance: '2024-10-25',
      mileage: 150000,
      driver: 'Hoàng Thị E',
      route: 'Tuyến E5'
    },
    {
      id: 6,
      busId: 'BS006',
      licensePlate: '29F-44444',
      model: 'Mercedes-Benz Sprinter',
      year: 2017,
      capacity: 35,
      fuel: 'Diesel',
      status: 'Nghỉ',
      maintenanceStatus: 'Cần bảo dưỡng',
      lastMaintenance: '2024-05-15',
      nextMaintenance: '2024-08-15',
      mileage: 180000,
      driver: 'Võ Văn F',
      route: 'Tuyến F6'
    }
  ]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Search and filter states
  const [searchTerms, setSearchTerms] = useState({
    drivers: '',
    buses: '',
    students: '',
    notifications: '',
    schedule: ''
  });

  const [filters, setFilters] = useState({
    drivers: { status: 'all' },
    buses: { status: 'all', maintenanceStatus: 'all' },
    students: { status: 'all', class: 'all' },
    notifications: { type: 'all', priority: 'all', target: 'all', readStatus: 'all' },
    schedule: { status: 'all', timeSlot: 'all' }
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Static data for charts
  const dailyTripsData = [
    { time: '06:00', trips: 12 },
    { time: '07:00', trips: 25 },
    { time: '08:00', trips: 18 },
    { time: '14:00', trips: 22 },
    { time: '15:00', trips: 28 },
    { time: '16:00', trips: 15 }
  ];

  const statusData = [
    { name: 'Đang chạy', value: 15, color: '#22c55e' },
    { name: 'Chờ khởi hành', value: 8, color: '#f59e0b' },
    { name: 'Nghỉ', value: 5, color: '#6b7280' }
  ];

  // CRUD Functions for Schedule
  const addSchedule = (newSchedule: any) => {
    const id = Math.max(...scheduleData.map(s => s.id)) + 1;
    const scheduleWithDetails = {
      ...newSchedule,
      id,
      students: parseInt(newSchedule.students),
      pickupPoints: newSchedule.pickupPoints ? newSchedule.pickupPoints.split(',').map((point: string) => point.trim()) : [],
      dropoffPoints: newSchedule.dropoffPoints ? newSchedule.dropoffPoints.split(',').map((point: string) => point.trim()) : [],
      actualTime: null
    };
    setScheduleData([...scheduleData, scheduleWithDetails]);
    setShowModal(false);
    alert('Đã thêm lịch trình thành công!');
  };

  const editSchedule = (id: any, updatedSchedule: any) => {
    const scheduleWithDetails = {
      ...updatedSchedule,
      id,
      students: parseInt(updatedSchedule.students),
      pickupPoints: updatedSchedule.pickupPoints ? updatedSchedule.pickupPoints.split(',').map((point: string) => point.trim()) : [],
      dropoffPoints: updatedSchedule.dropoffPoints ? updatedSchedule.dropoffPoints.split(',').map((point: string) => point.trim()) : []
    };
    setScheduleData(scheduleData.map(s => s.id === id ? scheduleWithDetails : s));
    setShowModal(false);
    alert('Đã cập nhật lịch trình thành công!');
  };

  const deleteSchedule = (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
      setScheduleData(scheduleData.filter(s => s.id !== id));
      alert('Đã xóa lịch trình thành công!');
    }
  };

  // CRUD Functions for Students
  const addStudent = (newStudent: any) => {
    const id = Math.max(...studentsData.map(s => s.id)) + 1;
    setStudentsData([...studentsData, { ...newStudent, id }]);
    setShowModal(false);
    alert('Đã thêm học sinh thành công!');
  };

  const editStudent = (id: any, updatedStudent: any) => {
    setStudentsData(studentsData.map(s => s.id === id ? { ...updatedStudent, id } : s));
    setShowModal(false);
    alert('Đã cập nhật thông tin học sinh thành công!');
  };

  const deleteStudent = (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      setStudentsData(studentsData.filter(s => s.id !== id));
      alert('Đã xóa học sinh thành công!');
    }
  };

  // CRUD Functions for Drivers
  const addDriver = (newDriver: any) => {
    const id = Math.max(...driversData.map(d => d.id)) + 1;
    setDriversData([...driversData, { ...newDriver, id }]);
    setShowModal(false);
    alert('Đã thêm tài xế thành công!');
  };

  const editDriver = (id: any, updatedDriver: any) => {
    setDriversData(driversData.map(d => d.id === id ? { ...updatedDriver, id } : d));
    setShowModal(false);
    alert('Đã cập nhật thông tin tài xế thành công!');
  };

  const deleteDriver = (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
      setDriversData(driversData.filter(d => d.id !== id));
      alert('Đã xóa tài xế thành công!');
    }
  };

  // CRUD Functions for Buses
  const addBus = (newBus: any) => {
    const id = Math.max(...busesData.map(b => b.id)) + 1;
    setBusesData([...busesData, { ...newBus, id }]);
    setShowModal(false);
    alert('Đã thêm xe buýt thành công!');
  };

  const editBus = (id: any, updatedBus: any) => {
    setBusesData(busesData.map(b => b.id === id ? { ...updatedBus, id } : b));
    setShowModal(false);
    alert('Đã cập nhật thông tin xe buýt thành công!');
  };

  const deleteBus = (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa xe buýt này?')) {
      setBusesData(busesData.filter(b => b.id !== id));
      alert('Đã xóa xe buýt thành công!');
    }
  };

  // CRUD Functions for Notifications
  const addNotification = (newNotification: any) => {
    const id = Math.max(...notificationsData.map(n => n.id)) + 1;
    const timestamp = new Date().toISOString();
    const time = 'Vừa xong';
    setNotificationsData([...notificationsData, { 
      ...newNotification, 
      id, 
      timestamp, 
      time,
      isRead: false 
    }]);
    setShowModal(false);
    alert('Đã gửi thông báo thành công!');
  };

  const editNotification = (id: any, updatedNotification: any) => {
    setNotificationsData(notificationsData.map(n => n.id === id ? { ...updatedNotification, id } : n));
    setShowModal(false);
    alert('Đã cập nhật thông báo thành công!');
  };

  const deleteNotification = (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      setNotificationsData(notificationsData.filter(n => n.id !== id));
      alert('Đã xóa thông báo thành công!');
    }
  };

  const markAsRead = (id: any) => {
    setNotificationsData(notificationsData.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // Import/Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    alert(`Đã xuất ${data.length} bản ghi thành công!`);
  };

  const exportDriversToCSV = () => {
    exportToCSV(driversData, 'drivers');
  };

  const exportBusesToCSV = () => {
    exportToCSV(busesData, 'buses');
  };

  const exportStudentsToCSV = () => {
    exportToCSV(studentsData, 'students');
  };

  const exportNotificationsToCSV = () => {
    exportToCSV(notificationsData, 'notifications');
  };

  const generateSampleData = (type: string) => {
    if (type === 'drivers') {
      const sampleDrivers = [];
      for (let i = 7; i <= 20; i++) {
        sampleDrivers.push({
          id: i,
          name: `Tài xế ${i}`,
          phone: `090123456${i}`,
          bus: `BS${String(i).padStart(3, '0')}`,
          status: ['Đang chạy', 'Sẵn sàng', 'Nghỉ'][Math.floor(Math.random() * 3)],
          licenseNumber: `B${i}-${Math.random().toString().substr(2, 9)}`,
          licenseClass: ['D', 'E'][Math.floor(Math.random() * 2)],
          experience: Math.floor(Math.random() * 20) + 1,
          dateOfBirth: `19${70 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          address: `${i * 10} Đường Test, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
          emergencyContact: `098765432${i}`,
          joinDate: `20${18 + Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
        });
      }
      setDriversData([...driversData, ...sampleDrivers]);
      alert(`Đã tạo thêm ${sampleDrivers.length} tài xế mẫu!`);
    }
  };



  const [notificationsData, setNotificationsData] = useState([
    { 
      id: 1, 
      type: 'warning', 
      title: 'Cảnh báo trễ giờ',
      message: 'Xe BS001 có thể trễ 5 phút do tắc đường', 
      time: '5 phút trước',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: 'high',
      target: 'driver',
      isRead: false,
      sender: 'Hệ thống'
    },
    { 
      id: 2, 
      type: 'info', 
      title: 'Thông tin học sinh',
      message: 'Học sinh Nguyễn Minh An đã lên xe', 
      time: '10 phút trước',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      priority: 'medium',
      target: 'parent',
      isRead: true,
      sender: 'Tài xế Nguyễn Văn A'
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'Hoàn thành chuyến',
      message: 'Chuyến Tuyến C3 đã hoàn thành', 
      time: '15 phút trước',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      priority: 'low',
      target: 'all',
      isRead: false,
      sender: 'Tài xế Lê Văn C'
    },
    { 
      id: 4, 
      type: 'warning', 
      title: 'Xe cần bảo dưỡng',
      message: 'Xe BS003 cần bảo dưỡng định kỳ trong tuần này', 
      time: '30 phút trước',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      priority: 'high',
      target: 'driver',
      isRead: false,
      sender: 'Bộ phận kỹ thuật'
    },
    { 
      id: 5, 
      type: 'info', 
      title: 'Thay đổi lịch trình',
      message: 'Tuyến B2 sẽ có thay đổi lịch trình vào ngày mai do sửa đường', 
      time: '1 giờ trước',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      target: 'all',
      isRead: true,
      sender: 'Quản lý điều hành'
    },
    { 
      id: 6, 
      type: 'success', 
      title: 'Tài xế mới',
      message: 'Chào mừng tài xế Phạm Minh D gia nhập đội ngũ', 
      time: '2 giờ trước',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
      target: 'driver',
      isRead: true,
      sender: 'Phòng nhân sự'
    },
    { 
      id: 7, 
      type: 'warning', 
      title: 'Thời tiết xấu',
      message: 'Dự báo có mưa to vào chiều nay, các tài xế cần chú ý an toàn', 
      time: '3 giờ trước',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      target: 'driver',
      isRead: false,
      sender: 'Hệ thống'
    },
    { 
      id: 8, 
      type: 'info', 
      title: 'Học sinh vắng mặt',
      message: 'Học sinh Trần Thị Bình sẽ không đi học trong 3 ngày tới', 
      time: '4 giờ trước',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
      target: 'driver',
      isRead: true,
      sender: 'Phụ huynh'
    },
    { 
      id: 9, 
      type: 'warning', 
      title: 'Xe BS001 đang trễ lịch trình', 
      message: 'Xe buýt BS001 đang chậm 10 phút so với lịch trình dự kiến do kẹt xe tại khu vực Cầu Giấy. Phụ huynh vui lòng chờ thêm ít phút.', 
      time: '5 phút trước',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: 'Cao',
      target: 'Phụ huynh',
      isRead: false,
      sender: 'Hệ thống GPS'
    },
    { 
      id: 10, 
      type: 'success', 
      title: 'Hoàn thành tuyến C3', 
      message: 'Xe BS003 đã hoàn thành tuyến C3 lúc 16:20. Tất cả 22 học sinh đã được đưa về điểm đón an toàn.', 
      time: '2 giờ trước',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: 'Trung bình',
      target: 'Phụ huynh',
      isRead: true,
      sender: 'Tài xế Lê Văn C'
    },
    { 
      id: 11, 
      type: 'warning', 
      title: 'Cảnh báo tốc độ xe BS004', 
      message: 'Xe BS004 đang chạy với tốc độ 65km/h, vượt quá giới hạn cho phép (50km/h) trong khu vực trường học. Tài xế cần giảm tốc độ ngay lập tức.', 
      time: '10 phút trước',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      priority: 'Cao',
      target: 'Tài xế',
      isRead: false,
      sender: 'Hệ thống GPS'
    },
    { 
      id: 12, 
      type: 'info', 
      title: 'Cập nhật vị trí xe BS002', 
      message: 'Xe BS002 đã đến điểm đón thứ 2 (Bến xe Mỹ Đình) đúng lịch trình. Dự kiến sẽ đến điểm đón tiếp theo trong 5 phút.', 
      time: '15 phút trước',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      priority: 'Thấp',
      target: 'Phụ huynh',
      isRead: true,
      sender: 'Hệ thống theo dõi'
    }
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
    { id: 'schedule', label: 'Quản lý Lịch trình', icon: Calendar },
    { id: 'tracking', label: 'Theo dõi Vị trí', icon: MapPin },
    { id: 'students', label: 'Quản lý Học sinh', icon: GraduationCap },
    { id: 'drivers', label: 'Quản lý Tài xế', icon: UserCheck },
    { id: 'buses', label: 'Quản lý Xe buýt', icon: Bus },
    { id: 'notifications', label: 'Thông báo', icon: Bell }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tổng quan Hệ thống</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">15</h3>
              <p className="text-sm text-gray-600">Xe đang chạy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">245</h3>
              <p className="text-sm text-gray-600">Học sinh di chuyển</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <UserCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">18</h3>
              <p className="text-sm text-gray-600">Tài xế hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">2</h3>
              <p className="text-sm text-gray-600">Cảnh báo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Số chuyến trong ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTripsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Line type="monotone" dataKey="trips" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái xe buýt</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="40%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${((percent as number) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} xe`, name]} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value}: ${entry?.payload?.value || 0} xe`}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Thông tin chi tiết */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {statusData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div 
                    className={`w-4 h-4 rounded-full mr-2 ${
                      item.name === 'Đang chạy' ? 'bg-green-500' :
                      item.name === 'Chờ khởi hành' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-xs text-gray-500">xe buýt</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bản đồ theo dõi</h3>
        <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Bản đồ Google Maps</p>
            <p className="text-sm text-gray-500">Hiển thị vị trí xe buýt theo thời gian thực</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Lịch trình</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "Tuyến,Giờ khởi hành,Tài xế,Xe,Học sinh,Trạng thái,Điểm đón,Điểm trả,Thời gian dự kiến,Khoảng cách\n"
                + scheduleData.map(schedule => 
                  `${schedule.route},${schedule.time},${schedule.driver},${schedule.bus},${schedule.students},${schedule.status},"${schedule.pickupPoints.join(', ')}","${schedule.dropoffPoints.join(', ')}",${schedule.estimatedTime},${schedule.distance}`
                ).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "lich_trinh.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            Export CSV
          </button>
          <button 
            onClick={() => {
              setModalType('schedule');
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm lịch trình
          </button>
        </div>
      </div>

      {/* Search and Filter for Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm lịch trình theo tuyến, tài xế, xe..."
            value={searchTerms.schedule}
            onChange={(e) => setSearchTerms({...searchTerms, schedule: e.target.value})}
            className="flex-1 min-w-64 p-2 border border-gray-300 rounded-lg"
          />
          <select 
            value={filters.schedule.status}
            onChange={(e) => setFilters({...filters, schedule: {...filters.schedule, status: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo trạng thái lịch trình"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang chạy">Đang chạy</option>
            <option value="Chờ khởi hành">Chờ khởi hành</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Sẵn sàng">Sẵn sàng</option>
          </select>
          <select 
            value={filters.schedule.timeSlot}
            onChange={(e) => setFilters({...filters, schedule: {...filters.schedule, timeSlot: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo khung giờ"
          >
            <option value="all">Tất cả khung giờ</option>
            <option value="morning">Buổi sáng (06:00-12:00)</option>
            <option value="afternoon">Buổi chiều (12:00-18:00)</option>
            <option value="evening">Buổi tối (18:00-22:00)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ khởi hành</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoảng cách</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(searchTerms.schedule ? 
                scheduleData.filter(schedule => 
                  schedule.route.toLowerCase().includes(searchTerms.schedule.toLowerCase()) ||
                  schedule.driver.toLowerCase().includes(searchTerms.schedule.toLowerCase()) ||
                  schedule.bus.toLowerCase().includes(searchTerms.schedule.toLowerCase())
                ) : scheduleData
              ).filter(schedule => {
                const timeFilter = filters.schedule.timeSlot === 'all' || 
                  (filters.schedule.timeSlot === 'morning' && schedule.time >= '06:00' && schedule.time < '12:00') ||
                  (filters.schedule.timeSlot === 'afternoon' && schedule.time >= '12:00' && schedule.time < '18:00') ||
                  (filters.schedule.timeSlot === 'evening' && schedule.time >= '18:00' && schedule.time < '22:00');
                
                return (filters.schedule.status === 'all' || schedule.status === filters.schedule.status) && timeFilter;
              }).map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 cursor-pointer" title={`Điểm đón: ${schedule.pickupPoints.join(', ')} | Điểm trả: ${schedule.dropoffPoints.join(', ')} | Thời gian dự kiến: ${schedule.estimatedTime}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{schedule.route}</span>
                      <span className="text-xs text-gray-500">Điểm đón: {schedule.pickupPoints.slice(0, 2).join(', ')}{schedule.pickupPoints.length > 2 ? '...' : ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span>{schedule.time}</span>
                      <span className="text-xs text-gray-500">Dự kiến: {schedule.estimatedTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.bus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      {schedule.students}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 text-gray-400 mr-1" />
                      {schedule.distance}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.status === 'Đang chạy' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'Chờ khởi hành' ? 'bg-yellow-100 text-yellow-800' :
                      schedule.status === 'Sẵn sàng' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setModalType('schedule');
                          setEditingItem(schedule);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900" 
                        title="Chỉnh sửa lịch trình"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-900" 
                        title="Xóa lịch trình"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Theo dõi Vị trí Xe</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            🔄 Cập nhật vị trí
          </button>
          <select className="border border-gray-300 rounded-lg px-3 py-2" aria-label="Chọn tuyến đường">
            <option>Tất cả tuyến</option>
            <option>Tuyến A1</option>
            <option>Tuyến B2</option>
            <option>Tuyến C3</option>
            <option>Tuyến D4</option>
            <option>Tuyến E5</option>
          </select>
        </div>
      </div>

      {/* Map Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <Navigation className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-xl text-gray-700 mb-2">Bản đồ theo dõi GPS thời gian thực</p>
            <p className="text-gray-600">Hiển thị vị trí và tuyến đường của tất cả xe buýt</p>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Đang chạy</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm">Sẵn sàng</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Bảo dưỡng</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-sm">Nghỉ</span>
              </div>
            </div>
          </div>
          
          {/* Simulated bus positions */}
          <div className="absolute top-4 left-4 bg-green-500 w-3 h-3 rounded-full animate-pulse" title="BS001 - Đang chạy"></div>
          <div className="absolute top-12 right-8 bg-yellow-500 w-3 h-3 rounded-full" title="BS002 - Sẵn sàng"></div>
          <div className="absolute bottom-8 left-12 bg-red-500 w-3 h-3 rounded-full" title="BS003 - Bảo dưỡng"></div>
          <div className="absolute bottom-16 right-6 bg-green-500 w-3 h-3 rounded-full animate-pulse" title="BS004 - Đang chạy"></div>
          <div className="absolute top-1/2 left-1/3 bg-yellow-500 w-3 h-3 rounded-full" title="BS005 - Sẵn sàng"></div>
          <div className="absolute top-1/3 right-1/4 bg-gray-500 w-3 h-3 rounded-full" title="BS006 - Nghỉ"></div>
        </div>
      </div>

      {/* Real-time Bus Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {busesData.map((bus) => (
          <div key={bus.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Bus className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bus.busId}</h3>
                  <p className="text-sm text-gray-600">{bus.licensePlate}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                bus.status === 'Đang chạy' ? 'bg-green-100 text-green-800' :
                bus.status === 'Sẵn sàng' ? 'bg-yellow-100 text-yellow-800' :
                bus.status === 'Bảo dưỡng' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {bus.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{bus.currentLocation?.address || 'Không xác định'}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Navigation className="h-4 w-4 mr-2" />
                <span>Tốc độ: {bus.currentLocation?.speed || 0} km/h</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Cập nhật: {bus.currentLocation?.lastUpdate || 'N/A'}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>Tài xế: {bus.driver}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📍</span>
                <span>GPS: {bus.currentLocation?.lat || 'N/A'}, {bus.currentLocation?.lng || 'N/A'}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tuyến:</span>
                <span className="font-medium">{bus.route}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Học sinh</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportStudentsToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            Export CSV
          </button>
          <button 
            onClick={() => {
              setModalType('student');
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm học sinh
          </button>
        </div>
      </div>

      {/* Search and Filter for Students */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm học sinh theo tên, mã học sinh, trường..."
            value={searchTerms.students}
            onChange={(e) => setSearchTerms({...searchTerms, students: e.target.value})}
            className="flex-1 min-w-64 p-2 border border-gray-300 rounded-lg"
          />
          <select 
            value={filters.students.status}
            onChange={(e) => setFilters({...filters, students: {...filters.students, status: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo trạng thái học sinh"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang học">Đang học</option>
            <option value="Tạm nghỉ">Tạm nghỉ</option>
            <option value="Chuyển trường">Chuyển trường</option>
          </select>
          <select 
            value={filters.students.class}
            onChange={(e) => setFilters({...filters, students: {...filters.students, class: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo lớp"
          >
            <option value="all">Tất cả lớp</option>
            <option value="10A1">10A1</option>
            <option value="10A2">10A2</option>
            <option value="11B3">11B3</option>
            <option value="12C1">12C1</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên học sinh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(searchTerms.students ? 
                studentsData.filter(student => 
                  student.name.toLowerCase().includes(searchTerms.students.toLowerCase()) ||
                  student.id.toString().includes(searchTerms.students) ||
                  student.class.toLowerCase().includes(searchTerms.students.toLowerCase()) ||
                  student.route.toLowerCase().includes(searchTerms.students.toLowerCase())
                ) : studentsData
              ).filter(student => 
                (filters.students.status === 'all' || student.status === filters.students.status) &&
                (filters.students.class === 'all' || student.class === filters.students.class)
              ).map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      student.status === 'Đang di chuyển' ? 'bg-blue-100 text-blue-800' :
                      student.status === 'Đã đến trường' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setModalType('student');
                          setEditingItem(student);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900" 
                        title="Chỉnh sửa thông tin học sinh"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900" 
                        title="Xóa học sinh"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài xế</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => generateSampleData('drivers')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo dữ liệu mẫu
          </button>
          <button 
            onClick={exportDriversToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            Export CSV
          </button>
          <button 
            onClick={() => {
              setModalType('driver');
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm tài xế
          </button>
        </div>
      </div>

      {/* Search and Filter for Drivers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm tài xế theo tên, số điện thoại, mã xe..."
            value={searchTerms.drivers}
            onChange={(e) => setSearchTerms({...searchTerms, drivers: e.target.value})}
            className="flex-1 min-w-64 p-2 border border-gray-300 rounded-lg"
          />
          <select 
            value={filters.drivers.status}
            onChange={(e) => setFilters({...filters, drivers: {...filters.drivers, status: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo trạng thái tài xế"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang chạy">Đang chạy</option>
            <option value="Sẵn sàng">Sẵn sàng</option>
            <option value="Nghỉ">Nghỉ</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tài xế</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bằng lái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe phụ trách</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kinh nghiệm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(searchTerms.drivers ? 
                driversData.filter(driver => 
                  driver.name.toLowerCase().includes(searchTerms.drivers.toLowerCase()) ||
                  driver.phone.includes(searchTerms.drivers) ||
                  driver.bus.toLowerCase().includes(searchTerms.drivers.toLowerCase())
                ) : driversData
              ).filter(driver => 
                filters.drivers.status === 'all' || driver.status === filters.drivers.status
              ).map((driver) => (
                <tr key={driver.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      <div className="text-sm text-gray-500">{driver.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{driver.licenseNumber}</div>
                      <div className="text-sm text-gray-500">Hạng {driver.licenseClass}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.bus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.experience} năm</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      driver.status === 'Đang chạy' ? 'bg-green-100 text-green-800' :
                      driver.status === 'Sẵn sàng' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setModalType('driver');
                          setEditingItem(driver);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900" 
                        title="Chỉnh sửa thông tin tài xế"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteDriver(driver.id)}
                        className="text-red-600 hover:text-red-900" 
                        title="Xóa tài xế"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBuses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Xe buýt</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportBusesToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            Export CSV
          </button>
          <button 
            onClick={() => {
              setModalType('bus');
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm xe buýt
          </button>
        </div>
      </div>

      {/* Search and Filter for Buses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm xe buýt theo mã xe, biển số, dòng xe..."
            value={searchTerms.buses}
            onChange={(e) => setSearchTerms({...searchTerms, buses: e.target.value})}
            className="flex-1 min-w-64 p-2 border border-gray-300 rounded-lg"
          />
          <select 
            value={filters.buses.status}
            onChange={(e) => setFilters({...filters, buses: {...filters.buses, status: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo trạng thái xe buýt"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang chạy">Đang chạy</option>
            <option value="Sẵn sàng">Sẵn sàng</option>
            <option value="Bảo dưỡng">Bảo dưỡng</option>
            <option value="Nghỉ">Nghỉ</option>
          </select>
          <select 
            value={filters.buses.maintenanceStatus}
            onChange={(e) => setFilters({...filters, buses: {...filters.buses, maintenanceStatus: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo tình trạng bảo dưỡng"
          >
            <option value="all">Tất cả tình trạng</option>
            <option value="Tốt">Tốt</option>
            <option value="Cần bảo dưỡng">Cần bảo dưỡng</option>
            <option value="Đang bảo dưỡng">Đang bảo dưỡng</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(searchTerms.buses ? 
          busesData.filter(bus => 
            bus.busId.toLowerCase().includes(searchTerms.buses.toLowerCase()) ||
            bus.licensePlate.toLowerCase().includes(searchTerms.buses.toLowerCase()) ||
            bus.model.toLowerCase().includes(searchTerms.buses.toLowerCase())
          ) : busesData
        ).filter(bus => 
          (filters.buses.status === 'all' || bus.status === filters.buses.status) &&
          (filters.buses.maintenanceStatus === 'all' || bus.maintenanceStatus === filters.buses.maintenanceStatus)
        ).map((bus) => (
          <div key={bus.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Bus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{bus.busId}</h3>
                  <p className="text-sm text-gray-600">{bus.model} - {bus.capacity} chỗ</p>
                  <p className="text-sm text-gray-500">{bus.licensePlate}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setModalType('bus');
                    setEditingItem(bus);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900" 
                  title="Chỉnh sửa thông tin xe buýt"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteBus(bus.id)}
                  className="text-red-600 hover:text-red-900" 
                  title="Xóa xe buýt"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tài xế:</span>
                <span className="text-sm font-medium">{bus.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  bus.status === 'Đang chạy' ? 'bg-green-100 text-green-800' :
                  bus.status === 'Sẵn sàng' ? 'bg-blue-100 text-blue-800' :
                  bus.status === 'Bảo dưỡng' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bảo dưỡng:</span>
                <span className={`text-sm font-medium ${
                  bus.maintenanceStatus === 'Tốt' ? 'text-green-600' :
                  bus.maintenanceStatus === 'Cần bảo dưỡng' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {bus.maintenanceStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Năm sản xuất:</span>
                <span className="text-sm font-medium">{bus.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Số km:</span>
                <span className="text-sm font-medium">{bus.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tuyến:</span>
                <span className="text-sm font-medium">{bus.route}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Thông báo & Cảnh báo</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportNotificationsToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            Export CSV
          </button>
          <button 
            onClick={() => {
              setModalType('notification');
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Gửi thông báo
          </button>
        </div>
      </div>

      {/* Search and Filters for Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung..."
            value={searchTerms.notifications}
            onChange={(e) => setSearchTerms({...searchTerms, notifications: e.target.value})}
            className="flex-1 min-w-64 p-2 border border-gray-300 rounded-lg"
          />
          <select 
            value={filters.notifications.type}
            onChange={(e) => setFilters({...filters, notifications: {...filters.notifications, type: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo loại"
          >
            <option value="all">Tất cả loại</option>
            <option value="warning">Cảnh báo</option>
            <option value="info">Thông tin</option>
            <option value="success">Thành công</option>
          </select>
          <select 
            value={filters.notifications.priority}
            onChange={(e) => setFilters({...filters, notifications: {...filters.notifications, priority: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo mức độ"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>
          <select 
            value={filters.notifications.readStatus}
            onChange={(e) => setFilters({...filters, notifications: {...filters.notifications, readStatus: e.target.value}})}
            className="border border-gray-300 rounded-lg px-3 py-2" 
            aria-label="Lọc theo trạng thái"
          >
            <option value="all">Tất cả</option>
            <option value="false">Chưa đọc</option>
            <option value="true">Đã đọc</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {(searchTerms.notifications ? 
          notificationsData.filter(notification => 
            notification.title.toLowerCase().includes(searchTerms.notifications.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerms.notifications.toLowerCase())
          ) : notificationsData
        ).filter(notification => 
          (filters.notifications.type === 'all' || notification.type === filters.notifications.type) &&
          (filters.notifications.priority === 'all' || notification.priority === filters.notifications.priority) &&
          (filters.notifications.readStatus === 'all' || 
           (filters.notifications.readStatus === 'true' && notification.isRead) ||
           (filters.notifications.readStatus === 'false' && !notification.isRead))
        ).map((notification) => (
          <div key={notification.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
            !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${
                  notification.type === 'warning' ? 'bg-yellow-100' :
                  notification.type === 'info' ? 'bg-blue-100' :
                  'bg-green-100'
                }`}>
                  {notification.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : notification.type === 'info' ? (
                    <Bell className="h-5 w-5 text-blue-600" />
                  ) : (
                    <UserCheck className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notification.priority === 'high' ? 'Cao' :
                       notification.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    {!notification.isRead && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Chưa đọc
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-medium mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Gửi bởi: {notification.sender}</span>
                    <span>Đối tượng: {
                      notification.target === 'driver' ? 'Tài xế' :
                      notification.target === 'parent' ? 'Phụ huynh' :
                      notification.target === 'student' ? 'Học sinh' : 'Tất cả'
                    }</span>
                    <span>{notification.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-900 text-sm" 
                    title="Đánh dấu đã đọc"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                <button 
                  onClick={() => {
                    setModalType('notification');
                    setEditingItem(notification);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900" 
                  title="Chỉnh sửa thông báo"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-900" 
                  title="Xóa thông báo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'schedule': return renderSchedule();
      case 'tracking': return renderTracking();
      case 'students': return renderStudents();
      case 'drivers': return renderDrivers();
      case 'buses': return renderBuses();
      case 'notifications': return renderNotifications();
      default: return renderDashboard();
    }
  };

  // Simple Modal Component for Testing
  const renderModal = () => {
    if (!showModal) return null;

    const handleSubmit = (e: any) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      if (modalType === 'schedule') {
        if (editingItem) {
          editSchedule(editingItem.id, data);
        } else {
          addSchedule(data);
        }
      } else if (modalType === 'student') {
        if (editingItem) {
          editStudent(editingItem.id, data);
        } else {
          addStudent(data);
        }
      } else if (modalType === 'driver') {
        if (editingItem) {
          editDriver(editingItem.id, data);
        } else {
          addDriver(data);
        }
      } else if (modalType === 'bus') {
        if (editingItem) {
          editBus(editingItem.id, data);
        } else {
          addBus(data);
        }
      } else if (modalType === 'notification') {
        if (editingItem) {
          editNotification(editingItem.id, data);
        } else {
          addNotification(data);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? 'Chỉnh sửa' : 'Gửi'} {' '}
              {modalType === 'schedule' ? 'Lịch trình' : 
               modalType === 'student' ? 'Học sinh' : 
               modalType === 'driver' ? 'Tài xế' : 
               modalType === 'bus' ? 'Xe buýt' : 
               modalType === 'notification' ? 'Thông báo' : 'Item'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
              title="Đóng modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType === 'schedule' && (
              <>
                <input
                  name="route"
                  placeholder="Tuyến (VD: Tuyến A1)"
                  defaultValue={editingItem?.route || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="time"
                  type="time"
                  placeholder="Giờ khởi hành"
                  defaultValue={editingItem?.time || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="driver"
                  placeholder="Tên tài xế"
                  defaultValue={editingItem?.driver || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="bus"
                  placeholder="Mã xe (VD: BS001)"
                  defaultValue={editingItem?.bus || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="students"
                  type="number"
                  placeholder="Số học sinh"
                  defaultValue={editingItem?.students || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <textarea
                  name="pickupPoints"
                  placeholder="Điểm đón (phân cách bằng dấu phẩy)"
                  defaultValue={editingItem?.pickupPoints?.join(', ') || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
                <textarea
                  name="dropoffPoints"
                  placeholder="Điểm trả (phân cách bằng dấu phẩy)"
                  defaultValue={editingItem?.dropoffPoints?.join(', ') || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
                <input
                  name="estimatedTime"
                  placeholder="Thời gian dự kiến (VD: 45 phút)"
                  defaultValue={editingItem?.estimatedTime || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  name="distance"
                  placeholder="Khoảng cách (VD: 12 km)"
                  defaultValue={editingItem?.distance || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <select
                  name="status"
                  defaultValue={editingItem?.status || 'Chờ khởi hành'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn trạng thái lịch trình"
                  required
                >
                  <option value="Chờ khởi hành">Chờ khởi hành</option>
                  <option value="Đang chạy">Đang chạy</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Sẵn sàng">Sẵn sàng</option>
                </select>
              </>
            )}
            
            {modalType === 'student' && (
              <>
                <input
                  name="name"
                  placeholder="Tên học sinh"
                  defaultValue={editingItem?.name || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="class"
                  placeholder="Lớp (VD: 6A)"
                  defaultValue={editingItem?.class || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="route"
                  placeholder="Tuyến (VD: Tuyến A1)"
                  defaultValue={editingItem?.route || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  name="status"
                  defaultValue={editingItem?.status || 'Chờ đón'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn trạng thái học sinh"
                  required
                >
                  <option value="Chờ đón">Chờ đón</option>
                  <option value="Đang di chuyển">Đang di chuyển</option>
                  <option value="Đã đến trường">Đã đến trường</option>
                </select>
              </>
            )}

            {modalType === 'driver' && (
              <>
                <input
                  name="name"
                  placeholder="Tên tài xế"
                  defaultValue={editingItem?.name || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="phone"
                  placeholder="Số điện thoại"
                  defaultValue={editingItem?.phone || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="licenseNumber"
                  placeholder="Số bằng lái (VD: B1-123456789)"
                  defaultValue={editingItem?.licenseNumber || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  name="licenseClass"
                  defaultValue={editingItem?.licenseClass || 'D'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn hạng bằng lái"
                  required
                >
                  <option value="D">Hạng D</option>
                  <option value="E">Hạng E</option>
                  <option value="F">Hạng F</option>
                </select>
                <input
                  name="experience"
                  type="number"
                  placeholder="Số năm kinh nghiệm"
                  defaultValue={editingItem?.experience || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="50"
                  required
                />
                <input
                  name="dateOfBirth"
                  type="date"
                  placeholder="Ngày sinh"
                  defaultValue={editingItem?.dateOfBirth || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="address"
                  placeholder="Địa chỉ"
                  defaultValue={editingItem?.address || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="emergencyContact"
                  placeholder="Liên hệ khẩn cấp"
                  defaultValue={editingItem?.emergencyContact || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="bus"
                  placeholder="Mã xe phụ trách (VD: BS001)"
                  defaultValue={editingItem?.bus || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  name="status"
                  defaultValue={editingItem?.status || 'Sẵn sàng'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn trạng thái tài xế"
                  required
                >
                  <option value="Sẵn sàng">Sẵn sàng</option>
                  <option value="Đang chạy">Đang chạy</option>
                  <option value="Nghỉ">Nghỉ</option>
                </select>
                <input
                  name="joinDate"
                  type="date"
                  placeholder="Ngày vào làm"
                  defaultValue={editingItem?.joinDate || new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </>
            )}

            {modalType === 'bus' && (
              <>
                <input
                  name="busId"
                  placeholder="Mã xe (VD: BS001)"
                  defaultValue={editingItem?.busId || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="licensePlate"
                  placeholder="Biển số xe (VD: 29A-12345)"
                  defaultValue={editingItem?.licensePlate || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="model"
                  placeholder="Dòng xe (VD: Hyundai Universe)"
                  defaultValue={editingItem?.model || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="year"
                  type="number"
                  placeholder="Năm sản xuất"
                  defaultValue={editingItem?.year || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min="2000"
                  max="2030"
                  required
                />
                <input
                  name="capacity"
                  type="number"
                  placeholder="Số ghế"
                  defaultValue={editingItem?.capacity || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min="20"
                  max="80"
                  required
                />
                <select
                  name="fuel"
                  defaultValue={editingItem?.fuel || 'Diesel'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn loại nhiên liệu"
                  required
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Xăng">Xăng</option>
                  <option value="Điện">Điện</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <select
                  name="status"
                  defaultValue={editingItem?.status || 'Sẵn sàng'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn trạng thái xe buýt"
                  required
                >
                  <option value="Sẵn sàng">Sẵn sàng</option>
                  <option value="Đang chạy">Đang chạy</option>
                  <option value="Bảo dưỡng">Bảo dưỡng</option>
                  <option value="Nghỉ">Nghỉ</option>
                </select>
                <select
                  name="maintenanceStatus"
                  defaultValue={editingItem?.maintenanceStatus || 'Tốt'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn tình trạng bảo dưỡng"
                  required
                >
                  <option value="Tốt">Tốt</option>
                  <option value="Cần bảo dưỡng">Cần bảo dưỡng</option>
                  <option value="Đang bảo dưỡng">Đang bảo dưỡng</option>
                </select>
                <input
                  name="lastMaintenance"
                  type="date"
                  placeholder="Bảo dưỡng lần cuối"
                  defaultValue={editingItem?.lastMaintenance || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="nextMaintenance"
                  type="date"
                  placeholder="Bảo dưỡng tiếp theo"
                  defaultValue={editingItem?.nextMaintenance || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="mileage"
                  type="number"
                  placeholder="Số km đã đi"
                  defaultValue={editingItem?.mileage || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min="0"
                  required
                />
                <input
                  name="driver"
                  placeholder="Tài xế phụ trách"
                  defaultValue={editingItem?.driver || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="route"
                  placeholder="Tuyến đường (VD: Tuyến A1)"
                  defaultValue={editingItem?.route || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </>
            )}

            {modalType === 'notification' && (
              <>
                <input
                  name="title"
                  placeholder="Tiêu đề thông báo"
                  defaultValue={editingItem?.title || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Nội dung thông báo"
                  defaultValue={editingItem?.message || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg h-24 resize-none"
                  required
                />
                <select
                  name="type"
                  defaultValue={editingItem?.type || 'info'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn loại thông báo"
                  required
                >
                  <option value="info">Thông tin</option>
                  <option value="warning">Cảnh báo</option>
                  <option value="success">Thành công</option>
                </select>
                <select
                  name="priority"
                  defaultValue={editingItem?.priority || 'medium'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn mức độ ưu tiên"
                  required
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
                <select
                  name="target"
                  defaultValue={editingItem?.target || 'all'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Chọn đối tượng nhận thông báo"
                  required
                >
                  <option value="all">Tất cả</option>
                  <option value="driver">Tài xế</option>
                  <option value="parent">Phụ huynh</option>
                  <option value="student">Học sinh</option>
                </select>
                <input
                  name="sender"
                  placeholder="Người gửi"
                  defaultValue={editingItem?.sender || 'Admin'}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">Smart Bus</h2>
                <p className="text-sm text-gray-600">Tracking System</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
      
      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default Dashboard;