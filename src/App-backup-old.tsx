import { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';
import DriverDashboard from './components/dashboard/DriverDashboard';
import Dashboard from './components/dashboard/Dashboard';
import ScheduleManagement from './components/management/ScheduleManagement';
import StudentManagement from './components/management/StudentManagement';
import DriverManagement from './components/management/DriverManagement';
import BusManagement from './components/management/BusManagement';
import LocationTracking from './components/tracking/LocationTracking';
import NotificationCenter from './components/notifications/NotificationCenter';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Modal from './components/shared/Modal';
import Form from './components/shared/Form';

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'admin' | 'parent' | 'driver' | null>(null);

  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // States for dynamic data
  const [scheduleData, setScheduleData] = useState([
    { id: 1, route: 'Tuyến A1', time: '07:00', driver: 'Nguyễn Văn A', bus: 'BS001', students: 25, status: 'Đang chạy' },
    { id: 2, route: 'Tuyến B2', time: '07:15', driver: 'Trần Thị B', bus: 'BS002', students: 30, status: 'Chờ khởi hành' },
    { id: 3, route: 'Tuyến C3', time: '07:30', driver: 'Lê Văn C', bus: 'BS003', students: 22, status: 'Hoàn thành' }
  ]);

  const [studentsData, setStudentsData] = useState([
    { id: 1, name: 'Nguyễn Minh An', class: '6A', route: 'Tuyến A1', status: 'Đang di chuyển' },
    { id: 2, name: 'Trần Thị Bình', class: '7B', route: 'Tuyến B2', status: 'Đã đến trường' },
    { id: 3, name: 'Lê Văn Cường', class: '8C', route: 'Tuyến C3', status: 'Chờ đón' }
  ]);

  const [driversData, setDriversData] = useState([
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', license: 'B2', experience: 8, status: 'Đang lái', currentRoute: 'Tuyến A1', currentBus: 'BS001' },
    { id: 2, name: 'Trần Thị B', phone: '0907654321', license: 'B2', experience: 5, status: 'Đang lái', currentRoute: 'Tuyến B2', currentBus: 'BS002' },
    { id: 3, name: 'Lê Văn C', phone: '0909876543', license: 'B2', experience: 12, status: 'Sẵn sàng', currentRoute: '', currentBus: '' },
    { id: 4, name: 'Phạm Minh D', phone: '0903456789', license: 'B2', experience: 3, status: 'Nghỉ phép', currentRoute: '', currentBus: '' }
  ]);

  const [busesData, setBusesData] = useState([
    { 
      id: 1, 
      busNumber: 'BS001', 
      model: 'Hyundai Universe', 
      capacity: 45, 
      year: 2020, 
      plateNumber: '29A-12345', 
      status: 'Hoạt động', 
      currentDriver: 'Nguyễn Văn A', 
      currentRoute: 'Tuyến A1', 
      mileage: 45000, 
      fuelLevel: 75, 
      lastMaintenance: '15/08/2024', 
      nextMaintenance: '15/11/2024', 
      condition: 'Tốt' 
    },
    { 
      id: 2, 
      busNumber: 'BS002', 
      model: 'Mercedes-Benz Citaro', 
      capacity: 40, 
      year: 2019, 
      plateNumber: '29A-67890', 
      status: 'Hoạt động', 
      currentDriver: 'Trần Thị B', 
      currentRoute: 'Tuyến B2', 
      mileage: 52000, 
      fuelLevel: 85, 
      lastMaintenance: '20/08/2024', 
      nextMaintenance: '20/11/2024', 
      condition: 'Tốt' 
    },
    { 
      id: 3, 
      busNumber: 'BS003', 
      model: 'Isuzu NPR', 
      capacity: 35, 
      year: 2018, 
      plateNumber: '29A-11111', 
      status: 'Bảo trì', 
      mileage: 78000, 
      fuelLevel: 30, 
      lastMaintenance: '01/09/2024', 
      nextMaintenance: '01/12/2024', 
      condition: 'Khá' 
    },
    { 
      id: 4, 
      busNumber: 'BS004', 
      model: 'Thaco Universe', 
      capacity: 50, 
      year: 2021, 
      plateNumber: '29A-22222', 
      status: 'Hỏng hóc', 
      mileage: 25000, 
      fuelLevel: 15, 
      lastMaintenance: '10/08/2024', 
      nextMaintenance: '10/11/2024', 
      condition: 'Kém' 
    }
  ]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // CRUD Functions for Schedule
  const addSchedule = (newSchedule: any) => {
    const id = Math.max(...scheduleData.map(s => s.id)) + 1;
    setScheduleData([...scheduleData, { ...newSchedule, id, students: Number(newSchedule.students) }]);
    setShowModal(false);
    alert('Đã thêm lịch trình thành công!');
  };

  const editSchedule = (id: any, updatedSchedule: any) => {
    setScheduleData(scheduleData.map(s => s.id === id ? { ...updatedSchedule, id, students: Number(updatedSchedule.students) } : s));
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
    setDriversData([...driversData, { ...newDriver, id, experience: Number(newDriver.experience) }]);
    setShowModal(false);
    alert('Đã thêm tài xế thành công!');
  };

  const editDriver = (id: any, updatedDriver: any) => {
    setDriversData(driversData.map(d => d.id === id ? { ...updatedDriver, id, experience: Number(updatedDriver.experience) } : d));
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
    setBusesData([...busesData, { 
      ...newBus, 
      id, 
      capacity: Number(newBus.capacity),
      year: Number(newBus.year),
      mileage: Number(newBus.mileage || 0),
      fuelLevel: Number(newBus.fuelLevel || 100)
    }]);
    setShowModal(false);
    alert('Đã thêm xe buýt thành công!');
  };

  const editBus = (id: any, updatedBus: any) => {
    setBusesData(busesData.map(b => b.id === id ? { 
      ...updatedBus, 
      id, 
      capacity: Number(updatedBus.capacity),
      year: Number(updatedBus.year),
      mileage: Number(updatedBus.mileage),
      fuelLevel: Number(updatedBus.fuelLevel)
    } : b));
    setShowModal(false);
    alert('Đã cập nhật thông tin xe buýt thành công!');
  };

  const deleteBus = (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa xe buýt này?')) {
      setBusesData(busesData.filter(b => b.id !== id));
      alert('Đã xóa xe buýt thành công!');
    }
  };

  // Modal handlers
  const handleAddSchedule = () => {
    setModalType('schedule');
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditSchedule = (schedule: any) => {
    setModalType('schedule');
    setEditingItem(schedule);
    setShowModal(true);
  };

  const handleAddStudent = () => {
    setModalType('student');
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditStudent = (student: any) => {
    setModalType('student');
    setEditingItem(student);
    setShowModal(true);
  };

  const handleAddDriver = () => {
    setModalType('driver');
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditDriver = (driver: any) => {
    setModalType('driver');
    setEditingItem(driver);
    setShowModal(true);
  };

  const handleAddBus = () => {
    setModalType('bus');
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditBus = (bus: any) => {
    setModalType('bus');
    setEditingItem(bus);
    setShowModal(true);
  };

  // Form submit handler
  const handleFormSubmit = (data: any) => {
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
    }
  };

  // Get form fields based on modal type
  const getFormFields = () => {
    if (modalType === 'schedule') {
      return [
        { name: 'route', type: 'text' as const, placeholder: 'Tuyến (VD: Tuyến A1)', required: true, defaultValue: editingItem?.route || '' },
        { name: 'time', type: 'time' as const, placeholder: 'Giờ khởi hành', required: true, defaultValue: editingItem?.time || '' },
        { name: 'driver', type: 'text' as const, placeholder: 'Tên tài xế', required: true, defaultValue: editingItem?.driver || '' },
        { name: 'bus', type: 'text' as const, placeholder: 'Mã xe (VD: BS001)', required: true, defaultValue: editingItem?.bus || '' },
        { name: 'students', type: 'number' as const, placeholder: 'Số học sinh', required: true, defaultValue: editingItem?.students || '' },
        { 
          name: 'status', 
          type: 'select' as const, 
          required: true, 
          defaultValue: editingItem?.status || 'Chờ khởi hành',
          placeholder: 'Trạng thái',
          options: [
            { value: 'Chờ khởi hành', label: 'Chờ khởi hành' },
            { value: 'Đang chạy', label: 'Đang chạy' },
            { value: 'Hoàn thành', label: 'Hoàn thành' }
          ]
        }
      ];
    } else if (modalType === 'student') {
      return [
        { name: 'name', type: 'text' as const, placeholder: 'Tên học sinh', required: true, defaultValue: editingItem?.name || '' },
        { name: 'class', type: 'text' as const, placeholder: 'Lớp (VD: 6A)', required: true, defaultValue: editingItem?.class || '' },
        { name: 'route', type: 'text' as const, placeholder: 'Tuyến (VD: Tuyến A1)', required: true, defaultValue: editingItem?.route || '' },
        { 
          name: 'status', 
          type: 'select' as const, 
          required: true, 
          defaultValue: editingItem?.status || 'Chờ đón',
          placeholder: 'Trạng thái',
          options: [
            { value: 'Chờ đón', label: 'Chờ đón' },
            { value: 'Đang di chuyển', label: 'Đang di chuyển' },
            { value: 'Đã đến trường', label: 'Đã đến trường' }
          ]
        }
      ];
    } else if (modalType === 'driver') {
      return [
        { name: 'name', type: 'text' as const, placeholder: 'Tên tài xế', required: true, defaultValue: editingItem?.name || '' },
        { name: 'phone', type: 'text' as const, placeholder: 'Số điện thoại (VD: 0901234567)', required: true, defaultValue: editingItem?.phone || '' },
        { name: 'license', type: 'text' as const, placeholder: 'Loại bằng lái (VD: B2)', required: true, defaultValue: editingItem?.license || '' },
        { name: 'experience', type: 'number' as const, placeholder: 'Số năm kinh nghiệm', required: true, defaultValue: editingItem?.experience || '' },
        { 
          name: 'status', 
          type: 'select' as const, 
          required: true, 
          defaultValue: editingItem?.status || 'Sẵn sàng',
          placeholder: 'Trạng thái',
          options: [
            { value: 'Sẵn sàng', label: 'Sẵn sàng' },
            { value: 'Đang lái', label: 'Đang lái' },
            { value: 'Nghỉ phép', label: 'Nghỉ phép' },
            { value: 'Không hoạt động', label: 'Không hoạt động' }
          ]
        },
        { name: 'currentRoute', type: 'text' as const, placeholder: 'Tuyến hiện tại (tùy chọn)', required: false, defaultValue: editingItem?.currentRoute || '' },
        { name: 'currentBus', type: 'text' as const, placeholder: 'Xe hiện tại (tùy chọn)', required: false, defaultValue: editingItem?.currentBus || '' }
      ];
    } else if (modalType === 'bus') {
      return [
        { name: 'busNumber', type: 'text' as const, placeholder: 'Số xe (VD: BS001)', required: true, defaultValue: editingItem?.busNumber || '' },
        { name: 'model', type: 'text' as const, placeholder: 'Model xe (VD: Hyundai Universe)', required: true, defaultValue: editingItem?.model || '' },
        { name: 'plateNumber', type: 'text' as const, placeholder: 'Biển số (VD: 29A-12345)', required: true, defaultValue: editingItem?.plateNumber || '' },
        { name: 'capacity', type: 'number' as const, placeholder: 'Sức chứa (số chỗ ngồi)', required: true, defaultValue: editingItem?.capacity || '' },
        { name: 'year', type: 'number' as const, placeholder: 'Năm sản xuất', required: true, defaultValue: editingItem?.year || '' },
        { name: 'mileage', type: 'number' as const, placeholder: 'Quãng đường đã đi (km)', required: false, defaultValue: editingItem?.mileage || 0 },
        { name: 'fuelLevel', type: 'number' as const, placeholder: 'Mức nhiên liệu (%)', required: false, defaultValue: editingItem?.fuelLevel || 100 },
        { name: 'lastMaintenance', type: 'text' as const, placeholder: 'Bảo trì gần nhất (VD: 15/08/2024)', required: false, defaultValue: editingItem?.lastMaintenance || '' },
        { name: 'nextMaintenance', type: 'text' as const, placeholder: 'Bảo trì tiếp theo (VD: 15/11/2024)', required: false, defaultValue: editingItem?.nextMaintenance || '' },
        { 
          name: 'status', 
          type: 'select' as const, 
          required: true, 
          defaultValue: editingItem?.status || 'Không hoạt động',
          placeholder: 'Trạng thái',
          options: [
            { value: 'Hoạt động', label: 'Hoạt động' },
            { value: 'Bảo trì', label: 'Bảo trì' },
            { value: 'Hỏng hóc', label: 'Hỏng hóc' },
            { value: 'Không hoạt động', label: 'Không hoạt động' }
          ]
        },
        { 
          name: 'condition', 
          type: 'select' as const, 
          required: true, 
          defaultValue: editingItem?.condition || 'Tốt',
          placeholder: 'Tình trạng',
          options: [
            { value: 'Tốt', label: 'Tốt' },
            { value: 'Khá', label: 'Khá' },
            { value: 'Trung bình', label: 'Trung bình' },
            { value: 'Kém', label: 'Kém' }
          ]
        },
        { name: 'currentDriver', type: 'text' as const, placeholder: 'Tài xế hiện tại (tùy chọn)', required: false, defaultValue: editingItem?.currentDriver || '' },
        { name: 'currentRoute', type: 'text' as const, placeholder: 'Tuyến hiện tại (tùy chọn)', required: false, defaultValue: editingItem?.currentRoute || '' }
      ];
    }
    return [];
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'parent-dashboard':
        return <ParentDashboard />;
      case 'schedule':
        return (
          <ScheduleManagement
            scheduleData={scheduleData}
            onAdd={handleAddSchedule}
            onEdit={handleEditSchedule}
            onDelete={deleteSchedule}
          />
        );
      case 'students':
        return (
          <StudentManagement
            studentsData={studentsData}
            onAdd={handleAddStudent}
            onEdit={handleEditStudent}
            onDelete={deleteStudent}
          />
        );
      case 'drivers':
        return (
          <DriverManagement
            driversData={driversData}
            onAdd={handleAddDriver}
            onEdit={handleEditDriver}
            onDelete={deleteDriver}
          />
        );
      case 'buses':
        return (
          <BusManagement
            busesData={busesData}
            onAdd={handleAddBus}
            onEdit={handleEditBus}
            onDelete={deleteBus}
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
        return <Dashboard />;
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
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          currentTime={currentTime}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
      
      {/* Modal */}
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

export default App;