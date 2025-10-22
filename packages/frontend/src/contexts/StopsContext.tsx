import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Stop {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface StopsContextType {
    stops: Stop[];
    addStop: (stop: Stop) => void;
    removeStop: (id: string) => void;
    updateStop: (stop: Stop) => void;
}

const StopsContext = createContext<StopsContextType | undefined>(undefined);

export const useStops = () => {
    const context = useContext(StopsContext);
    if (!context) {
        throw new Error('useStops must be used within a StopsProvider');
    }
    return context;
};

interface StopsProviderProps {
    children: ReactNode;
}

export const StopsProvider: React.FC<StopsProviderProps> = ({ children }) => {
    const [stops, setStops] = useState<Stop[]>([]);

    const addStop = (stop: Stop) => {
        setStops(prev => [...prev, stop]);
    };

    const removeStop = (id: string) => {
        setStops(prev => prev.filter(stop => stop.id !== id));
    };

    const updateStop = (updatedStop: Stop) => {
        setStops(prev =>
            prev.map(stop => (stop.id === updatedStop.id ? updatedStop : stop))
        );
    };

    return (
        <StopsContext.Provider value={{ stops, addStop, removeStop, updateStop }}>
            {children}
        </StopsContext.Provider>
    );
};