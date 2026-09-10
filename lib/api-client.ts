// @ts-nocheck
// lib/api-client.ts

import axios from "axios";

export interface ApiClientError {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
    status?: number;
}

// Main API client
export const api = {

};

// Error handling
export const handleApiError = (error: unknown): ApiClientError => {
    if (axios.isAxiosError(error)) {
        const response = error.response;

        if (response) {
            const data = response.data as {
                message?: string;
                errors?: Record<string, string[]>;
                code?: string;
            };

            return {
                message: data?.message || "API request failed",
                errors: data?.errors,
                code: data?.code,
                status: response.status,
            };
        }

        if (
            error.code === "ERR_NETWORK" ||
            error.code === "NETWORK_ERROR"
        ) {
            return {
                message:
                    "Network error. Please check your internet connection.",
                code: "NETWORK_ERROR",
                status: 0,
            };
        }

        if (
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT"
        ) {
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

    if (error instanceof Error) {
        return {
            message: error.message,
            code: "UNKNOWN_ERROR",
            status: 0,
        };
    }

    return {
        message: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
        status: 0,
    };
};

// Check validation error
export const isValidationError = (
    error: ApiClientError
): boolean => {
    return !!(
        error.errors &&
        Object.keys(error.errors).length > 0
    );
};

// Get field errors
export const getFieldErrors = (
    error: ApiClientError,
    field: string
): string[] => {
    return error.errors?.[field] ?? [];
};

// Get first field error
export const getFirstFieldError = (
    error: ApiClientError,
    field: string
): string | null => {
    const errors = getFieldErrors(error, field);

    return errors.length > 0 ? errors[0] : null;
};

// Check unauthorized error
export const isUnauthorizedError = (
    error: ApiClientError
): boolean => {
    return (
        error.status === 401 ||
        error.code === "INVALID_CREDENTIALS"
    );
};

// Check forbidden error
export const isForbiddenError = (
    error: ApiClientError
): boolean => {
    return (
        error.status === 403 ||
        error.code === "INVALID_ROLE"
    );
};

// Check not found error
export const isNotFoundError = (
    error: ApiClientError
): boolean => {
    return error.status === 404;
};

// Check server error
export const isServerError = (
    error: ApiClientError
): boolean => {
    return (error.status ?? 0) >= 500;
};

// Check network error
export const isNetworkError = (
    error: ApiClientError
): boolean => {
    return (
        error.code === "NETWORK_ERROR" ||
        error.status === 0
    );
};

// Format error message
export const formatErrorMessage = (
    error: ApiClientError
): string => {
    if (isValidationError(error)) {
        const errors = Object.values(error.errors ?? {});

        for (const fieldErrors of errors) {
            if (fieldErrors.length > 0) {
                return fieldErrors[0];
            }
        }
    }

    return error.message;
};

// Get all validation errors
export const getAllValidationErrors = (
    error: ApiClientError
): string[] => {
    if (!isValidationError(error)) {
        return [];
    }

    return Object.values(error.errors ?? {}).flat();
};

// Default export
export default api;