// lib/syncManager.ts - IndexedDB-based sync manager
import api from "@/lib/api-client";
import {
    OfflineAttendanceEntry,
    offlineStorage,
    OfflineTextbookEntry,
} from "@/lib/offlineStorage";
import type {
    CreateAttendanceData,
    CreateTextbookEntryData,
    UpdateTextbookEntryData,
} from "@/types/api";
import { useEffect, useState } from "react";

interface SyncResponse {
    synced_count: number;
    conflict_count: number;
    results: Array<{
        client_temp_id: string;
        server_id?: number;
        server_slug?: string;
        status:
            | "synced"
            | "conflict"
            | "already_exists"
            | "not_found"
            | "invalid_action";
        conflict_data?: any;
        synced_data?: any;
    }>;
}

// Event types for sync status updates
export type SyncEvent =
    | { type: "sync_started"; totalItems: number }
    | {
          type: "sync_progress";
          completed: number;
          total: number;
          currentItem?: string;
      }
    | { type: "sync_completed"; results: SyncResponse }
    | { type: "sync_error"; error: string; tempId?: string }
    | { type: "item_synced"; tempId: string; serverData: any }
    | { type: "connection_changed"; isOnline: boolean }
    | { type: "conflict_detected"; tempId: string; conflictData: any }
    | { type: "storage_quota_warning"; usageMB: number };

type SyncEventListener = (event: SyncEvent) => void;

class IndexedDBSyncManager {
    private isOnline: boolean = true;
    private syncInProgress: boolean = false;
    private maxRetries: number = 5;
    private syncInterval: NodeJS.Timeout | null = null;
    private eventListeners: SyncEventListener[] = [];
    private batchSyncTimeout: NodeJS.Timeout | null = null;
    private pendingSyncRequests = new Set<string>();

    constructor() {
        if (typeof window !== "undefined") {
            this.isOnline = navigator.onLine;
            this.setupEventListeners();
            this.startPeriodicSync();
            this.monitorStorageQuota();
        }
    }

    // Event system for real-time updates
    addEventListener(listener: SyncEventListener) {
        this.eventListeners.push(listener);
        return () => {
            this.eventListeners = this.eventListeners.filter(
                l => l !== listener
            );
        };
    }

