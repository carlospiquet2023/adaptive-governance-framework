import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste conforme necessário
  timeout: 10000,
});

// Interceptor para adicionar token JWT futuramente
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
