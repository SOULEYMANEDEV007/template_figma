// lib/api/auth.ts - Corrected to use cookies
import { getCookie, setCookie } from "cookies-next";
import { API_ROUTES } from "../../routes/api";
import type {
    ApiResponse,
    AuthResponse,
    LoginCredentials,
    UpdatePasswordData,
    UpdateProfileData,
    User,
} from "../../types/api";
import {
    apiClient,
    handleApiResponse,
    removeToken,
    setToken,
} from "../axios.setup";

export const authApi = {
    /**
     * Login user
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
            API_ROUTES.AUTH.LOGIN,
            credentials
        );

        const authData = handleApiResponse(response);

        // Store token in cookies
        if (authData.token) {
            setToken(authData.token);

            // Store user data for offline access
            if (typeof window !== "undefined") {
                setCookie("user_data", JSON.stringify(authData.user), {
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    // secure: process.env.NODE_ENV === "production",
                    secure: false, //! For TEST PROD
                    sameSite: "lax",
                });
            }
        }

        return authData;
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        try {
            await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
            // Even if the API call fails, we should still clear cookies
            console.warn(
                "Logout API call failed, but clearing cookies:",
                error
            );
        } finally {
            removeToken();
        }
    },

    /**
     * Get current authenticated user
     */
    me: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>(
            API_ROUTES.AUTH.ME
        );
        const user = handleApiResponse(response);

        // Update stored user data
        if (typeof window !== "undefined") {
            setCookie("user_data", JSON.stringify(user), {
                maxAge: 60 * 60 * 24 * 7,
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });
        }

        return user;
    },

    /**
     * Refresh authentication token
     */
    refresh: async (): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
            API_ROUTES.AUTH.REFRESH
        );

        const authData = handleApiResponse(response);

        // Update token
        if (authData.token) {
            setToken(authData.token);

            // Update user data
            if (typeof window !== "undefined") {
                setCookie("user_data", JSON.stringify(authData.user), {
                    maxAge: 60 * 60 * 24 * 7,
                    // secure: process.env.NODE_ENV === "production",
                    secure: false, //! For TEST PROD
                    sameSite: "lax",
                });
            }
        }

        return authData;
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: UpdateProfileData): Promise<User> => {
        const response = await apiClient.put<ApiResponse<User>>(
            API_ROUTES.AUTH.UPDATE_PROFILE,
            data
        );

        const user = handleApiResponse(response);

        // Update stored user data
        if (typeof window !== "undefined") {
            setCookie("user_data", JSON.stringify(user), {
                maxAge: 60 * 60 * 24 * 7,
                // secure: process.env.NODE_ENV === "production",
                secure: false, //! For TEST PROD
                sameSite: "lax",
            });
        }

        return user;
    },

    /**
     * Update user password
     */
    updatePassword: async (data: UpdatePasswordData): Promise<void> => {
        const response = await apiClient.put<ApiResponse<null>>(
            API_ROUTES.AUTH.UPDATE_PASSWORD,
            data
        );

        handleApiResponse(response);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        if (typeof window === "undefined") return false;

        const token = getCookie("authToken");
        const userData = getCookie("user_data");

        return !!(token && userData);
    },

    /**
     * Get stored user data
     */
    getStoredUser: (): User | null => {
        if (typeof window === "undefined") return null;

        try {
            const userData = getCookie("user_data") as string;
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error parsing stored user data:", error);
            return null;
        }
    },

    /**
     * Clear all authentication data
     */
    clearAuth: (): void => {
        removeToken();
    },
};

export default authApi;
