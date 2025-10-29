import { useState, useEffect } from 'react';
import { MapPin, Clock, User, Bus, Route, Phone, AlertCircle } from 'lucide-react';
import { useStudentsContext } from '../../contexts/StudentsContext';
import { useParentsContext } from '../../contexts/ParentsContext';
import { useBuses } from '../../contexts/BusesContext';
import { useDrivers } from '../../contexts/DriversContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useStops } from '../../contexts/StopsContext';


interface StudentInfo {
  id: number;
  name: string;
  grade: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  pickupStop: string;
  dropoffStop: string;
  pickupTime: string;
  dropoffTime: string;
  currentStatus: 'at_home' | 'waiting_pickup' | 'on_bus' | 'at_school' | 'going_home';
}

interface BusLocationInfo {
  busNumber: string;
  currentLocation: string;
  distanceToPickup: number;
  distanceToDropoff: number;
  estimatedPickupTime: string;
  estimatedDropoffTime: string;
  isOnRoute: boolean;
  lastUpdated: string;
}

/**
 * Defensive helper: call a hook and return fallback on error (e.g. provider missing).
 * This prevents the whole app from crashing while you work on wiring providers.
 */
function safeHook<T>(hook: () => T, fallback: T): T {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return hook();
  } catch {
    return fallback;
  }
}

