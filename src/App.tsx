import { useState, useEffect, useMemo } from 'react';
import Login from './components/auth/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';
import DriverDashboard from './components/dashboard/DriverDashboard';
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

// Define FormField interface locally to match the Form component
interface FormField {
  name: string;
  type: 'text' | 'time' | 'number' | 'select';
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string | number;
}

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'admin' | 'parent' | 'driver' | null>(null);

  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal state (for admin only)
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'student' | 'driver' | 'bus'>('schedule');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Sample data (this would come from API in real app)
  const [scheduleData, setScheduleData] = useState([
    { id: 1, route: 'Tuyến A1', time: '07:00', students: 15, driver: 'Nguyễn Văn A', bus: 'BS001', status: 'Hoạt động' },
    { id: 2, route: 'Tuyến B2', time: '07:15', students: 12, driver: 'Trần Thị B', bus: 'BS002', status: 'Hoạt động' },
    { id: 3, route: 'Tuyến C3', time: '07:30', students: 18, driver: 'Lê Văn C', bus: 'BS003', status: 'Tạm dừng' }
  ]);

  const [studentsData, setStudentsData] = useState([
    { id: 1, name: 'Nguyễn Minh An', class: '6A', route: 'Tuyến A1', status: 'Đang đi học' },
    { id: 2, name: 'Trần Thị Bình', class: '7B', route: 'Tuyến B2', status: 'Đã đến trường' },
    { id: 3, name: 'Lê Văn Cường', class: '8C', route: 'Tuyến C3', status: 'Chờ đón' }
  ]);

  const [driversData, setDriversData] = useState([
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', license: 'B2', experience: 8, status: 'Đang lái' },
    { id: 2, name: 'Trần Thị B', phone: '0907654321', license: 'B2', experience: 5, status: 'Đang lái' },
    { id: 3, name: 'Lê Văn C', phone: '0909876543', license: 'B2', experience: 12, status: 'Sẵn sàng' }
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
      mileage: 45000,
      fuelLevel: 85,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-07-15',
      condition: 'Tốt',
      currentDriver: 'Nguyễn Văn A',
      currentRoute: 'Tuyến A1'
    },
    { 
      id: 2, 
      busNumber: 'BS002', 
      model: 'Toyota Coaster', 
      capacity: 29, 
      year: 2021, 
      plateNumber: '29B-67890',
      status: 'Hoạt động',
      mileage: 32000,
      fuelLevel: 70,
      lastMaintenance: '2024-02-20',
      nextMaintenance: '2024-08-20',
      condition: 'Rất tốt',
      currentDriver: 'Trần Thị B',
      currentRoute: 'Tuyến B2'
    },
    { 
      id: 3, 
      busNumber: 'BS003', 
      model: 'Isuzu NPR', 
      capacity: 35, 
      year: 2019, 
      plateNumber: '29C-11111',
      status: 'Bảo trì',
      mileage: 58000,
      fuelLevel: 20,
      lastMaintenance: '2024-03-10',
      nextMaintenance: '2024-09-10',
      condition: 'Cần sửa chữa',
      currentDriver: '',
      currentRoute: ''
    }
  ]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle login
  const handleLogin = (role: 'admin' | 'parent' | 'driver', userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    setUserType(role);
    setActiveTab('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    setActiveTab('dashboard');
  };

  // Admin functions
  const handleAdd = (type: string) => {
    setModalType(type as any);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (type: string, item: any) => {
    setModalType(type as any);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingItem) {
      // Update existing item
      switch (modalType) {
        case 'schedule':
          setScheduleData(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item));
          break;
        case 'student':
          setStudentsData(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item));
          break;
        case 'driver':
          setDriversData(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item));
          break;
        case 'bus':
          setBusesData(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item));
          break;
      }
    } else {
      // Add new item
      const newId = Date.now();
      switch (modalType) {
        case 'schedule':
          setScheduleData(prev => [...prev, { id: newId, ...data }]);
          break;
        case 'student':
          setStudentsData(prev => [...prev, { id: newId, ...data }]);
          break;
        case 'driver':
          setDriversData(prev => [...prev, { id: newId, ...data }]);
          break;
        case 'bus':
          setBusesData(prev => [...prev, { id: newId, ...data }]);
          break;
      }
    }
    setShowModal(false);
  };

  // Delete functions
  const deleteItem = (type: string, id: number) => {
    switch (type) {
      case 'schedule':
        setScheduleData(prev => prev.filter(item => item.id !== id));
        break;
      case 'student':
        setStudentsData(prev => prev.filter(item => item.id !== id));
        break;
      case 'driver':
        setDriversData(prev => prev.filter(item => item.id !== id));
        break;
      case 'bus':
        setBusesData(prev => prev.filter(item => item.id !== id));
        break;
    }
  };

  // Render content for admin - memoized to prevent unnecessary re-renders
  const renderAdminContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard adminData={user} />;
      case 'schedule':
        return (
          <ScheduleManagement
            scheduleData={scheduleData}
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
        return <AdminDashboard adminData={user} />;
    }
  }, [activeTab, user, scheduleData, studentsData, driversData, busesData]);

  // Get form fields for modal
  const getFormFields = (): FormField[] => {
    switch (modalType) {
      case 'schedule':
        return [
          { name: 'route', label: 'Tuyến đường', type: 'text' as const, required: true },
          { name: 'time', label: 'Thời gian', type: 'time' as const, required: true },
          { name: 'students', label: 'Số học sinh', type: 'number' as const, required: true },
          { name: 'driver', label: 'Tài xế', type: 'text' as const, required: true },
          { name: 'status', label: 'Trạng thái', type: 'select' as const, options: [
            { value: 'Hoạt động', label: 'Hoạt động' }, 
            { value: 'Tạm dừng', label: 'Tạm dừng' }
          ], required: true }
        ];
      case 'student':
        return [
          { name: 'name', label: 'Họ tên', type: 'text' as const, required: true },
          { name: 'class', label: 'Lớp', type: 'text' as const, required: true },
          { name: 'route', label: 'Tuyến đường', type: 'text' as const, required: true },
          { name: 'status', label: 'Trạng thái', type: 'select' as const, options: [
            { value: 'Đang đi học', label: 'Đang đi học' },
            { value: 'Đã đến trường', label: 'Đã đến trường' },
            { value: 'Chờ đón', label: 'Chờ đón' }
          ], required: true }
        ];
      case 'driver':
        return [
          { name: 'name', label: 'Họ tên', type: 'text' as const, required: true },
          { name: 'phone', label: 'Số điện thoại', type: 'text' as const, required: true },
          { name: 'license', label: 'Bằng lái', type: 'text' as const, required: true },
          { name: 'experience', label: 'Kinh nghiệm (năm)', type: 'number' as const, required: true },
          { name: 'status', label: 'Trạng thái', type: 'select' as const, options: [
            { value: 'Đang lái', label: 'Đang lái' },
            { value: 'Sẵn sàng', label: 'Sẵn sàng' },
            { value: 'Nghỉ phép', label: 'Nghỉ phép' }
          ], required: true }
        ];
      case 'bus':
        return [
          { name: 'busNumber', label: 'Số xe', type: 'text' as const, required: true },
          { name: 'model', label: 'Model', type: 'text' as const, required: true },
          { name: 'capacity', label: 'Sức chứa', type: 'number' as const, required: true },
          { name: 'year', label: 'Năm sản xuất', type: 'number' as const, required: true },
          { name: 'status', label: 'Trạng thái', type: 'select' as const, options: [
            { value: 'Hoạt động', label: 'Hoạt động' },
            { value: 'Bảo trì', label: 'Bảo trì' },
            { value: 'Ngừng hoạt động', label: 'Ngừng hoạt động' }
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

  // Render different apps based on user role
  const renderApp = () => {
    if (!isAuthenticated || !userType) {
      return <Login onLogin={handleLogin} />;
    }

    switch (userType) {
      case 'admin':
        return <AdminApp />;
      case 'parent':
        return <ParentApp />;
      case 'driver':
        return <DriverApp />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  // Admin App Component (Full management system)
  const AdminApp = () => (
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
          onLogout={handleLogout}
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

  // Parent App Component (Simplified parent view)
  const ParentApp = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Smart School Bus - Phụ huynh</h1>
              <p className="text-sm text-gray-600">Xin chào, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <ParentDashboard />
    </div>
  );

  // Driver App Component (Driver-specific interface)
  const DriverApp = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Smart School Bus - Tài xế</h1>
              <p className="text-sm text-gray-600">Xin chào, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <DriverDashboard driverData={user} />
    </div>
  );

  return renderApp();
};

export default App;