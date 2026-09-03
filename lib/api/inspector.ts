// lib/api/inspector.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type {
    ApiResponse,
    DashboardStats,
    PaginatedResponse,
    School,
    TextbookEntry,
} from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";
import {
    mockInspectorDashboardStats,
    mockSchools,
    mockTextbookEntries,
} from "../mockData";

export const inspectorApi = {
    /**
     * Get inspector dashboard statistics
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response = await apiClient.get<ApiResponse<DashboardStats>>(
                API_ROUTES.INSPECTOR.DASHBOARD_STATS
            );
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn(
                "Inspector dashboard stats API failed, using mock data:",
                error
            );
            return mockInspectorDashboardStats;
        }
    },

    /**
     * Get schools for inspector
     */
    getSchools: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
    }): Promise<PaginatedResponse<School>> => {
        try {
            const url = buildApiUrl(API_ROUTES.INSPECTOR.SCHOOLS, params);
            const response =
                await apiClient.get<ApiResponse<PaginatedResponse<School>>>(
                    url
                );
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn(
                "Inspector schools API failed, using mock data:",
                error
            );
            return {
                data: mockSchools as School[],
                meta: {
                    current_page: params?.page || 1,
                    per_page: params?.per_page || 20,
                    total: mockSchools.length,
                    last_page: Math.ceil(
                        mockSchools.length / (params?.per_page || 20)
                    ),
                    from: 1,
                    to: mockSchools.length,
                },
                links: {
                    first: "",
                    last: "",
                    prev: null,
                    next: null,
                },
            };
        }
    },

    /**
     * Get textbooks for a specific school (inspector view)
     */
    getSchoolTextbooks: async (
        schoolSlug: string,
        params?: {
            page?: number;
            per_page?: number;
            search?: string;
            status?: string;
            teacher?: string;
        }
    ): Promise<PaginatedResponse<TextbookEntry>> => {
        try {
            const url = buildApiUrl(
                API_ROUTES.INSPECTOR.SCHOOL_TEXTBOOKS(schoolSlug),
                params
            );
            const response =
                await apiClient.get<
                    ApiResponse<PaginatedResponse<TextbookEntry>>
                >(url);
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn(
                "Inspector school textbooks API failed, using mock data:",
                error
            );
            return {
                data: mockTextbookEntries as any,
                meta: {
                    current_page: params?.page || 1,
                    per_page: params?.per_page || 20,
                    total: mockTextbookEntries.length,
                    last_page: Math.ceil(
                        mockTextbookEntries.length / (params?.per_page || 20)
                    ),
                    from: 1,
                    to: mockTextbookEntries.length,
                },
            } as any;
        }
    },

    /**
     * Get textbook details (inspector view)
     */
    getTextbookDetail: async (
        schoolSlug: string,
        textbookSlug: string
    ): Promise<TextbookEntry> => {
        try {
            const url = API_ROUTES.INSPECTOR.TEXTBOOK_DETAIL(
                schoolSlug,
                textbookSlug
            );
            const response =
                await apiClient.get<ApiResponse<TextbookEntry>>(url);
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn(
                "Inspector textbook detail API failed, using mock data:",
                error
            );
            const textbook = mockTextbookEntries.find(
                t => t.slug === textbookSlug
            );
            if (!textbook) {
                throw new Error("Textbook not found");
            }
            return textbook as any;
        }
    },

    /**
     * Update textbook status (inspector action)
     */
    updateTextbookStatus: async (
        schoolSlug: string,
        textbookSlug: string,
        data: {
            status: "pending" | "viewed" | "validated" | "rejected";
            comment?: string;
        }
    ): Promise<TextbookEntry> => {
        try {
            const url = API_ROUTES.INSPECTOR.UPDATE_TEXTBOOK_STATUS(
                schoolSlug,
                textbookSlug
            );
            const response = await apiClient.put<ApiResponse<TextbookEntry>>(
                url,
                {
                    inspector_status: data.status,
                    inspector_comment: data.comment,
                }
            );
            return handleApiResponse(response);
        } catch (error) {
            // For mock data, we'll simulate the update
            console.warn(
                "Inspector update textbook status API failed, using mock data:",
                error
            );
            const textbook = mockTextbookEntries.find(
                t => t.slug === textbookSlug
            );
            if (!textbook) {
                throw new Error("Textbook not found");
            }

            // Simulate the update
            const updatedTextbook = {
                ...textbook,
                inspectorStatus: data.status,
                inspectorComment: data.comment,
                inspectorCommentedAt: new Date().toISOString(),
            };

            return updatedTextbook as any;
        }
    },
};

export default inspectorApi;
