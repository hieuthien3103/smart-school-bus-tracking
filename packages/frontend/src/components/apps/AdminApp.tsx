// AdminApp component - Full management system for administrators
import React, { useState, useMemo } from 'react';
import AdminDashboard from '../dashboard/AdminDashboard';
import ScheduleManagement from '../management/ScheduleManagement';
import StudentManagement from '../management/StudentManagement';
import DriverManagement from '../management/DriverManagement';
import BusManagement from '../management/BusManagement';
import LocationTracking from '../tracking/LocationTracking';
import NotificationCenter from '../notifications/NotificationCenter';
import Reports from '../reports/Reports';
import Settings from '../settings/Settings';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import Modal from '../shared/Modal';
import Form from '../shared/Form';

import type { User, FormField, Student, Schedule, Driver } from '../../types';
import { useAppData } from '../../contexts/AppDataContext';



interface AdminAppProps {
  user: User;
  onLogout: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ user, onLogout }) => {
  // Global data context
  const { 
    updateBusLocations, 
    syncBusLocationFromSchedule,
    scheduleData,
    setScheduleData,
    studentsData: globalStudentsData,
    addStudent,
    updateStudent,
    deleteStudent,
    driversData: globalDriversData,
    addDriver,
    updateDriver,
    deleteDriver,
    busesData: globalBusesData,
    addBus,
    updateBus,
    deleteBus
  } = useAppData();

  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'student' | 'driver' | 'bus'>('schedule');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Transform data for management components - use global data
  const studentsData = globalStudentsData.map(student => ({
    id: student.id,
    name: student.name || 'Chưa có tên',
    class: student.class || student.grade || 'Chưa xác định',    // Use new class field
    route: student.route_id ? `Tuyến ${student.route_id}` : 'Chưa phân tuyến',
    pickup: student.pickup_address || 'Chưa xác định',
    dropoff: student.dropoff_address || 'Chưa xác định',
    parent: 'N/A',  // No longer in database
    phone: 'N/A',   // No longer in database
    status: student.status || 'Chưa xác định'
  }));
  
  // Transform global drivers data for AdminApp format
  const driversData = useMemo(() => globalDriversData.map(driver => ({
    id: driver.id,
    name: driver.name || 'Chưa có tên',
    phone: driver.phone || 'Chưa có SĐT',
    license: driver.license_number || 'Chưa có GPLX',
    experience: driver.experience || 0,
    status: driver.status || 'Chưa xác định',
    currentRoute: driver.current_bus_id ? `Tuyến ${driver.current_bus_id}` : 'Chưa phân tuyến',
    currentBus: driver.current_bus_id ? `BS${driver.current_bus_id}` : 'Chưa phân xe'
  })), [globalDriversData]);
  
  // Use global buses data directly
  const busesData = globalBusesData;

  // Update current time
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Use ref to track sync state and prevent infinite loops
  const lastSyncRef = React.useRef({ busCount: 0, scheduleCount: 0 });

  // Sync data with location tracking when data count changes
  React.useEffect(() => {
    const currentBusCount = busesData.length;
    const currentScheduleCount = scheduleData.length;
    
    // Only sync if the data counts have actually changed
    if (currentBusCount !== lastSyncRef.current.busCount) {
      if (currentBusCount > 0) {
        updateBusLocations(busesData);
      }
      lastSyncRef.current.busCount = currentBusCount;
    }
    
    if (currentScheduleCount !== lastSyncRef.current.scheduleCount) {
      if (currentScheduleCount > 0) {
        syncBusLocationFromSchedule(scheduleData);
      }
      lastSyncRef.current.scheduleCount = currentScheduleCount;
    }
  }, [busesData, scheduleData, updateBusLocations, syncBusLocationFromSchedule]);

  // CRUD operations
  const handleAdd = (type: 'schedule' | 'student' | 'driver' | 'bus') => {
    setModalType(type);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (type: 'schedule' | 'student' | 'driver' | 'bus', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleFormSubmit = (formData: any) => {
    try {
      // Validate form data
      if (!formData || Object.keys(formData).length === 0) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      if (editingItem) {
        // Edit existing item
        switch (modalType) {
          case 'schedule':
            setScheduleData(prev => prev.map(item => 
              item.id === editingItem.id ? { 
                ...item,
                route_id: parseInt(formData.route_id) || item.route_id,
                driver_id: parseInt(formData.driver_id) || item.driver_id,
                bus_id: parseInt(formData.bus_id) || item.bus_id,
                schedule_date: formData.schedule_date || item.schedule_date,
                schedule_type: formData.schedule_type || item.schedule_type,
                start_time: formData.start_time || item.start_time,
                end_time: formData.end_time || item.end_time,
                total_students: parseInt(formData.total_students) || item.total_students,
                status: formData.status || item.status,
                notes: formData.notes || item.notes
              } : item
            ));
            alert('Cập nhật lịch trình thành công!');
            break;
          case 'student':
            // Update student with new field names
            const studentUpdate: Partial<Student> = {
              student_code: formData.student_code,
              name: formData.name,
              grade: formData.grade,
              class: formData.class,
              date_of_birth: formData.date_of_birth,
              gender: formData.gender as 'male' | 'female',
              address: formData.address,
              pickup_address: formData.pickup_address,
              dropoff_address: formData.dropoff_address,
              school_id: parseInt(formData.school_id),
              route_id: formData.route_id ? parseInt(formData.route_id) : undefined,
              stop_id: formData.stop_id ? parseInt(formData.stop_id) : undefined,
              status: formData.status as 'active' | 'inactive' | 'transferred' | 'graduated',
              medical_notes: formData.medical_notes,
              allergies: formData.allergies,
              emergency_instructions: formData.emergency_instructions,
              photo: formData.photo
            };
            updateStudent(editingItem.id, studentUpdate);
            alert('Cập nhật học sinh thành công!');
            break;
          case 'driver':
            // Update driver with new field names
            const driverUpdate: Partial<Driver> = {
              name: formData.name,
              phone: formData.phone,
              license_number: formData.license_number,
              experience: parseInt(formData.experience) || 0,
              hire_date: formData.hire_date,
              current_bus_id: formData.current_bus_id ? parseInt(formData.current_bus_id) : undefined,
              status: formData.status as 'active' | 'inactive' | 'on_leave',
              emergency_contact_name: formData.emergency_contact_name,
              emergency_contact_phone: formData.emergency_contact_phone,
              address: formData.address,
              notes: formData.notes
            };
            updateDriver(editingItem.id, driverUpdate);
            alert('Cập nhật tài xế thành công!');
            break;
          case 'bus':
            // Update bus in global context
            const busUpdate = {
              ...formData,
              capacity: parseInt(formData.capacity) || editingItem.capacity
            };
            updateBus(editingItem.id, busUpdate);
            alert('Cập nhật xe buýt thành công!');
            break;
        }
      } else {
        // Add new item with unique ID based on existing data
        let newId: number;
        switch (modalType) {
          case 'schedule':
            newId = Math.max(...scheduleData.map(s => s.id), 0) + 1;
            const newSchedule: Schedule = {
              id: newId,
              route_id: parseInt(formData.route_id),
              driver_id: parseInt(formData.driver_id),
              bus_id: parseInt(formData.bus_id),
              schedule_date: formData.schedule_date,
              schedule_type: formData.schedule_type as 'morning' | 'afternoon',
              start_time: formData.start_time,
              end_time: formData.end_time,
              total_students: parseInt(formData.total_students) || 0,
              status: (formData.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled') || 'scheduled',
              notes: formData.notes
            };
            setScheduleData(prev => [...prev, newSchedule]);
            alert('Thêm lịch trình mới thành công!');
            break;
          case 'student':
            // Create new student with new field names
            const newStudentData: Omit<Student, 'id'> = {
              student_code: formData.student_code,
              name: formData.name,
              grade: formData.grade,
              class: formData.class,
              date_of_birth: formData.date_of_birth,
              gender: formData.gender as 'male' | 'female',
              address: formData.address,
              pickup_address: formData.pickup_address,
              dropoff_address: formData.dropoff_address,
              school_id: parseInt(formData.school_id),
              route_id: formData.route_id ? parseInt(formData.route_id) : undefined,
              stop_id: formData.stop_id ? parseInt(formData.stop_id) : undefined,
              status: (formData.status as 'active' | 'inactive' | 'transferred' | 'graduated') || 'active',
              medical_notes: formData.medical_notes,
              allergies: formData.allergies,
              emergency_instructions: formData.emergency_instructions,
              photo: formData.photo
            };
            addStudent(newStudentData);
            alert('Thêm học sinh mới thành công!');
            break;
          case 'driver':
            // Create new driver with new field names
            const newDriver: Omit<Driver, 'id'> = {
              name: formData.name,
              phone: formData.phone,
              license_number: formData.license_number,
              experience: parseInt(formData.experience) || 0,
              hire_date: formData.hire_date,
              current_bus_id: formData.current_bus_id ? parseInt(formData.current_bus_id) : undefined,
              status: (formData.status as 'active' | 'inactive' | 'on_leave') || 'active',
              emergency_contact_name: formData.emergency_contact_name,
              emergency_contact_phone: formData.emergency_contact_phone,
              address: formData.address,
              notes: formData.notes
            };
            addDriver(newDriver);
            alert('Thêm tài xế mới thành công!');
            break;
          case 'bus':
            // Add bus using global context
            const newBus = {
              busNumber: formData.busNumber,
              model: 'Standard Bus',
              capacity: parseInt(formData.capacity) || 0,
              year: 2024,
              plateNumber: `${formData.busNumber}-SCHOOL`,
              status: 'Đang hoạt động',
              currentDriver: '',
              currentRoute: '',
              mileage: 0,
              fuelLevel: 100,
              lastMaintenance: new Date().toLocaleDateString('vi-VN'),
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              condition: 'Tốt'
            };
            addBus(newBus);
            alert('Thêm xe buýt mới thành công!');
            break;
        }
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error handling form submit:', error);
      alert('Có lỗi xảy ra khi xử lý dữ liệu!');
    }
  };

  const deleteItem = (type: 'schedule' | 'student' | 'driver' | 'bus', id: number) => {
    const itemNames = {
      schedule: 'lịch trình',
      student: 'học sinh', 
      driver: 'tài xế',
      bus: 'xe buýt'
    };
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa ${itemNames[type]} này không?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      switch (type) {
        case 'schedule':
          setScheduleData(prev => prev.filter(item => item.id !== id));
          alert('Xóa lịch trình thành công!');
          break;
        case 'student':
          deleteStudent(id);
          alert('Xóa học sinh thành công!');
          break;
        case 'driver':
          deleteDriver(id);
          alert('Xóa tài xế thành công!');
          break;
        case 'bus':
          deleteBus(id);
          alert('Xóa xe buýt thành công!');
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Có lỗi xảy ra khi xóa!');
    }
  };

  // Render admin content based on active tab
  const renderAdminContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard 
          adminData={{ name: user?.name || '', role: user?.role || '' }} 
          onNavigate={setActiveTab}
          onAddNew={(type) => handleAdd(type)}
        />;
      case 'schedule':
        // Transform scheduleData to legacy format for ScheduleManagement component
        const legacyScheduleData = scheduleData.map(s => ({
          id: s.id,
          route: `Tuyến ${s.route_id}`,
          time: s.start_time,
          students: s.total_students,
          driver: `Driver ${s.driver_id}`,
          bus: `Bus ${s.bus_id}`,
          status: s.status
        }));
        return (
          <ScheduleManagement
            scheduleData={legacyScheduleData as any}
            onAdd={() => handleAdd('schedule')}
            onEdit={(item) => handleEdit('schedule', item)}
            onDelete={(id) => deleteItem('schedule', id)}
          />
        );
      case 'students':
        return (
          <StudentManagement
            studentsData={studentsData}
            onAdd={() => handleAdd('student')}
            onEdit={(item) => handleEdit('student', item)}
            onDelete={(id) => deleteItem('student', id)}
          />
        );
      case 'drivers':
        return (
          <DriverManagement
            driversData={driversData}
            onAdd={() => handleAdd('driver')}
            onEdit={(item) => handleEdit('driver', item)}
            onDelete={(id) => deleteItem('driver', id)}
          />
        );
      case 'buses':
        return (
          <BusManagement
            busesData={busesData}
            onAdd={() => handleAdd('bus')}
            onEdit={(item) => handleEdit('bus', item)}
            onDelete={(id) => deleteItem('bus', id)}
          />
        );
      case 'tracking':
        return <LocationTracking />;
      case 'notifications':
        return <NotificationCenter />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <AdminDashboard 
          adminData={{ name: user?.name || '', role: user?.role || '' }} 
          onNavigate={setActiveTab}
          onAddNew={(type) => handleAdd(type)}
        />;
    }
  }, [activeTab, user, scheduleData, studentsData, driversData, busesData]);

  // Generate dynamic options from current data
  const generateDriverOptions = () => {
    return driversData.map(driver => ({
      value: driver.name,
      label: `${driver.name} (${driver.experience} năm kinh nghiệm)`
    }));
  };

  const generateBusOptions = () => {
    return busesData.map(bus => ({
      value: bus.busNumber,
      label: `${bus.busNumber} (${bus.capacity} chỗ ngồi)`
    }));
  };

  const generateRouteOptions = () => {
    // Get unique routes from existing schedules + default routes
    const existingRoutes = scheduleData.map(s => `Tuyến ${s.route_id}`);
    const defaultRoutes = ['Tuyến A1', 'Tuyến B2', 'Tuyến C3', 'Tuyến D4', 'Tuyến E5'];
    const allRoutes = [...new Set([...defaultRoutes, ...existingRoutes])];
    
    return allRoutes.map(route => ({
      value: route,
      label: `${route} - Khu vực`
    }));
  };

  // Get form fields for modal
  const getFormFields = (): FormField[] => {
    switch (modalType) {
      case 'schedule':
        return [
          { 
            name: 'route_id', 
            label: 'Tuyến đường', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn tuyến đường cho lịch trình',
            options: generateRouteOptions()
          },
          { name: 'schedule_date', label: 'Ngày lịch trình', type: 'date', required: true, placeholder: 'Chọn ngày thực hiện lịch trình' },
          { 
            name: 'schedule_type', 
            label: 'Loại lịch trình', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn loại lịch trình',
            options: [
              { value: 'morning', label: '🌅 Buổi sáng (Đưa đến trường)' },
              { value: 'afternoon', label: '🌆 Buổi chiều (Đón về nhà)' }
            ]
          },
          { name: 'start_time', label: 'Giờ bắt đầu', type: 'time', required: true, placeholder: 'VD: 07:00 (giờ bắt đầu chuyến)' },
          { name: 'end_time', label: 'Giờ kết thúc', type: 'time', required: true, placeholder: 'VD: 08:30 (giờ dự kiến kết thúc)' },
          { name: 'total_students', label: 'Số học sinh', type: 'number', required: true, placeholder: 'VD: 25 (số học sinh trên chuyến)' },
          { 
            name: 'driver_id', 
            label: 'Tài xế', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn tài xế phụ trách',
            options: generateDriverOptions()
          },
          { 
            name: 'bus_id', 
            label: 'Xe buýt', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn xe buýt sử dụng',
            options: generateBusOptions()
          },
          { 
            name: 'status', 
            label: 'Trạng thái', 
            type: 'select', 
            placeholder: 'Chọn trạng thái lịch trình',
            options: [
              { value: 'scheduled', label: '📅 Đã lên lịch' },
              { value: 'in_progress', label: '🚌 Đang chạy' },
              { value: 'completed', label: '✅ Hoàn thành' },
              { value: 'cancelled', label: '❌ Đã hủy' }
            ], 
            required: true 
          },
          { name: 'notes', label: 'Ghi chú', type: 'textarea', required: false, placeholder: 'VD: Lưu ý đặc biệt cho chuyến đi' }
        ];
      case 'student':
        return [
          { name: 'name', label: 'Họ tên', type: 'text', required: true, placeholder: 'VD: Nguyễn Văn An' },
          { name: 'student_code', label: 'Mã học sinh', type: 'text', required: true, placeholder: 'VD: HS001, HS002' },
          { name: 'date_of_birth', label: 'Ngày sinh', type: 'date', required: true, placeholder: 'Chọn ngày sinh' },
          { 
            name: 'gender', 
            label: 'Giới tính', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn giới tính',
            options: [
              { value: 'male', label: '👦 Nam' },
              { value: 'female', label: '👧 Nữ' }
            ]
          },
          { name: 'grade', label: 'Khối', type: 'text', required: true, placeholder: 'VD: 6, 7, 8, 9' },
          { name: 'class', label: 'Lớp', type: 'text', required: true, placeholder: 'VD: 6A, 7B, 8C' },
          { name: 'address', label: 'Địa chỉ', type: 'text', required: true, placeholder: 'VD: 123 Đường ABC, Quận 1, TP.HCM' },
          { name: 'pickup_address', label: 'Điểm đón', type: 'text', required: true, placeholder: 'VD: Ngã tư ABC, gần siêu thị XYZ' },
          { name: 'dropoff_address', label: 'Điểm trả', type: 'text', required: true, placeholder: 'VD: Cổng trường THCS XYZ' },
          { 
            name: 'school_id', 
            label: 'Trường học', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn trường học',
            options: [] // TODO: Add school options from database
          },
          { 
            name: 'route_id', 
            label: 'Tuyến đường', 
            type: 'select', 
            required: false,
            placeholder: 'Chọn tuyến đường (tùy chọn)',
            options: generateRouteOptions()
          },
          { 
            name: 'stop_id', 
            label: 'Điểm dừng', 
            type: 'select', 
            required: false,
            placeholder: 'Chọn điểm dừng (tùy chọn)',
            options: [] // TODO: Add stop options based on selected route
          },
          { 
            name: 'status', 
            label: 'Trạng thái', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn trạng thái',
            options: [
              { value: 'active', label: '✅ Đang học' },
              { value: 'inactive', label: '⏸️ Tạm nghỉ' },
              { value: 'transferred', label: '🔄 Chuyển trường' },
              { value: 'graduated', label: '🎓 Tốt nghiệp' }
            ]
          },
          { name: 'medical_notes', label: 'Ghi chú y tế', type: 'textarea', required: false, placeholder: 'VD: Dị ứng thuốc kháng sinh' },
          { name: 'allergies', label: 'Dị ứng', type: 'textarea', required: false, placeholder: 'VD: Dị ứng hải sản, phấn hoa' },
          { name: 'emergency_instructions', label: 'Hướng dẫn khẩn cấp', type: 'textarea', required: false, placeholder: 'VD: Liên hệ bố mẹ ngay khi có vấn đề' }
        ];
      case 'driver':
        return [
          { name: 'name', label: 'Họ tên', type: 'text', required: true, placeholder: 'VD: Trần Văn Tài Xế' },
          { name: 'phone', label: 'Điện thoại', type: 'text', required: true, placeholder: 'VD: 0987654321' },
          { name: 'license_number', label: 'Số bằng lái', type: 'text', required: true, placeholder: 'VD: D123456789' },
          { name: 'experience', label: 'Kinh nghiệm (năm)', type: 'number', required: true, placeholder: 'VD: 5 (số năm kinh nghiệm lái xe)' },
          { name: 'hire_date', label: 'Ngày tuyển dụng', type: 'date', required: true, placeholder: 'Chọn ngày bắt đầu làm việc' },
          { 
            name: 'current_bus_id', 
            label: 'Xe buýt phụ trách', 
            type: 'select', 
            required: false,
            placeholder: 'Chọn xe buýt để phụ trách (tùy chọn)',
            options: generateBusOptions()
          },
          { 
            name: 'status', 
            label: 'Trạng thái', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn trạng thái làm việc',
            options: [
              { value: 'active', label: '✅ Đang làm việc' },
              { value: 'inactive', label: '⏸️ Tạm nghỉ' },
              { value: 'on_leave', label: '🏖️ Nghỉ phép' }
            ]
          },
          { name: 'emergency_contact_name', label: 'Người liên hệ khẩn cấp', type: 'text', required: false, placeholder: 'VD: Nguyễn Thị Vợ' },
          { name: 'emergency_contact_phone', label: 'SĐT liên hệ khẩn cấp', type: 'text', required: false, placeholder: 'VD: 0912345678' },
          { name: 'address', label: 'Địa chỉ', type: 'text', required: false, placeholder: 'VD: 123 Đường ABC, Quận 1' },
          { name: 'notes', label: 'Ghi chú', type: 'textarea', required: false, placeholder: 'VD: Ghi chú về tài xế' }
        ];
      case 'bus':
        return [
          { name: 'busNumber', label: 'Số xe', type: 'text', required: true, placeholder: 'VD: BS001, XB-123.45' },
          { name: 'capacity', label: 'Sức chứa', type: 'number', required: true, placeholder: 'VD: 45 (số ghế ngồi tối đa)' },
          { 
            name: 'currentDriver', 
            label: 'Tài xế phụ trách', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn tài xế phụ trách xe này',
            options: generateDriverOptions()
          },
          { 
            name: 'currentRoute', 
            label: 'Tuyến đường', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn tuyến đường hoạt động',
            options: generateRouteOptions()
          },
          { name: 'status', label: 'Trạng thái', type: 'select', placeholder: 'Chọn trạng thái hoạt động', options: [
            { value: 'Hoạt động', label: '✅ Hoạt động' },
            { value: 'Bảo trì', label: '🔧 Bảo trì' },
            { value: 'Ngừng hoạt động', label: '❌ Ngừng hoạt động' }
          ], required: true }
        ];
      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = editingItem ? 'Chỉnh sửa' : 'Thêm mới';
    const type = modalType === 'schedule' ? 'Lịch trình' :
                 modalType === 'student' ? 'Học sinh' :
                 modalType === 'driver' ? 'Tài xế' :
                 modalType === 'bus' ? 'Xe buýt' : 'Mục';
    return `${action} ${type}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentTime={currentTime}
          onLogout={onLogout}
          user={user}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderAdminContent}
        </main>
      </div>
      
      <Modal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        title={getModalTitle()}
      >
        <Form
          fields={getFormFields().map(field => ({
            ...field,
            defaultValue: editingItem ? editingItem[field.name] : field.defaultValue
          }))}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
          isEditing={!!editingItem}
        />
      </Modal>
    </div>
  );
};