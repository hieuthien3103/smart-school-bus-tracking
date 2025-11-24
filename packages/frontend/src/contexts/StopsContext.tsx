
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Stop } from '../types';
import { stopService } from '../services/api/stopService';

interface StopsContextType {
    stops: Stop[];
    fetchStops: () => Promise<void>;
    addStop: (stop: Omit<Stop, 'ma_diem_don'>) => Promise<void>;
    updateStop: (ma_diem_don: number, stop: Partial<Stop>) => Promise<void>;
    deleteStop: (ma_diem_don: number) => Promise<void>;
}

const StopsContext = createContext<StopsContextType | undefined>(undefined);

export const StopsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stops, setStops] = useState<Stop[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const fetchStops = useCallback(async () => {
        if (isFetching) return; // Prevent concurrent fetches
        
        setIsFetching(true);
        try {
            const data = await stopService.getStops();
            setStops(data);
        } catch (err: any) {
            console.error('StopsProvider.fetchStops error', err);
            // Don't clear stops on error, keep existing data
            if (err?.response?.status === 429) {
                console.warn('Rate limited, will retry later');
            }
        } finally {
            setIsFetching(false);
        }
    }, [isFetching]);

    const addStop = useCallback(async (stop: Omit<Stop, 'ma_diem_don'>) => {
        await stopService.createStop(stop);
        // Debounce refetch
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => fetchStops(), 500);
    }, [fetchStops]);

    const updateStop = useCallback(async (ma_diem_don: number, stop: Partial<Stop>) => {
        await stopService.updateStop(ma_diem_don, stop);
        // Debounce refetch
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => fetchStops(), 500);
    }, [fetchStops]);

    const deleteStop = useCallback(async (ma_diem_don: number) => {
        await stopService.deleteStop(ma_diem_don);
        // Debounce refetch
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => fetchStops(), 500);
    }, [fetchStops]);

    useEffect(() => {
        fetchStops();
        return () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, []); // Only fetch once on mount

    return (
        <StopsContext.Provider value={{ stops, fetchStops, addStop, updateStop, deleteStop }}>
            {children}
        </StopsContext.Provider>
    );
};

export const useStops = () => {
    const context = useContext(StopsContext);
    if (!context) throw new Error('useStops must be used within a StopsProvider');
    return context;
};