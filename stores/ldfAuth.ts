// @ts-nocheck
"use client";
// stores/ldfAuth.ts — Store Zustand ViFlo avec auth et notifications in-app persistantes
import { demoAccounts, mockSouscripteursUsers, mockUsers } from "@/lib/ldfData";
import type { LDFUser, LDFUserRole, Notification } from "@/types/ldf";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { create } from "zustand";
import { toast } from "sonner";

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
  addNotification: (data: Omit<Notification, "id" | "date" | "heure" | "estLue">) => void;
  setNotifications: (n: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

// ─── Gestionnaire persistant de notifications in-app ──────────────────────────
const NOTIF_STORAGE_KEY = "viflo_notifications_db_v1";

export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "NOTIF-001",
    titre: "Dossier déposé à AFG Bank",
    message: "Le dossier DOS-2026-0042 (Mamadou Coulibaly) a été remis à l'agence Plateau pour analyse bancaire.",
    categorie: "dossier",
    estLue: false,
    lien: "/dashboard/dossiers",
    reference: "DOS-2026-0042",
    date: "Aujourd'hui",
    heure: "09:30",
    roles: ["admin", "fournisseur", "banque"],
  },
  {
    id: "NOTIF-002",
    titre: "Accord de financement AFG Bank",
    message: "Comité de crédit : Le dossier DOS-2026-0038 a été accepté pour un montant de 1 250 000 FCFA.",
    categorie: "dossier",
    estLue: false,
    lien: "/dashboard/dossiers",
    reference: "DOS-2026-0038",
    date: "Aujourd'hui",
    heure: "10:15",
    roles: ["admin", "fournisseur", "souscripteur"],
  },
  {
    id: "NOTIF-003",
    titre: "Devis rattaché à la souscription",
    message: "Librairie de France Groupe a établi le devis DEV-2026-0012 pour la souscription VF-2026-0012.",
    categorie: "devis",
    estLue: false,
    lien: "/dashboard/devis",
    reference: "DEV-2026-0012",
    date: "Aujourd'hui",
    heure: "11:00",
    roles: ["admin", "fournisseur", "banque", "souscripteur"],
  },
  {
    id: "NOTIF-004",
    titre: "Bienvenue sur ViFlo VITALIS",
    message: "Votre espace opérationnel est configuré pour le suivi des souscriptions et des financements.",
    categorie: "systeme",
    estLue: true,
    lien: "/dashboard",
    date: "Hier",
    heure: "08:00",
    roles: ["admin", "fournisseur", "banque", "souscripteur"],
  },
];

export function getStoredNotifications(): Notification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
  } catch {}
}

export function getFilteredNotifications(role: string): Notification[] {
  if (!role) return [];
  const all = getStoredNotifications();
  return all.filter((n) => {
    if (!n.roles || n.roles.length === 0) return true;
    return n.roles.includes(role);
  });
}

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
        const filtered = getFilteredNotifications(user.role);
        const unreadCount = filtered.filter((n) => !n.estLue).length;
        set({ user, isAuthenticated: true, isLoading: false, notifications: filtered, unreadCount });
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

    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
      ?? mockSouscripteursUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      set({ isLoading: false, error: "Utilisateur introuvable." });
      throw new Error("Utilisateur introuvable");
    }

    setCookie("ldf_user", JSON.stringify(user), {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: false,
    });

    const filtered = getFilteredNotifications(user.role);
    const unreadCount = filtered.filter((n) => !n.estLue).length;
    set({ user, isAuthenticated: true, isLoading: false, error: null, notifications: filtered, unreadCount });
  },

  // ── Déconnexion ────────────────────────────────────────────────────────────
  logout: () => {
    deleteCookie("ldf_user");
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isMobileSidebarOpen: false,
      notifications: [],
      unreadCount: 0,
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
  addNotification: (data: Omit<Notification, "id" | "date" | "heure" | "estLue">) => {
    const newNotif: Notification = {
      ...data,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toLocaleDateString("fr-FR"),
      heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      estLue: false,
    };
    const all = [newNotif, ...getStoredNotifications()];
    saveStoredNotifications(all);

    const currentUser = get().user;
    if (currentUser?.role && (!data.roles || data.roles.length === 0 || data.roles.includes(currentUser.role))) {
      const currentList = [newNotif, ...get().notifications];
      set({
        notifications: currentList,
        unreadCount: currentList.filter((n) => !n.estLue).length,
      });
      try {
        toast.info(newNotif.titre, { description: newNotif.message });
      } catch {}
    }
  },

  setNotifications: (notifications) => {
    const unreadCount = notifications?.filter((n) => !n.estLue).length || 0;
    set({ notifications: notifications || [], unreadCount });
  },

  markNotificationRead: (id) => {
    const all = getStoredNotifications().map((n) =>
      n.id === id ? { ...n, estLue: true } : n
    );
    saveStoredNotifications(all);

    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, estLue: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.estLue).length };
    });
  },

  markAllNotificationsRead: () => {
    const currentUser = get().user;
    const all = getStoredNotifications().map((n) => {
      if (!currentUser?.role || !n.roles || n.roles.includes(currentUser.role)) {
        return { ...n, estLue: true };
      }
      return n;
    });
    saveStoredNotifications(all);

    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, estLue: true })),
      unreadCount: 0,
    }));
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrateur ViFlo",
    banque: "Responsable Banque",
    fournisseur: "Fournisseur",
    souscripteur: "Client / Souscripteur",
  };
  return labels[role] ?? role;
}

export function getDashboardPath(role: string): string {
  if (role === "souscripteur") return "/dashboard/souscripteur";
  return "/dashboard";
}

export function emitInAppNotification(data: Omit<Notification, "id" | "date" | "heure" | "estLue">) {
  useLDFAuthStore.getState().addNotification(data);
}
