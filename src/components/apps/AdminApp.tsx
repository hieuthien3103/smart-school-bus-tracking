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

import type { User, FormField } from '../../types';
import { mockScheduleData, mockStudentsData, mockDriversData, mockBusesData } from '../../services/mockData';



interface AdminAppProps {
  user: User;
  onLogout: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ user, onLogout }) => {
  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'student' | 'driver' | 'bus'>('schedule');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data states
  const [scheduleData, setScheduleData] = useState(mockScheduleData);
  
  // Transform data for management components
  const [studentsData, setStudentsData] = useState(() => 
    mockStudentsData.map(student => ({
      id: student.id,
      name: student.name,
      class: student.grade,
      route: student.bus,
      status: student.status
    }))
  );
  
  const [driversData, setDriversData] = useState(() => 
    mockDriversData.map(driver => ({
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      experience: parseInt(driver.experience.replace(' năm', '')) || 0,
      status: driver.status,
      currentRoute: driver.bus.replace('BS', 'Tuyến '),
      currentBus: driver.bus
    }))
  );
  
  const [busesData, setBusesData] = useState(() => 
    mockBusesData.map(bus => ({
      id: bus.id,
      busNumber: bus.number,
      model: 'Standard Bus',
      capacity: bus.capacity,
      year: 2020,
      plateNumber: `${bus.number}-SCHOOL`,
      status: bus.status,
      currentDriver: bus.driver,
      currentRoute: bus.route,
      mileage: Math.floor(Math.random() * 100000),
      fuelLevel: Math.floor(Math.random() * 100),
      lastMaintenance: bus.lastMaintenance,
      nextMaintenance: bus.nextMaintenance,
      condition: 'Tốt'
    }))
  );

  // Update current time
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    if (editingItem) {
      // Edit existing item
      switch (modalType) {
        case 'schedule':
          setScheduleData(prev => prev.map(item => 
            item.id === editingItem.id ? { ...item, ...formData } : item
          ));
          break;
        case 'student':
          setStudentsData(prev => prev.map(item => 
            item.id === editingItem.id ? { ...item, ...formData } : item
          ));
          break;
        case 'driver':
          setDriversData(prev => prev.map(item => 
            item.id === editingItem.id ? { ...item, ...formData } : item
          ));
          break;
        case 'bus':
          setBusesData(prev => prev.map(item => 
            item.id === editingItem.id ? { ...item, ...formData } : item
          ));
          break;
      }
    } else {
      // Add new item
      const newId = Date.now();
      switch (modalType) {
        case 'schedule':
          setScheduleData(prev => [...prev, { id: newId, ...formData }]);
          break;
        case 'student':
          setStudentsData(prev => [...prev, { id: newId, ...formData }]);
          break;
        case 'driver':
          setDriversData(prev => [...prev, { id: newId, ...formData }]);
          break;
        case 'bus':
          setBusesData(prev => [...prev, { id: newId, ...formData }]);
          break;
      }
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const deleteItem = (type: 'schedule' | 'student' | 'driver' | 'bus', id: number) => {
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

  // Render admin content based on active tab
  const renderAdminContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard adminData={{ name: user?.name || '', role: user?.role || '' }} />;
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
        return <AdminDashboard adminData={{ name: user?.name || '', role: user?.role || '' }} />;
    }
  }, [activeTab, user, scheduleData, studentsData, driversData, busesData]);

  // Get form fields for modal
  const getFormFields = (): FormField[] => {
    switch (modalType) {
      case 'schedule':
        return [
          { name: 'route', label: 'Tuyến đường', type: 'text', required: true },
          { name: 'time', label: 'Thời gian', type: 'time', required: true },
          { name: 'students', label: 'Số học sinh', type: 'number', required: true },
          { name: 'driver', label: 'Tài xế', type: 'text', required: true },
          { name: 'bus', label: 'Xe buýt', type: 'text', required: true },
          { name: 'status', label: 'Trạng thái', type: 'select', options: [
            { value: 'Hoạt động', label: 'Hoạt động' },
            { value: 'Tạm dừng', label: 'Tạm dừng' },
            { value: 'Bảo trì', label: 'Bảo trì' }
          ], required: true }
        ];
      case 'student':
        return [
          { name: 'name', label: 'Họ tên', type: 'text', required: true },
          { name: 'grade', label: 'Lớp', type: 'text', required: true },
          { name: 'bus', label: 'Xe buýt', type: 'text', required: true },
          { name: 'pickup', label: 'Điểm đón', type: 'text', required: true },
          { name: 'dropoff', label: 'Điểm trả', type: 'text', required: true },
          { name: 'parent', label: 'Phụ huynh', type: 'text', required: true },
          { name: 'phone', label: 'Điện thoại', type: 'text', required: true }
        ];
      case 'driver':
        return [
          { name: 'name', label: 'Họ tên', type: 'text', required: true },
          { name: 'license', label: 'Bằng lái', type: 'text', required: true },
          { name: 'phone', label: 'Điện thoại', type: 'text', required: true },
          { name: 'bus', label: 'Xe buýt', type: 'text', required: true },
          { name: 'experience', label: 'Kinh nghiệm', type: 'text', required: true },
          { name: 'rating', label: 'Đánh giá', type: 'number', required: true }
        ];
      case 'bus':
        return [
          { name: 'number', label: 'Số xe', type: 'text', required: true },
          { name: 'capacity', label: 'Sức chứa', type: 'number', required: true },
          { name: 'driver', label: 'Tài xế', type: 'text', required: true },
          { name: 'route', label: 'Tuyến đường', type: 'text', required: true },
          { name: 'status', label: 'Trạng thái', type: 'select', options: [
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