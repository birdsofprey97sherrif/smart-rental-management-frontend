// src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://smart-rental-management.onrender.com/api',
});

// Attach token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rate-limit interceptor (attach to instance, not axios)
instance.interceptors.response.use(
  response => {
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    
    if (remaining < 10) {
      console.warn(`⚠️ Only ${remaining} requests remaining until ${new Date(reset * 1000)}`);
    }
    return response;
  },
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.error(`Rate limited! Retry after ${retryAfter} seconds`);
    }
    return Promise.reject(error);
  }
);

export default instance;
