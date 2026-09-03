// components/forms/TextbookForm.tsx - Updated for IndexedDB integration
"use client";

import { Button, Card } from "@/components/ui";
import { handleApiError, isValidationError } from "@/lib/api-client";
import {
    useClassrooms,
    useCreateTextbook,
    useUpdateTextbook,
} from "@/lib/hooks/api-hooks";
import { syncManager, useSyncManager } from "@/lib/syncManager"; // Updated import
import { WEB_ROUTES } from "@/routes/web";
import type {
    Classroom,
    CreateTextbookEntryData,
    TextbookEntry,
    UpdateTextbookEntryData,
} from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Clock, Loader, Wifi, WifiOff } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: true,
    loading: () => (
        <div className="flex h-48 items-center justify-center rounded border bg-gray-50">
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">
                Chargement de l'éditeur...
            </span>
        </div>
    ),
});

interface TextbookFormProps {
    initialData?: TextbookEntry;
    mode: "create" | "edit";
}

type SaveStatus = "saved" | "synced" | "pending" | "syncing" | "error";

export default function TextbookForm({ initialData, mode }: TextbookFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    // Use the new sync manager hook
    const { syncStatus, syncProgress } = useSyncManager();

    // Form data
    const [formData, setFormData] = useState<CreateTextbookEntryData>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        subject: initialData?.subject || "",
        content: initialData?.content || "",
        class_id: initialData?.class?.id || 0,
        session_date: initialData?.sessionDate
            ? formatDateForInput(initialData.sessionDate)
            : formatDateForInput(new Date().toLocaleDateString("fr-FR")),
        session_time: initialData?.sessionTime || "",
        next_session_date: initialData?.nextSession
            ? formatDateForInput(initialData.nextSession)
            : "",
        next_session_time: initialData?.nextSessionTime || "",
    });

    // Quill configuration
    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["link"],
            ["blockquote", "code-block"],
            ["clean"],
        ],
    };

    const quillFormats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "list",
        "bullet",
        "indent",
        "align",
        "link",
        "blockquote",
        "code-block",
    ];

    // Helper function to format date from DD/MM/YYYY to YYYY-MM-DD
    function formatDateForInput(dateStr: string): string {
        if (!dateStr) return "";
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
        if (dateStr.includes("-") && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
        }
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
            }
        } catch (e) {
            console.warn("Invalid date format:", dateStr);
        }
        return "";
    }

    // API hooks with proper error handling and optimistic updates
    const {
        data: classroomsResponse,
        isLoading: classroomsLoading,
        error: classroomsError,
    } = useClassrooms();
    const classrooms = classroomsResponse?.data || [];

    const createTextbook = useCreateTextbook({
        onMutate: async newData => {
            await queryClient.cancelQueries({ queryKey: ["textbooks"] });
            const previousTextbooks = queryClient.getQueryData([
                "textbooks",
                "list",
            ]);

            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old) return old;
                const optimisticEntry = {
                    id: Date.now(),
                    slug: `temp-${Date.now()}`,
                    title: newData.title,
                    subject: newData.subject,
                    content: newData.content,
                    sessionDate: newData.session_date,
                    sessionTime: newData.session_time,
                    isSubmitted: false,
                    isOfflineCreated: !syncStatus.isOnline,
                    class: classrooms.find(c => c.id === newData.class_id),
                    createdAt: new Date().toISOString(),
                };
                return { ...old, data: [optimisticEntry, ...(old.data || [])] };
            });
            return { previousTextbooks };
        },
        onError: (err, newData, context: any) => {
            if (context?.previousTextbooks) {
                queryClient.setQueryData(
                    ["textbooks", "list"],
                    context.previousTextbooks
                );
            }
            if (isValidationError(err)) {
                setErrors(err.errors || {});
                toast.error("Veuillez corriger les erreurs dans le formulaire");
            } else {
                toast.error(err.message || "Erreur lors de la création");
                setSaveStatus("error");
            }
            setIsLoading(false);
        },
        onSuccess: data => {
            setSaveStatus("synced");
            setLastSaveTime(new Date());
            toast.success("Cahier de texte créé avec succès");
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ["textbooks"] });
            router.push(WEB_ROUTES.TEXTBOOKS.INDEX);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["textbooks"] });
        },
    });

    const updateTextbook = useUpdateTextbook({
        onMutate: async ({ slug, data: updateData }) => {
            await queryClient.cancelQueries({ queryKey: ["textbooks"] });
            await queryClient.cancelQueries({
                queryKey: ["textbooks", "detail", slug],
            });

            const previousTextbooks = queryClient.getQueryData([
                "textbooks",
                "list",
            ]);
            const previousTextbook = queryClient.getQueryData([
                "textbooks",
                "detail",
                slug,
            ]);

            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) =>
                        item.slug === slug
                            ? {
                                  ...item,
                                  title: updateData.title || item.title,
                                  subject: updateData.subject || item.subject,
                                  content: updateData.content || item.content,
                                  sessionDate:
                                      updateData.session_date ||
                                      item.sessionDate,
                                  sessionTime:
                                      updateData.session_time ||
                                      item.sessionTime,
                                  updatedAt: new Date().toISOString(),
                              }
                            : item
                    ),
                };
            });

            queryClient.setQueryData(
                ["textbooks", "detail", slug],
                (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        title: updateData.title || old.title,
                        subject: updateData.subject || old.subject,
                        content: updateData.content || old.content,
                        sessionDate: updateData.session_date || old.sessionDate,
                        sessionTime: updateData.session_time || old.sessionTime,
                        updatedAt: new Date().toISOString(),
                    };
                }
            );

            return { previousTextbooks, previousTextbook };
        },
        onError: (err, variables, context: any) => {
            if (context?.previousTextbooks) {
                queryClient.setQueryData(
                    ["textbooks", "list"],
                    context.previousTextbooks
                );
            }
            if (context?.previousTextbook) {
                queryClient.setQueryData(
                    ["textbooks", "detail", variables.slug],
                    context.previousTextbook
                );
            }
            if (isValidationError(err)) {
                setErrors(err.errors || {});
                toast.error("Veuillez corriger les erreurs dans le formulaire");
            } else {
                toast.error(err.message || "Erreur lors de la mise à jour");
                setSaveStatus("error");
            }
            setIsLoading(false);
        },
        onSuccess: (data, variables) => {
            setSaveStatus("synced");
            setLastSaveTime(new Date());
            toast.success("Cahier de texte mis à jour avec succès");
            setIsLoading(false);
            queryClient.setQueryData(
                ["textbooks", "detail", variables.slug],
                data
            );
            router.push(WEB_ROUTES.TEXTBOOKS.INDEX);
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["textbooks"] });
            queryClient.invalidateQueries({
                queryKey: ["textbooks", "detail", variables.slug],
            });
        },
    });

    // Update save status based on sync status
    useEffect(() => {
        if (syncStatus.isSyncing) {
            setSaveStatus("syncing");
        } else if (syncStatus.hasPendingItems) {
            setSaveStatus("pending");
        } else if (syncStatus.isOnline) {
            setSaveStatus("synced");
        }
    }, [syncStatus]);

    // Auto-save functionality
    useEffect(() => {
        if (!autoSaveEnabled || mode !== "edit") return;

        const autoSaveTimer = setTimeout(() => {
            if (
                (formData.title || formData.content) &&
                saveStatus !== "syncing"
            ) {
                handleAutoSave();
            }
        }, 60000); // Auto-save every 60 seconds

        return () => clearTimeout(autoSaveTimer);
    }, [formData, autoSaveEnabled, mode, saveStatus]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "class_id" ? parseInt(value) || 0 : value,
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: [] }));
        }
        if (saveStatus === "synced") {
            setSaveStatus("saved");
        }
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
        if (errors.content) {
            setErrors(prev => ({ ...prev, content: [] }));
        }
        if (saveStatus === "synced") {
            setSaveStatus("saved");
        }
    };

    const prepareFormDataForBackend = (
        data: typeof formData
    ): CreateTextbookEntryData | UpdateTextbookEntryData => {
        return {
            title: data.title,
            description: data.description || undefined,
            subject: data.subject,
            content: data.content,
            class_id: data.class_id,
            session_date: data.session_date,
            session_time: data.session_time || undefined,
            next_session_date: data.next_session_date || undefined,
            next_session_time: data.next_session_time || undefined,
        };
    };

    const handleAutoSave = async () => {
        if (!formData.title || !formData.content) return;
        if (saveStatus === "syncing") return;

        setSaveStatus("syncing");

        try {
            const backendData = prepareFormDataForBackend(formData);

            if (mode === "create") {
                // Use the new IndexedDB sync manager
                const tempId = await syncManager.createTextbookEntry(
                    backendData as CreateTextbookEntryData
                );

                if (syncStatus.isOnline) {
                    setSaveStatus("synced");
                    toast.success("Sauvegarde automatique réussie", {
                        duration: 2000,
                    });
                } else {
                    setSaveStatus("pending");
                    toast.success(
                        "Sauvegardé localement - En attente de synchronisation",
                        { duration: 3000 }
                    );
                }
                setLastSaveTime(new Date());
            } else if (mode === "edit" && initialData) {
                if (syncStatus.isOnline) {
                    try {
                        await updateTextbook.mutateAsync({
                            slug: initialData.slug,
                            data: backendData as UpdateTextbookEntryData,
                        });
                    } catch (error) {
                        // Fallback to offline
                        await syncManager.updateTextbookEntry(
                            initialData.slug,
                            backendData as UpdateTextbookEntryData
                        );
                        setSaveStatus("pending");
                        toast.success("Modifications sauvegardées localement", {
                            duration: 3000,
                        });
                        setLastSaveTime(new Date());
                    }
                } else {
                    await syncManager.updateTextbookEntry(
                        initialData.slug,
                        backendData as UpdateTextbookEntryData
                    );
                    setSaveStatus("pending");
                    toast.success("Modifications sauvegardées localement", {
                        duration: 3000,
                    });
                    setLastSaveTime(new Date());
                }
            }
        } catch (error) {
            console.error("Auto-save failed:", error);
            setSaveStatus("error");
            toast.error("Erreur de sauvegarde automatique");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Client-side validation
        const newErrors: Record<string, string[]> = {};
        if (!formData.title.trim())
            newErrors.title = ["Le titre est obligatoire"];
        if (!formData.subject.trim())
            newErrors.subject = ["La matière est obligatoire"];
        if (!formData.content.trim() || formData.content === "<p><br></p>")
            newErrors.content = ["Le contenu est obligatoire"];
        if (!formData.class_id)
            newErrors.class_id = ["La classe est obligatoire"];
        if (!formData.session_date)
            newErrors.session_date = ["La date de session est obligatoire"];

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            toast.error("Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        try {
            const backendData = prepareFormDataForBackend(formData);

            if (mode === "create") {
                if (syncStatus.isOnline) {
                    // Try online creation first
                    createTextbook.mutate(
                        backendData as CreateTextbookEntryData
                    );
                } else {
                    // Offline creation using IndexedDB
                    await syncManager.createTextbookEntry(
                        backendData as CreateTextbookEntryData
                    );
                    setSaveStatus("pending");
                    setLastSaveTime(new Date());
                    toast.success(
                        "Créé et sauvegardé localement - Sera synchronisé automatiquement"
                    );
                    setIsLoading(false);

                    // Update local cache optimistically
                    queryClient.setQueryData(
                        ["textbooks", "list"],
                        (old: any) => {
                            const optimisticEntry = {
                                id: Date.now(),
                                slug: `offline-${Date.now()}`,
                                title: formData.title,
                                subject: formData.subject,
                                content: formData.content,
                                sessionDate: formData.session_date,
                                sessionTime: formData.session_time,
                                isSubmitted: false,
                                isOfflineCreated: true,
                                class: classrooms.find(
                                    c => c.id === formData.class_id
                                ),
                                createdAt: new Date().toISOString(),
                            };

                            if (!old?.data) {
                                return {
                                    data: [optimisticEntry],
                                    meta: { total: 1 },
                                };
                            }
                            return {
                                ...old,
                                data: [optimisticEntry, ...old.data],
                            };
                        }
                    );

                    router.push(WEB_ROUTES.TEXTBOOKS.INDEX);
                }
            } else if (mode === "edit" && initialData) {
                if (syncStatus.isOnline) {
                    // Try online update first
                    updateTextbook.mutate({
                        slug: initialData.slug,
                        data: backendData as UpdateTextbookEntryData,
                    });
                } else {
                    // Offline update using IndexedDB
                    await syncManager.updateTextbookEntry(
                        initialData.slug,
                        backendData as UpdateTextbookEntryData
                    );
                    setSaveStatus("pending");
                    setLastSaveTime(new Date());
                    toast.success(
                        "Modifications sauvegardées localement - Sera synchronisé automatiquement"
                    );
                    setIsLoading(false);

                    // Update local cache optimistically
                    queryClient.setQueryData(
                        ["textbooks", "detail", initialData.slug],
                        (old: any) => {
                            return {
                                ...old,
                                title: formData.title,
                                subject: formData.subject,
                                content: formData.content,
                                sessionDate: formData.session_date,
                                sessionTime: formData.session_time,
                                updatedAt: new Date().toISOString(),
                            };
                        }
                    );

                    queryClient.invalidateQueries({ queryKey: ["textbooks"] });
                    router.push(WEB_ROUTES.TEXTBOOKS.INDEX);
                }
            }
        } catch (error) {
            const apiError = handleApiError(error);
            if (isValidationError(apiError)) {
                setErrors(apiError.errors || {});
                toast.error("Veuillez corriger les erreurs dans le formulaire");
            } else {
                toast.error(apiError.message || "Erreur lors de la soumission");
                setSaveStatus("error");
            }
            setIsLoading(false);
        }
    };

    const handleManualSave = async () => {
        if (mode === "create" && (!formData.title || !formData.content)) {
            toast.warning(
                "Veuillez remplir au moins le titre et le contenu pour sauvegarder"
            );
            return;
        }
        await handleAutoSave();
    };

    const handleForceSync = async () => {
        if (!syncStatus.isOnline) {
            toast.error("Impossible de synchroniser hors ligne");
            return;
        }

        setSaveStatus("syncing");
        try {
            await syncManager.forceSync();
            setSaveStatus("synced");
            setLastSaveTime(new Date());
            queryClient.invalidateQueries({ queryKey: ["textbooks"] });
            toast.success("Synchronisation manuelle réussie!");
        } catch (error) {
            console.error("Force sync failed:", error);
            setSaveStatus("error");
            toast.error("Échec de la synchronisation");
        }
    };

    // Subject options
    const subjectOptions = [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Éducation Civique et Morale",
        "Éducation Physique et Sportive",
        "Arts Plastiques",
        "Éducation Musicale",
        "Anglais",
        "Informatique",
    ];

    // Status indicator component
    const StatusIndicator = () => (
        <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
                <div
                    className={`h-2 w-2 rounded-full ${syncStatus.isOnline ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-xs text-gray-600">
                    {syncStatus.isOnline ? "En ligne" : "Hors ligne"}
                </span>
            </div>

            {/* Save Status with Sync Progress */}
            {saveStatus === "pending" && (
                <div className="flex items-center text-yellow-600">
                    <Clock className="mr-1 h-4 w-4" />
                    <span className="text-xs">
                        En attente de synchronisation ({syncStatus.pendingCount}{" "}
                        éléments)
                    </span>
                </div>
            )}

            {saveStatus === "syncing" && (
                <div className="flex items-center text-blue-600">
                    <Loader className="mr-1 h-4 w-4 animate-spin" />
                    <span className="text-xs">
                        Synchronisation...
                        {syncProgress.total > 0 &&
                            ` (${syncProgress.completed}/${syncProgress.total})`}
                    </span>
                </div>
            )}

            {saveStatus === "synced" && (
                <div className="flex items-center text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    <span className="text-xs">
                        Synchronisé{" "}
                        {lastSaveTime &&
                            `à ${lastSaveTime.toLocaleTimeString("fr-FR")}`}
                    </span>
                </div>
            )}

            {saveStatus === "error" && (
                <div className="flex items-center text-red-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    <span className="text-xs">Erreur de sauvegarde</span>
                </div>
            )}
        </div>
    );

    return (
        <Card className="p-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {mode === "create"
                                    ? "Nouvelle Entrée"
                                    : "Modifier l'Entrée"}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                {mode === "create"
                                    ? "Créer une nouvelle entrée dans le cahier de textes"
                                    : "Modifier les détails de l'entrée"}
                            </p>
                        </div>
                        <StatusIndicator />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Titre de la leçon *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                errors.title?.length
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="Ex: Introduction aux nombres de 0 à 10"
                            maxLength={255}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title[0]}
                            </p>
                        )}
                    </div>

                    {/* Subject and Class */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="subject"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Matière *
                            </label>
                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                    errors.subject?.length
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            >
                                <option value="">
                                    Sélectionner une matière
                                </option>
                                {subjectOptions.map(subject => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                            {errors.subject && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.subject[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="class_id"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Classe *
                            </label>
                            <select
                                id="class_id"
                                name="class_id"
                                value={formData.class_id}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                    errors.class_id?.length
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={classroomsLoading}
                            >
                                <option value="">
                                    {classroomsLoading
                                        ? "Chargement des classes..."
                                        : classrooms.length === 0
                                          ? "Aucune classe disponible"
                                          : "Sélectionner une classe"}
                                </option>
                                {classrooms.map((classroom: Classroom) => (
                                    <option
                                        key={classroom.id}
                                        value={classroom.id}
                                    >
                                        {classroom.name} - {classroom.level}
                                    </option>
                                ))}
                            </select>
                            {errors.class_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.class_id[0]}
                                </p>
                            )}
                            {classroomsError && (
                                <p className="mt-1 text-sm text-red-600">
                                    Erreur lors du chargement des classes
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                errors.description?.length
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="Brève description de la leçon..."
                            maxLength={1000}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.description[0]}
                            </p>
                        )}
                    </div>

                    {/* Session Date and Time */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="session_date"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Date de la séance *
                            </label>
                            <input
                                type="date"
                                id="session_date"
                                name="session_date"
                                value={formData.session_date}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                    errors.session_date?.length
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.session_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.session_date[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="session_time"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Heure de la séance
                            </label>
                            <input
                                type="time"
                                id="session_time"
                                name="session_time"
                                value={formData.session_time}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                    errors.session_time?.length
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.session_time && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.session_time[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Next Session Date and Time */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="next_session_date"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Prochaine séance (Date)
                            </label>
                            <input
                                type="date"
                                id="next_session_date"
                                name="next_session_date"
                                value={formData.next_session_date}
                                onChange={handleInputChange}
                                min={formData.session_date}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                    errors.next_session_date?.length
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.next_session_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.next_session_date[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="next_session_time"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Prochaine séance (Heure)
                            </label>
                            <input
                                type="time"
                                id="next_session_time"
                                name="next_session_time"
                                value={formData.next_session_time}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                                    errors.next_session_time?.length
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.next_session_time && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.next_session_time[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Contenu de la leçon *
                        </label>
                        <div
                            className={`rounded-md border ${errors.content?.length ? "border-red-500" : "border-gray-300"}`}
                        >
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                className="ql-container"
                                onChange={handleContentChange}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Rédigez le contenu détaillé de votre leçon ici..."
                                style={{ minHeight: "300px" }}
                            />
                        </div>
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.content[0]}
                            </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Utilisez la barre d'outils pour formater votre
                            contenu (gras, italique, listes, etc.)
                        </p>
                    </div>

                    {/* Comments Section - Only show if there are comments */}
                    {(initialData?.principalComment ||
                        initialData?.inspectorComment) && (
                        <div className="space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <h3 className="text-sm font-medium text-blue-900">
                                💬 Commentaires
                            </h3>

                            {initialData.principalComment && (
                                <div className="rounded-md border border-blue-200 bg-white p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-700">
                                            Commentaire du Directeur
                                        </span>
                                        {initialData.principalCommentedAt && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(
                                                    initialData.principalCommentedAt
                                                ).toLocaleString("fr-FR")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {initialData.principalComment}
                                    </p>
                                </div>
                            )}

                            {initialData.inspectorComment && (
                                <div className="rounded-md border border-blue-200 bg-white p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-purple-700">
                                            Commentaire de l'Inspecteur
                                        </span>
                                        {initialData.inspectorCommentedAt && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(
                                                    initialData.inspectorCommentedAt
                                                ).toLocaleString("fr-FR")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {initialData.inspectorComment}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Auto-save and Sync Controls */}
                    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-medium text-gray-700">
                            Options de sauvegarde
                        </h3>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="autoSave"
                                checked={autoSaveEnabled}
                                onChange={e =>
                                    setAutoSaveEnabled(e.target.checked)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                                htmlFor="autoSave"
                                className="text-sm text-gray-700"
                            >
                                Sauvegarde automatique (toutes les 60 secondes)
                            </label>
                        </div>

                        {/* Enhanced sync status display */}
                        {(saveStatus === "pending" ||
                            saveStatus === "syncing") && (
                            <div className="flex items-center justify-between rounded-md bg-yellow-50 p-3">
                                <div>
                                    <p className="text-sm text-yellow-700">
                                        {saveStatus === "pending"
                                            ? `${syncStatus.pendingCount} modifications en attente de synchronisation`
                                            : "Synchronisation en cours..."}
                                    </p>
                                    {syncProgress.total > 0 && (
                                        <div className="mt-1">
                                            <div className="text-xs text-yellow-600">
                                                Progression:{" "}
                                                {syncProgress.completed}/
                                                {syncProgress.total}
                                                {syncProgress.currentItem &&
                                                    ` - ${syncProgress.currentItem}`}
                                            </div>
                                            <div className="mt-1 h-1 w-full rounded bg-yellow-200">
                                                <div
                                                    className="h-1 rounded bg-yellow-500 transition-all duration-300"
                                                    style={{
                                                        width: `${(syncProgress.completed / syncProgress.total) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleForceSync}
                                    disabled={
                                        !syncStatus.isOnline ||
                                        saveStatus === "syncing"
                                    }
                                >
                                    {saveStatus === "syncing" ? (
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wifi className="mr-2 h-4 w-4" />
                                    )}
                                    Synchroniser maintenant
                                </Button>
                            </div>
                        )}

                        {/* Storage statistics */}
                        {syncStatus.storageStats && (
                            <div className="text-xs text-gray-500">
                                Stockage local:{" "}
                                {syncStatus.storageStats.estimatedTotalSizeMB}MB
                                utilisés (
                                {syncStatus.storageStats.textbookEntries}{" "}
                                entrées, {syncStatus.storageStats.files}{" "}
                                fichiers)
                            </div>
                        )}
                    </div>

                    {/* Offline Indicator */}
                    {!syncStatus.isOnline && (
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <WifiOff className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Mode hors ligne
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        Vous êtes actuellement hors ligne. Les
                                        modifications sont sauvegardées dans
                                        IndexedDB et seront synchronisées
                                        automatiquement lorsque la connexion
                                        sera rétablie.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validation Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Erreurs de validation
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <ul className="list-disc space-y-1 pl-5">
                                            {Object.entries(errors).map(
                                                ([field, fieldErrors]) =>
                                                    fieldErrors.map(
                                                        (error, index) => (
                                                            <li
                                                                key={`${field}-${index}`}
                                                            >
                                                                {error}
                                                            </li>
                                                        )
                                                    )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="-mx-6 -mb-6 rounded-b-lg border-t bg-gray-50 px-6 py-4">
                        {/* Status indicator - hidden on mobile, shown on larger screens */}
                        <div className="mb-3 hidden md:block">
                            <StatusIndicator />
                        </div>

                        {/* Mobile layout: stack buttons */}
                        <div className="flex flex-col gap-3 md:hidden">
                            <Button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    classroomsLoading ||
                                    saveStatus === "syncing" ||
                                    !formData.title ||
                                    !formData.subject ||
                                    !formData.content ||
                                    !formData.class_id
                                }
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading || saveStatus === "syncing" ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        {mode === "create"
                                            ? "Création..."
                                            : "Mise à jour..."}
                                    </>
                                ) : (
                                    <>
                                        {mode === "create"
                                            ? "Créer l'entrée"
                                            : "Mettre à jour"}
                                        {!syncStatus.isOnline && (
                                            <WifiOff className="ml-2 h-4 w-4" />
                                        )}
                                    </>
                                )}
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={() => router.back()}
                                    variant="outline"
                                    disabled={
                                        isLoading || saveStatus === "syncing"
                                    }
                                    className="min-w-0 flex-1"
                                >
                                    <span className="truncate">
                                        Retour au cahier de texte
                                    </span>
                                </Button>

                                {mode === "edit" && (
                                    <Button
                                        type="button"
                                        onClick={handleManualSave}
                                        variant="outline"
                                        disabled={
                                            isLoading ||
                                            saveStatus === "syncing"
                                        }
                                        className="min-w-0 flex-1 bg-gray-100 hover:bg-gray-200"
                                    >
                                        {saveStatus === "syncing" ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                <span className="truncate">
                                                    Sauvegarde...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {syncStatus.isOnline ? (
                                                    <Wifi className="mr-2 h-4 w-4 flex-shrink-0" />
                                                ) : (
                                                    <WifiOff className="mr-2 h-4 w-4 flex-shrink-0" />
                                                )}
                                                <span className="truncate">
                                                    Sauvegarder
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Desktop layout: original horizontal layout */}
                        <div className="hidden md:flex md:items-center md:justify-between">
                            <div></div> {/* Empty div to maintain spacing */}
                            <div className="flex space-x-3">
                                <Button
                                    type="button"
                                    onClick={() => router.back()}
                                    variant="outline"
                                    disabled={
                                        isLoading || saveStatus === "syncing"
                                    }
                                >
                                    Retour au cahier de texte
                                </Button>

                                {mode === "edit" && (
                                    <Button
                                        type="button"
                                        onClick={handleManualSave}
                                        variant="outline"
                                        disabled={
                                            isLoading ||
                                            saveStatus === "syncing"
                                        }
                                        className="bg-gray-100 hover:bg-gray-200"
                                    >
                                        {saveStatus === "syncing" ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Sauvegarde...
                                            </>
                                        ) : (
                                            <>
                                                {syncStatus.isOnline ? (
                                                    <Wifi className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <WifiOff className="mr-2 h-4 w-4" />
                                                )}
                                                Sauvegarder
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        classroomsLoading ||
                                        saveStatus === "syncing" ||
                                        !formData.title ||
                                        !formData.subject ||
                                        !formData.content ||
                                        !formData.class_id
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLoading || saveStatus === "syncing" ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                            {mode === "create"
                                                ? "Création..."
                                                : "Mise à jour..."}
                                        </>
                                    ) : (
                                        <>
                                            {mode === "create"
                                                ? "Créer l'entrée"
                                                : "Mettre à jour"}
                                            {!syncStatus.isOnline && (
                                                <WifiOff className="ml-2 h-4 w-4" />
                                            )}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Help Text */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-900">
                    💡 Conseils d'utilisation
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Les champs marqués d'un * sont obligatoires</li>
                    <li>
                        • La sauvegarde automatique fonctionne même hors ligne
                        grâce à IndexedDB
                    </li>
                    <li>
                        • Utilisez l'éditeur riche pour formater votre contenu
                    </li>
                    <li>
                        • Les modifications sont synchronisées automatiquement
                    </li>
                    <li>
                        • Stockage local sécurisé avec support des gros volumes
                        de données
                    </li>
                    {!syncStatus.isOnline && (
                        <li className="text-yellow-700">
                            • Mode hors ligne : vos données sont stockées
                            localement dans IndexedDB et seront synchronisées
                            dès que la connexion sera rétablie
                        </li>
                    )}
                </ul>
            </div>
        </Card>
    );
}