const ParentDashboard = () => {
  // Use safeHook to avoid throwing if a provider is not mounted yet
  const studentsCtx = safeHook(useStudentsContext, { students: [], fetchStudents: async () => {} } as any);
  const parentsCtx = safeHook(useParentsContext, { parents: [], fetchParents: async () => {} } as any);
  const busesCtx = safeHook(useBuses, { buses: [], busLocations: {} } as any);
  const driversCtx = safeHook(useDrivers, { drivers: [] } as any);
  const schedulesCtx = safeHook(useSchedules, { schedules: [] } as any);
  const stopsCtx = safeHook(useStops, { stops: [] } as any);


  // Use normalized types and direct API fields/relations
  const studentsData = studentsCtx.students ?? [];
  const currentStudent = studentsData[0] || null;

  // Get bus, driver, schedule, stop from relations if available
  const currentBus = currentStudent?.diem_don?.xe || null;
  const currentDriver = currentStudent?.diem_don?.tai_xe || null;
  const pickupStop = currentStudent?.diem_don?.ten_tram || '';
  const dropoffStop = currentStudent?.diem_tra?.ten_tram || '';

  // If schedule is available via assignment or relation, use it
  // (Assume only one schedule per student for simplicity)
  let currentSchedule = null;
  if (currentStudent?.phan_cong && Array.isArray(currentStudent.phan_cong) && currentStudent.phan_cong[0]?.lich_trinh) {
    currentSchedule = currentStudent.phan_cong[0].lich_trinh;
  }

  // Compose student info for display
  const studentInfo: StudentInfo | null = currentStudent
    ? {
        id: currentStudent.ma_hs,
        name: currentStudent.ho_ten,
        grade: currentStudent.lop ?? '---',
        busNumber: currentBus?.bien_so ?? '',
        driverName: currentDriver?.ho_ten ?? '',
        driverPhone: currentDriver?.so_dien_thoai ?? '',
        pickupStop: pickupStop,
        dropoffStop: dropoffStop,
        pickupTime: currentSchedule?.gio_bat_dau ?? '',
        dropoffTime: currentSchedule?.gio_ket_thuc ?? '',
        currentStatus: ((): StudentInfo['currentStatus'] => {
          // Map backend status to UI status
          const st = (currentStudent.trang_thai ?? '').toString().toLowerCase();
          if (st === 'hoat_dong') return 'at_school';
          if (st === 'nghi') return 'at_home';
          return 'at_home';
        })(),
      }
    : null;

  const [busLocation, setBusLocation] = useState<BusLocationInfo>({
    busNumber: currentStudent?.bus ?? currentStudent?.busNumber ?? 'BS001',
    currentLocation: currentBus?.route ?? currentBus?.currentLocation ?? 'Chưa có vị trí',
    distanceToPickup:
      typeof currentBus?.distanceToPickup === 'number' ? currentBus.distanceToPickup : 0.8,
    distanceToDropoff:
      typeof currentBus?.distanceToDropoff === 'number' ? currentBus.distanceToDropoff : 5.2,
    estimatedPickupTime: currentSchedule?.time ?? '7:15 AM',
    estimatedDropoffTime: currentSchedule?.estimatedDropoffTime ?? '4:30 PM',
    isOnRoute: currentBus?.status === 'Đang di chuyển' || currentBus?.isOnRoute === true,
    lastUpdated: currentBus?.lastUpdate ?? 'Vừa cập nhật',
  });

  useEffect(() => {
    if (currentBus) {
      setBusLocation(prev => ({
        ...prev,
        busNumber: currentBus.busNumber ?? currentBus.number ?? prev.busNumber,
        currentLocation: currentBus.route ?? currentBus.currentLocation ?? prev.currentLocation,
        isOnRoute: currentBus.status === 'Đang di chuyển' || currentBus.isOnRoute === true,
        distanceToPickup:
          typeof currentBus.distanceToPickup === 'number' ? currentBus.distanceToPickup : prev.distanceToPickup,
        distanceToDropoff:
          typeof currentBus.distanceToDropoff === 'number' ? currentBus.distanceToDropoff : prev.distanceToDropoff,
        estimatedPickupTime: currentSchedule?.time ?? prev.estimatedPickupTime,
        estimatedDropoffTime: currentSchedule?.estimatedDropoffTime ?? prev.estimatedDropoffTime,
        lastUpdated: currentBus.lastUpdate ?? prev.lastUpdated,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBus, currentSchedule, currentDriver]);

  const placeholderStudentInfo: StudentInfo = {
    id: 0,
    name: 'Chưa có thông tin',
    grade: '---',
    busNumber: '---',
    driverName: '---',
    driverPhone: '---',
    pickupStop: '---',
    dropoffStop: '---',
    pickupTime: '--:--',
    dropoffTime: '--:--',
    currentStatus: 'at_home',
  };

  const placeholderBusLocation: BusLocationInfo = {
    busNumber: '---',
    currentLocation: 'Chưa có thông tin vị trí',
    distanceToPickup: 0,
    distanceToDropoff: 0,
    estimatedPickupTime: '--:--',
    estimatedDropoffTime: '--:--',
    isOnRoute: false,
    lastUpdated: 'Chưa cập nhật',
  };

  const displayStudentInfo = studentInfo || placeholderStudentInfo;
  const displayBusLocation = busLocation || placeholderBusLocation;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'at_home':
        return {
          text: 'Đang ở nhà',
          color: 'text-gray-600 bg-gray-100',
          icon: <User className="h-4 w-4" />,
        };
      case 'waiting_pickup':
        return {
          text: 'Chờ xe đón',
          color: 'text-yellow-600 bg-yellow-100',
          icon: <Clock className="h-4 w-4" />,
        };
      case 'on_bus':
        return {
          text: 'Đang trên xe',
          color: 'text-blue-600 bg-blue-100',
          icon: <Bus className="h-4 w-4" />,
        };
      case 'at_school':
        return {
          text: 'Đã đến trường',
          color: 'text-green-600 bg-green-100',
          icon: <MapPin className="h-4 w-4" />,
        };
      case 'going_home':
        return {
          text: 'Đang về nhà',
          color: 'text-purple-600 bg-purple-100',
          icon: <Route className="h-4 w-4" />,
        };
      default:
        return {
          text: 'Không xác định',
          color: 'text-gray-600 bg-gray-100',
          icon: <AlertCircle className="h-4 w-4" />,
        };
    }
  };

  const statusInfo = getStatusInfo(displayStudentInfo.currentStatus);

  const shouldShowPickupAlert =
    displayBusLocation.distanceToPickup <= 1 && displayBusLocation.distanceToPickup > 0;
  const shouldShowDropoffAlert =
    displayBusLocation.distanceToDropoff <= 1 && displayBusLocation.distanceToDropoff > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng, Phụ huynh! 👋</h1>
        <p className="text-blue-100">Theo dõi hành trình đến trường của con bạn</p>
      </div>

      {/* Alerts */}
      {shouldShowPickupAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">🚌 Xe buýt sắp đến điểm đón!</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Xe {displayBusLocation.busNumber} cách điểm đón{' '}
                {displayBusLocation.distanceToPickup.toFixed(1)}km, dự kiến đến lúc{' '}
                {displayBusLocation.estimatedPickupTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {shouldShowDropoffAlert && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">🏫 Xe buýt sắp đến trường!</h3>
              <p className="text-green-700 text-sm mt-1">
                Xe {displayBusLocation.busNumber} cách trường{' '}
                {displayBusLocation.distanceToDropoff.toFixed(1)}km, dự kiến đến lúc{' '}
                {displayBusLocation.estimatedDropoffTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{displayStudentInfo.name}</h2>
                <p className="text-gray-600">{displayStudentInfo.grade}</p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${statusInfo.color}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bus Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Bus className="h-5 w-5 mr-2 text-blue-600" />
              Thông tin xe buýt
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số xe:</span>
                <span className="font-medium text-gray-900">{displayStudentInfo.busNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tài xế:</span>
                <span className="font-medium text-gray-900">{displayStudentInfo.driverName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Điện thoại:</span>
                <a
                  href={`tel:${displayStudentInfo.driverPhone}`}
                  className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {displayStudentInfo.driverPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Route className="h-5 w-5 mr-2 text-green-600" />
              Lộ trình
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Điểm đón:</span>
                  <span className="text-xs text-gray-500">{displayStudentInfo.pickupTime}</span>
                </div>
                <p className="font-medium text-gray-900">{displayStudentInfo.pickupStop}</p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Điểm trả:</span>
                  <span className="text-xs text-gray-500">{displayStudentInfo.dropoffTime}</span>
                </div>
                <p className="font-medium text-gray-900">{displayStudentInfo.dropoffStop}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Tracking */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Vị trí xe buýt (Real-time)
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{displayBusLocation.lastUpdated}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Vị trí hiện tại:</span>
              <span className="font-medium text-gray-900">{displayBusLocation.currentLocation}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cách điểm đón:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {displayBusLocation.distanceToPickup.toFixed(1)} km
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, 100 - displayBusLocation.distanceToPickup * 20)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Dự kiến: {displayBusLocation.estimatedPickupTime}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cách điểm trả:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {displayBusLocation.distanceToDropoff.toFixed(1)} km
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, 100 - displayBusLocation.distanceToDropoff * 10)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Dự kiến: {displayBusLocation.estimatedDropoffTime}</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Bản đồ theo dõi xe buýt
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Cập nhật mới nhất</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* <MapViews /> removed due to export error */}
              <div className="rounded-lg overflow-hidden border border-gray-200 h-64 flex items-center justify-center text-gray-400">
                (Bản đồ đang bảo trì)
              </div>

              <div className="text-center mt-4">
                <p className="text-gray-500 text-sm mb-4">
                  Hiển thị vị trí xe buýt và lộ trình di chuyển real-time
                </p>
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Xe buýt</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Điểm đón/trả</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Vị trí hiện tại</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;