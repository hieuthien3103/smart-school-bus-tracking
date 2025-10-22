import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Route } from '../types';
import routeService from '../services/api/routeService';

interface RoutesContextType {
  routesData: Route[];
  setRoutesData: React.Dispatch<React.SetStateAction<Route[]>>;
  addRoute: (route: Omit<Route, 'id'>) => Promise<void>;
  updateRoute: (routeId: number, route: Partial<Route>) => Promise<void>;
  deleteRoute: (routeId: number) => Promise<void>;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

export const RoutesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routesData, setRoutesData] = useState<Route[]>([]);

  const addRoute = useCallback(async (route: Omit<Route, 'id'>) => {
    // ...implement API call and state update...
  }, []);

  const updateRoute = useCallback(async (routeId: number, route: Partial<Route>) => {
    // ...implement API call and state update...
  }, []);

  const deleteRoute = useCallback(async (routeId: number) => {
    // ...implement API call and state update...
  }, []);

  return (
    <RoutesContext.Provider value={{ routesData, setRoutesData, addRoute, updateRoute, deleteRoute }}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (!context) throw new Error('useRoutes must be used within a RoutesProvider');
  return context;
};
