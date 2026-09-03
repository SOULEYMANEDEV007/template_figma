// lib/offlineStorage.ts - Fixed IndexedDB key range errors
import Dexie, { Table } from "dexie";

export interface OfflineTextbookEntry {
    id?: number;
    tempId: string; // For offline entries
    serverId?: string; // When synced with server
    title: string;
    content: string;
    description?: string;
    subject: string;
    classId: string;
    sessionDate: string;
    sessionTime?: string;
    nextSessionDate?: string;
    nextSessionTime?: string;
    lastModified: number;
    createdAt: number;
    isSynced: boolean;
    isDeleted: boolean;
    syncStatus: "pending" | "syncing" | "synced" | "error" | "conflict";
    retryCount: number;
    action: "create" | "update" | "delete";
    originalSlug?: string; // For updates
    errorMessage?: string;
    conflictData?: any;
}

export interface OfflineAttendanceEntry {
    id?: number;
    tempId: string;
    serverId?: string;
    studentId: string;
    classId: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
    lastModified: number;
    createdAt: number;
    isSynced: boolean;
    isDeleted: boolean;
    syncStatus: "pending" | "syncing" | "synced" | "error" | "conflict";
    retryCount: number;
    action: "create" | "update" | "delete";
    originalSlug?: string;
    errorMessage?: string;
    conflictData?: any;
}

export interface SyncMetadata {
    id?: number;
    key: string;
    value: string;
    lastUpdated: number;
}

export interface OfflineFile {
    id?: number;
    tempId: string;
    fileName: string;
    fileData: Blob;
    mimeType: string;
    size: number;
    associatedEntryId: string;
    associatedEntryType: "textbook" | "attendance";
    uploadStatus: "pending" | "uploading" | "uploaded" | "error";
    createdAt: number;
}

class OfflineDatabase extends Dexie {
    textbookEntries!: Table<OfflineTextbookEntry>;
    attendanceEntries!: Table<OfflineAttendanceEntry>;
    syncMetadata!: Table<SyncMetadata>;
    files!: Table<OfflineFile>;

    constructor() {
        super("ClassroomOfflineDB");

        this.version(1).stores({
            textbookEntries:
                "++id, tempId, serverId, classId, isSynced, syncStatus, action, lastModified, createdAt",
            attendanceEntries:
                "++id, tempId, serverId, studentId, classId, isSynced, syncStatus, action, lastModified, createdAt",
            syncMetadata: "++id, key, lastUpdated",
            files: "++id, tempId, associatedEntryId, associatedEntryType, uploadStatus, createdAt",
        });

        // Add hooks for automatic indexing and cleanup
        this.textbookEntries.hook("creating", function (primKey, obj, trans) {
            obj.createdAt = obj.createdAt || Date.now();
            obj.lastModified = obj.lastModified || Date.now();
            obj.retryCount = obj.retryCount || 0;
        });

        this.attendanceEntries.hook("creating", function (primKey, obj, trans) {
            obj.createdAt = obj.createdAt || Date.now();
            obj.lastModified = obj.lastModified || Date.now();
            obj.retryCount = obj.retryCount || 0;
        });
    }

    // Clean up old synced entries (keep for 7 days) - FIXED
    async cleanupOldEntries() {
        const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

        try {
            console.log("🧹 Starting cleanup of old entries...");

            await this.transaction(
                "rw",
                [this.textbookEntries, this.attendanceEntries],
                async () => {
                    // Use .filter() instead of .where().below() to avoid key range issues
                    const oldTextbooks = await this.textbookEntries
                        .filter(
                            entry =>
                                entry.isSynced &&
                                entry.lastModified < cutoffTime
                        )
                        .toArray();

                    const oldAttendance = await this.attendanceEntries
                        .filter(
                            entry =>
                                entry.isSynced &&
                                entry.lastModified < cutoffTime
                        )
                        .toArray();

                    console.log(
                        `🗑️ Found ${oldTextbooks.length} old textbook entries and ${oldAttendance.length} old attendance entries to delete`
                    );

                    // Delete by ID to avoid key range issues
                    if (oldTextbooks.length > 0) {
                        await this.textbookEntries.bulkDelete(
                            oldTextbooks.map(entry => entry.id!)
                        );
                    }

                    if (oldAttendance.length > 0) {
                        await this.attendanceEntries.bulkDelete(
                            oldAttendance.map(entry => entry.id!)
                        );
                    }
                }
            );

            console.log("✅ Cleanup completed successfully");
        } catch (error) {
            console.error("❌ Cleanup failed:", error);
            throw error;
        }
    }

