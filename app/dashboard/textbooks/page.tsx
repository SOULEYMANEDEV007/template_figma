// app/dashboard/textbooks/page.tsx - Enhanced with IndexedDB viewer
"use client";

import IndexedDBViewer from "@/components/debug/IndexedDBViewer";
import { Button, Input } from "@/components/ui";
import {
    useClassrooms,
    useDeleteTextbook,
    useTextbooks,
} from "@/lib/hooks/api-hooks";
import { syncManager, useSyncManager } from "@/lib/syncManager";
import { Classroom } from "@/types/api";
import clsx from "clsx";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Database,
    Edit,
    Eye,
    Filter,
    List,
    Loader,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Wifi,
    WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function TextbookPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [page, setPage] = useState(1);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [showIndexedDBViewer, setShowIndexedDBViewer] = useState(false);

    // Use the sync manager hook
    const {
        syncStatus,
        syncProgress,
        forceSync,
        getHealthStatus,
        exportData,
        performMaintenance,
    } = useSyncManager();

    const filters = useMemo(() => {
        const filter: any = {};
        if (selectedClass) filter.class_id = selectedClass;
        if (selectedSubject) filter.subject = selectedSubject;
        if (selectedStatus) {
            // Map the status values to what the API expects
            filter.status = selectedStatus;
        }
        return filter;
    }, [selectedClass, selectedSubject, selectedStatus]);

    // Fetch data with React Query
    const {
        data: textbooksResponse,
        isLoading: textbooksLoading,
        error: textbooksError,
        refetch,
    } = useTextbooks({
        page,
        per_page: 20,
        search: searchTerm || undefined,
        ...filters,
    });

    // Trigger refetch when filters change
    useEffect(() => {
        refetch();
    }, [
        selectedClass,
        selectedSubject,
        selectedStatus,
        searchTerm,
        page,
        refetch,
    ]);

    const { data: classroomsResponse, isLoading: classroomsLoading } =
        useClassrooms();

    const deleteTextbookMutation = useDeleteTextbook({
        onSuccess: () => {
            toast.success("Cahier de texte supprimé avec succès");
        },
        onError: error => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });

    // Extract data from API responses
    const textbookEntries = textbooksResponse?.data.data || [];
    const pagination = textbooksResponse?.meta;
    const classrooms = classroomsResponse?.data || [];

    // Get unique subjects from textbook entries
    const uniqueSubjects = useMemo(() => {
        const subjects = textbookEntries.map(entry => entry.subject);
        return [...new Set(subjects)].filter(Boolean);
    }, [textbookEntries]);

    // Debug logging for sync status changes
    useEffect(() => {
        console.log("🔄 Sync Status Changed:", {
            isOnline: syncStatus.isOnline,
            isSyncing: syncStatus.isSyncing,
            pendingCount: syncStatus.pendingCount,
            hasPendingItems: syncStatus.hasPendingItems,
            lastSyncAttempt: syncStatus.lastSyncAttempt
                ? new Date(syncStatus.lastSyncAttempt).toLocaleString()
                : "Never",
            storageStats: syncStatus.storageStats,
        });

        if (syncProgress.total > 0) {
            console.log("📊 Sync Progress:", {
                completed: syncProgress.completed,
                total: syncProgress.total,
                percentage: Math.round(
                    (syncProgress.completed / syncProgress.total) * 100
                ),
                currentItem: syncProgress.currentItem,
            });
        }
    }, [syncStatus, syncProgress]);

    // Load debug info on component mount
    useEffect(() => {
        loadDebugInfo();
    }, []);

    const loadDebugInfo = async () => {
        try {
            console.log("🔍 Loading debug information...");
            const [healthStatus, currentSyncStatus] = await Promise.all([
                getHealthStatus(),
                syncManager.getSyncStatus(),
            ]);

            const debugData = {
                health: healthStatus,
                syncStatus: currentSyncStatus,
                indexedDBSupported: "indexedDB" in window,
                storageEstimate: null as any,
                timestamp: new Date().toISOString(),
            };

            // Get storage estimate if available
            if ("storage" in navigator && "estimate" in navigator.storage) {
                try {
                    debugData.storageEstimate =
                        await navigator.storage.estimate();
                } catch (e) {
                    console.warn("Could not get storage estimate:", e);
                }
            }

            console.log("🐛 Debug Info Loaded:", debugData);
            setDebugInfo(debugData);
        } catch (error) {
            console.error("❌ Failed to load debug info:", error);
            setDebugInfo({
                error: String(error),
                timestamp: new Date().toISOString(),
            });
        }
    };

    // Add this new useEffect to refresh data when sync completes
    useEffect(() => {
        // Only refetch if sync just completed (not syncing anymore but was syncing before)
        if (!syncStatus.isSyncing && syncStatus.lastSyncAttempt) {
            const lastSync = new Date(syncStatus.lastSyncAttempt);
            const now = new Date();
            // If sync completed within the last 5 seconds, refetch
            if (now.getTime() - lastSync.getTime() < 5000) {
                refetch();
            }
        }
    }, [syncStatus.isSyncing, syncStatus.lastSyncAttempt, refetch]);

    const handleDelete = async (slug: string, title: string) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
            try {
                console.log("🗑️ Deleting textbook:", { slug, title });
                await deleteTextbookMutation.mutateAsync(slug);
                console.log("✅ Textbook deleted successfully");
            } catch (error) {
                console.error("❌ Delete failed:", error);
            }
        }
    };

    const clearFilters = () => {
        console.log("🧹 Clearing filters");
        setSearchTerm("");
        setSelectedClass("");
        setSelectedSubject("");
        setSelectedStatus("");
        setPage(1);
    };

    const handleRefresh = () => {
        console.log("🔄 Manual refresh triggered");
        refetch();
        loadDebugInfo();
        toast.success("Données actualisées", { duration: 2000 });
    };

    const handleManualSync = async () => {
        if (!syncStatus.isOnline) {
            toast.error("Impossible de synchroniser hors ligne");
            return;
        }

        if (syncStatus.isSyncing) {
            toast.warning("Synchronisation déjà en cours...");
            return;
        }

        try {
            console.log("🚀 Manual sync initiated");
            console.log(
                "📋 Current sync status before manual sync:",
                syncStatus
            );

            toast.loading("Démarrage de la synchronisation...", {
                id: "manual-sync",
            });

            const result = await forceSync();

            console.log("✅ Manual sync completed:", result);

            if (result) {
                const message = `Synchronisation terminée: ${result.synced_count} éléments synchronisés`;
                if (result.conflict_count > 0) {
                    toast.warning(
                        `${message}, ${result.conflict_count} conflits détectés`,
                        {
                            id: "manual-sync",
                            duration: 5000,
                        }
                    );
                } else {
                    toast.success(message, {
                        id: "manual-sync",
                        duration: 3000,
                    });
                }

                refetch();
                loadDebugInfo();
            } else {
                toast.success("Aucune donnée à synchroniser", {
                    id: "manual-sync",
                    duration: 2000,
                });
            }

            // Add this line to force a fresh fetch of textbooks
            await refetch();
        } catch (error) {
            console.error("❌ Manual sync failed:", error);
            toast.error(`Erreur de synchronisation: ${error}`, {
                id: "manual-sync",
                duration: 5000,
            });
        }
    };

    const handleExportData = async () => {
        try {
            console.log("📤 Exporting offline data...");
            const blob = await exportData();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `textbook-offline-data-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("✅ Data exported successfully");
            toast.success("Données exportées avec succès");
        } catch (error) {
            console.error("❌ Export failed:", error);
            toast.error("Erreur lors de l'export");
        }
    };

    const handleMaintenance = async () => {
        try {
            console.log("🔧 Performing maintenance...");
            await performMaintenance();
            console.log("✅ Maintenance completed");
            toast.success("Maintenance terminée");
            loadDebugInfo();
        } catch (error) {
            console.error("❌ Maintenance failed:", error);
            toast.error("Erreur lors de la maintenance");
        }
    };

    // Sync status indicator component
    const SyncStatusIndicator = () => {
        if (syncStatus.isSyncing) {
            return (
                <div className="flex items-center space-x-2 text-blue-600">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                        Synchronisation... ({syncProgress.completed}/
                        {syncProgress.total})
                    </span>
                </div>
            );
        }

        if (syncStatus.hasPendingItems) {
            return (
                <div className="flex items-center space-x-2 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                        {syncStatus.pendingCount} élément(s) en attente
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Synchronisé</span>
            </div>
        );
    };

    if (textbooksError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Cahier de texte
                    </h1>
                    <Link href="/dashboard/textbooks/create">
                        <Button className="bg-green-500 hover:bg-green-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter
                        </Button>
                    </Link>
                </div>
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Erreur de chargement
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                {textbooksError.message ||
                                    "Une erreur s'est produite lors du chargement des données."}
                            </p>
                            <div className="mt-3 flex space-x-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    Réessayer
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    Actualiser la page
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header with enhanced sync controls */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Cahier de texte
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez vos entrées de cahier de texte
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Connection and sync status */}
                        <div className="flex items-center space-x-2">
                            {syncStatus.isOnline ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <SyncStatusIndicator />
                        </div>

                        {/* IndexedDB Viewer button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowIndexedDBViewer(true)}
                            title="Voir le contenu détaillé d'IndexedDB"
                            className="border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                        >
                            <List className="mr-1 h-4 w-4" />
                            Voir les données locales
                        </Button>

                        {/* Debug toggle button */}
                        <Button
                            hidden
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDebugPanel(!showDebugPanel)}
                            title="Afficher/masquer les informations de debug"
                        >
                            <Database className="h-4 w-4" />
                        </Button>

                        {/* Refresh button */}
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={textbooksLoading}
                            title="Actualiser les données depuis le serveur"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${textbooksLoading ? "animate-spin" : ""}`}
                            />
                            Actualiser
                        </Button>

                        {/* Manual sync button */}
                        <Button
                            variant="outline"
                            onClick={handleManualSync}
                            disabled={
                                !syncStatus.isOnline || syncStatus.isSyncing
                            }
                            className={`${
                                syncStatus.hasPendingItems
                                    ? "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                    : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                            title={
                                !syncStatus.isOnline
                                    ? "Synchronisation impossible hors ligne"
                                    : syncStatus.isSyncing
                                      ? "Synchronisation en cours..."
                                      : `Synchroniser ${syncStatus.pendingCount} élément(s) en attente`
                            }
                        >
                            {syncStatus.isSyncing ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            ) : syncStatus.isOnline ? (
                                <Wifi className="mr-2 h-4 w-4" />
                            ) : (
                                <WifiOff className="mr-2 h-4 w-4" />
                            )}
                            Synchroniser
                            {syncStatus.pendingCount > 0 && (
                                <span className="ml-1 rounded-full bg-yellow-200 px-2 py-0.5 text-xs">
                                    {syncStatus.pendingCount}
                                </span>
                            )}
                        </Button>

                        {/* Add button */}
                        <Link href="/dashboard/textbooks/create">
                            <Button className="bg-green-500 hover:bg-green-600">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Debug Panel */}
                {showDebugPanel && debugInfo && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700">
                                🐛 Informations de Debug IndexedDB
                            </h3>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={loadDebugInfo}
                                >
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Actualiser
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleExportData}
                                >
                                    📤 Exporter
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleMaintenance}
                                >
                                    🔧 Maintenance
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2 lg:grid-cols-3">
                            {/* Health Status */}
                            <div className="rounded border bg-white p-3">
                                <h4 className="mb-2 font-medium text-gray-800">
                                    État de Santé
                                </h4>
                                <div
                                    className={`flex items-center space-x-1 ${debugInfo.health?.isHealthy ? "text-green-600" : "text-red-600"}`}
                                >
                                    {debugInfo.health?.isHealthy ? (
                                        <CheckCircle className="h-3 w-3" />
                                    ) : (
                                        <AlertCircle className="h-3 w-3" />
                                    )}
                                    <span>
                                        {debugInfo.health?.isHealthy
                                            ? "Sain"
                                            : "Problèmes détectés"}
                                    </span>
                                </div>
                                {debugInfo.health?.issues?.map(
                                    (issue: string, i: number) => (
                                        <div
                                            key={i}
                                            className="mt-1 text-red-600"
                                        >
                                            • {issue}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Storage Stats */}
                            <div className="rounded border bg-white p-3">
                                <h4 className="mb-2 font-medium text-gray-800">
                                    Stockage Local
                                </h4>
                                {syncStatus.storageStats && (
                                    <div className="space-y-1">
                                        <div>
                                            Entrées:{" "}
                                            {
                                                syncStatus.storageStats
                                                    .textbookEntries
                                            }
                                        </div>
                                        <div>
                                            Fichiers:{" "}
                                            {syncStatus.storageStats.files}
                                        </div>
                                        <div>
                                            Taille:{" "}
                                            {
                                                syncStatus.storageStats
                                                    .estimatedTotalSizeMB
                                            }
                                            MB
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sync Status */}
                            <div className="rounded border bg-white p-3">
                                <h4 className="mb-2 font-medium text-gray-800">
                                    État de Sync
                                </h4>
                                <div className="space-y-1">
                                    <div>
                                        En attente: {syncStatus.pendingCount}
                                    </div>
                                    <div>
                                        En ligne:{" "}
                                        {syncStatus.isOnline ? "✅" : "❌"}
                                    </div>
                                    <div>
                                        En cours:{" "}
                                        {syncStatus.isSyncing ? "✅" : "❌"}
                                    </div>
                                    {syncStatus.lastSyncAttempt && (
                                        <div>
                                            Dernière tentative:{" "}
                                            {new Date(
                                                syncStatus.lastSyncAttempt
                                            ).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Browser Support */}
                            <div className="rounded border bg-white p-3">
                                <h4 className="mb-2 font-medium text-gray-800">
                                    Support Navigateur
                                </h4>
                                <div className="space-y-1">
                                    <div>
                                        IndexedDB:{" "}
                                        {debugInfo.indexedDBSupported
                                            ? "✅"
                                            : "❌"}
                                    </div>
                                    <div>
                                        Storage API:{" "}
                                        {"storage" in navigator ? "✅" : "❌"}
                                    </div>
                                    {debugInfo.storageEstimate && (
                                        <>
                                            <div>
                                                Quota:{" "}
                                                {Math.round(
                                                    (debugInfo.storageEstimate
                                                        .quota || 0) /
                                                        1024 /
                                                        1024
                                                )}
                                                MB
                                            </div>
                                            <div>
                                                Utilisé:{" "}
                                                {Math.round(
                                                    (debugInfo.storageEstimate
                                                        .usage || 0) /
                                                        1024 /
                                                        1024
                                                )}
                                                MB
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Sync Progress (when active) */}
                            {syncProgress.total > 0 && (
                                <div className="rounded border bg-white p-3">
                                    <h4 className="mb-2 font-medium text-gray-800">
                                        Progression
                                    </h4>
                                    <div className="space-y-1">
                                        <div>
                                            Progression:{" "}
                                            {syncProgress.completed}/
                                            {syncProgress.total}
                                        </div>
                                        <div className="h-2 w-full rounded bg-gray-200">
                                            <div
                                                className="h-2 rounded bg-blue-500 transition-all duration-300"
                                                style={{
                                                    width: `${(syncProgress.completed / syncProgress.total) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        {syncProgress.currentItem && (
                                            <div className="truncate">
                                                Actuel:{" "}
                                                {syncProgress.currentItem}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {debugInfo.error && (
                            <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                                <strong>Erreur:</strong> {debugInfo.error}
                            </div>
                        )}
                    </div>
                )}

                {/* Rest of your existing component (stats, filters, table, etc.) */}
                {/* Stats Summary */}
                {textbookEntries.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
                                            <span className="text-sm font-semibold text-blue-600">
                                                {pagination?.total}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">
                                                Total des entrées
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {pagination?.total ||
                                                    textbookEntries.length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100">
                                            <span className="text-sm font-semibold text-green-600">
                                                {
                                                    textbookEntries.filter(
                                                        e => e.isSubmitted
                                                    ).length
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">
                                                Soumises
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {
                                                    textbookEntries.filter(
                                                        e => e.isSubmitted
                                                    ).length
                                                }
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-100">
                                            <span className="text-sm font-semibold text-yellow-600">
                                                {
                                                    textbookEntries.filter(
                                                        e => !e.isSubmitted
                                                    ).length
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">
                                                Brouillons
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {
                                                    textbookEntries.filter(
                                                        e => !e.isSubmitted
                                                    ).length
                                                }
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        {/* Search */}
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher par titre, matière..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Class Filter */}
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="min-w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            disabled={classroomsLoading}
                        >
                            <option value="">
                                {classroomsLoading
                                    ? "Chargement..."
                                    : "Toutes les classes"}
                            </option>
                            {classrooms.map((classroom: Classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.name} - {classroom.level}
                                </option>
                            ))}
                        </select>

                        {/* Subject Filter */}
                        <select
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            className="min-w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Toutes les matières</option>
                            {uniqueSubjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            className="min-w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="submitted">Soumis</option>
                            <option value="draft">Brouillon</option>
                        </select>

                        {/* Clear Filters */}
                        {(searchTerm ||
                            selectedClass ||
                            selectedSubject ||
                            selectedStatus) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Effacer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block">
                    {/* Table Header */}
                    <div className="bg-green-500 text-white">
                        <div className="grid grid-cols-8 gap-4 px-6 py-4 text-sm font-medium">
                            <div>Titre & Description</div>
                            <div>Matière</div>
                            <div>Classe</div>
                            <div>Date de session</div>
                            <div>Statut</div>
                            <div>Statut Directeur</div>
                            <div>Statut Inspecteur</div>
                            <div>Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {textbooksLoading ? (
                            <div className="px-6 py-12 text-center">
                                <div className="inline-flex items-center">
                                    <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                                    <span className="text-gray-600">
                                        Chargement des données...
                                    </span>
                                </div>
                            </div>
                        ) : textbookEntries.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <svg
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-medium text-gray-900">
                                    {searchTerm ||
                                    selectedClass ||
                                    selectedSubject ||
                                    selectedStatus
                                        ? "Aucun résultat trouvé"
                                        : "Aucun cahier de texte"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ||
                                    selectedClass ||
                                    selectedSubject ||
                                    selectedStatus
                                        ? "Essayez de modifier vos critères de recherche"
                                        : "Commencez par créer votre première entrée"}
                                </p>
                                {!(
                                    searchTerm ||
                                    selectedClass ||
                                    selectedSubject ||
                                    selectedStatus
                                ) && (
                                    <div className="mt-6">
                                        <Link href="/dashboard/textbooks/create">
                                            <Button className="bg-green-500 hover:bg-green-600">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Créer une entrée
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            textbookEntries.map(entry => (
                                <div
                                    key={entry.id}
                                    className="grid grid-cols-8 items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                                >
                                    <div>
                                        <h3 className="line-clamp-1 font-medium text-gray-900">
                                            {entry.title}
                                        </h3>
                                        {entry.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                {entry.description}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                            {entry.subject}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                            {entry.class?.name ||
                                                entry.classroom ||
                                                "Non défini"}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            {entry.sessionDate}
                                            {entry.sessionTime && (
                                                <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs">
                                                    {entry.sessionTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-col space-y-1">
                                            {entry.isSubmitted &&
                                                !entry.isOfflineCreated && (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        ✓ Soumis
                                                    </span>
                                                )}
                                            {!entry.isSubmitted &&
                                                !entry.isOfflineCreated && (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                        📝 Brouillon
                                                    </span>
                                                )}
                                            {entry.isSubmitted &&
                                                entry.isOfflineCreated && (
                                                    <>
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                            ✓ Enregistré
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                                            <WifiOff className="mr-1 h-3 w-3" />
                                                            Hors ligne
                                                        </span>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                entry.principalStatus ===
                                                "validated"
                                                    ? "bg-green-100 text-green-800"
                                                    : entry.principalStatus ===
                                                        "rejected"
                                                      ? "bg-red-100 text-red-800"
                                                      : entry.principalStatus ===
                                                          "viewed"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {entry.principalStatus ===
                                                "validated" && "✅ Validé"}
                                            {entry.principalStatus ===
                                                "rejected" && "❌ Rejeté"}
                                            {entry.principalStatus ===
                                                "viewed" && "👁️ Vu"}
                                            {entry.principalStatus ===
                                                "pending" && "⏳ En attente"}
                                        </span>
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                entry.inspectorStatus ===
                                                "validated"
                                                    ? "bg-green-100 text-green-800"
                                                    : entry.inspectorStatus ===
                                                        "rejected"
                                                      ? "bg-red-100 text-red-800"
                                                      : entry.inspectorStatus ===
                                                          "viewed"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {entry.inspectorStatus ===
                                                "validated" && "✅ Validé"}
                                            {entry.inspectorStatus ===
                                                "rejected" && "❌ Rejeté"}
                                            {entry.inspectorStatus ===
                                                "viewed" && "👁️ Vu"}
                                            {entry.inspectorStatus ===
                                                "pending" && "⏳ En attente"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/dashboard/textbooks/${entry.slug}`}
                                        >
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                                title="Voir les détails"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/dashboard/textbooks/${entry.slug}/edit`}
                                        >
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={clsx(
                                                    "border-purple-200 text-purple-600 hover:bg-purple-50",
                                                    {
                                                        "cursor-not-allowed opacity-50":
                                                            entry.isSubmitted,
                                                    }
                                                )}
                                                title="Modifier l'entrée"
                                                hidden={entry.isSubmitted}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() =>
                                                handleDelete(
                                                    entry.slug,
                                                    entry.title
                                                )
                                            }
                                            disabled={
                                                deleteTextbookMutation.isPending ||
                                                entry.isSubmitted
                                            }
                                            title={
                                                entry.isSubmitted
                                                    ? "Impossible de supprimer une entrée soumise"
                                                    : "Supprimer l'entrée"
                                            }
                                        >
                                            {deleteTextbookMutation.isPending ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mobile Card View - Visible only on mobile and tablets */}
                <div className="space-y-4 lg:hidden">
                    {textbooksLoading ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="inline-flex items-center">
                                <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                                <span className="text-gray-600">
                                    Chargement des données...
                                </span>
                            </div>
                        </div>
                    ) : textbookEntries.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-900">
                                {searchTerm ||
                                selectedClass ||
                                selectedSubject ||
                                selectedStatus
                                    ? "Aucun résultat trouvé"
                                    : "Aucun cahier de texte"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ||
                                selectedClass ||
                                selectedSubject ||
                                selectedStatus
                                    ? "Essayez de modifier vos critères de recherche"
                                    : "Commencez par créer votre première entrée"}
                            </p>
                            {!(
                                searchTerm ||
                                selectedClass ||
                                selectedSubject ||
                                selectedStatus
                            ) && (
                                <div className="mt-6">
                                    <Link href="/dashboard/textbooks/create">
                                        <Button className="bg-green-500 hover:bg-green-600">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Créer une entrée
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        textbookEntries.map(entry => (
                            <div
                                key={entry.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:shadow-md"
                            >
                                {/* Card Header */}
                                <div className="mb-3">
                                    <h3 className="line-clamp-2 font-medium text-gray-900">
                                        {entry.title}
                                    </h3>
                                    {entry.description && (
                                        <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                                            {entry.description}
                                        </p>
                                    )}
                                </div>

                                {/* Card Content - Grid layout for mobile */}
                                <div className="space-y-3">
                                    {/* Row 1: Subject and Class */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                            {entry.subject}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                            {entry.class?.name ||
                                                entry.classroom ||
                                                "Non défini"}
                                        </span>
                                    </div>

                                    {/* Row 2: Date and Time */}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        {entry.sessionDate}
                                        {entry.sessionTime && (
                                            <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs">
                                                {entry.sessionTime}
                                            </span>
                                        )}
                                    </div>

                                    {/* Row 3: Status */}
                                    <div>
                                        <div className="mb-1 text-xs font-medium text-gray-500">
                                            Statut:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {entry.isSubmitted &&
                                                !entry.isOfflineCreated && (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        ✓ Soumis
                                                    </span>
                                                )}
                                            {!entry.isSubmitted &&
                                                !entry.isOfflineCreated && (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                        📝 Brouillon
                                                    </span>
                                                )}
                                            {entry.isSubmitted &&
                                                entry.isOfflineCreated && (
                                                    <>
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                            ✓ Enregistré
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                                            <WifiOff className="mr-1 h-3 w-3" />
                                                            Hors ligne
                                                        </span>
                                                    </>
                                                )}
                                        </div>
                                    </div>

                                    {/* Row 4: Principal and Inspector Status */}
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <div>
                                            <div className="mb-1 text-xs font-medium text-gray-500">
                                                Directeur:
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    entry.principalStatus ===
                                                    "validated"
                                                        ? "bg-green-100 text-green-800"
                                                        : entry.principalStatus ===
                                                            "rejected"
                                                          ? "bg-red-100 text-red-800"
                                                          : entry.principalStatus ===
                                                              "viewed"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {entry.principalStatus ===
                                                    "validated" && "✅ Validé"}
                                                {entry.principalStatus ===
                                                    "rejected" && "❌ Rejeté"}
                                                {entry.principalStatus ===
                                                    "viewed" && "👁️ Vu"}
                                                {entry.principalStatus ===
                                                    "pending" &&
                                                    "⏳ En attente"}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-xs font-medium text-gray-500">
                                                Inspecteur:
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    entry.inspectorStatus ===
                                                    "validated"
                                                        ? "bg-green-100 text-green-800"
                                                        : entry.inspectorStatus ===
                                                            "rejected"
                                                          ? "bg-red-100 text-red-800"
                                                          : entry.inspectorStatus ===
                                                              "viewed"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {entry.inspectorStatus ===
                                                    "validated" && "✅ Validé"}
                                                {entry.inspectorStatus ===
                                                    "rejected" && "❌ Rejeté"}
                                                {entry.inspectorStatus ===
                                                    "viewed" && "👁️ Vu"}
                                                {entry.inspectorStatus ===
                                                    "pending" &&
                                                    "⏳ En attente"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
                                    <Link
                                        href={`/dashboard/textbooks/${entry.slug}`}
                                    >
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="min-w-[2.5rem] flex-shrink-0 border-orange-200 text-orange-600 hover:bg-orange-50"
                                            title="Voir les détails"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {!entry.isSubmitted && (
                                        <Link
                                            href={`/dashboard/textbooks/${entry.slug}/edit`}
                                        >
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="min-w-[2.5rem] flex-shrink-0 border-purple-200 text-purple-600 hover:bg-purple-50"
                                                title="Modifier l'entrée"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="min-w-[2.5rem] flex-shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                            handleDelete(
                                                entry.slug,
                                                entry.title
                                            )
                                        }
                                        disabled={
                                            deleteTextbookMutation.isPending ||
                                            entry.isSubmitted
                                        }
                                        title={
                                            entry.isSubmitted
                                                ? "Impossible de supprimer une entrée soumise"
                                                : "Supprimer l'entrée"
                                        }
                                    >
                                        {deleteTextbookMutation.isPending ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between rounded-lg border bg-white px-6 py-3">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Affichage de{" "}
                                <span className="font-medium">
                                    {pagination.from || 0}
                                </span>{" "}
                                à{" "}
                                <span className="font-medium">
                                    {pagination.to || 0}
                                </span>{" "}
                                sur{" "}
                                <span className="font-medium">
                                    {pagination.total}
                                </span>{" "}
                                résultats
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1 || textbooksLoading}
                            >
                                Précédent
                            </Button>
                            <div className="flex items-center space-x-1">
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            pagination.last_page
                                        ),
                                    },
                                    (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    page === pageNum
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() => setPage(pageNum)}
                                                disabled={textbooksLoading}
                                                className="h-8 w-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    }
                                )}
                                {pagination.last_page > 5 && (
                                    <>
                                        <span className="text-gray-500">
                                            ...
                                        </span>
                                        <Button
                                            variant={
                                                page === pagination.last_page
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setPage(pagination.last_page)
                                            }
                                            disabled={textbooksLoading}
                                            className="h-8 w-8 p-0"
                                        >
                                            {pagination.last_page}
                                        </Button>
                                    </>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage(
                                        Math.min(pagination.last_page, page + 1)
                                    )
                                }
                                disabled={
                                    page === pagination.last_page ||
                                    textbooksLoading
                                }
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}

                {/* Enhanced Help Section */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-blue-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Guide d'utilisation du cahier de texte numérique
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc space-y-1 pl-5">
                                    <li>
                                        Utilisez les filtres par classe, matière
                                        et statut pour retrouver facilement vos
                                        cours
                                    </li>
                                    <li>
                                        Une fois qu'une séance est validée, elle
                                        ne peut plus être modifiée
                                    </li>
                                    <li>
                                        <strong>🔄 Synchronisation : </strong>
                                        Cliquez sur "Synchroniser" pour
                                        sauvegarder vos données sur le serveur
                                        de l'école
                                    </li>
                                    <li>
                                        <strong>
                                            👁️ Consultation détaillée :
                                        </strong>
                                        Le bouton "Voir IndexedDB" vous permet
                                        de consulter tous vos cours sauvegardés
                                        sur votre appareil
                                    </li>
                                    <li>
                                        <strong>
                                            💾 Travail hors ligne :{" "}
                                        </strong>
                                        Vous pouvez créer et modifier vos
                                        séances même sans internet.
                                        L'application peut stocker beaucoup de
                                        données localement
                                    </li>
                                    <li>
                                        <strong>🔍 Diagnostic : </strong>
                                        Le bouton 🗄️ vous montre l'état de vos
                                        données sauvegardées et détecte
                                        d'éventuels problèmes
                                    </li>
                                    <li>
                                        <strong>
                                            📊 Suivi d'utilisation :{" "}
                                        </strong>
                                        Consultez l'espace utilisé par vos
                                        données et l'état général de
                                        l'application
                                    </li>
                                    <li>
                                        <strong>
                                            ⚡ Fluidité d'utilisation :
                                        </strong>
                                        L'application fonctionne de manière
                                        fluide, même lors de la sauvegarde de
                                        gros volumes de données
                                    </li>
                                    <li>
                                        <strong>
                                            🔒 Sécurité des données :
                                        </strong>
                                        Vos données sont protégées et
                                        sauvegardées de manière fiable pour
                                        éviter toute perte
                                    </li>
                                    <li>
                                        Les séances créées sans connexion
                                        internet sont identifiées par un
                                        indicateur orange
                                    </li>
                                    <li>
                                        Dès que vous retrouvez une connexion
                                        internet, vos données se synchronisent
                                        automatiquement
                                    </li>
                                    <li>
                                        <strong>💡 Conseil pratique : </strong>
                                        Pensez à synchroniser régulièrement pour
                                        éviter la perte de données en cas de
                                        problème technique
                                    </li>
                                    <li>
                                        En cas de message d'avertissement sur
                                        l'espace de stockage, utilisez la
                                        fonction "Maintenance" pour nettoyer les
                                        anciennes données
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Warning (if usage is high) */}
                {syncStatus.storageStats &&
                    syncStatus.storageStats.estimatedTotalSizeMB > 25 && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Utilisation du stockage
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        Vous utilisez actuellement{" "}
                                        {
                                            syncStatus.storageStats
                                                .estimatedTotalSizeMB
                                        }
                                        MB de stockage local.
                                        {syncStatus.storageStats
                                            .estimatedTotalSizeMB > 50 && (
                                            <span className="font-medium">
                                                {" "}
                                                Considérez utiliser la fonction
                                                de maintenance pour nettoyer les
                                                anciennes données.
                                            </span>
                                        )}
                                    </p>
                                    <div className="mt-2 flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleMaintenance}
                                        >
                                            🔧 Maintenance
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleExportData}
                                        >
                                            📤 Sauvegarder les données
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {/* IndexedDB Viewer Modal */}
                <IndexedDBViewer
                    isOpen={showIndexedDBViewer}
                    onClose={() => setShowIndexedDBViewer(false)}
                />
            </div>
        </>
    );
}
