import axios from 'axios';

/**
 * Axios client wrapper.
 * Sử dụng VITE_API_BASE nếu đã cấu hình environment.
 */
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Default export added for modules that import the client as default
export default apiClient;

// Optional: attach interceptors here (auth, error handling) nếu cần sau này