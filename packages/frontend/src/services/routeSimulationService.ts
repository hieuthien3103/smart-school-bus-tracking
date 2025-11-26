/**
 * Service để giả lập di chuyển xe theo tuyến đường thực tế
 * Xe sẽ di chuyển dọc theo các điểm trên tuyến đường thay vì di chuyển ngẫu nhiên
 */

import { getRouteDirections } from './api/directionsService';

export interface RoutePath {
  routeId: number;
  coordinates: [number, number][]; // [lat, lng] format
  totalDistance: number;
}

export interface BusSimulationState {
  busId: number;
  routeId: number;
  currentIndex: number; // Index trong mảng coordinates
  routePath: RoutePath;
  speed: number; // km/h
  direction: 'forward' | 'backward';
  lastUpdateTime: number;
}

/**
 * Tính khoảng cách giữa hai điểm (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Tìm điểm gần nhất trên tuyến đường từ vị trí hiện tại
 */
export function findNearestPointOnRoute(
  currentLat: number,
  currentLng: number,
  routePath: RoutePath
): number {
  let nearestIndex = 0;
  let minDistance = Infinity;

  routePath.coordinates.forEach(([lat, lng], index) => {
    const distance = calculateDistance(currentLat, currentLng, lat, lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

/**
 * Tính vị trí mới của xe dựa trên tốc độ và thời gian
 * Xe sẽ di chuyển dọc theo tuyến đường
 */
export function calculateNextPosition(
  state: BusSimulationState,
  timeElapsedSeconds: number = 5
): { lat: number; lng: number; newIndex: number; newSpeed: number; newDirection: 'forward' | 'backward' } {
  const { routePath, currentIndex, speed, direction } = state;
  const coordinates = routePath.coordinates;

  if (coordinates.length < 2) {
    // Nếu tuyến đường không có đủ điểm, trả về vị trí hiện tại
    const current = coordinates[currentIndex] || coordinates[0];
    return {
      lat: current[0],
      lng: current[1],
      newIndex: currentIndex,
      newSpeed: speed,
      newDirection: direction,
    };
  }

  // Tính quãng đường di chuyển được (km)
  // speed là km/h, timeElapsedSeconds là giây
  const distanceTraveled = (speed * timeElapsedSeconds) / 3600; // km

  let newIndex = currentIndex;
  let remainingDistance = distanceTraveled;
  let newDirection = direction;

  // Di chuyển dọc theo tuyến đường
  while (remainingDistance > 0 && newIndex < coordinates.length - 1) {
    const current = coordinates[newIndex];
    const next = coordinates[newIndex + 1];
    const segmentDistance = calculateDistance(
      current[0],
      current[1],
      next[0],
      next[1]
    );

    if (segmentDistance <= remainingDistance) {
      // Đã đi hết đoạn này, chuyển sang đoạn tiếp theo
      remainingDistance -= segmentDistance;
      newIndex++;
    } else {
      // Đi một phần đoạn này
      const ratio = remainingDistance / segmentDistance;
      const lat = current[0] + (next[0] - current[0]) * ratio;
      const lng = current[1] + (next[1] - current[1]) * ratio;
      
      // Thêm một chút biến thiên tốc độ để tự nhiên hơn
      const speedVariation = (Math.random() - 0.5) * 5; // ±2.5 km/h
      const newSpeed = Math.max(20, Math.min(60, speed + speedVariation));

      return {
        lat,
        lng,
        newIndex,
        newSpeed,
        newDirection,
      };
    }
  }

  // Nếu đã đến cuối tuyến, xử lý theo hướng di chuyển
  if (newIndex >= coordinates.length - 1) {
    if (direction === 'forward') {
      // Đến cuối tuyến, quay ngược lại
      newIndex = coordinates.length - 1;
      // Đảo ngược hướng để quay lại
      newDirection = 'backward';
    } else {
      // Đang đi ngược, đến đầu tuyến, quay lại đi xuôi
      newIndex = 0;
      newDirection = 'forward';
    }
  }

  // Nếu đang đi ngược và chưa đến đầu
  if (direction === 'backward' && newIndex > 0 && remainingDistance > 0) {
    // Đi ngược lại
    while (remainingDistance > 0 && newIndex > 0) {
      const current = coordinates[newIndex];
      const prev = coordinates[newIndex - 1];
      const segmentDistance = calculateDistance(
        current[0],
        current[1],
        prev[0],
        prev[1]
      );

      if (segmentDistance <= remainingDistance) {
        remainingDistance -= segmentDistance;
        newIndex--;
      } else {
        const ratio = remainingDistance / segmentDistance;
        const lat = current[0] + (prev[0] - current[0]) * ratio;
        const lng = current[1] + (prev[1] - current[1]) * ratio;
        
        const speedVariation = (Math.random() - 0.5) * 5;
        const newSpeed = Math.max(20, Math.min(60, speed + speedVariation));

        return {
          lat,
          lng,
          newIndex,
          newSpeed,
          newDirection,
        };
      }
    }
  }

  const final = coordinates[newIndex];
  const speedVariation = (Math.random() - 0.5) * 5;
  const newSpeed = Math.max(20, Math.min(60, speed + speedVariation));

  return {
    lat: final[0],
    lng: final[1],
    newIndex,
    newSpeed,
    newDirection,
  };
}

/**
 * Khởi tạo trạng thái giả lập cho một xe
 */
export function initializeBusSimulation(
  busId: number,
  routeId: number,
  routePath: RoutePath,
  currentLat?: number,
  currentLng?: number
): BusSimulationState {
  let currentIndex = 0;

  // Nếu có vị trí hiện tại, tìm điểm gần nhất trên tuyến
  if (currentLat !== undefined && currentLng !== undefined) {
    currentIndex = findNearestPointOnRoute(currentLat, currentLng, routePath);
  }

  return {
    busId,
    routeId,
    currentIndex,
    routePath,
    speed: 30 + Math.random() * 20, // Tốc độ ban đầu 30-50 km/h
    direction: 'forward',
    lastUpdateTime: Date.now(),
  };
}

/**
 * Lấy tuyến đường thực tế từ các điểm dừng
 */
export async function getRoutePathFromStops(
  routeId: number,
  stops: Array<{ vi_do: number | null; kinh_do: number | null }>
): Promise<RoutePath | null> {
  // Lọc các điểm dừng có tọa độ hợp lệ
  const waypoints: [number, number][] = stops
    .map((stop) => {
      if (
        stop.vi_do !== null &&
        stop.vi_do !== undefined &&
        stop.kinh_do !== null &&
        stop.kinh_do !== undefined
      ) {
        return [Number(stop.vi_do), Number(stop.kinh_do)] as [number, number];
      }
      return null;
    })
    .filter((point): point is [number, number] => point !== null);

  if (waypoints.length < 2) {
    return null;
  }

  try {
    // Lấy tuyến đường thực tế từ API
    const directions = await getRouteDirections(waypoints);
    
    // Chuyển từ [lng, lat] sang [lat, lng] cho Leaflet
    const coordinates: [number, number][] = directions.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    return {
      routeId,
      coordinates,
      totalDistance: directions.distance,
    };
  } catch (error) {
    console.error(`Error getting route path for route ${routeId}:`, error);
    // Fallback: sử dụng các điểm dừng trực tiếp
    return {
      routeId,
      coordinates: waypoints,
      totalDistance: 0,
    };
  }
}

