"use client";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useLDFAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
