import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nabhasih-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const appointmentAPI = {
  getAppointments: () => api.get('/appointments'),
  bookAppointment: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  startConsultation: (id) => api.patch(`/appointments/${id}/start`),
  completeConsultation: (id, data) => api.patch(`/appointments/${id}/complete`, data),
  getDoctors: (params) => api.get('/appointments/doctors', { params }),
  getQueue: () => api.get('/appointments/queue'),
};

export const prescriptionAPI = {
  getPrescriptions: () => api.get('/prescriptions'),
  createPrescription: (data) => api.post('/prescriptions', data),
  getPrescription: (id) => api.get(`/prescriptions/${id}`),
};

export const pharmacyAPI = {
  getPharmacies: () => api.get('/pharmacies'),
  getPharmacy: (id) => api.get(`/pharmacies/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  getUsers: (params) => api.get('/users', { params }),
  verifyUser: (id) => api.patch(`/users/${id}/verify`),
};

export default api;