// src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://smart-rental-management.onrender.com/api',
});

// Add token from localStorage to every request if it exists
// In your axios interceptor
axios.interceptors.response.use(
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