// lib/api-client.ts
import { AxiosError } from "axios";
import type { ApiError } from "../types/api";
import attendanceApi from "./api/attendance";
import authApi from "./api/auth";
import classroomsApi from "./api/classrooms";
import dashboardApi from "./api/dashboard";
import reportsApi from "./api/reports";
import studentsApi from "./api/students";
import syncApi from "./api/sync";
import textbooksApi from "./api/textbooks";

// Main API client that combines all API modules
export const api = {
    auth: authApi,
    classrooms: classroomsApi,
    students: studentsApi,
    attendance: attendanceApi,
    textbooks: textbooksApi,
    dashboard: dashboardApi,
    reports: reportsApi,
    sync: syncApi,
};

// Error handling utilities
export const handleApiError = (error: unknown): ApiError => {
    if (error instanceof AxiosError) {
        const response = error.response;

        if (response?.data) {
            // Laravel validation errors
            if (response.data.errors) {
                return {
                    message: response.data.message || "Validation failed",
                    errors: response.data.errors,
                    code: response.data.code,
                    status: response.status,
                };
            }

            // General API errors
            return {
                message: response.data.message || "API request failed",
                code: response.data.code,
                status: response.status,
            };
        }

        // Network or other axios errors
        if (error.code === "NETWORK_ERROR") {
            return {
                message:
                    "Network error. Please check your internet connection.",
                code: "NETWORK_ERROR",
                status: 0,
            };
        }

        if (error.code === "ECONNABORTED") {
            return {
                message: "Request timeout. Please try again.",
                code: "TIMEOUT",
                status: 0,
            };
        }

        return {
            message: error.message || "An unexpected error occurred",
            code: error.code,
            status: 0,
        };
    }

    // Non-axios errors
    if (error instanceof Error) {
        return {
            message: error.message,
            code: "UNKNOWN_ERROR",
            status: 0,
        };
    }

    // Unknown error type
    return {
        message: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
        status: 0,
    };
};

// Utility function to check if error is a validation error
export const isValidationError = (error: ApiError): boolean => {
    return !!(error.errors && Object.keys(error.errors).length > 0);
};

// Utility function to get validation errors for a specific field
export const getFieldErrors = (error: ApiError, field: string): string[] => {
    return error.errors?.[field] || [];
};

// Utility function to get the first validation error for a field
export const getFirstFieldError = (
    error: ApiError,
    field: string
): string | null => {
    const errors = getFieldErrors(error, field);
    return errors.length > 0 ? errors[0] : null;
};

// Utility function to check if user is unauthorized
export const isUnauthorizedError = (error: ApiError): boolean => {
    return error.status === 401 || error.code === "INVALID_CREDENTIALS";
};

// Utility function to check if resource is forbidden
export const isForbiddenError = (error: ApiError): boolean => {
    return error.status === 403 || error.code === "INVALID_ROLE";
};

// Utility function to check if resource is not found
export const isNotFoundError = (error: ApiError): boolean => {
    return error.status === 404;
};

// Utility function to check if it's a server error
export const isServerError = (error: ApiError): boolean => {
    return (error.status || 0) >= 500;
};

// Utility function to check if it's a network error
export const isNetworkError = (error: ApiError): boolean => {
    return error.code === "NETWORK_ERROR" || error.status === 0;
};

// Utility function to format error message for display
export const formatErrorMessage = (error: ApiError): string => {
    // For validation errors, return the first error message
    if (isValidationError(error)) {
        const firstField = Object.keys(error.errors!)[0];
        const firstError = error.errors![firstField][0];
        return firstError;
    }

    // For other errors, return the main message
    return error.message;
};

// Utility function to get all validation error messages as a flat array
export const getAllValidationErrors = (error: ApiError): string[] => {
    if (!isValidationError(error)) {
        return [];
    }

    const allErrors: string[] = [];
    Object.values(error.errors!).forEach(fieldErrors => {
        allErrors.push(...fieldErrors);
    });

    return allErrors;
};

// Export the main API client as default
export default api;
