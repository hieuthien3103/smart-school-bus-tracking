// Service for getting route directions using OpenRouteService or OSRM (free alternatives to Google Directions)
// You can also use Google Directions API if you have an API key

const OPENROUTESERVICE_API_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY || '';
const USE_OPENROUTESERVICE = !!OPENROUTESERVICE_API_KEY;
const USE_OSRM = !USE_OPENROUTESERVICE; // Use OSRM as fallback if OpenRouteService is not available

interface DirectionsResponse {
  coordinates: [number, number][]; // [lng, lat] format
  distance: number;
  duration: number;
}

/**
 * Get route directions between waypoints using OpenRouteService
 * Falls back to simple straight-line interpolation if API is not available
 */
export async function getRouteDirections(
  waypoints: [number, number][] // Array of [lat, lng] coordinates
): Promise<DirectionsResponse> {
  if (waypoints.length < 2) {
    return {
      coordinates: waypoints.map(([lat, lng]) => [lng, lat]),
      distance: 0,
      duration: 0,
    };
  }

  // Try OpenRouteService first if API key is available
  if (USE_OPENROUTESERVICE) {
    try {
      // OpenRouteService expects coordinates in [lng, lat] format
      const coordinates = waypoints.map(([lat, lng]) => [lng, lat]);
      
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': OPENROUTESERVICE_API_KEY,
          },
          body: JSON.stringify({
            coordinates,
            geometry: true,
            format: 'geojson',
            instructions: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenRouteService error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        let routeCoordinates: [number, number][] = [];

        if (route.geometry) {
          if (route.geometry.type === 'LineString' && Array.isArray(route.geometry.coordinates)) {
            routeCoordinates = route.geometry.coordinates as [number, number][];
          } else if (typeof route.geometry === 'string') {
            routeCoordinates = decodePolyline(route.geometry);
          } else if (Array.isArray(route.geometry.coordinates)) {
            routeCoordinates = route.geometry.coordinates as [number, number][];
          }
        }

        if (routeCoordinates.length > 0) {
          return {
            coordinates: routeCoordinates,
            distance: route.summary.distance / 1000,
            duration: route.summary.duration / 60,
          };
        }
      }

      throw new Error('No routes found from OpenRouteService');
    } catch (error) {
      console.warn('OpenRouteService failed, trying OSRM:', error);
    }
  }

  // Try OSRM (Open Source Routing Machine) as free alternative
  if (USE_OSRM) {
    try {
      // OSRM expects coordinates in [lng, lat] format
      const coordinates = waypoints.map(([lat, lng]) => [lng, lat]);
      const coordinatesString = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(';');
      
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`OSRM error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates as [number, number][];

        if (routeCoordinates && routeCoordinates.length > 0) {
          return {
            coordinates: routeCoordinates,
            distance: route.distance / 1000, // Convert to km
            duration: route.duration / 60, // Convert to minutes
          };
        }
      }

      throw new Error('No routes found from OSRM');
    } catch (error) {
      console.warn('OSRM failed, using interpolation:', error);
    }
  }

  // Final fallback: use interpolation with many points for smoother route
  console.warn('No routing API available, using interpolated route');
  const interpolated = interpolateRoute(waypoints, 30); // More points for smoother visualization
  return {
    coordinates: interpolated.map(([lat, lng]) => [lng, lat]),
    distance: calculateStraightLineDistance(waypoints),
    duration: 0,
  };
}

/**
 * Calculate straight-line distance between waypoints (Haversine formula)
 */
function calculateStraightLineDistance(waypoints: [number, number][]): number {
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lat1, lng1] = waypoints[i];
    const [lat2, lng2] = waypoints[i + 1];
    totalDistance += haversineDistance(lat1, lng1, lat2, lng2);
  }
  return totalDistance;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Decode polyline string to coordinates array
 * Polyline encoding is used by Google Maps and OpenRouteService
 */
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

/**
 * Interpolate points between waypoints for smoother route visualization
 * Uses more points for longer segments to ensure smooth movement
 */
export function interpolateRoute(waypoints: [number, number][], pointsPerSegment: number = 10): [number, number][] {
  if (waypoints.length < 2) return waypoints;

  const interpolated: [number, number][] = [waypoints[0]];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lat1, lng1] = waypoints[i];
    const [lat2, lng2] = waypoints[i + 1];

    // Calculate distance to determine number of points needed
    const distance = haversineDistance(lat1, lng1, lat2, lng2);
    // More points for longer segments (at least 1 point per 100m)
    const segmentPoints = Math.max(pointsPerSegment, Math.ceil(distance * 10));

    for (let j = 1; j < segmentPoints; j++) {
      const t = j / segmentPoints;
      // Use easing function for smoother interpolation
      const easedT = t * t * (3 - 2 * t); // Smoothstep function
      const lat = lat1 + (lat2 - lat1) * easedT;
      const lng = lng1 + (lng2 - lng1) * easedT;
      interpolated.push([lat, lng]);
    }
    interpolated.push(waypoints[i + 1]);
  }

  return interpolated;
}

