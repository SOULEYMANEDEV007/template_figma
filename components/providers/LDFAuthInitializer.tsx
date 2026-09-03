"use client";
import { mockNotifications } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useEffect } from "react";

export default function LDFAuthInitializer({ children }: { children: React.ReactNode }) {
  const { initializeAuth, setNotifications } = useLDFAuthStore();

  useEffect(() => {
    initializeAuth();
    setNotifications(mockNotifications);
  }, [initializeAuth, setNotifications]);

  return <>{children}</>;
}
