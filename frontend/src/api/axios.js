import axios from 'axios';

// Create an axios instance with our backend URL as the base
// process.env is not used in Vite — we use import.meta.env instead
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor = runs automatically before EVERY request
// This is where we attach the JWT token
API.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // If token exists, add it to the Authorization header
  // The backend's protect middleware reads exactly this header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;