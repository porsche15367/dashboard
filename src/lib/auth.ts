import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Admin, LoginRequest, LoginResponse } from "@/types";
import api from "./api";
import { useEffect, useState } from "react";

interface AuthState {
  admin: Admin | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });
        try {
          console.log("Auth service: Attempting login...");
          const response = await api.post<LoginResponse>(
            "/auth/login",
            credentials
          );
          console.log("Auth service: Login successful", response.data);
          const { user, access_token, refresh_token } = response.data;

          set({
            admin: user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store tokens in localStorage for API interceptor
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", access_token);
            localStorage.setItem("admin_refresh_token", refresh_token);
          }
        } catch (error: unknown) {
          console.error("Auth service: Login failed", error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          console.log("No refresh token available");
          return false;
        }

        try {
          console.log("Attempting to refresh access token...");
          const response = await api.post("/auth/refresh", {
            refreshToken: refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          set({
            token: access_token,
            refreshToken: refresh_token,
          });

          // Update localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", access_token);
            localStorage.setItem("admin_refresh_token", refresh_token);
          }

          console.log("Access token refreshed successfully");
          return true;
        } catch (error: unknown) {
          console.error("Failed to refresh access token:", error);
          // If refresh fails, logout the user
          get().logout();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize auth state from localStorage on app start
        if (typeof window !== "undefined" && state) {
          const token = localStorage.getItem("admin_token");
          const refreshToken = localStorage.getItem("admin_refresh_token");
          if (token && state.admin && state.token) {
            console.log("Auth: Rehydrated from storage");
            state.isAuthenticated = true;
            // Sync refresh token from localStorage if available
            if (refreshToken) {
              state.refreshToken = refreshToken;
            }
          } else {
            console.log("Auth: No valid token found, clearing state");
            state.admin = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);

// Client-side hook to prevent hydration issues
export const useClientAuth = () => {
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Add a small delay to ensure Zustand has hydrated
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 50); // Reduced delay
    return () => clearTimeout(timer);
  }, []);

  const authStore = useAuthStore();

  if (!isClient || !isHydrated) {
    return {
      admin: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Show loading during hydration
      login: authStore.login,
      logout: authStore.logout,
      setLoading: authStore.setLoading,
      refreshAccessToken: authStore.refreshAccessToken,
    };
  }

  return authStore;
};