    // Get storage usage statistics
    async getStorageStats() {
        try {
            const [textbookCount, attendanceCount, filesCount, files] =
                await Promise.all([
                    this.textbookEntries.count(),
                    this.attendanceEntries.count(),
                    this.files.count(),
                    this.files.toArray(),
                ]);

            const filesSize = files.reduce((sum, file) => sum + file.size, 0);

            return {
                textbookEntries: textbookCount,
                attendanceEntries: attendanceCount,
                files: filesCount,
                totalFileSizeMB:
                    Math.round((filesSize / (1024 * 1024)) * 100) / 100,
                estimatedTotalSizeMB:
                    Math.round(
                        ((filesSize +
                            (textbookCount + attendanceCount) * 1024) /
                            (1024 * 1024)) *
                            100
                    ) / 100,
            };
        } catch (error) {
            console.error("❌ Failed to get storage stats:", error);
            return {
                textbookEntries: 0,
                attendanceEntries: 0,
                files: 0,
                totalFileSizeMB: 0,
                estimatedTotalSizeMB: 0,
            };
        }
    }
}

export const offlineDB = new OfflineDatabase();

// Storage manager with enhanced capabilities and error handling
export class OfflineStorageManager {
    public db = offlineDB;

    // Textbook Entry Operations - FIXED
    async createTextbookEntry(
        data: Omit<
            OfflineTextbookEntry,
            "id" | "tempId" | "createdAt" | "lastModified"
        >
    ): Promise<string> {
        try {
            const tempId = `textbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const entry: OfflineTextbookEntry = {
                ...data,
                tempId,
                createdAt: Date.now(),
                lastModified: Date.now(),
                retryCount: 0,
            };

            console.log("💾 Creating textbook entry:", {
                tempId,
                title: entry.title,
            });
            await this.db.textbookEntries.add(entry);
            console.log("✅ Textbook entry created successfully");
            return tempId;
        } catch (error) {
            console.error("❌ Failed to create textbook entry:", error);
            throw error;
        }
    }

    async updateTextbookEntry(
        tempId: string,
        updates: Partial<OfflineTextbookEntry>
    ): Promise<void> {
        try {
            console.log("📝 Updating textbook entry:", {
                tempId,
                updates: Object.keys(updates),
            });

            const count = await this.db.textbookEntries
                .where("tempId")
                .equals(tempId)
                .modify({
                    ...updates,
                    lastModified: Date.now(),
                });

            if (count === 0) {
                console.warn("⚠️ No textbook entry found with tempId:", tempId);
            } else {
                console.log("✅ Textbook entry updated successfully");
            }
        } catch (error) {
            console.error("❌ Failed to update textbook entry:", error);
            throw error;
        }
    }

    async getTextbookEntry(
        tempId: string
    ): Promise<OfflineTextbookEntry | undefined> {
        try {
            console.log("🔍 Getting textbook entry:", tempId);
            const entry = await this.db.textbookEntries
                .where("tempId")
                .equals(tempId)
                .first();
            console.log(
                "📖 Found textbook entry:",
                entry ? entry.title : "not found"
            );
            return entry;
        } catch (error) {
            console.error("❌ Failed to get textbook entry:", error);
            return undefined;
        }
    }

    async getAllPendingTextbookEntries(): Promise<OfflineTextbookEntry[]> {
        try {
            console.log("📋 Getting all pending textbook entries...");
            // Use .filter() instead of .where() to avoid key range issues with boolean values
            const entries = await this.db.textbookEntries
                .filter(entry => !entry.isSynced)
                .toArray();
            console.log(`📝 Found ${entries.length} pending textbook entries`);
            return entries;
        } catch (error) {
            console.error("❌ Failed to get pending textbook entries:", error);
            return [];
        }
    }

    async getTextbookEntriesByClass(
        classId: string
    ): Promise<OfflineTextbookEntry[]> {
        try {
            console.log("🏫 Getting textbook entries for class:", classId);
            const entries = await this.db.textbookEntries
                .where("classId")
                .equals(classId)
                .toArray();
            console.log(
                `📚 Found ${entries.length} entries for class ${classId}`
            );
            return entries;
        } catch (error) {
            console.error("❌ Failed to get textbook entries by class:", error);
            return [];
        }
    }

    async searchTextbookEntries(
        query: string
    ): Promise<OfflineTextbookEntry[]> {
        try {
            console.log("🔍 Searching textbook entries for:", query);
            const searchTerm = query.toLowerCase();
            const entries = await this.db.textbookEntries
                .filter(
                    entry =>
                        entry.title.toLowerCase().includes(searchTerm) ||
                        entry.subject.toLowerCase().includes(searchTerm) ||
                        entry.content.toLowerCase().includes(searchTerm)
                )
                .toArray();
            console.log(`🔍 Found ${entries.length} matching entries`);
            return entries;
        } catch (error) {
            console.error("❌ Failed to search textbook entries:", error);
            return [];
        }
    }

    // Attendance Entry Operations - FIXED
    async createAttendanceEntry(
        data: Omit<
            OfflineAttendanceEntry,
            "id" | "tempId" | "createdAt" | "lastModified"
        >
    ): Promise<string> {
        try {
            const tempId = `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const entry: OfflineAttendanceEntry = {
                ...data,
                tempId,
                createdAt: Date.now(),
                lastModified: Date.now(),
                retryCount: 0,
            };

            console.log("💾 Creating attendance entry:", {
                tempId,
                date: entry.date,
                status: entry.status,
            });
            await this.db.attendanceEntries.add(entry);
            console.log("✅ Attendance entry created successfully");
            return tempId;
        } catch (error) {
            console.error("❌ Failed to create attendance entry:", error);
            throw error;
        }
    }

