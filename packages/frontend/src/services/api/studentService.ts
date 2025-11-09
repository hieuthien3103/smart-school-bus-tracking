
import type { Student, PaginatedResponse } from '../../types';
import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Filters for hocsinh
export interface StudentFilters {
  ma_phu_huynh?: number;
  ma_diem_don?: number;
  ma_diem_tra?: number;
  lop?: string;
  trang_thai?: 'hoat_dong' | 'nghi';
  search?: string;
  page?: number;
  limit?: number;
}

// DTOs for create/update
export type CreateStudentDto = Omit<Student, 'ma_hs'>;
export type UpdateStudentDto = Partial<CreateStudentDto>;

// Removed duplicate StudentService class and its exports to resolve duplicate identifier error.

class StudentService {
  // Get all students with optional filters
  async getStudents(filters?: StudentFilters): Promise<PaginatedResponse<Student>> {
    const response = await apiClient.get(ENDPOINTS.STUDENTS.BASE, { params: filters });
    const payload = response.data as any;
    const students = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    const page = filters?.page ?? 1;
    const inferredLimit = students.length || 10;
    const limit = filters?.limit ?? inferredLimit;
    const total = students.length;
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / (limit || 1))),
    };

    return {
      success: true,
      data: students as Student[],
      pagination,
    };
  }

  // Get student by ID
  async getStudentById(id: number): Promise<Student> {
    const response = await apiClient.get(ENDPOINTS.STUDENTS.BY_ID(id));
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Get students by route
  async getStudentsByRoute(routeId: number): Promise<Student[]> {
    const response = await apiClient.get(ENDPOINTS.STUDENTS.BY_ROUTE(routeId));
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }

  // Get students by school
  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    const response = await apiClient.get(ENDPOINTS.STUDENTS.BY_SCHOOL(schoolId));
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }

  // Get students by bus
  async getStudentsByBus(busId: number): Promise<Student[]> {
    const response = await apiClient.get(ENDPOINTS.STUDENTS.BY_BUS(busId));
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }

  // Get students by driver
  async getStudentsByDriver(driverId: number): Promise<Student[]> {
    const response = await apiClient.get(ENDPOINTS.STUDENTS.BY_DRIVER(driverId));
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }

  // Create new student
  async createStudent(studentData: CreateStudentDto): Promise<Student> {
    const response = await apiClient.post(ENDPOINTS.STUDENTS.BASE, studentData);
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Update student
  async updateStudent(id: number, updates: UpdateStudentDto): Promise<Student> {
    const response = await apiClient.put(ENDPOINTS.STUDENTS.BY_ID(id), updates);
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Update student status (for check-in/check-out)
  async updateStudentStatus(id: number, status: string): Promise<Student> {
    const response = await apiClient.patch(
      `${ENDPOINTS.STUDENTS.BY_ID(id)}/status`,
      { status },
    );
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Delete student
  async deleteStudent(id: number): Promise<void> {
    await apiClient.delete<void>(ENDPOINTS.STUDENTS.BY_ID(id));
  }

  // Assign student to route
  async assignStudentToRoute(studentId: number, routeId: number, pickupStopId: number, dropoffStopId: number): Promise<Student> {
    const response = await apiClient.post(
      `${ENDPOINTS.STUDENTS.BY_ID(studentId)}/assign-route`,
      { routeId, pickupStopId, dropoffStopId },
    );
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Unassign student from route
  async unassignStudentFromRoute(studentId: number): Promise<Student> {
    const response = await apiClient.delete(`${ENDPOINTS.STUDENTS.BY_ID(studentId)}/unassign-route`);
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Search students
  async searchStudents(query: string, filters?: Omit<StudentFilters, 'search'>): Promise<Student[]> {
    const searchFilters = { ...filters, search: query };
    const response = await this.getStudents(searchFilters);
    return response.data;
  }

  // Bulk operations
  async bulkUpdateStatus(studentIds: number[], status: string): Promise<Student[]> {
    const response = await apiClient.post(
      `${ENDPOINTS.STUDENTS.BASE}/bulk-status`,
      { studentIds, status },
    );
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }

  // Import students from CSV/Excel
  async importStudents(file: File, onProgress?: (progress: number) => void): Promise<{ 
    created: number; 
    updated: number; 
    errors: string[]; 
  }> {
    if (typeof FormData === 'undefined') {
      throw new Error('File uploads are not supported in the current environment');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${ENDPOINTS.STUDENTS.BASE}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      },
    });
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  // Export students to CSV
  async exportStudents(filters?: StudentFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    // Use apiClient for proper authentication handling
    const response = await apiClient.get(
      `${ENDPOINTS.STUDENTS.BASE}/export?${params}`,
      { responseType: 'blob' },
    );

    return response.data as Blob;
  }

  // Get student attendance history
  async getAttendanceHistory(
    studentId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<{
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
  }[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`${ENDPOINTS.STUDENTS.BY_ID(studentId)}/attendance?${params}`);
    const payload = response.data as any;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }
}

// Create singleton instance
export const studentService = new StudentService();
export default studentService;