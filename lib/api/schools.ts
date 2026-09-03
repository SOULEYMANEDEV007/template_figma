// lib/api/schools.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type {
    ApiResponse,
    PaginatedResponse,
    School,
    Teacher,
    TextbookEntry,
} from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";
import { mockSchools, mockTeachers, mockTextbookEntries } from "../mockData";

export const schoolsApi = {
    /**
     * Get all schools (for inspector)
     */
    getAllSchools: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
    }): Promise<PaginatedResponse<School>> => {
        try {
            const url = buildApiUrl(API_ROUTES.SCHOOLS.INDEX, params);
            const response =
                await apiClient.get<ApiResponse<PaginatedResponse<School>>>(
                    url
                );
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data if API fails
            console.warn("Schools API failed, using mock data:", error);
            return {
                data: mockSchools,
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
                    first: "/api/schools?page=1",
                    last: `/api/schools?page=${Math.ceil(
                        mockSchools.length / (params?.per_page || 20)
                    )}`,
                    prev:
                        params?.page && params.page > 1
                            ? `/api/schools?page=${params.page - 1}`
                            : null,
                    next:
                        params?.page &&
                        params.per_page &&
                        params.page <
                            Math.ceil(mockSchools.length / params.per_page)
                            ? `/api/schools?page=${params.page + 1}`
                            : null,
                },
            };
        }
    },

    /**
     * Get school details
     */
    getSchool: async (slug: string): Promise<School> => {
        try {
            const url = API_ROUTES.SCHOOLS.SHOW(slug);
            const response = await apiClient.get<ApiResponse<School>>(url);
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn("School details API failed, using mock data:", error);
            const school = mockSchools.find(
                s => s.id.toString() === slug || s.slug === slug
            );
            if (!school) {
                throw new Error("School not found");
            }
            return school;
        }
    },

    /**
     * Get textbooks for a school
     */
    getSchoolTextbooks: async (
        slug: string,
        params?: {
            page?: number;
            per_page?: number;
            search?: string;
            status?: string;
        }
    ): Promise<PaginatedResponse<TextbookEntry>> => {
        try {
            const url = buildApiUrl(API_ROUTES.SCHOOLS.TEXTBOOKS(slug), params);
            const response =
                await apiClient.get<
                    ApiResponse<PaginatedResponse<TextbookEntry>>
                >(url);
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn(
                "School textbooks API failed, using mock data:",
                error
            );
            return {
                data: mockTextbookEntries,
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
                links: {
                    first: "/api/schools?page=1",
                    last: `/api/schools?page=${Math.ceil(
                        mockSchools.length / (params?.per_page || 20)
                    )}`,
                    prev:
                        params?.page && params.page > 1
                            ? `/api/schools?page=${params.page - 1}`
                            : null,
                    next:
                        params?.page &&
                        params.per_page &&
                        params.page <
                            Math.ceil(mockSchools.length / params.per_page)
                            ? `/api/schools?page=${params.page + 1}`
                            : null,
                },
            };
        }
    },

    /**
     * Get teachers for a school
     */
    getSchoolTeachers: async (
        slug: string,
        params?: {
            page?: number;
            per_page?: number;
            search?: string;
        }
    ): Promise<PaginatedResponse<Teacher>> => {
        try {
            const url = buildApiUrl(API_ROUTES.SCHOOLS.TEACHERS(slug), params);
            const response =
                await apiClient.get<ApiResponse<PaginatedResponse<Teacher>>>(
                    url
                );
            return handleApiResponse(response);
        } catch (error) {
            // Fallback to mock data
            console.warn("School teachers API failed, using mock data:", error);
            return {
                data: mockTeachers,
                meta: {
                    current_page: params?.page || 1,
                    per_page: params?.per_page || 20,
                    total: mockTeachers.length,
                    last_page: Math.ceil(
                        mockTeachers.length / (params?.per_page || 20)
                    ),
                    from: 1,
                    to: mockTeachers.length,
                },
                links: {
                    first: "/api/schools?page=1",
                    last: `/api/schools?page=${Math.ceil(
                        mockSchools.length / (params?.per_page || 20)
                    )}`,
                    prev:
                        params?.page && params.page > 1
                            ? `/api/schools?page=${params.page - 1}`
                            : null,
                    next:
                        params?.page &&
                        params.per_page &&
                        params.page <
                            Math.ceil(mockSchools.length / params.per_page)
                            ? `/api/schools?page=${params.page + 1}`
                            : null,
                },
            };
        }
    },
};

export default schoolsApi;
