// @ts-nocheck
"use client";
import LDFHeader from "@/components/layout/LDFHeader";
import LDFSidebar from "@/components/layout/LDFSidebar";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isSidebarCollapsed } = useLDFAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg">
            <div className="w-full h-full animate-pulse" style={{ background: "linear-gradient(135deg,#f6c90e,#f0a500)" }} />
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <LDFSidebar />
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <LDFHeader />
        <main className="p-4 sm:p-6 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