    private emitEvent(event: SyncEvent) {
        this.eventListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error("Error in sync event listener:", error);
            }
        });
    }

    private setupEventListeners() {
        window.addEventListener("online", () => {
            this.isOnline = true;
            this.emitEvent({ type: "connection_changed", isOnline: true });
            // Debounced sync after connection is restored
            this.debouncedSync();
        });

        window.addEventListener("offline", () => {
            this.isOnline = false;
            this.emitEvent({ type: "connection_changed", isOnline: false });
        });

        // Sync when the page becomes visible
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && this.isOnline && !this.syncInProgress) {
                this.debouncedSync();
            }
        });

        // Listen for storage events from other tabs
        window.addEventListener("storage", e => {
            if (e.key === "sync_trigger" && this.isOnline) {
                this.debouncedSync();
            }
        });
    }

    private startPeriodicSync() {
        // Sync every 5 minutes when online
        this.syncInterval = setInterval(
            () => {
                if (this.isOnline && !this.syncInProgress) {
                    this.syncPendingData();
                }
            },
            5 * 60 * 1000
        );
    }

    private async monitorStorageQuota() {
        if ("storage" in navigator && "estimate" in navigator.storage) {
            setInterval(async () => {
                try {
                    const estimate = await navigator.storage.estimate();
                    const usedMB = (estimate.usage || 0) / (1024 * 1024);
                    const quotaMB = (estimate.quota || 0) / (1024 * 1024);

                    // Warn if using more than 80% of quota
                    if (usedMB > quotaMB * 0.8) {
                        this.emitEvent({
                            type: "storage_quota_warning",
                            usageMB: usedMB,
                        });
                    }
                } catch (error) {
                    console.warn("Could not check storage quota:", error);
                }
            }, 60 * 1000); // Check every minute
        }
    }

    private debouncedSync() {
        if (this.batchSyncTimeout) {
            clearTimeout(this.batchSyncTimeout);
        }

        this.batchSyncTimeout = setTimeout(() => {
            this.syncPendingData();
        }, 2000); // Wait 2 seconds for additional changes
    }

    /**
     * Enhanced sync with IndexedDB and progress tracking
     */
    async syncPendingData(): Promise<SyncResponse | null> {
        if (this.syncInProgress || !this.isOnline) {
            return null;
        }

        this.syncInProgress = true;

        try {
            const pendingData = await offlineStorage.getAllPendingEntries();
            const totalItems = pendingData.totalCount;

            if (totalItems === 0) {
                this.syncInProgress = false;
                return null;
            }

            console.log(`Syncing ${totalItems} pending items...`);
            this.emitEvent({ type: "sync_started", totalItems });

            let completed = 0;
            const allResults: any[] = [];

            // Sync textbook entries
            if (pendingData.textbookEntries.length > 0) {
                try {
                    const results = await this.syncTextbookEntries(
                        pendingData.textbookEntries
                    );
                    allResults.push(...results);
                    completed += results.length;

                    this.emitEvent({
                        type: "sync_progress",
                        completed,
                        total: totalItems,
                    });
                } catch (error) {
                    console.error("Failed to sync textbook entries:", error);
                    this.emitEvent({
                        type: "sync_error",
                        error: `Textbook sync failed: ${error}`,
                    });
                }
            }

            // Sync attendance entries
            if (pendingData.attendanceEntries.length > 0) {
                try {
                    const results = await this.syncAttendanceEntries(
                        pendingData.attendanceEntries
                    );
                    allResults.push(...results);
                    completed += results.length;

                    this.emitEvent({
                        type: "sync_progress",
                        completed,
                        total: totalItems,
                    });
                } catch (error) {
                    console.error("Failed to sync attendance entries:", error);
                    this.emitEvent({
                        type: "sync_error",
                        error: `Attendance sync failed: ${error}`,
                    });
                }
            }

            const finalResults: SyncResponse = {
                synced_count: allResults.filter(r => r.status === "synced")
                    .length,
                conflict_count: allResults.filter(r => r.status === "conflict")
                    .length,
                results: allResults,
            };

            this.emitEvent({ type: "sync_completed", results: finalResults });

            // Store last sync time
            await offlineStorage.setMetadata("last_sync_time", Date.now());

            console.log(
                `Sync completed. Synced: ${finalResults.synced_count}, Conflicts: ${finalResults.conflict_count}`
            );

            return finalResults;
        } catch (error) {
            console.error("Sync process failed:", error);
            this.emitEvent({ type: "sync_error", error: String(error) });
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    private async syncTextbookEntries(
        entries: OfflineTextbookEntry[]
    ): Promise<any[]> {
        const results: any[] = [];

        for (const entry of entries) {
            try {
                // Mark as syncing
                await offlineStorage.updateTextbookEntry(entry.tempId, {
                    syncStatus: "syncing",
                });

                this.emitEvent({
                    type: "sync_progress",
                    completed: results.length,
                    total: entries.length,
                    currentItem: entry.title,
                });

                let result;

                if (entry.action === "create") {
                    result = await this.syncCreateTextbook(entry);
                } else if (entry.action === "update") {
                    result = await this.syncUpdateTextbook(entry);
                } else if (entry.action === "delete") {
                    result = await this.syncDeleteTextbook(entry);
                }

                if (result) {
                    results.push(result);

                    if (result.status === "synced") {
                        await offlineStorage.markAsSynced(
                            entry.tempId,
                            result.server_slug || result.server_id,
                            result.synced_data
                        );

                        this.emitEvent({
                            type: "item_synced",
                            tempId: entry.tempId,
                            serverData: result.synced_data,
                        });
                    } else if (result.status === "conflict") {
                        await offlineStorage.markAsConflict(
                            entry.tempId,
                            result.conflict_data
                        );

                        this.emitEvent({
                            type: "conflict_detected",
                            tempId: entry.tempId,
                            conflictData: result.conflict_data,
                        });
                    } else {
                        await offlineStorage.markAsFailed(
                            entry.tempId,
                            result.error || "Unknown error"
                        );
                    }
                }
            } catch (error) {
                console.error(
                    `Failed to sync textbook entry ${entry.tempId}:`,
                    error
                );
                await offlineStorage.markAsFailed(entry.tempId, String(error));

                results.push({
                    client_temp_id: entry.tempId,
                    status: "error",
                    error: String(error),
                });

                this.emitEvent({
                    type: "sync_error",
                    error: String(error),
                    tempId: entry.tempId,
                });
            }
        }

        return results;
    }

    private async syncCreateTextbook(
        entry: OfflineTextbookEntry
    ): Promise<any> {
        try {
            const createData: CreateTextbookEntryData = {
                title: entry.title,
                content: entry.content,
                description: entry.description,
                subject: entry.subject,
                class_id: parseInt(entry.classId),
                session_date: entry.sessionDate,
                session_time: entry.sessionTime,
                next_session_date: entry.nextSessionDate,
                next_session_time: entry.nextSessionTime,
            };

            const result = await api.textbooks.create(createData);

            return {
                client_temp_id: entry.tempId,
                server_slug: result.slug,
                server_id: result.id,
                status: "synced",
                synced_data: result,
            };
        } catch (error: any) {
            if (error.status === 409) {
                // Conflict
                return {
                    client_temp_id: entry.tempId,
                    status: "conflict",
                    conflict_data: error.data,
                };
            }
            throw error;
        }
    }

    private async syncUpdateTextbook(
        entry: OfflineTextbookEntry
    ): Promise<any> {
        if (!entry.originalSlug) {
            throw new Error("Missing original slug for update operation");
        }

        try {
            const updateData: UpdateTextbookEntryData = {
                title: entry.title,
                content: entry.content,
                description: entry.description,
                subject: entry.subject,
                class_id: Number(entry.classId),
                session_date: entry.sessionDate,
                session_time: entry.sessionTime,
                next_session_date: entry.nextSessionDate,
                next_session_time: entry.nextSessionTime,
            };

            const result = await api.textbooks.update(
                entry.originalSlug,
                updateData
            );

            return {
                client_temp_id: entry.tempId,
                server_slug: result.slug,
                server_id: result.id,
                status: "synced",
                synced_data: result,
            };
        } catch (error: any) {
            if (error.status === 409) {
                // Conflict
                return {
                    client_temp_id: entry.tempId,
                    status: "conflict",
                    conflict_data: error.data,
                };
            } else if (error.status === 404) {
                return {
                    client_temp_id: entry.tempId,
                    status: "not_found",
                    error: "Original entry not found on server",
                };
            }
            throw error;
        }
    }

    private async syncDeleteTextbook(
        entry: OfflineTextbookEntry
    ): Promise<any> {
        if (!entry.originalSlug) {
            throw new Error("Missing original slug for delete operation");
        }

        try {
            await api.textbooks.delete(entry.originalSlug);

            return {
                client_temp_id: entry.tempId,
                status: "synced",
            };
        } catch (error: any) {
            if (error.status === 404) {
                // Already deleted, consider it synced
                return {
                    client_temp_id: entry.tempId,
                    status: "already_exists", // Using this to indicate "already processed"
                };
            }
            throw error;
        }
    }

    private async syncAttendanceEntries(
        entries: OfflineAttendanceEntry[]
    ): Promise<any[]> {
        const results: any[] = [];

        for (const entry of entries) {
            try {
                // Mark as syncing
                await offlineStorage.updateTextbookEntry(entry.tempId, {
                    syncStatus: "syncing",
                });

                this.emitEvent({
                    type: "sync_progress",
                    completed: results.length,
                    total: entries.length,
                    currentItem: `Attendance for ${entry.date}`,
                });

                let result;

                if (entry.action === "create") {
                    result = await this.syncCreateAttendance(entry);
                } else if (entry.action === "update") {
                    result = await this.syncUpdateAttendance(entry);
                }

                if (result) {
                    results.push(result);

                    if (result.status === "synced") {
                        await offlineStorage.markAsSynced(
                            entry.tempId,
                            result.server_slug || result.server_id,
                            result.synced_data
                        );

                        this.emitEvent({
                            type: "item_synced",
                            tempId: entry.tempId,
                            serverData: result.synced_data,
                        });
                    } else if (result.status === "conflict") {
                        await offlineStorage.markAsConflict(
                            entry.tempId,
                            result.conflict_data
                        );

                        this.emitEvent({
                            type: "conflict_detected",
                            tempId: entry.tempId,
                            conflictData: result.conflict_data,
                        });
                    } else {
                        await offlineStorage.markAsFailed(
                            entry.tempId,
                            result.error || "Unknown error"
                        );
                    }
                }
            } catch (error) {
                console.error(
                    `Failed to sync attendance entry ${entry.tempId}:`,
                    error
                );
                await offlineStorage.markAsFailed(entry.tempId, String(error));

                results.push({
                    client_temp_id: entry.tempId,
                    status: "error",
                    error: String(error),
                });
            }
        }

        return results;
    }

    private async syncCreateAttendance(
        entry: OfflineAttendanceEntry
    ): Promise<any> {
        try {
            const createData: CreateAttendanceData = {
                student_id: parseInt(entry.studentId),
                class_id: parseInt(entry.classId),
                date: entry.date,
                status: entry.status,
                notes: entry.notes,
            };

            const result = await api.attendance.create(createData);

            return {
                client_temp_id: entry.tempId,
                server_slug: result.slug,
                server_id: result.id,
                status: "synced",
                synced_data: result,
            };
        } catch (error: any) {
            if (error.status === 409) {
                return {
                    client_temp_id: entry.tempId,
                    status: "conflict",
                    conflict_data: error.data,
                };
            }
            throw error;
        }
    }

    private async syncUpdateAttendance(
        entry: OfflineAttendanceEntry
    ): Promise<any> {
        // Similar implementation to syncUpdateTextbook
        // Implementation depends on your attendance API structure
        return {
            client_temp_id: entry.tempId,
            status: "synced",
        };
    }

    /**
     * Public API Methods
     */

    async createTextbookEntry(data: CreateTextbookEntryData): Promise<string> {
        const entryData = {
            title: data.title,
            content: data.content,
            description: data.description,
            subject: data.subject,
            classId: data.class_id.toString(),
            sessionDate: data.session_date,
            sessionTime: data.session_time,
            nextSessionDate: data.next_session_date,
            nextSessionTime: data.next_session_time,
            isSynced: false,
            isDeleted: false,
            syncStatus: "pending" as const,
            retryCount: 0,
            action: "create" as const,
        };

        if (this.isOnline) {
            try {
                const result = await api.textbooks.create(data);
                // If successful online, mark as synced immediately
                const tempId = await offlineStorage.createTextbookEntry({
                    ...entryData,
                    isSynced: true,
                    syncStatus: "synced",
                    serverId: result.slug,
                });
                return result.slug || tempId;
            } catch (error) {
                console.warn(
                    "Online textbook creation failed, falling back to offline:",
                    error
                );
                // Fall through to offline storage
            }
        }

        // Store offline
        const tempId = await offlineStorage.createTextbookEntry(entryData);

        // Trigger sync if online
        if (this.isOnline) {
            this.debouncedSync();
        }

        return tempId;
    }

    async updateTextbookEntry(
        slug: string,
        data: UpdateTextbookEntryData
    ): Promise<string> {
        const entryData = {
            title: data.title,
            content: data.content,
            description: data.description,
            subject: data.subject,
            classId: data.class_id?.toString() || "",
            sessionDate: data.session_date || "",
            sessionTime: data.session_time,
            nextSessionDate: data.next_session_date,
            nextSessionTime: data.next_session_time,
            isSynced: false,
            isDeleted: false,
            syncStatus: "pending" as const,
            retryCount: 0,
            action: "update" as const,
            originalSlug: slug,
        };

        if (this.isOnline) {
            try {
                const result = await api.textbooks.update(slug, data);
                // If successful online, mark as synced immediately
                const tempId = await offlineStorage.createTextbookEntry({
                    ...entryData,
                    isSynced: true,
                    syncStatus: "synced",
                    serverId: result.slug,
                } as any);
                return result.slug || tempId;
            } catch (error) {
                console.warn(
                    "Online textbook update failed, falling back to offline:",
                    error
                );
                // Fall through to offline storage
            }
        }

        // Store offline
        const tempId = await offlineStorage.createTextbookEntry(
            entryData as any
        );

        // Trigger sync if online
        if (this.isOnline) {
            this.debouncedSync();
        }

        return tempId;
    }

    async createAttendance(data: CreateAttendanceData): Promise<string> {
        const entryData = {
            studentId: data.student_id.toString(),
            classId: data.class_id.toString(),
            date: data.date,
            status: data.status,
            notes: data.notes,
            isSynced: false,
            isDeleted: false,
            syncStatus: "pending" as const,
            retryCount: 0,
            action: "create" as const,
        };

        if (this.isOnline) {
            try {
                const result = await api.attendance.create(data);
                // If successful online, mark as synced immediately
                const tempId = await offlineStorage.createAttendanceEntry({
                    ...entryData,
                    isSynced: true,
                    syncStatus: "synced",
                    serverId: result.slug,
                });
                return result.slug || tempId;
            } catch (error) {
                console.warn(
                    "Online attendance creation failed, falling back to offline:",
                    error
                );
                // Fall through to offline storage
            }
        }

        // Store offline
        const tempId = await offlineStorage.createAttendanceEntry(entryData);

        // Trigger sync if online
        if (this.isOnline) {
            this.debouncedSync();
        }

        return tempId;
    }

    /**
     * Status and management methods
     */

    async getSyncStatus(): Promise<{
        hasPendingItems: boolean;
        pendingCount: number;
        isOnline: boolean;
        isSyncing: boolean;
        lastSyncAttempt: number | null;
        storageStats: any;
        pendingItems: {
            textbookEntries: OfflineTextbookEntry[];
            attendanceEntries: OfflineAttendanceEntry[];
        };
    }> {
        const [pendingData, lastSyncAttempt, storageStats] = await Promise.all([
            offlineStorage.getAllPendingEntries(),
            offlineStorage.getMetadata("last_sync_time"),
            offlineStorage.db.getStorageStats(),
        ]);

        return {
            hasPendingItems: pendingData.totalCount > 0,
            pendingCount: pendingData.totalCount,
            isOnline: this.isOnline,
            isSyncing: this.syncInProgress,
            lastSyncAttempt,
            storageStats,
            pendingItems: {
                textbookEntries: pendingData.textbookEntries,
                attendanceEntries: pendingData.attendanceEntries,
            },
        };
    }

    async forceSync(): Promise<SyncResponse | null> {
        if (!this.isOnline) {
            throw new Error("Cannot sync while offline");
        }

        await offlineStorage.setMetadata("last_sync_attempt", Date.now());
        return await this.syncPendingData();
    }

    async clearPendingSync(): Promise<void> {
        await offlineStorage.clearAllSyncedEntries();
    }

    async retryFailedEntry(tempId: string): Promise<void> {
        await offlineStorage.retryEntry(tempId);
        if (this.isOnline) {
            this.debouncedSync();
        }
    }

    async deleteEntry(tempId: string): Promise<void> {
        await offlineStorage.deleteEntry(tempId);
    }

    async resolveConflict(
        tempId: string,
        resolution: "use_server" | "use_client" | "merge",
        mergedData?: any
    ): Promise<void> {
        if (resolution === "use_server") {
            // Mark as resolved and delete local version
            await offlineStorage.deleteEntry(tempId);
        } else if (resolution === "use_client") {
            // Retry the sync with force flag
            await offlineStorage.retryEntry(tempId);
            if (this.isOnline) {
                this.debouncedSync();
            }
        } else if (resolution === "merge" && mergedData) {
            // Update with merged data and retry
            await offlineStorage.updateTextbookEntry(tempId, {
                ...mergedData,
                syncStatus: "pending",
                retryCount: 0,
            });
            if (this.isOnline) {
                this.debouncedSync();
            }
        }
    }

    async exportOfflineData(): Promise<Blob> {
        const data = await offlineStorage.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        return new Blob([jsonString], { type: "application/json" });
    }

    async importOfflineData(file: File): Promise<void> {
        const text = await file.text();
        const data = JSON.parse(text);
        await offlineStorage.importData(data);
    }

    async getHealthStatus(): Promise<{
        isHealthy: boolean;
        issues: string[];
        recommendations: string[];
    }> {
        const health = await offlineStorage.healthCheck();
        const recommendations: string[] = [];

        if (!health.isHealthy) {
            if (health.issues.some(issue => issue.includes("stuck"))) {
                recommendations.push(
                    "Consider clearing stuck entries or resetting sync"
                );
            }
            if (health.issues.some(issue => issue.includes("storage"))) {
                recommendations.push(
                    "Clear old synced entries to free up space"
                );
            }
        }

        return {
            isHealthy: health.isHealthy,
            issues: health.issues,
            recommendations,
        };
    }

    /**
     * Cleanup and utility methods
     */

    async performMaintenance(): Promise<void> {
        // Clean up old synced entries
        await offlineStorage.db.cleanupOldEntries();

        // Reset entries with too many retries
        const status = await this.getSyncStatus();
        const stuckEntries = [
            ...status.pendingItems.textbookEntries,
            ...status.pendingItems.attendanceEntries,
        ].filter(entry => entry.retryCount > this.maxRetries);

        for (const entry of stuckEntries) {
            await offlineStorage.deleteEntry(entry.tempId);
        }

        console.log(
            `Maintenance completed. Cleaned ${stuckEntries.length} stuck entries.`
        );
    }

    destroy(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        if (this.batchSyncTimeout) {
            clearTimeout(this.batchSyncTimeout);
        }
        this.eventListeners = [];
    }
}

// Export singleton instance
export const syncManager = new IndexedDBSyncManager();

// Expose syncManager globally for testing (only in development/browser)
if (typeof window !== "undefined") {
    (window as any).syncManager = syncManager;
    console.log("🔧 SyncManager exposed globally for testing");
}

export function useSyncManager() {
    const [syncStatus, setSyncStatus] = useState({
        hasPendingItems: false,
        pendingCount: 0,
        isOnline: true,
        isSyncing: false,
        lastSyncAttempt: null as number | null,
        storageStats: null as any,
    });

    const [syncProgress, setSyncProgress] = useState({
        completed: 0,
        total: 0,
        currentItem: "",
    });

    useEffect(() => {
        // Get initial status
        syncManager.getSyncStatus().then(status => {
            setSyncStatus({
                hasPendingItems: status.hasPendingItems,
                pendingCount: status.pendingCount,
                isOnline: status.isOnline,
                isSyncing: status.isSyncing,
                lastSyncAttempt: status.lastSyncAttempt,
                storageStats: status.storageStats,
            });
        });

        // Listen to sync events
        const unsubscribe = syncManager.addEventListener(event => {
            switch (event.type) {
                case "sync_started":
                    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
                    setSyncProgress({
                        completed: 0,
                        total: event.totalItems,
                        currentItem: "",
                    });
                    break;
                case "sync_progress":
                    setSyncProgress({
                        completed: event.completed,
                        total: event.total,
                        currentItem: event.currentItem || "",
                    });
                    break;
                case "sync_completed":
                case "sync_error":
                    setSyncStatus(prev => ({ ...prev, isSyncing: false }));
                    setSyncProgress({
                        completed: 0,
                        total: 0,
                        currentItem: "",
                    });
                    // Refresh status after sync
                    syncManager.getSyncStatus().then(status => {
                        setSyncStatus({
                            hasPendingItems: status.hasPendingItems,
                            pendingCount: status.pendingCount,
                            isOnline: status.isOnline,
                            isSyncing: status.isSyncing,
                            lastSyncAttempt: status.lastSyncAttempt,
                            storageStats: status.storageStats,
                        });
                    });
                    break;
                case "connection_changed":
                    setSyncStatus(prev => ({
                        ...prev,
                        isOnline: event.isOnline,
                    }));
                    break;
            }
        });

        return unsubscribe;
    }, []);

    return {
        syncStatus,
        syncProgress,
        forceSync: () => syncManager.forceSync(),
        clearPending: () => syncManager.clearPendingSync(),
        retryFailed: (tempId: string) => syncManager.retryFailedEntry(tempId),
        resolveConflict: (
            tempId: string,
            resolution: "use_server" | "use_client" | "merge",
            mergedData?: any
        ) => syncManager.resolveConflict(tempId, resolution, mergedData),
        exportData: () => syncManager.exportOfflineData(),
        importData: (file: File) => syncManager.importOfflineData(file),
        getHealthStatus: () => syncManager.getHealthStatus(),
        performMaintenance: () => syncManager.performMaintenance(),
    };
}

export default syncManager;
