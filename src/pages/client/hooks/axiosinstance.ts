// axiosInstance.js
import axios from 'axios';
import { mockEnv } from './mock';

const axiosInstance = axios.create({
  baseURL: mockEnv.baseUrl
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  config.meta = { startTime: Date.now() };

  // Añadir API Key si existe
  if (mockEnv.apiKey) {
    config.headers['X-API-KEY'] = mockEnv.apiKey;
  }

  // Añadir headers por defecto
  if (mockEnv.defaultHeaders) {
    config.headers = {
      ...config.headers,
      ...mockEnv.defaultHeaders
    };
  }

  return config;
}, (error) => Promise.reject(error));

// Response Interceptor
axiosInstance.interceptors.response.use((response) => {
  const endTime = Date.now();
  const duration = Math.floor((endTime - response.config.meta.startTime) / 1000);
  
  response.timeResponse = duration; // lo adjuntamos a la respuesta
  return response;
}, (error) => {
  const endTime = Date.now();
  if (error.config?.meta?.startTime) {
    error.timeResponse = Math.floor((endTime - error.config.meta.startTime) / 1000);
  }

  return Promise.reject({
    status: error.response?.status || 'N/A',
    data: error.response?.data || { message: error.message },
    raw: error.toJSON ? error.toJSON() : error,
    timeResponse: error.timeResponse || null
  });
});

export default axiosInstance;