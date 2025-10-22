import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export interface Stop {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    routeId: string;
}

export const getStops = async (routeId?: string): Promise<Stop[]> => {
    const url = routeId ? `${API_BASE_URL}/stops?routeId=${routeId}` : `${API_BASE_URL}/stops`;
    const response = await axios.get<Stop[]>(url);
    return response.data;
};

export const getStopById = async (id: string): Promise<Stop> => {
    const response = await axios.get<Stop>(`${API_BASE_URL}/stops/${id}`);
    return response.data;
};

export const createStop = async (stop: Omit<Stop, 'id'>): Promise<Stop> => {
    const response = await axios.post<Stop>(`${API_BASE_URL}/stops`, stop);
    return response.data;
};

export const updateStop = async (id: string, stop: Partial<Omit<Stop, 'id'>>): Promise<Stop> => {
    const response = await axios.put<Stop>(`${API_BASE_URL}/stops/${id}`, stop);
    return response.data;
};

export const deleteStop = async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/stops/${id}`);
};