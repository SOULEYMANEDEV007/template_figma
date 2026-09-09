"use client";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useEffect } from "react";

export default function LDFAuthInitializer({ children }: { children: React.ReactNode }) {
  const { initializeAuth, setNotifications } = useLDFAuthStore();

  useEffect(() => {
    initializeAuth();
    // Notifications vides par défaut (seront chargées depuis la DB si nécessaire)
    setNotifications([]);
  }, [initializeAuth, setNotifications]);

  return <>{children}</>;
}
