"use client";
// stores/ldfAuth.ts — Store Zustand LDF avec auth mockée complète
import { demoAccounts, mockUsers } from "@/lib/ldfData";
import type { LDFUser, LDFUserRole, Notification } from "@/types/ldf";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthState = {
  user: LDFUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  clearError: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  toggleMobileSidebar: () => void;
  setNotifications: (n: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useLDFAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  notifications: [],
  unreadCount: 0,

  // ── Initialisation au démarrage ────────────────────────────────────────────
  initializeAuth: () => {
    try {
      const userCookie = getCookie("ldf_user");
      if (userCookie) {
        const user: LDFUser = JSON.parse(userCookie as string);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      deleteCookie("ldf_user");
      set({ isLoading: false });
    }
  },

  // ── Connexion ──────────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    // Simulation délai réseau
    await new Promise((r) => setTimeout(r, 800));

    const account = demoAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (!account) {
      set({ isLoading: false, error: "Email ou mot de passe incorrect." });
      throw new Error("Identifiants invalides");
    }

    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      set({ isLoading: false, error: "Utilisateur introuvable." });
      throw new Error("Utilisateur introuvable");
    }

    setCookie("ldf_user", JSON.stringify(user), {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: false,
    });

    set({ user, isAuthenticated: true, isLoading: false, error: null });
  },

  // ── Déconnexion ────────────────────────────────────────────────────────────
  logout: () => {
    deleteCookie("ldf_user");
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isMobileSidebarOpen: false,
    });
  },

  clearError: () => set({ error: null }),

  // ── Sidebar ────────────────────────────────────────────────────────────────
  toggleSidebar: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ isSidebarCollapsed: v }),
  setMobileSidebarOpen: (v) => set({ isMobileSidebarOpen: v }),
  toggleMobileSidebar: () =>
    set((s) => ({ isMobileSidebarOpen: !s.isMobileSidebarOpen })),

  // ── Notifications ──────────────────────────────────────────────────────────
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.estLue).length;
    set({ notifications, unreadCount });
  },
  markNotificationRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, estLue: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.estLue).length };
    }),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, estLue: true })),
      unreadCount: 0,
    })),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getRoleLabel(role: LDFUserRole): string {
  const labels: Record<LDFUserRole, string> = {
    admin: "Administrateur LDF",
    banque: "Responsable Banque",
    fournisseur: "Fournisseur",
  };
  return labels[role] ?? role;
}

export function getDashboardPath(role: LDFUserRole): string {
  return "/dashboard";
}
