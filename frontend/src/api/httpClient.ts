import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adaptflow_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token storage
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired
      console.warn('Unauthorized API request (401)');
    }
    return Promise.reject(error);
  }
);
