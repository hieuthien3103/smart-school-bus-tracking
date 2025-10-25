
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const useBusTracking = (options?: { pollIntervalMs?: number }) => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UI state đồng bộ với LocationTracking
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const normalizeArray = (maybeArray: any): any[] => {
    if (!maybeArray) return [];
    if (Array.isArray(maybeArray)) return maybeArray;
    if (Array.isArray(maybeArray.data)) return maybeArray.data;
    return [];
  };

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/buses');
      const raw = res?.data ?? res;
      const list = normalizeArray(raw);
      setBuses(list);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setBuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
    if (options?.pollIntervalMs && options.pollIntervalMs > 0) {
      const id = setInterval(fetchBuses, options.pollIntervalMs);
      return () => clearInterval(id);
    }
  }, [fetchBuses, options?.pollIntervalMs]);

  // Filtered buses theo trạng thái
  const filteredBuses = useMemo(() => {
    let result = [...buses];
    if (filterStatus) {
      result = result.filter((bus) => bus.status === filterStatus);
    }
    if (searchQuery.trim()) {
      result = result.filter((bus) => {
        const q = searchQuery.toLowerCase();
        return (
          (bus.busNumber && bus.busNumber.toLowerCase().includes(q)) ||
          (bus.route && bus.route.toLowerCase().includes(q)) ||
          (bus.driver && bus.driver.toLowerCase().includes(q))
        );
      });
    }
    return result;
  }, [buses, filterStatus, searchQuery]);

  // Search results (dropdown)
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(
        buses.filter((bus) => {
          const q = searchQuery.toLowerCase();
          return (
            (bus.busNumber && bus.busNumber.toLowerCase().includes(q)) ||
            (bus.route && bus.route.toLowerCase().includes(q)) ||
            (bus.driver && bus.driver.toLowerCase().includes(q))
          );
        })
      );
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, buses]);

  const getMarkers = useCallback(() => {
    return (filteredBuses ?? []).map((bus: any) => {
      return {
        id: bus.id ?? bus.ma_xe ?? bus.ma_xe_id,
        lat: bus.lat ?? bus.latitude ?? bus.toa_do_lat,
        lng: bus.lng ?? bus.longitude ?? bus.toa_do_lng,
        label: bus.name ?? bus.ten_xe ?? '',
        raw: bus,
      };
    });
  }, [filteredBuses]);

  // Xử lý chọn xe từ search
  const handleSearchSelect = (bus: any) => {
    setSelectedBus(bus.id);
    setShowSearchResults(false);
    setSearchQuery(bus.busNumber || '');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  return {
    buses,
    filteredBuses,
    loading,
    error,
    fetchBuses,
    getMarkers,
    selectedBus,
    setSelectedBus,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    autoRefresh,
    setAutoRefresh,
    handleSearchSelect,
    clearSearch,
  };
};