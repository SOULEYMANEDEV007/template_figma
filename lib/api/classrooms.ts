// lib/api/classrooms.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type {
    ApiResponse,
    Attendance,
    Classroom,
    CreateClassroomData,
    PaginatedResponse,
    QueryParams,
    Student,
    TextbookEntry,
    UpdateClassroomData,
} from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";

export const classroomsApi = {
    /**
     * Get all classrooms with optional pagination and filtering
     */
    getAll: async (
        params?: QueryParams
    ): Promise<PaginatedResponse<Classroom> | Classroom[]> => {
        try {
            const url = buildApiUrl(API_ROUTES.CLASSROOMS.INDEX, params);
            const response =
                await apiClient.get<
                    ApiResponse<PaginatedResponse<Classroom> | Classroom[]>
                >(url);

            const result = handleApiResponse(response);

            // Debug logging
            if (process.env.NODE_ENV === "development") {
                console.log("🏫 Classrooms API Response:", {
                    result,
                    resultType: typeof result,
                    isArray: Array.isArray(result),
                    hasData:
                        result &&
                        typeof result === "object" &&
                        "data" in result,
                    length: Array.isArray(result)
                        ? result.length
                        : result &&
                            typeof result === "object" &&
                            "data" in result &&
                            Array.isArray((result as any).data)
                          ? (result as any).data.length
                          : "unknown",
                });
            }

            // Handle different response structures
            if (result && typeof result === "object") {
                // If it's a paginated response with data array
                if ("data" in result && Array.isArray((result as any).data)) {
                    return result as PaginatedResponse<Classroom>;
                }
                // If it's a direct array
                if (Array.isArray(result)) {
                    return result as Classroom[];
                }
            }

            // If it's already an array
            if (Array.isArray(result)) {
                return result as Classroom[];
            }

            // Fallback to empty array
            console.warn("Unexpected classrooms response format:", result);
            return [];
        } catch (error) {
            console.error("Error fetching classrooms:", error);
            throw error;
        }
    },

    /**
     * Get a single classroom by slug
     */
    getBySlug: async (slug: string, include?: string[]): Promise<Classroom> => {
        try {
            const params = include ? { include: include.join(",") } : undefined;
            const url = buildApiUrl(API_ROUTES.CLASSROOMS.SHOW(slug), params);
            const response = await apiClient.get<ApiResponse<Classroom>>(url);
            return handleApiResponse(response);
        } catch (error) {
            console.error(`Error fetching classroom ${slug}:`, error);
            throw error;
        }
    },

    /**
     * Create a new classroom
     */
    create: async (data: CreateClassroomData): Promise<Classroom> => {
        try {
            const response = await apiClient.post<ApiResponse<Classroom>>(
                API_ROUTES.CLASSROOMS.STORE,
                data
            );
            return handleApiResponse(response);
        } catch (error) {
            console.error("Error creating classroom:", error);
            throw error;
        }
    },

    /**
     * Update a classroom
     */
    update: async (
        slug: string,
        data: UpdateClassroomData
    ): Promise<Classroom> => {
        try {
            const response = await apiClient.put<ApiResponse<Classroom>>(
                API_ROUTES.CLASSROOMS.UPDATE(slug),
                data
            );
            return handleApiResponse(response);
        } catch (error) {
            console.error(`Error updating classroom ${slug}:`, error);
            throw error;
        }
    },

    /**
     * Delete a classroom
     */
    delete: async (slug: string): Promise<void> => {
        try {
            const response = await apiClient.delete<ApiResponse<null>>(
                API_ROUTES.CLASSROOMS.DELETE(slug)
            );
            handleApiResponse(response);
        } catch (error) {
            console.error(`Error deleting classroom ${slug}:`, error);
            throw error;
        }
    },

    /**
     * Get all students in a classroom
     */
    getStudents: async (
        slug: string,
        params?: QueryParams
    ): Promise<PaginatedResponse<Student>> => {
        try {
            const url = buildApiUrl(
                API_ROUTES.CLASSROOMS.STUDENTS(slug),
                params
            );
            const response =
                await apiClient.get<ApiResponse<PaginatedResponse<Student>>>(
                    url
                );
            return handleApiResponse(response);
        } catch (error) {
            console.error(
                `Error fetching students for classroom ${slug}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Get attendance records for a classroom
     */
    getAttendance: async (
        slug: string,
        params?: QueryParams
    ): Promise<PaginatedResponse<Attendance>> => {
        try {
            const url = buildApiUrl(
                API_ROUTES.CLASSROOMS.ATTENDANCE(slug),
                params
            );
            const response =
                await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>(
                    url
                );
            return handleApiResponse(response);
        } catch (error) {
            console.error(
                `Error fetching attendance for classroom ${slug}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Get textbook entries for a classroom
     */
    getTextbookEntries: async (
        slug: string,
        params?: QueryParams
    ): Promise<PaginatedResponse<TextbookEntry>> => {
        try {
            const url = buildApiUrl(
                API_ROUTES.CLASSROOMS.TEXTBOOK_ENTRIES(slug),
                params
            );
            const response =
                await apiClient.get<
                    ApiResponse<PaginatedResponse<TextbookEntry>>
                >(url);
            return handleApiResponse(response);
        } catch (error) {
            console.error(
                `Error fetching textbook entries for classroom ${slug}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Get classroom statistics
     */
    getStatistics: async (
        slug: string,
        params?: { period?: string; subject?: string }
    ): Promise<any> => {
        try {
            const url = buildApiUrl(
                API_ROUTES.CLASSROOMS.STATISTICS(slug),
                params
            );
            const response = await apiClient.get<ApiResponse<any>>(url);
            return handleApiResponse(response);
        } catch (error) {
            console.error(
                `Error fetching statistics for classroom ${slug}:`,
                error
            );
            throw error;
        }
    },
};

export default classroomsApi;
