// lib/api/students.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type {
    ApiResponse,
    Attendance,
    CreateStudentData,
    PaginatedResponse,
    QueryParams,
    Student,
    UpdateStudentData,
} from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";

export const studentsApi = {
    /**
     * Get all students with optional pagination and filtering
     */
    getAll: async (
        params?: QueryParams
    ): Promise<PaginatedResponse<Student>> => {
        const url = buildApiUrl(API_ROUTES.STUDENTS.INDEX, params);
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<Student>>>(url);
        return handleApiResponse(response);
    },

    /**
     * Get a single student by slug
     */
    getBySlug: async (slug: string, include?: string[]): Promise<Student> => {
        const params = include ? { include: include.join(",") } : undefined;
        const url = buildApiUrl(API_ROUTES.STUDENTS.SHOW(slug), params);
        const response = await apiClient.get<ApiResponse<Student>>(url);
        return handleApiResponse(response);
    },

    /**
     * Create a new student
     */
    create: async (data: CreateStudentData): Promise<Student> => {
        const response = await apiClient.post<ApiResponse<Student>>(
            API_ROUTES.STUDENTS.STORE,
            data
        );
        return handleApiResponse(response);
    },

    /**
     * Update a student
     */
    update: async (slug: string, data: UpdateStudentData): Promise<Student> => {
        const response = await apiClient.put<ApiResponse<Student>>(
            API_ROUTES.STUDENTS.UPDATE(slug),
            data
        );
        return handleApiResponse(response);
    },

    /**
     * Delete a student
     */
    delete: async (slug: string): Promise<void> => {
        const response = await apiClient.delete<ApiResponse<null>>(
            API_ROUTES.STUDENTS.DELETE(slug)
        );
        handleApiResponse(response);
    },

    /**
     * Get attendance history for a student
     */
    getAttendanceHistory: async (
        slug: string,
        params?: QueryParams
    ): Promise<PaginatedResponse<Attendance>> => {
        const url = buildApiUrl(
            API_ROUTES.STUDENTS.ATTENDANCE_HISTORY(slug),
            params
        );
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>(
                url
            );
        return handleApiResponse(response);
    },

    /**
     * Import students from file
     */
    import: async (
        file: File,
        classId?: number
    ): Promise<{ imported: number; errors: any[] }> => {
        const formData = new FormData();
        formData.append("file", file);
        if (classId) {
            formData.append("class_id", classId.toString());
        }

        const response = await apiClient.post<
            ApiResponse<{ imported: number; errors: any[] }>
        >(API_ROUTES.STUDENTS.IMPORT, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return handleApiResponse(response);
    },

    /**
     * Export students to Excel
     */
    export: async (params?: {
        class_id?: number;
        format?: "xlsx" | "csv";
    }): Promise<Blob> => {
        const url = buildApiUrl(API_ROUTES.STUDENTS.EXPORT, params);
        const response = await apiClient.get(url, {
            responseType: "blob",
        });
        return response.data;
    },
};

export default studentsApi;
