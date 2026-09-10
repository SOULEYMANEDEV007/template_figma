// @ts-nocheck
// lib/axios-setup.ts - Corrected with setToken function
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

// API Configuration
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001/api";
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Token management utilities using cookies
const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return (getCookie("authToken") as string) || null;
    }
    return null;
};

const setToken = (token: string): void => {
    if (typeof window !== "undefined") {
        setCookie("authToken", token, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            // secure: process.env.NODE_ENV === "production",
            secure: false, //! For TEST PROD
            sameSite: "lax",
        });
    }
};

const removeToken = (): void => {
    if (typeof window !== "undefined") {
        deleteCookie("authToken");
        deleteCookie("user");
        deleteCookie("isAuthenticated");
        deleteCookie("selectedRole");
    }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add timestamp to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now(),
        };

        // Log request in development
        if (process.env.NODE_ENV === "development") {
            console.log(
                `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
            );
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === "development") {
            console.log(
                `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
                response.data
            );
        }
        return response;
    },
    (error: AxiosError) => {
        // Log error in development
        if (process.env.NODE_ENV === "development") {
            console.error(
                `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                error
            );
        }

        // Handle token expiration
        if (error.response?.status === 401) {
            removeToken();

            // Redirect to login if not already there
            if (
                typeof window !== "undefined" &&
                !window.location.pathname.includes("/login")
            ) {
                window.location.href = "/login";
            }
        }

        // Handle network errors
        if (error.code === "NETWORK_ERROR" || !error.response) {
            console.error("Network error - check your connection");
        }

        return Promise.reject(error);
    }
);

// API Response wrapper interface
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    errors?: Record<string, string[]>;
    code?: string;
}

// Enhanced utility function to handle API responses with flexible format support
export const handleApiResponse = <T>(
    response: AxiosResponse<ApiResponse<T> | T>
): T => {
    const responseData = response.data;

    // Debug logging
    if (process.env.NODE_ENV === "development") {
        console.log("🔍 Handling API Response:", {
            status: response.status,
            data: responseData,
            dataType: typeof responseData,
            hasSuccess:
                responseData &&
                typeof responseData === "object" &&
                "success" in responseData,
            hasData:
                responseData &&
                typeof responseData === "object" &&
                "data" in responseData,
        });
    }

    // Handle different response formats
    if (responseData && typeof responseData === "object") {
        // Standard Laravel API response with success flag
        if ("success" in responseData) {
            const apiResponse = responseData as ApiResponse<T>;
            if (apiResponse.success) {
                return apiResponse.data;
            } else {
                throw new Error(apiResponse.message || "API request failed");
            }
        }

        // Direct data response (when success wrapper is not used)
        if ("data" in responseData) {
            return (responseData as any).data;
        }

        // Direct response without wrapper (for arrays or direct objects)
        return responseData as T;
    }

    // Fallback - return the response data as-is
    console.warn("Unexpected API response format:", responseData);
    return responseData as T;
};

// Export utilities
export { apiClient, getToken, removeToken, setToken };
export default apiClient;