    async getAttendanceEntriesByDate(
        date: string
    ): Promise<OfflineAttendanceEntry[]> {
        try {
            console.log("📅 Getting attendance entries for date:", date);
            const entries = await this.db.attendanceEntries
                .where("date")
                .equals(date)
                .toArray();
            console.log(
                `👥 Found ${entries.length} attendance entries for ${date}`
            );
            return entries;
        } catch (error) {
            console.error(
                "❌ Failed to get attendance entries by date:",
                error
            );
            return [];
        }
    }

    async getAllPendingAttendanceEntries(): Promise<OfflineAttendanceEntry[]> {
        try {
            console.log("📋 Getting all pending attendance entries...");
            // Use .filter() instead of .where() to avoid key range issues
            const entries = await this.db.attendanceEntries
                .filter(entry => !entry.isSynced)
                .toArray();
            console.log(
                `👥 Found ${entries.length} pending attendance entries`
            );
            return entries;
        } catch (error) {
            console.error(
                "❌ Failed to get pending attendance entries:",
                error
            );
            return [];
        }
    }

    // Sync Operations - FIXED
    async markAsSynced(
        tempId: string,
        serverId: string,
        serverData?: any
    ): Promise<void> {
        try {
            console.log("✅ Marking as synced:", { tempId, serverId });

            const isTextbook = tempId.startsWith("textbook_");
            const table = isTextbook
                ? this.db.textbookEntries
                : this.db.attendanceEntries;

            const count = await (table as any)
                .where("tempId")
                .equals(tempId)
                .modify({
                    isSynced: true,
                    syncStatus: "synced",
                    serverId,
                    lastModified: Date.now(),
                    retryCount: 0,
                    errorMessage: undefined,
                    conflictData: undefined,
                });

            if (count === 0) {
                console.warn("⚠️ No entry found to mark as synced:", tempId);
            } else {
                console.log("✅ Entry marked as synced successfully");
            }
        } catch (error) {
            console.error("❌ Failed to mark as synced:", error);
            throw error;
        }
    }

    async markAsFailed(tempId: string, errorMessage: string): Promise<void> {
        try {
            console.log("❌ Marking as failed:", { tempId, errorMessage });

            const isTextbook = tempId.startsWith("textbook_");
            const table = isTextbook
                ? this.db.textbookEntries
                : this.db.attendanceEntries;

            const count = await (table as any)
                .where("tempId")
                .equals(tempId)
                .modify((entry: any) => {
                    entry.syncStatus = "error";
                    entry.retryCount = (entry.retryCount || 0) + 1;
                    entry.errorMessage = errorMessage;
                    entry.lastModified = Date.now();
                });

            if (count === 0) {
                console.warn("⚠️ No entry found to mark as failed:", tempId);
            } else {
                console.log("❌ Entry marked as failed successfully");
            }
        } catch (error) {
            console.error("❌ Failed to mark as failed:", error);
            throw error;
        }
    }

