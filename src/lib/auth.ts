import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Admin, LoginRequest, LoginResponse } from "@/types";
import api from "./api";
import { useEffect, useState } from "react";

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
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
          const { user, access_token } = response.data;

          set({
            admin: user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API interceptor
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", access_token);
          }
        } catch (error: any) {
          console.error("Auth service: Login failed", error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize auth state from localStorage on app start
        if (typeof window !== "undefined" && state) {
          const token = localStorage.getItem("admin_token");
          if (token && state.admin && state.token) {
            console.log("Auth: Rehydrated from storage");
            state.isAuthenticated = true;
          } else {
            console.log("Auth: No valid token found, clearing state");
            state.admin = null;
            state.token = null;
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
      isAuthenticated: false,
      isLoading: true, // Show loading during hydration
      login: authStore.login,
      logout: authStore.logout,
      setLoading: authStore.setLoading,
    };
  }

  return authStore;
};
