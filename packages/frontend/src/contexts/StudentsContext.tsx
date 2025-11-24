import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Student, Parent, Stop } from '../types';
import studentService from '../services/api/studentService';
import { apiClient } from '../services/api/client';

interface StudentsContextType {
  students: Student[];
  loading: boolean;
  error: string | null;
  parents: Parent[];
  parentsLoading: boolean;
  parentsError: string | null;
  stops: Stop[];
  stopsLoading: boolean;
  stopsError: string | null;
  fetchStudents: () => Promise<void>;
  fetchParents: () => Promise<void>;
  fetchStops: () => Promise<void>;
  addStudent: (student: Partial<Student>) => Promise<void>;
  updateStudent: (ma_hs: number, student: Partial<Student>) => Promise<void>;
  deleteStudent: (ma_hs: number) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [parents, setParents] = useState<Parent[]>([]);
  const [parentsLoading, setParentsLoading] = useState<boolean>(false);
  const [parentsError, setParentsError] = useState<string | null>(null);
  
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopsLoading, setStopsLoading] = useState<boolean>(false);
  const [stopsError, setStopsError] = useState<string | null>(null);

  const normalizeStudents = (raw: any[]): Student[] => {
    return (raw || []).map((s: any) => {
      const ma_hs = s.ma_hs ?? s.ma_hoc_sinh ?? s.id ?? s.maHocSinh;
      const ho_ten = s.ho_ten ?? s.hoTen ?? s.name;
      return { ...s, ma_hs, ho_ten };
    });
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getStudents();
      const items = normalizeStudents(response?.data ?? []);
      setStudents(items);
    } catch (err: any) {
      console.error('StudentsProvider.fetchStudents error', err);
      setError(err?.message ?? 'Lỗi khi lấy danh sách học sinh');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParents = useCallback(async () => {
    setParentsLoading(true);
    setParentsError(null);
    try {
      const response = await apiClient.get('/phuhuynh');
      const payload = response?.data;
      const raw = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setParents(raw as Parent[]);
    } catch (err: any) {
      console.error('StudentsProvider.fetchParents error', err);
      setParentsError(err?.message ?? 'Lỗi khi lấy danh sách phụ huynh');
      setParents([]);
    } finally {
      setParentsLoading(false);
    }
  }, []);

  const fetchStops = useCallback(async () => {
    setStopsLoading(true);
    setStopsError(null);
    try {
      const response = await apiClient.get('/tramxe');
      const payload = response?.data;
      const raw = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setStops(raw as Stop[]);
    } catch (err: any) {
      console.error('StudentsProvider.fetchStops error', err);
      setStopsError(err?.message ?? 'Lỗi khi lấy danh sách trạm');
      setStops([]);
    } finally {
      setStopsLoading(false);
    }
  }, []);

  const addStudent = useCallback(async (student: Partial<Student>) => {
    setError(null);
    try {
      await studentService.createStudent(student as any);
      await fetchStudents();
    } catch (err: any) {
      console.error('addStudent error', err);
      setError(err?.message ?? 'Lỗi thêm học sinh');
      throw err;
    }
  }, [fetchStudents]);

  const updateStudent = useCallback(async (ma_hs: number, student: Partial<Student>) => {
    setError(null);
    try {
      await studentService.updateStudent(ma_hs, student as any);
      await fetchStudents();
    } catch (err: any) {
      console.error('updateStudent error', err);
      setError(err?.message ?? 'Lỗi cập nhật học sinh');
      throw err;
    }
  }, [fetchStudents]);

  const deleteStudent = useCallback(async (ma_hs: number) => {
    setError(null);
    try {
      await studentService.deleteStudent(ma_hs);
      await fetchStudents();
    } catch (err: any) {
      console.error('deleteStudent error', err);
      setError(err?.message ?? 'Lỗi xóa học sinh');
      throw err;
    }
  }, [fetchStudents]);

  useEffect(() => {
    fetchStudents();
    fetchParents();
    fetchStops();
    // Only fetch once on mount, not on every dependency change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StudentsContext.Provider value={{ 
      students, 
      loading, 
      error, 
      parents, 
      parentsLoading, 
      parentsError,
      stops,
      stopsLoading,
      stopsError,
      fetchStudents, 
      fetchParents,
      fetchStops,
      addStudent, 
      updateStudent, 
      deleteStudent 
    }}>
      {children}
    </StudentsContext.Provider>
  );
};

// Primary hook name (context)
export const useStudentsContext = () => {
  const context = useContext(StudentsContext);
  if (!context) throw new Error('useStudentsContext must be used within a StudentsProvider');
  return context;
};

// Backward-compatible alias: export useStudents so existing imports keep working
export function useStudents() {
  return useStudentsContext();
}