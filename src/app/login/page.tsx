"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShoppingCart } from "lucide-react";
import { useClientAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useClientAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Login Page - Auth State:", {
      isAuthenticated,
      authLoading,
    });

    if (!authLoading && isAuthenticated) {
      console.log("Already authenticated, redirecting to dashboard");
      // Use replace to avoid back button issues
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    console.log("=== LOGIN COMPONENT MOUNTED ===");
    return () => {
      console.log("=== LOGIN COMPONENT UNMOUNTED ===");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("=== FORM SUBMIT START ===");
    e.preventDefault();
    e.stopPropagation();
    console.log("Form submitted - preventDefault called");

    try {
      if (!email || !password) {
        console.log("Validation failed: missing fields");
        setError("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        console.log("Validation failed: password too short");
        setError("Password must be at least 6 characters");
        return;
      }

      console.log("Validation passed, starting login process");
      setIsLoading(true);
      setError("");

      try {
        console.log("Attempting login with:", { email, password });

        await login({
          email,
          password,
          type: "admin",
        });
        console.log("Login successful, redirecting...");
        // Use replace to avoid back button issues
        router.replace("/dashboard");
      } catch (err: any) {
        console.error("Login error:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          config: err.config,
        });

        console.log("Error response data:", err.response?.data);
        console.log(
          "Error response data message:",
          err.response?.data?.message
        );
        console.log("Error message:", err.message);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials and try again.";
        console.log("Final error message:", errorMessage);
        setError(errorMessage);
        console.log("Error state should be set to:", errorMessage);
      } finally {
        console.log("Setting loading to false");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error in form submission:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }

    console.log("=== FORM SUBMIT END ===");
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    <br />
                    <small>Debug: Error state is set</small>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@marketplace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>Default admin credentials:</p>
          <p className="font-mono">admin@marketplace.com / AdminPassword123!</p>
        </div>
      </div>
    </div>
  );
}