    async markAsConflict(tempId: string, conflictData: any): Promise<void> {
        try {
            console.log("⚠️ Marking as conflict:", { tempId });

            const isTextbook = tempId.startsWith("textbook_");
            const table = isTextbook
                ? this.db.textbookEntries
                : this.db.attendanceEntries;

            const count = await (table as any)
                .where("tempId")
                .equals(tempId)
                .modify({
                    syncStatus: "conflict",
                    conflictData,
                    lastModified: Date.now(),
                });

            if (count === 0) {
                console.warn("⚠️ No entry found to mark as conflict:", tempId);
            } else {
                console.log("⚠️ Entry marked as conflict successfully");
            }
        } catch (error) {
            console.error("❌ Failed to mark as conflict:", error);
            throw error;
        }
    }

    async retryEntry(tempId: string): Promise<void> {
        try {
            console.log("🔄 Retrying entry:", tempId);

            const isTextbook = tempId.startsWith("textbook_");
            const table = isTextbook
                ? this.db.textbookEntries
                : this.db.attendanceEntries;

            const count = await (table as any)
                .where("tempId")
                .equals(tempId)
                .modify({
                    syncStatus: "pending",
                    errorMessage: undefined,
                    lastModified: Date.now(),
                });

            if (count === 0) {
                console.warn("⚠️ No entry found to retry:", tempId);
            } else {
                console.log("🔄 Entry retry status set successfully");
            }
        } catch (error) {
            console.error("❌ Failed to retry entry:", error);
            throw error;
        }
    }

    async deleteEntry(tempId: string): Promise<void> {
        try {
            console.log("🗑️ Deleting entry:", tempId);

            await this.db.transaction(
                "rw",
                [
                    this.db.textbookEntries,
                    this.db.attendanceEntries,
                    this.db.files,
                ],
                async () => {
                    // Delete from both tables (only one will match)
                    const textbookCount = await this.db.textbookEntries
                        .where("tempId")
                        .equals(tempId)
                        .delete();
                    const attendanceCount = await this.db.attendanceEntries
                        .where("tempId")
                        .equals(tempId)
                        .delete();

                    // Delete associated files
                    const filesCount = await this.db.files
                        .where("associatedEntryId")
                        .equals(tempId)
                        .delete();

                    console.log(
                        `🗑️ Deleted: ${textbookCount} textbook, ${attendanceCount} attendance, ${filesCount} files`
                    );
                }
            );
        } catch (error) {
            console.error("❌ Failed to delete entry:", error);
            throw error;
        }
    }

    // File Operations - FIXED
    async storeFile(
        file: File,
        associatedEntryId: string,
        associatedEntryType: "textbook" | "attendance"
    ): Promise<string> {
        try {
            const tempId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const offlineFile: OfflineFile = {
                tempId,
                fileName: file.name,
                fileData: file,
                mimeType: file.type,
                size: file.size,
                associatedEntryId,
                associatedEntryType,
                uploadStatus: "pending",
                createdAt: Date.now(),
            };

            console.log("📎 Storing file:", {
                tempId,
                fileName: file.name,
                size: file.size,
            });
            await this.db.files.add(offlineFile);
            console.log("✅ File stored successfully");
            return tempId;
        } catch (error) {
            console.error("❌ Failed to store file:", error);
            throw error;
        }
    }

    async getFilesByEntry(entryId: string): Promise<OfflineFile[]> {
        try {
            const files = await this.db.files
                .where("associatedEntryId")
                .equals(entryId)
                .toArray();
            console.log(`📎 Found ${files.length} files for entry ${entryId}`);
            return files;
        } catch (error) {
            console.error("❌ Failed to get files by entry:", error);
            return [];
        }
    }

    async getPendingFiles(): Promise<OfflineFile[]> {
        try {
            // Use .filter() instead of .where() to avoid key range issues
            const files = await this.db.files
                .filter(file => file.uploadStatus === "pending")
                .toArray();
            console.log(`📎 Found ${files.length} pending files`);
            return files;
        } catch (error) {
            console.error("❌ Failed to get pending files:", error);
            return [];
        }
    }

