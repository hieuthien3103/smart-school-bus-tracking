import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Student } from '../types';
import studentService from '../services/api/studentService';

interface StudentsContextType {
  studentsData: Student[];
  setStudentsData: React.Dispatch<React.SetStateAction<Student[]>>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (studentId: number, student: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: number) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentsData, setStudentsData] = useState<Student[]>([]);

  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    // ...implement API call and state update...
  }, []);

  const updateStudent = useCallback(async (studentId: number, student: Partial<Student>) => {
    // ...implement API call and state update...
  }, []);

  const deleteStudent = useCallback(async (studentId: number) => {
    // ...implement API call and state update...
  }, []);

  return (
    <StudentsContext.Provider value={{ studentsData, setStudentsData, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) throw new Error('useStudents must be used within a StudentsProvider');
  return context;
};
