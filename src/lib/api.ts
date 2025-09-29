import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(
      "API Response Error:",
      error.response?.status,
      error.config?.url
    );
    // Don't redirect on 401 during login - let the login form handle the error
    if (error.response?.status === 401 && error.config?.url !== "/auth/login") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
