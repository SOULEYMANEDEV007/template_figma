// lib/api/dashboard.ts
import { API_ROUTES, buildApiUrl } from "../../routes/api";
import type { ApiResponse, DashboardStats } from "../../types/api";
import { apiClient, handleApiResponse } from "../axios.setup";

export const dashboardApi = {
    /**
     * Get dashboard statistics
     */
    getStats: async (params?: {
        period?: "today" | "week" | "month" | "year";
    }): Promise<DashboardStats> => {
        const url = buildApiUrl(API_ROUTES.DASHBOARD.STATS, params);
        const response = await apiClient.get<ApiResponse<DashboardStats>>(url);
        return handleApiResponse(response);
    },

    /**
     * Get recent activity for dashboard
     */
    getRecentActivity: async (params?: {
        limit?: number;
        type?: string;
    }): Promise<any[]> => {
        const url = buildApiUrl(API_ROUTES.DASHBOARD.RECENT_ACTIVITY, params);
        const response = await apiClient.get<ApiResponse<any[]>>(url);
        return handleApiResponse(response);
    },
};

export default dashboardApi;
