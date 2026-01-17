import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee APIs
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (employeeId) => api.get(`/employees/${employeeId}`),
  getNextId: () => api.get('/employees/next-id'),
  create: (data) => api.post('/employees', data),
  delete: (employeeId) => api.delete(`/employees/${employeeId}`),
};

// Attendance APIs
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getByEmployee: (employeeId, params) => api.get(`/employees/${employeeId}/attendance`, { params }),
  mark: (data) => api.post('/attendance', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export default api;
