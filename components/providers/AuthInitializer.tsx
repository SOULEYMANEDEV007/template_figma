// @ts-nocheck
// components/providers/AuthInitializer.tsx - Updated with real API
"use client";

import { useAuthStore } from "@/stores/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthInitializerProps {
    children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { initializeAuth, isAuthenticated, isLoading } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeAuth();
            } catch (error) {
                console.error("Auth initialization failed:", error);
            } finally {
                setIsInitialized(true);
            }
        };

        init();
    }, [initializeAuth]);

    useEffect(() => {
        if (!isInitialized || isLoading) return;

        const isLoginPage = pathname === "/login";
        const isPublicPage = pathname === "/" || isLoginPage;

        if (!isAuthenticated && !isPublicPage) {
            // Redirect to login if trying to access protected route without auth
            router.push("/login");
        } else if (isAuthenticated && isLoginPage) {
            // Redirect to dashboard if authenticated user tries to access login
            router.push("/dashboard");
        }
    }, [isInitialized, isLoading, isAuthenticated, pathname, router]);

    // Show loading spinner while initializing
    if (!isInitialized || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Initialisation...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default AuthInitializer;
