// @ts-nocheck
// lib/utils/error.ts - Error handling utilities
import type { ApiError } from "@/types/api";
import { AxiosError } from "axios";

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    // Handle axios errors
    if (error instanceof AxiosError) {
        // Check if we have a response from the server
        if (error.response?.data) {
            const data = error.response.data;

            // Handle API response format
            if (data.message) {
                return data.message;
            }

            // Handle validation errors
            if (data.errors && typeof data.errors === "object") {
                const errorMessages = Object.values(data.errors).flat();
                return errorMessages.join(", ");
            }
        }

        // Handle network errors
        if (error.code === "NETWORK_ERROR") {
            return "Erreur de réseau. Vérifiez votre connexion internet.";
        }

        if (error.code === "ECONNABORTED") {
            return "La requête a expiré. Veuillez réessayer.";
        }

        // Handle HTTP status codes
        switch (error.response?.status) {
            case 401:
                return "Non autorisé. Veuillez vous reconnecter.";
            case 403:
                return "Accès interdit. Vous n'avez pas les permissions nécessaires.";
            case 404:
                return "Ressource non trouvée.";
            case 422:
                return "Données invalides. Vérifiez les informations saisies.";
            case 429:
                return "Trop de requêtes. Veuillez patienter avant de réessayer.";
            case 500:
                return "Erreur interne du serveur. Veuillez réessayer plus tard.";
            case 503:
                return "Service temporairement indisponible. Veuillez réessayer plus tard.";
            default:
                return error.message || "Une erreur inattendue s'est produite.";
        }
    }

    // Handle ApiError type
    if (error && typeof error === "object" && "message" in error) {
        const apiError = error as ApiError;
        return apiError.message;
    }

    // Handle Error instances
    if (error instanceof Error) {
        return error.message;
    }

    // Handle string errors
    if (typeof error === "string") {
        return error;
    }

    return "Une erreur inattendue s'est produite.";
};

/**
 * Extract validation errors from API response
 */
export const getValidationErrors = (
    error: unknown
): Record<string, string[]> => {
    if (error instanceof AxiosError && error.response?.data?.errors) {
        return error.response.data.errors;
    }

    if (error && typeof error === "object" && "errors" in error) {
        const apiError = error as ApiError;
        return apiError.errors || {};
    }

    return {};
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.code === "NETWORK_ERROR" || !error.response;
    }
    return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 401;
    }
    return false;
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 403;
    }
    return false;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 422;
    }
    return false;
};

/**
 * Check if error is a not found error
 */
export const isNotFoundError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 404;
    }
    return false;
};

/**
 * Get HTTP status code from error
 */
export const getErrorStatusCode = (error: unknown): number | null => {
    if (error instanceof AxiosError && error.response) {
        return error.response.status;
    }
    return null;
};

/**
 * Create a user-friendly error message based on context
 */
export const getContextualErrorMessage = (
    error: unknown,
    context: string
): string => {
    const baseMessage = getErrorMessage(error);

    if (isNetworkError(error)) {
        return `Impossible de ${context}. Vérifiez votre connexion internet.`;
    }

    if (isAuthError(error)) {
        return `Session expirée. Veuillez vous reconnecter pour ${context}.`;
    }

    if (isPermissionError(error)) {
        return `Permissions insuffisantes pour ${context}.`;
    }

    if (isNotFoundError(error)) {
        return `Élément introuvable. Impossible de ${context}.`;
    }

    if (isValidationError(error)) {
        return `Données invalides. ${baseMessage}`;
    }

    return `Erreur lors de ${context}: ${baseMessage}`;
};
