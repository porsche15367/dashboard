"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, admin, token } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard Layout - Auth State:", {
      isAuthenticated,
      isLoading,
      hasAdmin: !!admin,
      hasToken: !!token,
    });

    // Only redirect if we're sure the auth state has been properly loaded
    if (!isLoading && !isAuthenticated) {
      console.log("Dashboard: Not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, admin, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-grow flex-col overflow-y-auto border-r bg-white shadow-sm">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
