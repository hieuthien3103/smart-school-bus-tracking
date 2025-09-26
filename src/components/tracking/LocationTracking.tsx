import { useState, useEffect, memo } from 'react';
import { MapPin, Navigation, Clock, Users, Bus, RefreshCw, Filter, Eye, AlertTriangle, Search, X } from 'lucide-react';

interface BusLocation {
  id: number;
  busNumber: string;
  driver: string;
  route: string;
  lat: number;
  lng: number;
  speed: number;
  direction: number;
  status: string;
  students: number;
  lastUpdate: string;
  nextStop: string;
  estimatedArrival: string;
  routeStops: string[];
  currentStopIndex: number;
}

const LocationTracking = () => {
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusLocation[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API GPS
  const [busLocations, setBusLocations] = useState<BusLocation[]>([
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
      students: 23,
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
      students: 18,
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
      students: 31,
      lastUpdate: '30 giây trước',
      nextStop: 'Bệnh viện Bạch Mai',
      estimatedArrival: '15 phút',
      routeStops: ['Bệnh viện Bạch Mai', 'Trường ĐH Bách Khoa', 'Chợ Trời', 'TTTM Vincom'],
      currentStopIndex: 1
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      setBusLocations(prev => prev.map(bus => ({
        ...bus,
        lat: bus.lat + (Math.random() - 0.5) * 0.001,
        lng: bus.lng + (Math.random() - 0.5) * 0.001,
        speed: Math.max(0, bus.speed + (Math.random() - 0.5) * 10),
        lastUpdate: 'Vừa cập nhật'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const filtered = busLocations.filter(bus => 
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
    setShowSearchDropdown(filtered.length > 0);
  }, [searchQuery, busLocations]);

  const handleSearchSelect = (bus: BusLocation) => {
    setSelectedBus(bus.id);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đang di chuyển':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'dừng đón khách':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'nghỉ trưa':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'sự cố':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const filteredBuses = busLocations.filter(bus => {
    if (filterStatus === 'all') return true;
    return bus.status.toLowerCase().includes(filterStatus.toLowerCase());
  });

  const MapView = () => (
    <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl h-96 overflow-hidden border-2 border-dashed border-gray-300">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Bản đồ tương tác</h3>
          <p className="text-gray-500 max-w-md">
            Tích hợp với Google Maps hoặc OpenStreetMap để hiển thị vị trí xe buýt real-time
          </p>
        </div>
      </div>
      
      {/* Mock bus markers */}
      {filteredBuses.map((bus, index) => {
        const isSearched = searchResults.some(result => result.id === bus.id) && searchQuery.trim() !== '';
        return (
          <div
            key={bus.id}
            className={`absolute w-6 h-6 rounded-full border-2 shadow-lg cursor-pointer transform -translate-x-3 -translate-y-3 transition-all hover:scale-125 ${
              selectedBus === bus.id ? 'ring-4 ring-blue-300' : ''
            } ${
              isSearched ? 'bg-red-500 border-red-200 ring-2 ring-red-300 scale-125' : 'bg-blue-600 border-white'
            }`}
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + index * 20}%`
            }}
            onClick={() => setSelectedBus(selectedBus === bus.id ? null : bus.id)}
            title={`${bus.busNumber} - ${bus.route}${isSearched ? ' (Tìm kiếm)' : ''}`}
          >
            <Bus className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theo dõi Vị trí</h1>
          <p className="text-gray-600">Giám sát vị trí và trạng thái xe buýt real-time</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            {viewMode === 'map' ? 'Chế độ danh sách' : 'Chế độ bản đồ'}
          </button>
          
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isAutoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng xe</p>
              <p className="text-xl font-semibold text-gray-900">{busLocations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Navigation className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đang di chuyển</p>
              <p className="text-xl font-semibold text-gray-900">
                {busLocations.filter(b => b.status === 'Đang di chuyển').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dừng đón khách</p>
              <p className="text-xl font-semibold text-gray-900">
                {busLocations.filter(b => b.status === 'Dừng đón khách').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng học sinh</p>
              <p className="text-xl font-semibold text-gray-900">
                {busLocations.reduce((sum, bus) => sum + bus.students, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm theo tuyến, xe, hoặc tài xế..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((bus) => (
                  <div
                    key={bus.id}
                    onClick={() => handleSearchSelect(bus)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{bus.busNumber}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{bus.route}</span>
                      </div>
                      <p className="text-sm text-gray-500">{bus.driver}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.status)}`}>
                      {bus.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
        </div>
        <div className="flex gap-2">
          {['all', 'đang di chuyển', 'dừng đón khách', 'sự cố'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tất cả' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map/List View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {viewMode === 'map' ? 'Bản đồ trực tiếp' : 'Danh sách xe buýt'}
              </h3>
            </div>
            
            {viewMode === 'map' ? (
              <MapView />
            ) : (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredBuses.map((bus) => (
                  <div
                    key={bus.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedBus === bus.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedBus(selectedBus === bus.id ? null : bus.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{bus.busNumber}</h4>
                          <p className="text-sm text-gray-600">{bus.route}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.status)}`}>
                        {bus.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bus Details */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">
              {selectedBus ? 'Thông tin chi tiết' : 'Chọn xe để xem chi tiết'}
            </h3>
          </div>
          
          <div className="p-4">
            {selectedBus ? (
              (() => {
                const bus = busLocations.find(b => b.id === selectedBus);
                if (!bus) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="text-center pb-4 border-b">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bus className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">{bus.busNumber}</h4>
                      <p className="text-gray-600">{bus.route}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tài xế:</span>
                        <span className="font-medium text-gray-900">{bus.driver}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.status)}`}>
                          {bus.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tốc độ:</span>
                        <span className="font-medium text-gray-900">{bus.speed} km/h</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Học sinh:</span>
                        <span className="font-medium text-gray-900">{bus.students}/45</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cập nhật:</span>
                        <span className="font-medium text-gray-900">{bus.lastUpdate}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h5 className="font-medium text-gray-900 mb-2">Điểm đến tiếp theo</h5>
                      <p className="text-gray-600 text-sm">{bus.nextStop}</p>
                      <p className="text-blue-600 text-sm font-medium">Dự kiến: {bus.estimatedArrival}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <h5 className="font-medium text-gray-900 mb-3">Điểm dừng tuyến đường</h5>
                      <div className="space-y-2">
                        {bus.routeStops.map((stop, index) => (
                          <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${
                            index === bus.currentStopIndex ? 'bg-blue-50 border border-blue-200' :
                            index < bus.currentStopIndex ? 'bg-green-50 border border-green-200' :
                            'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              index === bus.currentStopIndex ? 'bg-blue-500' :
                              index < bus.currentStopIndex ? 'bg-green-500' :
                              'bg-gray-300'
                            }`}></div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                index === bus.currentStopIndex ? 'text-blue-900' :
                                index < bus.currentStopIndex ? 'text-green-900' :
                                'text-gray-600'
                              }`}>
                                {stop}
                              </p>
                              {index === bus.currentStopIndex && (
                                <p className="text-xs text-blue-600">Điểm hiện tại</p>
                              )}
                              {index < bus.currentStopIndex && (
                                <p className="text-xs text-green-600">Đã qua</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {bus.speed === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Xe đang dừng</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Có thể đang đón hoặc trả khách
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nhấp vào xe buýt trên bản đồ hoặc danh sách để xem thông tin chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(LocationTracking);