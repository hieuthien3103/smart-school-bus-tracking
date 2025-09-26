import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  Clock, 
  Navigation, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Route,
  Fuel,
  Activity
} from 'lucide-react';

interface DriverDashboardProps {
  driverData: {
    id: number;
    name: string;
    busId: number;
    route: string;
  };
}

const DriverDashboard = ({ driverData }: DriverDashboardProps) => {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 21.0285,
    lng: 105.8542,
    address: 'Đường Láng, Đống Đa, Hà Nội'
  });

  const [busStatus, setBusStatus] = useState({
    speed: 0,
    fuel: 85,
    engine: 'normal',
    temperature: 92
  });

  // Trip mode: 'pickup' (đón học sinh) hoặc 'dropoff' (trả học sinh)
  const [tripMode, setTripMode] = useState<'pickup' | 'dropoff'>('pickup');

  const [students, setStudents] = useState([
    { id: 1, name: 'Nguyễn Minh An', pickup: '07:15', dropoff: '16:30', pickupAddress: 'Ngã tư Láng Hạ', dropoffAddress: '123 Đường ABC', status: 'waiting', phone: '0901234567' },
    { id: 2, name: 'Trần Thị Bình', pickup: '07:20', dropoff: '16:35', pickupAddress: 'Bưu điện Đống Đa', dropoffAddress: '456 Đường DEF', status: 'picked', phone: '0907654321' },
    { id: 3, name: 'Lê Văn Cường', pickup: '07:25', dropoff: '16:40', pickupAddress: 'Trường THCS XYZ', dropoffAddress: '789 Đường GHI', status: 'waiting', phone: '0909876543' },
    { id: 4, name: 'Phạm Minh Đức', pickup: '07:30', dropoff: '16:45', pickupAddress: 'Chợ Hôm', dropoffAddress: '101 Đường JKL', status: 'absent', phone: '0903456789' }
  ]);

  const [routeInfo] = useState({
    totalStops: 8,
    completedStops: 2,
    currentStop: 'Điểm đón số 3 - Ngã tư Láng Hạ',
    nextStop: 'Điểm đón số 4 - Bưu điện Đống Đa',
    estimatedTime: '15 phút'
  });

  // Simulation real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update bus speed randomly
      setBusStatus(prev => ({
        ...prev,
        speed: Math.floor(Math.random() * 40) + 10 // 10-50 km/h
      }));

      // Update location slightly
      setCurrentLocation(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStudentStatus = (studentId: number, newStatus: 'picked' | 'absent' | 'dropped') => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status: newStatus }
          : student
      )
    );
  };

  const emergencyCall = () => {
    alert('Đang gọi đến số khẩn cấp: 113');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked': return 'text-green-600 bg-green-100';
      case 'dropped': return 'text-blue-600 bg-blue-100';
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'absent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'picked': return 'Đã đón';
      case 'dropped': return 'Đã trả';
      case 'waiting': return tripMode === 'pickup' ? 'Chờ đón' : 'Chờ trả';
      case 'absent': return 'Vắng mặt';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Dashboard Tài xế - {driverData.name}
            </h1>
            <p className="text-gray-600">Tuyến {driverData.route} - Xe buýt #{driverData.busId}</p>
          </div>
          
          {/* Trip Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTripMode('pickup')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tripMode === 'pickup' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚌 Đón học sinh
            </button>
            <button
              onClick={() => setTripMode('dropoff')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tripMode === 'dropoff' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏠 Trả học sinh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Navigation className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tốc độ hiện tại</p>
              <p className="text-2xl font-bold text-gray-900">{busStatus.speed}</p>
              <p className="text-sm text-gray-500">km/h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${tripMode === 'pickup' ? 'bg-green-100' : 'bg-blue-100'}`}>
              <Users className={`h-6 w-6 ${tripMode === 'pickup' ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">
                {tripMode === 'pickup' ? 'Học sinh đã đón' : 'Học sinh đã trả'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {tripMode === 'pickup' 
                  ? students.filter(s => s.status === 'picked').length
                  : students.filter(s => s.status === 'dropped').length
                }
              </p>
              <p className="text-sm text-gray-500">/ {students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Fuel className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Nhiên liệu</p>
              <p className="text-2xl font-bold text-gray-900">{busStatus.fuel}%</p>
              <p className="text-sm text-gray-500">còn lại</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Route className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Điểm đón</p>
              <p className="text-2xl font-bold text-gray-900">{routeInfo.completedStops}</p>
              <p className="text-sm text-gray-500">/ {routeInfo.totalStops}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Location & Route */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            Vị trí và Tuyến đường
          </h2>
          
          {/* Current Location */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Vị trí hiện tại:</span>
              <span className="text-xs text-gray-500">Real-time</span>
            </div>
            <p className="text-gray-600 mb-3">{currentLocation.address}</p>
            
            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Bản đồ GPS</p>
                <p className="text-xs text-gray-400">Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}</p>
              </div>
            </div>
          </div>

          {/* Route Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tiến độ tuyến:</span>
              <span className="text-sm text-blue-600">{routeInfo.completedStops}/{routeInfo.totalStops}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(routeInfo.completedStops / routeInfo.totalStops) * 100}%` }}
              ></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-600">Hiện tại: {routeInfo.currentStop}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-gray-600">Tiếp theo: {routeInfo.nextStop}</span>
              </div>
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-gray-600">Dự kiến: {routeInfo.estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            {tripMode === 'pickup' ? 'Danh sách Đón học sinh' : 'Danh sách Trả học sinh'}
          </h2>
          
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">
                      {tripMode === 'pickup' ? `Đón lúc: ${student.pickup}` : `Trả lúc: ${student.dropoff}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {tripMode === 'pickup' ? student.pickupAddress : student.dropoffAddress}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                    {getStatusText(student.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {student.phone}
                  </div>
                  
                  {/* Pickup Mode Buttons */}
                  {tripMode === 'pickup' && student.status === 'waiting' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStudentStatus(student.id, 'picked')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs hover:bg-green-200 transition-colors"
                      >
                        Đã đón
                      </button>
                      <button
                        onClick={() => handleStudentStatus(student.id, 'absent')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200 transition-colors"
                      >
                        Vắng mặt
                      </button>
                    </div>
                  )}
                  
                  {/* Dropoff Mode Buttons */}
                  {tripMode === 'dropoff' && student.status === 'picked' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStudentStatus(student.id, 'dropped')}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition-colors"
                      >
                        Đã trả
                      </button>
                      <button
                        onClick={() => handleStudentStatus(student.id, 'absent')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200 transition-colors"
                      >
                        Không có mặt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={emergencyCall}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-colors"
          title="Gọi khẩn cấp"
          aria-label="Gọi khẩn cấp - Số 113"
        >
          <Phone className="h-6 w-6" />
        </button>
      </div>

      {/* Bus Status Panel */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-blue-600 mr-2" />
          Trạng thái Xe buýt
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tốc độ</p>
            <p className="text-xl font-bold text-blue-600">{busStatus.speed} km/h</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Nhiên liệu</p>
            <p className="text-xl font-bold text-green-600">{busStatus.fuel}%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Động cơ</p>
            <p className="text-xl font-bold text-yellow-600 capitalize">{busStatus.engine}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Nhiệt độ</p>
            <p className="text-xl font-bold text-orange-600">{busStatus.temperature}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;