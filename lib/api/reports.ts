// lib/api/reports.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type { ApiResponse } from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";

export const reportsApi = {
    /**
     * Get attendance report
     */
    getAttendanceReport: async (params?: {
        class_id?: number;
        student_id?: number;
        start_date?: string;
        end_date?: string;
        format?: "summary" | "detailed";
    }): Promise<any> => {
        const url = buildApiUrl(API_ROUTES.REPORTS.ATTENDANCE, params);
        const response = await apiClient.get<ApiResponse<any>>(url);
        return handleApiResponse(response);
    },

    /**
     * Get classroom performance report
     */
    getClassroomPerformanceReport: async (params?: {
        class_id?: number;
        period?: string;
        metric?: "attendance" | "activity" | "all";
    }): Promise<any> => {
        const url = buildApiUrl(
            API_ROUTES.REPORTS.CLASSROOM_PERFORMANCE,
            params
        );
        const response = await apiClient.get<ApiResponse<any>>(url);
        return handleApiResponse(response);
    },

    /**
     * Get teacher activity report
     */
    getTeacherActivityReport: async (params?: {
        teacher_id?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<any> => {
        const url = buildApiUrl(API_ROUTES.REPORTS.TEACHER_ACTIVITY, params);
        const response = await apiClient.get<ApiResponse<any>>(url);
        return handleApiResponse(response);
    },

    /**
     * Export attendance report
     */
    exportAttendanceReport: async (params?: {
        class_id?: number;
        student_id?: number;
        start_date?: string;
        end_date?: string;
        format?: "xlsx" | "pdf";
    }): Promise<Blob> => {
        const url = buildApiUrl(API_ROUTES.REPORTS.EXPORT.ATTENDANCE, params);
        const response = await apiClient.get(url, {
            responseType: "blob",
        });
        return response.data;
    },

    /**
     * Export classroom performance report
     */
    exportClassroomPerformanceReport: async (params?: {
        class_id?: number;
        period?: string;
        format?: "xlsx" | "pdf";
    }): Promise<Blob> => {
        const url = buildApiUrl(
            API_ROUTES.REPORTS.EXPORT.CLASSROOM_PERFORMANCE,
            params
        );
        const response = await apiClient.get(url, {
            responseType: "blob",
        });
        return response.data;
    },

    /**
     * Export teacher activity report
     */
    exportTeacherActivityReport: async (params?: {
        teacher_id?: number;
        start_date?: string;
        end_date?: string;
        format?: "xlsx" | "pdf";
    }): Promise<Blob> => {
        const url = buildApiUrl(
            API_ROUTES.REPORTS.EXPORT.TEACHER_ACTIVITY,
            params
        );
        const response = await apiClient.get(url, {
            responseType: "blob",
        });
        return response.data;
    },
};

export default reportsApi;
