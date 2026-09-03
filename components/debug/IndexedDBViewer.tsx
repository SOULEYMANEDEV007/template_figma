// components/debug/IndexedDBViewer.tsx - View actual IndexedDB content
"use client";

import { Button } from "@/components/ui";
import { offlineStorage } from "@/lib/offlineStorage";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Database,
    Eye,
    EyeOff,
    FileText,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface IndexedDBViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewMode = "textbooks" | "attendance" | "metadata" | "files";
type FilterMode = "all" | "pending" | "synced" | "error";

export function IndexedDBViewer({ isOpen, onClose }: IndexedDBViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("textbooks");
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showContent, setShowContent] = useState(false);

    // Load data when view mode or filter changes
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, viewMode, filterMode]);

    const loadData = async () => {
        setLoading(true);
        try {
            console.log(
                `🔍 Loading ${viewMode} data with filter: ${filterMode}`
            );

            let rawData: any[] = [];

            switch (viewMode) {
                case "textbooks":
                    if (filterMode === "pending") {
                        rawData =
                            await offlineStorage.getAllPendingTextbookEntries();
                    } else {
                        // Get all textbook entries
                        rawData =
                            await offlineStorage.db.textbookEntries.toArray();
                        if (filterMode === "synced") {
                            rawData = rawData.filter(item => item.isSynced);
                        } else if (filterMode === "error") {
                            rawData = rawData.filter(
                                item => item.syncStatus === "error"
                            );
                        }
                    }
                    break;

                case "attendance":
                    if (filterMode === "pending") {
                        rawData =
                            await offlineStorage.getAllPendingAttendanceEntries();
                    } else {
                        rawData =
                            await offlineStorage.db.attendanceEntries.toArray();
                        if (filterMode === "synced") {
                            rawData = rawData.filter(item => item.isSynced);
                        } else if (filterMode === "error") {
                            rawData = rawData.filter(
                                item => item.syncStatus === "error"
                            );
                        }
                    }
                    break;

                case "metadata":
                    rawData = await offlineStorage.db.syncMetadata.toArray();
                    break;

                case "files":
                    if (filterMode === "pending") {
                        rawData = await offlineStorage.getPendingFiles();
                    } else {
                        rawData = await offlineStorage.db.files.toArray();
                    }
                    break;
            }

            // Apply search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                rawData = rawData.filter(item => {
                    if (viewMode === "textbooks") {
                        return (
                            item.title?.toLowerCase().includes(term) ||
                            item.subject?.toLowerCase().includes(term) ||
                            item.content?.toLowerCase().includes(term)
                        );
                    } else if (viewMode === "attendance") {
                        return (
                            item.studentId?.toLowerCase().includes(term) ||
                            item.date?.includes(term) ||
                            item.status?.toLowerCase().includes(term)
                        );
                    } else if (viewMode === "metadata") {
                        return (
                            item.key?.toLowerCase().includes(term) ||
                            item.value?.toLowerCase().includes(term)
                        );
                    } else if (viewMode === "files") {
                        return (
                            item.fileName?.toLowerCase().includes(term) ||
                            item.mimeType?.toLowerCase().includes(term)
                        );
                    }
                    return false;
                });
            }

            setData(rawData);
            console.log(`📊 Loaded ${rawData.length} ${viewMode} items`);
        } catch (error) {
            console.error("❌ Failed to load data:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (item: any) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?"))
            return;

        try {
            await offlineStorage.deleteEntry(item.tempId);
            toast.success("Élément supprimé");
            loadData(); // Refresh data
        } catch (error) {
            console.error("❌ Failed to delete item:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleRetryItem = async (item: any) => {
        try {
            await offlineStorage.retryEntry(item.tempId);
            toast.success("Élément marqué pour nouvelle tentative");
            loadData(); // Refresh data
        } catch (error) {
            console.error("❌ Failed to retry item:", error);
            toast.error("Erreur lors de la nouvelle tentative");
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("fr-FR");
    };

    const getStatusBadge = (item: any) => {
        if (item.isSynced) {
            return (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Synchronisé
                </span>
            );
        } else if (item.syncStatus === "error") {
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Erreur ({item.retryCount || 0})
                </span>
            );
        } else if (item.syncStatus === "syncing") {
            return (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    En cours
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    <Clock className="mr-1 h-3 w-3" />
                    En attente
                </span>
            );
        }
    };

    const renderTextbookItem = (item: any) => (
        <div key={item.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                            {item.title}
                        </h3>
                        {getStatusBadge(item)}
                        {item.isDeleted && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                Supprimé
                            </span>
                        )}
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Matière:</span>{" "}
                            {item.subject}
                        </div>
                        <div>
                            <span className="font-medium">Classe:</span>{" "}
                            {item.classId}
                        </div>
                        <div>
                            <span className="font-medium">Date session:</span>{" "}
                            {item.sessionDate}
                        </div>
                        <div>
                            <span className="font-medium">Action:</span>{" "}
                            {item.action}
                        </div>
                        <div>
                            <span className="font-medium">Créé:</span>{" "}
                            {formatDate(item.createdAt)}
                        </div>
                        <div>
                            <span className="font-medium">Modifié:</span>{" "}
                            {formatDate(item.lastModified)}
                        </div>
                    </div>

                    {item.description && (
                        <p className="mb-2 text-sm text-gray-600">
                            <span className="font-medium">Description:</span>{" "}
                            {item.description}
                        </p>
                    )}

                    {item.errorMessage && (
                        <div className="mb-2 rounded border border-red-200 bg-red-50 p-2">
                            <p className="text-xs text-red-700">
                                <span className="font-medium">Erreur:</span>{" "}
                                {item.errorMessage}
                            </p>
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        <span className="font-medium">ID:</span> {item.tempId}
                        {item.serverId && (
                            <span className="ml-4">
                                <span className="font-medium">Serveur ID:</span>{" "}
                                {item.serverId}
                            </span>
                        )}
                    </div>
                </div>

                <div className="ml-4 flex space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            setSelectedItem(
                                selectedItem?.id === item.id ? null : item
                            )
                        }
                        title="Voir le contenu"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    {item.syncStatus === "error" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryItem(item)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            title="Réessayer"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        title="Supprimer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content preview */}
            {selectedItem?.id === item.id && (
                <div className="mt-4 border-t pt-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                            Contenu complet:
                        </h4>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowContent(!showContent)}
                        >
                            {showContent ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                            {showContent ? "Masquer" : "Afficher"} HTML
                        </Button>
                    </div>

                    {showContent ? (
                        <pre className="max-h-40 overflow-auto rounded bg-gray-100 p-3 text-xs">
                            {item.content}
                        </pre>
                    ) : (
                        <div
                            className="prose prose-sm max-h-40 max-w-none overflow-auto rounded bg-gray-50 p-3"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    )}
                </div>
            )}
        </div>
    );

    const renderAttendanceItem = (item: any) => (
        <div key={item.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                            Présence - {item.date}
                        </h3>
                        {getStatusBadge(item)}
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Étudiant:</span>{" "}
                            {item.studentId}
                        </div>
                        <div>
                            <span className="font-medium">Classe:</span>{" "}
                            {item.classId}
                        </div>
                        <div>
                            <span className="font-medium">Statut:</span>{" "}
                            {item.status}
                        </div>
                        <div>
                            <span className="font-medium">Action:</span>{" "}
                            {item.action}
                        </div>
                    </div>

                    {item.notes && (
                        <p className="mb-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {item.notes}
                        </p>
                    )}

                    <div className="text-xs text-gray-500">
                        <span className="font-medium">ID:</span> {item.tempId}
                    </div>
                </div>

                <div className="ml-4 flex space-x-2">
                    {item.syncStatus === "error" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryItem(item)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderMetadataItem = (item: any) => (
        <div key={item.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="mb-2 font-medium text-gray-900">
                        {item.key}
                    </h3>
                    <pre className="max-h-32 overflow-auto rounded bg-gray-100 p-2 text-xs">
                        {item.value}
                    </pre>
                    <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium">Mis à jour:</span>{" "}
                        {formatDate(item.lastUpdated)}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFileItem = (item: any) => (
        <div key={item.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                            {item.fileName}
                        </h3>
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                item.uploadStatus === "uploaded"
                                    ? "bg-green-100 text-green-800"
                                    : item.uploadStatus === "error"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                            {item.uploadStatus}
                        </span>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Type:</span>{" "}
                            {item.mimeType}
                        </div>
                        <div>
                            <span className="font-medium">Taille:</span>{" "}
                            {Math.round(item.size / 1024)}KB
                        </div>
                        <div>
                            <span className="font-medium">Associé à:</span>{" "}
                            {item.associatedEntryType}
                        </div>
                        <div>
                            <span className="font-medium">Créé:</span>{" "}
                            {formatDate(item.createdAt)}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        <span className="font-medium">ID:</span> {item.tempId}
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-500/65 p-2 md:p-4">
            <div className="flex h-[90vh] w-full max-w-[95vw] flex-col rounded-lg bg-white shadow-xl md:h-[80vh] md:max-w-4xl lg:max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 md:p-6">
                    <div className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
                            <span className="hidden md:inline">
                                Visualiseur IndexedDB
                            </span>
                            <span className="md:hidden">IndexedDB</span>
                        </h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex flex-col space-y-2 border-b bg-gray-50 p-3 md:flex-row md:items-center md:space-y-0 md:space-x-4 md:p-4">
                    {/* View Mode */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant={
                                viewMode === "textbooks" ? "default" : "outline"
                            }
                            onClick={() => setViewMode("textbooks")}
                        >
                            <FileText className="mr-1 h-4 w-4" />
                            Textbooks
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                viewMode === "attendance"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => setViewMode("attendance")}
                        >
                            <Users className="mr-1 h-4 w-4" />
                            Présence
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                viewMode === "metadata" ? "default" : "outline"
                            }
                            onClick={() => setViewMode("metadata")}
                        >
                            <Database className="mr-1 h-4 w-4" />
                            Metadata
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                viewMode === "files" ? "default" : "outline"
                            }
                            onClick={() => setViewMode("files")}
                        >
                            <Calendar className="mr-1 h-4 w-4" />
                            Fichiers
                        </Button>
                    </div>

                    {/* Filter Mode */}
                    {(viewMode === "textbooks" ||
                        viewMode === "attendance") && (
                        <div className="flex space-x-2">
                            <select
                                value={filterMode}
                                onChange={e =>
                                    setFilterMode(e.target.value as FilterMode)
                                }
                                className="rounded border border-gray-300 px-2 py-1 text-sm"
                            >
                                <option value="all">Tous</option>
                                <option value="pending">En attente</option>
                                <option value="synced">Synchronisés</option>
                                <option value="error">Erreurs</option>
                            </select>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full rounded border border-gray-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Refresh */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={loadData}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                        />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-gray-600">
                                    Chargement des données...
                                </p>
                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <Database className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    Aucune donnée trouvée
                                </h3>
                                <p className="text-gray-600">
                                    {searchTerm
                                        ? "Aucun résultat pour votre recherche"
                                        : `Aucun ${viewMode} dans IndexedDB`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {data.length} élément(s) trouvé(s)
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {data.map(item => {
                                    switch (viewMode) {
                                        case "textbooks":
                                            return renderTextbookItem(item);
                                        case "attendance":
                                            return renderAttendanceItem(item);
                                        case "metadata":
                                            return renderMetadataItem(item);
                                        case "files":
                                            return renderFileItem(item);
                                        default:
                                            return null;
                                    }
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default IndexedDBViewer;
