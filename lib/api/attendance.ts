// lib/api/attendance.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type {
    ApiResponse,
    Attendance,
    CreateAttendanceData,
    PaginatedResponse,
    QueryParams,
    UpdateAttendanceData,
} from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";

export const attendanceApi = {
    /**
     * Get all attendance records with optional pagination and filtering
     */
    getAll: async (
        params?: QueryParams
    ): Promise<PaginatedResponse<Attendance>> => {
        const url = buildApiUrl(API_ROUTES.ATTENDANCE.INDEX, params);
        const response =
            await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>(
                url
            );
        return handleApiResponse(response);
    },

    /**
     * Get a single attendance record by slug
     */
    getBySlug: async (
        slug: string,
        include?: string[]
    ): Promise<Attendance> => {
        const params = include ? { include: include.join(",") } : undefined;
        const url = buildApiUrl(API_ROUTES.ATTENDANCE.SHOW(slug), params);
        const response = await apiClient.get<ApiResponse<Attendance>>(url);
        return handleApiResponse(response);
    },

    /**
     * Create a new attendance record
     */
    create: async (data: CreateAttendanceData): Promise<Attendance> => {
        const response = await apiClient.post<ApiResponse<Attendance>>(
            API_ROUTES.ATTENDANCE.STORE,
            data
        );
        return handleApiResponse(response);
    },

    /**
     * Update an attendance record
     */
    update: async (
        slug: string,
        data: UpdateAttendanceData
    ): Promise<Attendance> => {
        const response = await apiClient.put<ApiResponse<Attendance>>(
            API_ROUTES.ATTENDANCE.UPDATE(slug),
            data
        );
        return handleApiResponse(response);
    },

    /**
     * Delete an attendance record
     */
    delete: async (slug: string): Promise<void> => {
        const response = await apiClient.delete<ApiResponse<null>>(
            API_ROUTES.ATTENDANCE.DELETE(slug)
        );
        handleApiResponse(response);
    },

    /**
     * Create multiple attendance records at once
     */
    bulkCreate: async (data: CreateAttendanceData[]): Promise<Attendance[]> => {
        const response = await apiClient.post<ApiResponse<Attendance[]>>(
            API_ROUTES.ATTENDANCE.BULK_STORE,
            { attendance_records: data }
        );
        return handleApiResponse(response);
    },

    /**
     * Get attendance reports
     */
    getReports: async (params?: {
        class_id?: number;
        student_id?: number;
        start_date?: string;
        end_date?: string;
        status?: string;
    }): Promise<any> => {
        const url = buildApiUrl(API_ROUTES.ATTENDANCE.REPORTS, params);
        const response = await apiClient.get<ApiResponse<any>>(url);
        return handleApiResponse(response);
    },

    /**
     * Export attendance records to Excel
     */
    export: async (params?: {
        class_id?: number;
        start_date?: string;
        end_date?: string;
        format?: "xlsx" | "csv";
    }): Promise<Blob> => {
        const url = buildApiUrl(API_ROUTES.ATTENDANCE.EXPORT, params);
        const response = await apiClient.get(url, {
            responseType: "blob",
        });
        return response.data;
    },
};

export default attendanceApi;