    // Metadata Operations - FIXED
    async setMetadata(key: string, value: any): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);

            console.log("💾 Setting metadata:", {
                key,
                valueType: typeof value,
            });
            await this.db.syncMetadata.put({
                key,
                value: serializedValue,
                lastUpdated: Date.now(),
            });
            console.log("✅ Metadata set successfully");
        } catch (error) {
            console.error("❌ Failed to set metadata:", error);
            throw error;
        }
    }

    async getMetadata<T = any>(key: string): Promise<T | null> {
        try {
            const record = await this.db.syncMetadata
                .where("key")
                .equals(key)
                .first();
            if (!record) return null;

            try {
                const value = JSON.parse(record.value);
                console.log("📖 Retrieved metadata:", {
                    key,
                    valueType: typeof value,
                });
                return value;
            } catch {
                console.warn("⚠️ Failed to parse metadata value for key:", key);
                return null;
            }
        } catch (error) {
            console.error("❌ Failed to get metadata:", error);
            return null;
        }
    }

    async removeMetadata(key: string): Promise<void> {
        try {
            console.log("🗑️ Removing metadata:", key);
            const count = await this.db.syncMetadata
                .where("key")
                .equals(key)
                .delete();
            console.log(`🗑️ Removed ${count} metadata records for key: ${key}`);
        } catch (error) {
            console.error("❌ Failed to remove metadata:", error);
            throw error;
        }
    }

    // Bulk Operations - FIXED
    async getAllPendingEntries(): Promise<{
        textbookEntries: OfflineTextbookEntry[];
        attendanceEntries: OfflineAttendanceEntry[];
        totalCount: number;
    }> {
        try {
            console.log("📋 Getting all pending entries...");

            const [textbookEntries, attendanceEntries] = await Promise.all([
                this.getAllPendingTextbookEntries(),
                this.getAllPendingAttendanceEntries(),
            ]);

            const result = {
                textbookEntries,
                attendanceEntries,
                totalCount: textbookEntries.length + attendanceEntries.length,
            };

            console.log(
                `📊 Total pending entries: ${result.totalCount} (${textbookEntries.length} textbooks, ${attendanceEntries.length} attendance)`
            );
            return result;
        } catch (error) {
            console.error("❌ Failed to get all pending entries:", error);
            return {
                textbookEntries: [],
                attendanceEntries: [],
                totalCount: 0,
            };
        }
    }

    async clearAllSyncedEntries(): Promise<void> {
        try {
            console.log("🧹 Clearing all synced entries...");

            await this.db.transaction(
                "rw",
                [this.db.textbookEntries, this.db.attendanceEntries],
                async () => {
                    // Use .filter() and .delete() to avoid key range issues
                    const syncedTextbooks = await this.db.textbookEntries
                        .filter(entry => entry.isSynced)
                        .toArray();
                    const syncedAttendance = await this.db.attendanceEntries
                        .filter(entry => entry.isSynced)
                        .toArray();

                    if (syncedTextbooks.length > 0) {
                        await this.db.textbookEntries.bulkDelete(
                            syncedTextbooks.map(entry => entry.id!)
                        );
                    }

                    if (syncedAttendance.length > 0) {
                        await this.db.attendanceEntries.bulkDelete(
                            syncedAttendance.map(entry => entry.id!)
                        );
                    }

                    console.log(
                        `🗑️ Cleared ${syncedTextbooks.length} textbook and ${syncedAttendance.length} attendance synced entries`
                    );
                }
            );
        } catch (error) {
            console.error("❌ Failed to clear synced entries:", error);
            throw error;
        }
    }

    async resetDatabase(): Promise<void> {
        try {
            console.log("🔄 Resetting database...");

            await this.db.transaction(
                "rw",
                [
                    this.db.textbookEntries,
                    this.db.attendanceEntries,
                    this.db.syncMetadata,
                    this.db.files,
                ],
                async () => {
                    await this.db.textbookEntries.clear();
                    await this.db.attendanceEntries.clear();
                    await this.db.syncMetadata.clear();
                    await this.db.files.clear();
                }
            );

            console.log("✅ Database reset successfully");
        } catch (error) {
            console.error("❌ Failed to reset database:", error);
            throw error;
        }
    }

    // Utility Methods - FIXED
    async exportData(): Promise<{
        textbookEntries: OfflineTextbookEntry[];
        attendanceEntries: OfflineAttendanceEntry[];
        metadata: SyncMetadata[];
        exportedAt: number;
    }> {
        try {
            console.log("📤 Exporting data...");

            const [textbookEntries, attendanceEntries, metadata] =
                await Promise.all([
                    this.db.textbookEntries.toArray(),
                    this.db.attendanceEntries.toArray(),
                    this.db.syncMetadata.toArray(),
                ]);

            const result = {
                textbookEntries,
                attendanceEntries,
                metadata,
                exportedAt: Date.now(),
            };

            console.log(
                `📦 Exported ${textbookEntries.length} textbook entries, ${attendanceEntries.length} attendance entries, ${metadata.length} metadata records`
            );
            return result;
        } catch (error) {
            console.error("❌ Failed to export data:", error);
            throw error;
        }
    }

    async importData(data: {
        textbookEntries?: OfflineTextbookEntry[];
        attendanceEntries?: OfflineAttendanceEntry[];
        metadata?: SyncMetadata[];
    }): Promise<void> {
        try {
            console.log("📥 Importing data...");

            await this.db.transaction(
                "rw",
                [
                    this.db.textbookEntries,
                    this.db.attendanceEntries,
                    this.db.syncMetadata,
                ],
                async () => {
                    if (
                        data.textbookEntries &&
                        data.textbookEntries.length > 0
                    ) {
                        await this.db.textbookEntries.bulkAdd(
                            data.textbookEntries
                        );
                        console.log(
                            `📚 Imported ${data.textbookEntries.length} textbook entries`
                        );
                    }
                    if (
                        data.attendanceEntries &&
                        data.attendanceEntries.length > 0
                    ) {
                        await this.db.attendanceEntries.bulkAdd(
                            data.attendanceEntries
                        );
                        console.log(
                            `👥 Imported ${data.attendanceEntries.length} attendance entries`
                        );
                    }
                    if (data.metadata && data.metadata.length > 0) {
                        await this.db.syncMetadata.bulkAdd(data.metadata);
                        console.log(
                            `⚙️ Imported ${data.metadata.length} metadata records`
                        );
                    }
                }
            );

            console.log("✅ Data imported successfully");
        } catch (error) {
            console.error("❌ Failed to import data:", error);
            throw error;
        }
    }

    // Health Check - FIXED
    async healthCheck(): Promise<{
        isHealthy: boolean;
        issues: string[];
        stats: any;
    }> {
        const issues: string[] = [];
        let isHealthy = true;

        try {
            console.log("🏥 Running health check...");

            // Check database connectivity
            await this.db.open();

            // Check for corrupted entries
            const pendingEntries = await this.getAllPendingEntries();
            const stuckEntries = [
                ...pendingEntries.textbookEntries,
                ...pendingEntries.attendanceEntries,
            ].filter(entry => entry.retryCount > 10);

            if (stuckEntries.length > 0) {
                issues.push(
                    `${stuckEntries.length} entries stuck with high retry count`
                );
                isHealthy = false;
            }

            // Check storage usage
            const stats = await this.db.getStorageStats();
            if (stats.estimatedTotalSizeMB > 100) {
                // 100MB threshold
                issues.push(
                    `High storage usage: ${stats.estimatedTotalSizeMB}MB`
                );
            }

            console.log(
                `🏥 Health check completed: ${isHealthy ? "Healthy" : "Issues found"}`
            );
            return {
                isHealthy,
                issues,
                stats,
            };
        } catch (error) {
            console.error("❌ Health check failed:", error);
            return {
                isHealthy: false,
                issues: [`Database error: ${error}`],
                stats: null,
            };
        }
    }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Expose offlineStorage globally for testing (only in development/browser)
if (typeof window !== "undefined") {
    (window as any).offlineStorage = offlineStorage;
    console.log("🗄️ OfflineStorage exposed globally for testing");
}

// Initialize cleanup on startup
offlineDB.open().then(() => {
    console.log("🗄️ IndexedDB initialized successfully");

    // Clean up old entries every hour
    setInterval(
        () => {
            offlineDB.cleanupOldEntries().catch(error => {
                console.error("❌ Scheduled cleanup failed:", error);
            });
        },
        60 * 60 * 1000
    );
});

export default offlineStorage;
