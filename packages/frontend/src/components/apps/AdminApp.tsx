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

import type { User, Student, Schedule, Driver } from '../../types';
import { useStudents } from '../../contexts/StudentsContext';
import { useDrivers } from '../../contexts/DriversContext';
import { useBuses } from '../../contexts/BusesContext';
import { useSchedules } from '../../contexts/SchedulesContext';



interface AdminAppProps {
  user: User;
  onLogout: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ user, onLogout }) => {
  // Context con hooks
  const { students, addStudent, updateStudent, deleteStudent } = useStudents();
  const { drivers, addDriver, updateDriver, deleteDriver } = useDrivers();
  const { buses, addBus, updateBus, deleteBus } = useBuses();
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useSchedules();

  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'student' | 'driver' | 'bus'>('schedule');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Transform data for management components - use global data
  const studentsData = students.map((student: Student) => ({
    ma_hs: student.ma_hs,
    ho_ten: student.ho_ten || 'Chưa có tên',
    lop: student.lop || 'Chưa xác định',
    ma_phu_huynh: student.ma_phu_huynh ? String(student.ma_phu_huynh) : 'N/A',
    ma_diem_don: student.ma_diem_don || 'Chưa xác định',
    ma_diem_tra: student.ma_diem_tra || 'Chưa xác định',
    trang_thai: student.trang_thai || 'Chưa xác định'
  }));
  
  // Transform global drivers data for AdminApp format
  const driversData = useMemo(() => drivers.map((driver: Driver) => ({
    ma_tai_xe: driver.ma_tai_xe,
    ho_ten: driver.ho_ten || 'Chưa có tên',
    so_dien_thoai: driver.so_dien_thoai || 'Chưa có SĐT',
    so_gplx: driver.so_gplx || 'Chưa có GPLX',
    trang_thai: driver.trang_thai || 'Chưa xác định',
    ma_ql: driver.ma_ql ? `BS${driver.ma_ql}` : 'Chưa phân xe',
    tai_khoan: driver.tai_khoan || '',
    mat_khau: driver.mat_khau || ''
  })), [drivers]);
  
  // Use global buses data directly
  const busesData = buses;

  // Update current time
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Use ref to track sync state and prevent infinite loops
  // Removed unused lastSyncRef

  // Nếu cần đồng bộ vị trí xe buýt, hãy chuyển logic này sang BusesContext hoặc LocationTracking

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

  const handleFormSubmit = async (formData: any) => {
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
            // UpdateSchedule method with database field names
            await updateSchedule(editingItem.ma_lich, {
              ma_tuyen: Number(formData.ma_tuyen),
              ma_xe: Number(formData.ma_xe),
              ma_tai_xe: Number(formData.ma_tai_xe),
              ngay_chay: formData.ngay_chay,
              gio_bat_dau: formData.gio_bat_dau,
              gio_ket_thuc: formData.gio_ket_thuc,
              trang_thai_lich: formData.trang_thai_lich
            });
            alert('Cập nhật lịch trình thành công!');
            break;
          case 'student':
            // Update student với các trường hợp lệ
            const studentUpdate: Partial<Student> = {
              ho_ten: formData.ho_ten,
              lop: formData.lop,
              ma_phu_huynh: Number(formData.ma_phu_huynh),
              ma_diem_don: Number(formData.ma_diem_don),
              ma_diem_tra: Number(formData.ma_diem_tra),
              trang_thai: formData.trang_thai
            };
            await updateStudent(editingItem.ma_hoc_sinh, studentUpdate);
            alert('Cập nhật học sinh thành công!');
            break;
          case 'driver':
            // Update driver với các trường hợp lệ
            const driverUpdate: Partial<Driver> = {
              ho_ten: formData.ho_ten,
              so_dien_thoai: formData.so_dien_thoai,
              so_gplx: formData.so_gplx,
              trang_thai: formData.trang_thai,
              tai_khoan: formData.tai_khoan,
              mat_khau: formData.mat_khau,
              ma_ql: formData.ma_ql ? Number(formData.ma_ql) : null
            };
            await updateDriver(editingItem.ma_tai_xe, driverUpdate);
            alert('Cập nhật tài xế thành công!');
            break;
          case 'bus':
            // Update bus in global context with correct database fields
            const busUpdate: Partial<import('../../types').Bus> = {
              bien_so: formData.bien_so,
              suc_chua: Number(formData.suc_chua),
              ma_tai_xe: formData.ma_tai_xe && formData.ma_tai_xe !== '' ? Number(formData.ma_tai_xe) : null,
              trang_thai: formData.trang_thai
            };
            console.log('Bus update data:', busUpdate); // Debug log
            await updateBus(editingItem.ma_xe, busUpdate);
            alert('Cập nhật xe buýt thành công!');
            break;
        }
      } else {
  // Add new item with correct backend fields
        switch (modalType) {
          case 'schedule':
            // addSchedule method
            const newScheduleData: Omit<Schedule, 'ma_lich'> = {
              ma_tuyen: Number(formData.ma_tuyen),
              ma_xe: Number(formData.ma_xe),
              ma_tai_xe: Number(formData.ma_tai_xe),
              ngay_chay: formData.ngay_chay,
              gio_bat_dau: formData.gio_bat_dau,
              gio_ket_thuc: formData.gio_ket_thuc,
              trang_thai_lich: formData.trang_thai_lich
            };
            await addSchedule(newScheduleData);
            alert('Thêm lịch trình mới thành công!');
            break;
          case 'student':
            // Tạo mới student với các trường hợp lệ
            const newStudentData: Omit<Student, 'ma_hoc_sinh'> = {
              ma_hs: formData.ma_hs,
              ho_ten: formData.ho_ten,
              lop: formData.lop,
              ma_phu_huynh: Number(formData.ma_phu_huynh),
              ma_diem_don: Number(formData.ma_diem_don),
              ma_diem_tra: Number(formData.ma_diem_tra),
              trang_thai: formData.trang_thai
            };
            await addStudent(newStudentData);
            alert('Thêm học sinh mới thành công!');
            break;
          case 'driver':
            // Tạo mới driver với các trường hợp lệ
            const newDriver: Omit<Driver, 'ma_tai_xe'> = {
              ho_ten: formData.ho_ten,
              so_dien_thoai: formData.so_dien_thoai,
              so_gplx: formData.so_gplx,
              trang_thai: formData.trang_thai,
              tai_khoan: formData.tai_khoan,
              mat_khau: formData.mat_khau,
              ma_ql: formData.ma_ql ? Number(formData.ma_ql) : null
            };
            await addDriver(newDriver);
            alert('Thêm tài xế mới thành công!');
            break;
          case 'bus':
            // Add bus using global context with correct database fields
            const newBus: Omit<import('../../types').Bus, 'ma_xe'> = {
              bien_so: formData.bien_so,
              suc_chua: Number(formData.suc_chua),
              ma_tai_xe: formData.ma_tai_xe && formData.ma_tai_xe !== '' ? Number(formData.ma_tai_xe) : null,
              trang_thai: formData.trang_thai
            };
            console.log('New bus data:', newBus); // Debug log
            await addBus(newBus);
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
          deleteSchedule(id);
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
          adminData={{ name: user?.ten || '', role: user?.role || '' }} 
          onNavigate={setActiveTab}
          onAddNew={(type) => handleAdd(type)}
        />;
      case 'schedule':
  // scheduleData is already transformed to display format
        // Just pass it directly to ScheduleManagement component
        return (
          <ScheduleManagement
            schedules={schedules}
            onAdd={() => handleAdd('schedule')}
            onEdit={(item) => handleEdit('schedule', item)}
            onDelete={(id) => deleteItem('schedule', id)}
          />
        );
      case 'students':
        return <StudentManagement />;
      case 'drivers':
        return (
          <DriverManagement
            driversData={drivers}
            onAdd={handleAdd.bind(null, 'driver')}
            onEdit={handleEdit.bind(null, 'driver')}
            onDelete={deleteItem.bind(null, 'driver')}
          />
        );
      case 'buses':
        return <BusManagement busesData={busesData} onAdd={handleAdd.bind(null, 'bus')} onEdit={handleEdit.bind(null, 'bus')} onDelete={deleteItem.bind(null, 'bus')} />;
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
          adminData={{ name: user?.ten || '', role: user?.role || '' }} 
          onNavigate={setActiveTab}
          onAddNew={(type) => handleAdd(type)}
        />;
    }
  }, [activeTab, user, schedules, studentsData, driversData, busesData]);

  // Generate dynamic options from current data
  const generateDriverOptions = () => {
    // Guard against non-array driversData
    const safeDriversData = Array.isArray(driversData) ? driversData : [];
    return safeDriversData.map((driver) => ({
      value: driver.ma_tai_xe,  // Use ma_tai_xe (driver ID) as value
      label: `${driver.ho_ten} (ID: ${driver.ma_tai_xe})`  // Display name with ID
    }));
  };

  const generateBusOptions = () => {
    // Guard against non-array busesData
    const safeBusesData = Array.isArray(busesData) ? busesData : [];
    return safeBusesData.map(bus => ({
      value: bus.ma_xe,  // Use ma_xe (bus ID) as value
      label: `${bus.bien_so} (${bus.suc_chua} chỗ ngồi)`
    }));
  };

  const generateRouteOptions = () => {
    // TODO: Replace with actual routes from RouteContext when available
    // For now, create options from existing schedules or use mock data
    const uniqueRoutes = new Map<number, string>();
    
    // Get routes from schedules
    schedules.forEach((s: Schedule) => {
      if (s.ma_tuyen && !uniqueRoutes.has(s.ma_tuyen)) {
        const routeName = s.tuyen?.ten_tuyen || `Tuyến ${s.ma_tuyen}`;
        uniqueRoutes.set(s.ma_tuyen, routeName);
      }
    });
    
    // Add default routes if empty
    if (uniqueRoutes.size === 0) {
      [1, 2, 3, 4, 5].forEach(id => uniqueRoutes.set(id, `Tuyến ${id}`));
    }
    
    return Array.from(uniqueRoutes.entries()).map(([id, name]) => ({
      value: id,  // Use ma_tuyen (route ID) as value
      label: name
    }));
  };

  const generateParentOptions = () => {
    // TODO: Replace with actual parents data from context
    // For now return empty array with placeholder option
    return [
      { value: '1', label: 'Nguyễn Văn A (Phụ huynh mẫu)' },
      { value: '2', label: 'Trần Thị B (Phụ huynh mẫu)' }
    ];
  };

  const generateStopOptions = () => {
    // TODO: Replace with actual stops data from context
    // For now return empty array with placeholder option
    return [
      { value: '1', label: 'Trạm 1 - Ngã tư ABC' },
      { value: '2', label: 'Trạm 2 - Cổng trường' }
    ];
  };

  // Get form fields for modal
  // Replace with correct type or any if FormField is not defined
  const getFormFields = (): any[] => {
    switch (modalType) {
      case 'schedule':
        return [
          { 
            name: 'ma_tuyen', 
            label: 'Tuyến đường', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn tuyến đường cho lịch trình',
            options: generateRouteOptions(),
            defaultValue: editingItem?.ma_tuyen
          },
          { 
            name: 'ma_tai_xe', 
            label: 'Tài xế', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn tài xế phụ trách',
            options: generateDriverOptions(),
            defaultValue: editingItem?.ma_tai_xe
          },
          { 
            name: 'ma_xe', 
            label: 'Xe buýt', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn xe buýt sử dụng',
            options: generateBusOptions(),
            defaultValue: editingItem?.ma_xe
          },
          { 
            name: 'ngay_chay', 
            label: 'Ngày lịch trình', 
            type: 'date', 
            required: true, 
            placeholder: 'Chọn ngày thực hiện lịch trình',
            defaultValue: editingItem?.ngay_chay
          },
          { 
            name: 'gio_bat_dau', 
            label: 'Giờ bắt đầu', 
            type: 'time', 
            required: true, 
            placeholder: 'VD: 07:00 (giờ bắt đầu chuyến)',
            defaultValue: editingItem?.gio_bat_dau
          },
          { 
            name: 'gio_ket_thuc', 
            label: 'Giờ kết thúc', 
            type: 'time', 
            required: true, 
            placeholder: 'VD: 08:30 (giờ dự kiến kết thúc)',
            defaultValue: editingItem?.gio_ket_thuc
          },
          { 
            name: 'trang_thai_lich', 
            label: 'Trạng thái', 
            type: 'select', 
            placeholder: 'Chọn trạng thái lịch trình',
            options: [
              { value: 'cho_chay', label: '📅 Chờ chạy' },
              { value: 'dang_chay', label: '🚌 Đang chạy' },
              { value: 'hoan_thanh', label: '✅ Hoàn thành' },
              { value: 'huy', label: '❌ Đã hủy' }
            ], 
            required: true,
            defaultValue: editingItem?.trang_thai_lich
          }
        ];
      case 'student':
        return [
          { name: 'ho_ten', label: 'Họ tên', type: 'text', required: true, placeholder: 'VD: Nguyễn Văn An', defaultValue: editingItem?.ho_ten },
          { name: 'ma_hs', label: 'Mã học sinh', type: 'text', required: true, placeholder: 'VD: HS001, HS002', defaultValue: editingItem?.ma_hs },
          { name: 'lop', label: 'Lớp', type: 'text', required: true, placeholder: 'VD: 6A, 7B, 8C', defaultValue: editingItem?.lop },
          { 
            name: 'ma_phu_huynh', 
            label: 'Phụ huynh', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn phụ huynh',
            options: generateParentOptions(),
            defaultValue: editingItem?.ma_phu_huynh
          },
          { 
            name: 'ma_diem_don', 
            label: 'Điểm đón', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn điểm đón',
            options: generateStopOptions(),
            defaultValue: editingItem?.ma_diem_don
          },
          { 
            name: 'ma_diem_tra', 
            label: 'Điểm trả', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn điểm trả',
            options: generateStopOptions(),
            defaultValue: editingItem?.ma_diem_tra
          },
          { 
            name: 'trang_thai', 
            label: 'Trạng thái', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn trạng thái',
            options: [
              { value: 'dang_hoc', label: '✅ Đang học' },
              { value: 'nghi_hoc', label: '⏸️ Tạm nghỉ' },
              { value: 'chuyen_truong', label: '🔄 Chuyển trường' },
              { value: 'tot_nghiep', label: '🎓 Tốt nghiệp' }
            ],
            defaultValue: editingItem?.trang_thai
          }
        ];
      case 'driver':
        return [
          { name: 'ho_ten', label: 'Họ tên', type: 'text', required: true, placeholder: 'VD: Trần Văn Tài Xế', defaultValue: editingItem?.ho_ten },
          { name: 'so_dien_thoai', label: 'Điện thoại', type: 'text', required: true, placeholder: 'VD: 0987654321', defaultValue: editingItem?.so_dien_thoai },
          { name: 'so_gplx', label: 'Số bằng lái', type: 'text', required: true, placeholder: 'VD: D123456789', defaultValue: editingItem?.so_gplx },
          { name: 'tai_khoan', label: 'Tài khoản', type: 'text', required: true, placeholder: 'VD: driver01', defaultValue: editingItem?.tai_khoan },
          { name: 'mat_khau', label: 'Mật khẩu', type: 'text', required: !editingItem, placeholder: 'Để trống nếu không đổi mật khẩu' },
          { 
            name: 'ma_ql', 
            label: 'Quản lý', 
            type: 'select', 
            required: false,
            placeholder: 'Chọn quản lý (tùy chọn)',
            options: [{ value: '', label: 'Không có' }],
            defaultValue: editingItem?.ma_ql
          },
          { 
            name: 'trang_thai', 
            label: 'Trạng thái', 
            type: 'select', 
            required: true,
            placeholder: 'Chọn trạng thái làm việc',
            options: [
              { value: 'dang_lam', label: '✅ Đang làm việc' },
              { value: 'nghi_viec', label: '⏸️ Nghỉ việc' },
              { value: 'nghi_phep', label: '🏖️ Nghỉ phép' }
            ],
            defaultValue: editingItem?.trang_thai
          }
        ];
      case 'bus':
        return [
          { 
            name: 'bien_so', 
            label: 'Biển số xe', 
            type: 'text', 
            required: true, 
            placeholder: 'VD: 30A-10001, 29B-12345',
            defaultValue: editingItem?.bien_so
          },
          { 
            name: 'suc_chua', 
            label: 'Sức chứa', 
            type: 'number', 
            required: true, 
            placeholder: 'VD: 40 (số ghế ngồi tối đa)',
            defaultValue: editingItem?.suc_chua
          },
          { 
            name: 'ma_tai_xe', 
            label: 'Tài xế phụ trách', 
            type: 'select', 
            required: false,
            placeholder: 'Chọn tài xế phụ trách xe này (không bắt buộc)',
            options: generateDriverOptions(),
            defaultValue: editingItem?.ma_tai_xe
          },
          { 
            name: 'trang_thai', 
            label: 'Trạng thái', 
            type: 'select', 
            placeholder: 'Chọn trạng thái xe buýt', 
            options: [
              { value: 'san_sang', label: '✅ Sẵn sàng' },
              { value: 'dang_su_dung', label: '🚌 Đang sử dụng' },
              { value: 'bao_duong', label: '🔧 Bảo dưỡng' }
            ], 
            required: true,
            defaultValue: editingItem?.trang_thai
          }
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
          fields={getFormFields()}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
          isEditing={!!editingItem}
        />
      </Modal>
    </div>
  );
};