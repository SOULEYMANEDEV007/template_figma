// stores/auth.ts - Updated with real API and cookies-next
"use client";

import api, { handleApiError } from "@/lib/api-client";
import { User, UserRole } from "@/types";
import type { LoginCredentials } from "@/types/api";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { create } from "zustand";

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    selectedRole: UserRole | null;
    error: string | null;
    isMobileSidebarOpen: boolean;
};

type AuthActions = {
    setSelectedRole: (role: UserRole) => void;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    setUser: (user: User) => void;
    clearError: () => void;
    refreshToken: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    setMobileSidebarOpen: (open: boolean) => void;
    toggleMobileSidebar: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    selectedRole: null,
    error: null,
    isMobileSidebarOpen: false,

    initializeAuth: async () => {
        set({ isLoading: true, error: null });

        try {
            const authToken = getCookie("authToken");
            const userCookie = getCookie("user");

            if (authToken && userCookie) {
                // Try to verify token with API
                try {
                    const user = await api.auth.me();

                    // Convert API user to your User type
                    const mappedUser: User = {
                        id: user.id.toString(),
                        slug: user.slug.toString(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role as UserRole,
                        matricule: user.matricule,
                        phone: user.phone || "",
                        avatar: user.avatar || "",
                    };

                    // Update cookies with fresh data
                    setCookie("user", JSON.stringify(mappedUser), {
                        maxAge: 60 * 60 * 24 * 7, // 7 days
                        // secure: process.env.NODE_ENV === "production",
                        secure: false, //! For TEST PROD
                        sameSite: "lax",
                    });

                    set({
                        user: mappedUser,
                        isAuthenticated: true,
                        isLoading: false,
                        selectedRole: mappedUser.role,
                    });
                } catch (error) {
                    // Token is invalid, clear everything
                    deleteCookie("user");
                    deleteCookie("isAuthenticated");
                    deleteCookie("authToken");
                    deleteCookie("selectedRole");

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        selectedRole: null,
                    });
                }
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            set({
                isLoading: false,
                error: "Failed to initialize authentication",
            });
        }
    },

    setSelectedRole: (role: UserRole) => {
        set({ selectedRole: role });
        setCookie("selectedRole", role, {
            maxAge: 60 * 60 * 24, // 24 hours
            sameSite: "lax",
        });
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
            const { selectedRole } = get();
            if (!selectedRole) {
                throw new Error("Veuillez sélectionner un rôle");
            }

            // Make real API call
            const credentials: LoginCredentials = {
                email,
                password,
                role: selectedRole,
            };

            const authResponse = await api.auth.login(credentials);

            // Convert API user to your User type
            const user: User = {
                id: authResponse.user.id.toString(),
                slug: authResponse.user.slug.toString(),
                firstName: authResponse.user.firstName,
                lastName: authResponse.user.lastName,
                email: authResponse.user.email,
                role: authResponse.user.role as UserRole,
                matricule: authResponse.user.matricule,
                phone: authResponse.user.phone || "",
                avatar: authResponse.user.avatar || "",
            };

            // Set cookies with security options
            setCookie("user", JSON.stringify(user), {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });

            setCookie("isAuthenticated", "true", {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });

            setCookie("authToken", authResponse.token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                httpOnly: false, // Can't be httpOnly in client-side
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            const apiError = handleApiError(error);
            set({
                isLoading: false,
                error: apiError.message,
            });
            throw apiError;
        }
    },

    logout: async () => {
        set({ isLoading: true });

        try {
            // Call API logout
            await api.auth.logout();
        } catch (error) {
            // Even if logout API fails, clear local data
            console.warn("Logout API failed:", error);
        } finally {
            // Clear all auth cookies
            deleteCookie("user");
            deleteCookie("isAuthenticated");
            deleteCookie("authToken");
            deleteCookie("selectedRole");

            set({
                user: null,
                isAuthenticated: false,
                selectedRole: null,
                isLoading: false,
                error: null,
            });
        }
    },

    refreshToken: async () => {
        try {
            const authResponse = await api.auth.refresh();

            // Convert API user to your User type
            const user: User = {
                id: authResponse.user.id.toString(),
                slug: authResponse.user.slug.toString(),
                firstName: authResponse.user.firstName,
                lastName: authResponse.user.lastName,
                email: authResponse.user.email,
                role: authResponse.user.role as UserRole,
                matricule: authResponse.user.matricule,
                phone: authResponse.user.phone || "",
                avatar: authResponse.user.avatar || "",
            };

            // Update cookies
            setCookie("user", JSON.stringify(user), {
                maxAge: 60 * 60 * 24 * 7,
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });

            setCookie("authToken", authResponse.token, {
                maxAge: 60 * 60 * 24 * 7,
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });

            set({
                user,
                isAuthenticated: true,
                error: null,
            });
        } catch (error) {
            // If refresh fails, logout user
            const { logout } = get();
            await logout();
            throw error;
        }
    },

    updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
            const updatedUser = await api.auth.updateProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            });

            // Convert API user to your User type
            const user: User = {
                id: updatedUser.id.toString(),
                slug: updatedUser.slug.toString(),
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role as UserRole,
                matricule: updatedUser.matricule,
                phone: updatedUser.phone || "",
                avatar: updatedUser.avatar || "",
            };

            // Update cookie
            setCookie("user", JSON.stringify(user), {
                maxAge: 60 * 60 * 24 * 7,
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });

            set({
                user,
                isLoading: false,
            });
        } catch (error) {
            const apiError = handleApiError(error);
            set({
                isLoading: false,
                error: apiError.message,
            });
            throw apiError;
        }
    },

    setUser: (user: User) => {
        setCookie("user", JSON.stringify(user), {
            maxAge: 60 * 60 * 24 * 7,
            // secure: process.env.NODE_ENV === "production",
            secure: false, //! For TEST PROD
            sameSite: "lax",
        });
        set({ user, isAuthenticated: true });
    },

    clearError: () => set({ error: null }),

    setMobileSidebarOpen: (open: boolean) => set({ isMobileSidebarOpen: open }),

    toggleMobileSidebar: () => {
        const { isMobileSidebarOpen } = get();
        set({ isMobileSidebarOpen: !isMobileSidebarOpen });
    },
}));
