import axios from "axios";

//const API_BASE_URL = "https://backend-production-e593.up.railway.app/api";  
const API_BASE_URL = "http://localhost:3000/api";

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

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(
      "API Response Error:",
      error.response?.status,
      error.config?.url
    );

    const originalRequest = error.config;

    // Don't redirect on 401 during login - let the login form handle the error
    if (error.response?.status === 401 && error.config?.url !== "/auth/login") {
      // Don't retry refresh token requests to avoid infinite loops
      if (originalRequest.url === "/auth/refresh") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Try to refresh the token
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("admin_refresh_token");
        if (refreshToken && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log("Attempting to refresh token...");
            const response = await api.post("/auth/refresh", {
              refreshToken: refreshToken,
            });

            const { access_token, refresh_token } = response.data;

            // Update tokens in localStorage
            localStorage.setItem("admin_token", access_token);
            localStorage.setItem("admin_refresh_token", refresh_token);

            // Update the authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;

            console.log(
              "Token refreshed successfully, retrying original request"
            );
            return api(originalRequest);
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_refresh_token");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available, redirect to login
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
