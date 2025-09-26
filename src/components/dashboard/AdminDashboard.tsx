import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Bus, 
  MapPin, 
  Bell, 
  Calendar,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

interface AdminDashboardProps {
  adminData: {
    name: string;
    role: string;
  };
}

const AdminDashboard = ({ adminData }: AdminDashboardProps) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalBuses: 12,
    activeBuses: 9,
    totalStudents: 245,
    totalDrivers: 15,
    activeRoutes: 8,
    totalAlerts: 3
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'bus', message: 'Xe BS001 đã hoàn thành tuyến A1', time: '2 phút trước', status: 'success' },
    { id: 2, type: 'alert', message: 'Cảnh báo: Xe BS003 chậm tiến độ 10 phút', time: '5 phút trước', status: 'warning' },
    { id: 3, type: 'student', message: 'Học sinh Nguyễn Văn An đã được đón', time: '8 phút trước', status: 'info' },
    { id: 4, type: 'driver', message: 'Tài xế Trần Văn B đã đăng nhập', time: '12 phút trước', status: 'info' }
  ]);

  const [activeAlerts, setActiveAlerts] = useState([
    { id: 1, type: 'delay', message: 'Xe BS003 chậm 10 phút so với lịch trình', severity: 'medium', route: 'Tuyến B2' },
    { id: 2, type: 'maintenance', message: 'Xe BS007 cần bảo trì định kỳ', severity: 'low', route: 'Tuyến C1' },
    { id: 3, type: 'emergency', message: 'Sự cố nhỏ tại điểm đón số 5', severity: 'high', route: 'Tuyến A3' }
  ]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardStats(prev => ({
        ...prev,
        activeBuses: Math.floor(Math.random() * 3) + 8, // 8-10 active buses
        totalAlerts: Math.floor(Math.random() * 5) + 1  // 1-5 alerts
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'student': return <Users className="h-4 w-4" />;
      case 'driver': return <Activity className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Quản trị - {adminData.name}
        </h1>
        <p className="text-gray-600">Tổng quan hệ thống Smart School Bus</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng số xe buýt</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBuses}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 tháng này
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Xe đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeBuses}</p>
              <p className="text-sm text-gray-500 mt-1">
                {Math.round((dashboardStats.activeBuses / dashboardStats.totalBuses) * 100)}% tổng số
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học sinh</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Users className="h-3 w-3 mr-1" />
                8 tuyến đường
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cảnh báo</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalAlerts}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Cần xử lý
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* System Overview */}
        <div className="xl:col-span-2 space-y-6">
          {/* Active Alerts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Cảnh báo Hệ thống
            </h2>
            
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{alert.message}</h3>
                      <p className="text-sm opacity-80">Tuyến: {alert.route}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {alert.severity === 'high' ? 'Cao' : alert.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              Hoạt động Gần đây
            </h2>
            
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác Nhanh</h2>
            
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left flex items-center">
                <Bus className="h-5 w-5 mr-3" />
                Quản lý Xe buýt
              </button>
              
              <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left flex items-center">
                <Users className="h-5 w-5 mr-3" />
                Quản lý Học sinh
              </button>
              
              <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left flex items-center">
                <MapPin className="h-5 w-5 mr-3" />
                Theo dõi Vị trí
              </button>
              
              <button className="w-full p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-left flex items-center">
                <Calendar className="h-5 w-5 mr-3" />
                Lịch trình
              </button>
              
              <button className="w-full p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left flex items-center">
                <BarChart3 className="h-5 w-5 mr-3" />
                Báo cáo
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái Hệ thống</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tài xế hoạt động</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {dashboardStats.activeBuses}/{dashboardStats.totalDrivers}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(dashboardStats.activeBuses / dashboardStats.totalDrivers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tuyến đường hoạt động</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {dashboardStats.activeRoutes}/8
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(dashboardStats.activeRoutes / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hệ thống</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm font-medium text-green-600">Hoạt động tốt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;