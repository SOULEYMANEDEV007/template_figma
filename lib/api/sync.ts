// lib/api/sync.ts - Fixed sync API for Laravel backend
import { API_ROUTES } from "../../routes/api";
import type { ApiResponse } from "../../types/api";
import { apiClient } from "../axios.setup";

interface SyncEntry {
    client_temp_id: string;
    action: "create" | "update" | "delete";
    last_modified: number;
    data: any;
}

interface SyncResult {
    client_temp_id: string;
    server_id?: number;
    status:
        | "synced"
        | "conflict"
        | "already_exists"
        | "not_found"
        | "invalid_action";
    conflict_data?: any;
}

interface SyncResponse {
    synced_count: number;
    conflict_count: number;
    results: SyncResult[];
}

interface ConflictResolution {
    temp_id: string;
    resolution: "use_server" | "use_client" | "merge";
    merged_data?: any;
}

export const syncApi = {
    /**
     * Sync textbook entries with the server
     */
    syncTextbookEntries: async (
        entries: SyncEntry[]
    ): Promise<SyncResponse> => {
        const response = await apiClient.post<ApiResponse<SyncResponse>>(
            API_ROUTES.SYNC.TEXTBOOK_ENTRIES,
            { entries }
        );
        return response.data.data;
    },

    /**
     * Sync attendance records with the server
     */
    syncAttendanceRecords: async (
        entries: SyncEntry[]
    ): Promise<SyncResponse> => {
        const response = await apiClient.post<ApiResponse<SyncResponse>>(
            API_ROUTES.SYNC.ATTENDANCE,
            { entries }
        );
        return response.data.data;
    },

    /**
     * Get pending changes for synchronization
     */
    getPendingChanges: async (lastSyncTime?: string): Promise<any> => {
        const params = lastSyncTime ? { last_sync: lastSyncTime } : undefined;
        const url = lastSyncTime
            ? `${API_ROUTES.SYNC.CHANGES}?last_sync=${lastSyncTime}`
            : API_ROUTES.SYNC.CHANGES;

        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data.data;
    },

    /**
     * Resolve synchronization conflicts
     */
    resolveConflicts: async (conflicts: ConflictResolution[]): Promise<any> => {
        const response = await apiClient.post<ApiResponse<any>>(
            API_ROUTES.SYNC.RESOLVE_CONFLICTS,
            { conflicts }
        );
        return response.data.data;
    },

    /**
     * Get server sync status
     */
    getSyncStatus: async (): Promise<any> => {
        const response = await apiClient.get<ApiResponse<any>>(
            API_ROUTES.SYNC.STATUS
        );
        return response.data.data;
    },
};

export default syncApi;
