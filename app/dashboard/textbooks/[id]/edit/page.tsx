// app/dashboard/textbooks/[id]/edit/page.tsx
"use client";

import TextbookForm from "@/components/forms/TextbookForm";
import { Button } from "@/components/ui";
import { useTextbook } from "@/lib/hooks/api-hooks";
import { ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditTextbookPage() {
    const params = useParams();
    const entrySlug = params.id as string;

    const {
        data: entry,
        isLoading,
        error,
        refetch,
    } = useTextbook(entrySlug, ["class", "teacher", "syncMetadata"]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="border-b bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href="/dashboard/textbooks">
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Retour au cahier de texte
                                    </Button>
                                </Link>
                                <div className="flex items-center space-x-2">
                                    <Loader className="h-5 w-5 animate-spin text-gray-400" />
                                    <div>
                                        <h1 className="text-xl font-semibold text-gray-900">
                                            Chargement...
                                        </h1>
                                        <p className="text-sm text-gray-600">
                                            Récupération des données de l'entrée
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Content */}
                <div className="mx-auto max-w-7xl py-6">
                    <div className="mx-auto max-w-4xl p-6">
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <div className="space-y-6">
                                {/* Skeleton Loading */}
                                <div className="space-y-4">
                                    <div className="h-6 animate-pulse rounded bg-gray-200"></div>
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-10 animate-pulse rounded bg-gray-200"></div>
                                        <div className="h-10 animate-pulse rounded bg-gray-200"></div>
                                    </div>
                                    <div className="h-32 animate-pulse rounded bg-gray-200"></div>
                                    <div className="h-64 animate-pulse rounded bg-gray-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !entry) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="border-b bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href="/dashboard/textbooks">
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Retour au cahier de texte
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-semibold text-red-600">
                                        Erreur de chargement
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Impossible de charger l'entrée
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Content */}
                <div className="mx-auto max-w-7xl py-6">
                    <div className="mx-auto max-w-4xl p-6">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                            <div className="text-center">
                                <h2 className="mb-2 text-lg font-medium text-red-800">
                                    {error
                                        ? "Erreur de chargement"
                                        : "Entrée non trouvée"}
                                </h2>
                                <p className="mb-4 text-red-700">
                                    {error?.message ||
                                        "L'entrée demandée n'existe pas ou n'est plus disponible."}
                                </p>
                                <div className="flex items-center justify-center space-x-4">
                                    <Button
                                        onClick={() => refetch()}
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        Réessayer
                                    </Button>
                                    <Link href="/dashboard/textbooks">
                                        <Button variant="outline">
                                            Retour à la liste
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Check if entry is submitted and cannot be edited
    if (entry.isSubmitted) {
        toast.warning(
            "Cette entrée a été soumise et ne peut plus être modifiée"
        );
        // You could redirect or show a message
    }

    // Success state - render the form
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard/textbooks">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour au cahier de texte
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Modifier l'entrée
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {entry.title}
                                </p>
                            </div>
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center space-x-3">
                            {entry.isSubmitted && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                    Soumis
                                </span>
                            )}
                            {entry.isOfflineCreated && (
                                <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                                    Créé hors ligne
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl py-6">
                {/* Warning for submitted entries */}
                {entry.isSubmitted && (
                    <div className="mx-auto mb-6 max-w-4xl">
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-yellow-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Attention
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        Cette entrée a été soumise le{" "}
                                        {entry.submissionDate}. Les
                                        modifications peuvent être limitées
                                        selon vos permissions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <TextbookForm mode="edit" initialData={entry} />
            </div>
        </div>
    );
}
