// lib/api/textbooks.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type {
    ApiResponse,
    CreateTextbookEntryData,
    PaginatedResponse,
    QueryParams,
    TextbookEntry,
    UpdateTextbookEntryData,
} from "../../types/api";
import { apiClient } from "../axios.setup";

export const textbooksApi = {
    /**
     * Get all textbook entries with optional pagination and filtering
     */
    getAll: async (
        params?: QueryParams
    ): Promise<ApiResponse<PaginatedResponse<TextbookEntry>>> => {
        const url = buildApiUrl(API_ROUTES.TEXTBOOKS.INDEX, params);
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<TextbookEntry>>>(
                url
            );
        return response.data;
    },

    /**
     * Get a single textbook entry by slug
     */
    getBySlug: async (
        slug: string,
        include?: string[]
    ): Promise<TextbookEntry> => {
        const params = include ? { include: include.join(",") } : undefined;
        const url = buildApiUrl(API_ROUTES.TEXTBOOKS.SHOW(slug), params);
        const response = await apiClient.get<ApiResponse<TextbookEntry>>(url);
        return response.data.data;
    },

    /**
     * Create a new textbook entry
     */
    create: async (data: CreateTextbookEntryData): Promise<TextbookEntry> => {
        const response = await apiClient.post<ApiResponse<TextbookEntry>>(
            API_ROUTES.TEXTBOOKS.STORE,
            data
        );
        return response.data.data;
    },

    /**
     * Update a textbook entry
     */
    update: async (
        slug: string,
        data: UpdateTextbookEntryData
    ): Promise<TextbookEntry> => {
        const response = await apiClient.put<ApiResponse<TextbookEntry>>(
            API_ROUTES.TEXTBOOKS.UPDATE(slug),
            data
        );
        return response.data.data;
    },

    /**
     * Delete a textbook entry
     */
    delete: async (slug: string): Promise<void> => {
        await apiClient.delete<ApiResponse<null>>(
            API_ROUTES.TEXTBOOKS.DELETE(slug)
        );
    },

    /**
     * Submit a textbook entry
     */
    submit: async (slug: string): Promise<TextbookEntry> => {
        const response = await apiClient.post<ApiResponse<TextbookEntry>>(
            API_ROUTES.TEXTBOOKS.SUBMIT(slug)
        );
        return response.data.data;
    },

    /**
     * Get textbook entries by class
     */
    getByClass: async (
        classSlug: string,
        params?: QueryParams
    ): Promise<ApiResponse<PaginatedResponse<TextbookEntry>>> => {
        const url = buildApiUrl(`/textbooks/by-class/${classSlug}`, params);
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<TextbookEntry>>>(
                url
            );
        return response.data;
    },

    /**
     * Get subjects used in textbook entries
     */
    getSubjects: async (): Promise<string[]> => {
        const response = await apiClient.get<ApiResponse<string[]>>(
            "/textbooks/subjects"
        );
        return response.data.data;
    },

    /**
     * Get textbook statistics
     */
    getStatistics: async (params?: any): Promise<any> => {
        const url = buildApiUrl("/textbooks/statistics", params);
        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data.data;
    },

    /**
     * Export textbook entries to Excel
     */
    export: async (params?: {
        class_id?: number;
        subject?: string;
        start_date?: string;
        end_date?: string;
        format?: "xlsx" | "csv";
    }): Promise<Blob> => {
        const url = buildApiUrl(API_ROUTES.TEXTBOOKS.EXPORT, params);
        const response = await apiClient.get(url, {
            responseType: "blob",
        });
        return response.data;
    },

    /**
     * Update principal comment and status
     */
    updatePrincipalComment: async (
        slug: string,
        data: {
            principal_status: "pending" | "viewed" | "validated" | "rejected";
            principal_comment?: string;
        }
    ): Promise<TextbookEntry> => {
        const response = await apiClient.put<ApiResponse<TextbookEntry>>(
            `/textbooks/${slug}/principal-comment`,
            data
        );
        return response.data.data;
    },

    /**
     * Update inspector comment and status
     */
    updateInspectorComment: async (
        slug: string,
        data: {
            inspector_status: "pending" | "viewed" | "validated" | "rejected";
            inspector_comment?: string;
        }
    ): Promise<TextbookEntry> => {
        const response = await apiClient.put<ApiResponse<TextbookEntry>>(
            `/textbooks/${slug}/inspector-comment`,
            data
        );
        return response.data.data;
    },

    /**
     * Get textbooks needing principal review
     */
    getNeedsPrincipalReview: async (params?: {
        class_id?: number;
        subject?: string;
        per_page?: number;
        page?: number;
    }): Promise<ApiResponse<PaginatedResponse<TextbookEntry>>> => {
        const url = buildApiUrl("/textbooks/needs-principal-review", params);
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<TextbookEntry>>>(
                url
            );
        return response.data;
    },

    /**
     * Get textbooks needing inspector review
     */
    getNeedsInspectorReview: async (params?: {
        class_id?: number;
        subject?: string;
        school_id?: number;
        per_page?: number;
        page?: number;
    }): Promise<ApiResponse<PaginatedResponse<TextbookEntry>>> => {
        const url = buildApiUrl("/textbooks/needs-inspector-review", params);
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<TextbookEntry>>>(
                url
            );
        return response.data;
    },
};

export default textbooksApi;
