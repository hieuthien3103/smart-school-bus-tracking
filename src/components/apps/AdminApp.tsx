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
import { mockStudentsData, mockDriversData, mockBusesData } from '../../services/mockData';
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
    setScheduleData
  } = useAppData();

  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'student' | 'driver' | 'bus'>('schedule');
  const [editingItem, setEditingItem] = useState<any>(null);
  
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

  // Sync data with location tracking when bus or schedule data changes
  React.useEffect(() => {
    // Update bus locations for tracking
    updateBusLocations(busesData);
    
    // Sync schedule data with bus tracking
    syncBusLocationFromSchedule(scheduleData);
  }, [busesData, driversData, scheduleData, updateBusLocations, syncBusLocationFromSchedule]);

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
                ...formData,
                students: parseInt(formData.students) || item.students
              } : item
            ));
            alert('Cập nhật lịch trình thành công!');
            break;
          case 'student':
            setStudentsData(prev => prev.map(item => 
              item.id === editingItem.id ? { ...item, ...formData } : item
            ));
            alert('Cập nhật học sinh thành công!');
            break;
          case 'driver':
            setDriversData(prev => prev.map(item => 
              item.id === editingItem.id ? { 
                ...item, 
                ...formData,
                experience: parseInt(formData.experience) || item.experience,

                currentRoute: formData.bus?.replace('BS', 'Tuyến ') || item.currentRoute,
                currentBus: formData.bus || item.currentBus
              } : item
            ));
            alert('Cập nhật tài xế thành công!');
            break;
          case 'bus':
            setBusesData(prev => prev.map(item => 
              item.id === editingItem.id ? { 
                ...item, 
                ...formData,
                capacity: parseInt(formData.capacity) || item.capacity
              } : item
            ));
            alert('Cập nhật xe buýt thành công!');
            break;
        }
      } else {
        // Add new item with unique ID
        const newId = Date.now() + Math.random();
        switch (modalType) {
          case 'schedule':
            const newSchedule = {
              id: newId,
              route: formData.route,
              time: formData.time,
              students: parseInt(formData.students) || 0,
              driver: formData.driver,
              bus: formData.bus,
              status: formData.status || 'Hoạt động'
            };
            setScheduleData(prev => [...prev, newSchedule]);
            alert('Thêm lịch trình mới thành công!');
            break;
          case 'student':
            setStudentsData(prev => [...prev, { id: newId, ...formData }]);
            alert('Thêm học sinh mới thành công!');
            break;
          case 'driver':
            const newDriver = {
              id: newId,
              name: formData.name,
              phone: formData.phone,
              license: formData.license,
              experience: parseInt(formData.experience) || 0,
              status: 'Đang hoạt động',
              currentRoute: formData.bus?.replace('BS', 'Tuyến ') || '',
              currentBus: formData.bus

            };
            setDriversData(prev => [...prev, newDriver]);
            alert('Thêm tài xế mới thành công!');
            break;
          case 'bus':
            const newBus = {
              id: newId,
              busNumber: formData.busNumber,
              model: 'Standard Bus',
              capacity: parseInt(formData.capacity) || 0,
              year: 2024,
              plateNumber: `${formData.busNumber}-SCHOOL`,
              status: formData.status,
              currentDriver: formData.currentDriver,  
              currentRoute: formData.currentRoute,
              mileage: 0,
              fuelLevel: 100,
              lastMaintenance: new Date().toISOString().split('T')[0],
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              condition: 'Tốt'
            };
            setBusesData(prev => [...prev, newBus]);
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
          setStudentsData(prev => prev.filter(item => item.id !== id));
          alert('Xóa học sinh thành công!');
          break;
        case 'driver':
          setDriversData(prev => prev.filter(item => item.id !== id));
          alert('Xóa tài xế thành công!');
          break;
        case 'bus':
          setBusesData(prev => prev.filter(item => item.id !== id));
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
    const existingRoutes = scheduleData.map(s => s.route);
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
            name: 'route', 
            label: 'Tuyến đường', 
            type: 'select', 
            required: true,
            options: generateRouteOptions()
          },
          { name: 'time', label: 'Thời gian khởi hành', type: 'time', required: true },
          { name: 'students', label: 'Số học sinh dự kiến', type: 'number', required: true },
          { 
            name: 'driver', 
            label: 'Tài xế', 
            type: 'select', 
            required: true,
            options: generateDriverOptions()
          },
          { 
            name: 'bus', 
            label: 'Xe buýt', 
            type: 'select', 
            required: true,
            options: generateBusOptions()
          },
          { 
            name: 'status', 
            label: 'Trạng thái', 
            type: 'select', 
            options: [
              { value: 'Hoạt động', label: '✅ Hoạt động' },
              { value: 'Tạm dừng', label: '⏸️ Tạm dừng' },
              { value: 'Bảo trì', label: '🔧 Bảo trì' }
            ], 
            required: true 
          }
        ];
      case 'student':
        return [
          { name: 'name', label: 'Họ tên', type: 'text', required: true },
          { name: 'grade', label: 'Lớp', type: 'text', required: true },
          { 
            name: 'bus', 
            label: 'Xe buýt', 
            type: 'select', 
            required: true,
            options: generateBusOptions()
          },
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
          { 
            name: 'bus', 
            label: 'Xe buýt phụ trách', 
            type: 'select', 
            required: true,
            options: generateBusOptions()
          },
          { name: 'experience', label: 'Kinh nghiệm (năm)', type: 'number', required: true }
        ];
      case 'bus':
        return [
          { name: 'busNumber', label: 'Số xe', type: 'text', required: true },
          { name: 'capacity', label: 'Sức chứa', type: 'number', required: true },
          { 
            name: 'currentDriver', 
            label: 'Tài xế phụ trách', 
            type: 'select', 
            required: true,
            options: generateDriverOptions()
          },
          { 
            name: 'currentRoute', 
            label: 'Tuyến đường', 
            type: 'select', 
            required: true,
            options: generateRouteOptions()
          },
          { name: 'status', label: 'Trạng thái', type: 'select', options: [
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