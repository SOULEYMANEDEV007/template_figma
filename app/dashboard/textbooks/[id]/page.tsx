// app/dashboard/textbooks/[id]/page.tsx - Updated with proper toast integration
"use client";

import { Button, Card, CardContent } from "@/components/ui";
import { useSubmitTextbook, useTextbook } from "@/lib/hooks/api-hooks";
import DOMPurify from "dompurify";
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Wifi,
    WifiOff,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
// import "../../../../styles/quill-educational.css";

export default function TextbookDetailPage() {
    const params = useParams();
    const entrySlug = params.id as string;

    const {
        data: entry,
        isLoading,
        error,
        refetch,
    } = useTextbook(entrySlug, ["class", "teacher", "syncMetadata"]);

    const submitTextbookMutation = useSubmitTextbook({
        onSuccess: () => {
            toast.success("Cahier de texte soumis avec succès");
            refetch(); // Refresh the data
        },
        onError: error => {
            toast.error(error.message || "Erreur lors de la soumission");
        },
    });

    const handleSubmit = async () => {
        if (entry && !entry.isSubmitted) {
            if (
                confirm(
                    "Êtes-vous sûr de vouloir soumettre ce cahier de texte ? Cette action est irréversible."
                )
            ) {
                try {
                    await submitTextbookMutation.mutateAsync(entry.slug);
                } catch (error) {
                    // Error is handled by the mutation's onError
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                            <div className="h-32 animate-pulse rounded bg-gray-200"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !entry) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
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
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        {error
                            ? "Erreur de chargement"
                            : "Cahier de texte non trouvé"}
                    </h2>
                    <p className="mb-4 text-gray-600">
                        {error?.message ||
                            "L'entrée demandée n'existe pas ou n'est plus disponible."}
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <Link href="/dashboard/textbooks">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au cahier de texte
                            </Button>
                        </Link>
                        <Button onClick={() => refetch()}>Réessayer</Button>
                    </div>
                </div>
            </div>
        );
    }

    const isSubmitted = entry.isSubmitted;
    const isOffline = entry.isOfflineCreated;
    const syncStatus = entry.syncMetadata?.syncStatus;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/textbooks">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {entry.title}
                        </h1>
                        <div className="mt-2 flex items-center space-x-4">
                            {/* Submission Status */}
                            <div className="flex items-center">
                                {isSubmitted ? (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        <span className="text-sm">Soumis</span>
                                        {entry.submissionDate && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                le {entry.submissionDate}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-yellow-600">
                                        <XCircle className="mr-1 h-4 w-4" />
                                        <span className="text-sm">
                                            Brouillon
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Sync Status */}
                            {isOffline && (
                                <div className="flex items-center">
                                    {syncStatus === "synced" ? (
                                        <div className="flex items-center text-green-600">
                                            <Wifi className="mr-1 h-4 w-4" />
                                            <span className="text-sm">
                                                Synchronisé
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-orange-600">
                                            <WifiOff className="mr-1 h-4 w-4" />
                                            <span className="text-sm">
                                                Non synchronisé
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {!isSubmitted && (
                        <>
                            <Link
                                href={`/dashboard/textbooks/${entry.slug}/edit`}
                            >
                                <Button className="bg-purple-500 hover:bg-purple-600">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </Button>
                            </Link>
                            <Button
                                className="bg-green-500 hover:bg-green-600"
                                onClick={handleSubmit}
                                disabled={submitTextbookMutation.isPending}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {submitTextbookMutation.isPending
                                    ? "Soumission..."
                                    : "Soumettre"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Submission Warning */}
            {isSubmitted && (
                <div className="rounded-md border border-green-200 bg-green-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                Entrée soumise
                            </h3>
                            <p className="mt-1 text-sm text-green-700">
                                Cette entrée a été soumise le{" "}
                                {entry.submissionDate} et ne peut plus être
                                modifiée.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Entry Details */}
            <Card>
                <CardContent className="p-6">
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* School Info */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nom de l'école
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={
                                        entry.school ||
                                        entry.class?.school?.name ||
                                        "Non défini"
                                    }
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Principal Teacher */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Professeur Principal
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={
                                        entry.principalTeacher ||
                                        entry.teacher?.fullName ||
                                        "Non défini"
                                    }
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Classroom */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Salle de classe
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={
                                        entry.classroom ||
                                        entry.class?.name ||
                                        "Non défini"
                                    }
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Subject */}
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Matière
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={entry.subject}
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Session Time */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Heure
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={entry.sessionTime || "Non défini"}
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Session Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date de session
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={entry.sessionDate}
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Submission Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date de soumission
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={entry.submissionDate || "Non soumis"}
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Principal Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Statut Directeur
                            </label>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                        entry.principalStatus === "validated"
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
                                    {entry.principalStatus === "validated" &&
                                        "✅ Validé"}
                                    {entry.principalStatus === "rejected" &&
                                        "❌ Rejeté"}
                                    {entry.principalStatus === "viewed" &&
                                        "👁️ Vu"}
                                    {entry.principalStatus === "pending" &&
                                        "⏳ En attente"}
                                </span>
                            </div>
                        </div>

                        {/* Inspector Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Statut Inspecteur
                            </label>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                        entry.inspectorStatus === "validated"
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
                                    {entry.inspectorStatus === "validated" &&
                                        "✅ Validé"}
                                    {entry.inspectorStatus === "rejected" &&
                                        "❌ Rejeté"}
                                    {entry.inspectorStatus === "viewed" &&
                                        "👁️ Vu"}
                                    {entry.inspectorStatus === "pending" &&
                                        "⏳ En attente"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Next Session */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Prochaine session
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={entry.nextSession || "Non défini"}
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Next Session Time */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Heure
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={
                                        entry.nextSessionTime || "Non défini"
                                    }
                                    disabled
                                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                                />
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {entry.description && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
                                <p className="text-gray-700">
                                    {entry.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Contenu du cours
                        </label>
                        <div className="min-h-96 rounded-md border border-gray-300 bg-gray-50 p-4">
                            <div
                                className="ql-editor"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(entry.content),
                                }}
                            />
                        </div>
                    </div>

                    {/* Comments Section - Only show if there are comments */}
                    {(entry.principalComment || entry.inspectorComment) && (
                        <div className="mt-6 space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <h3 className="text-sm font-medium text-blue-900">
                                💬 Commentaires
                            </h3>

                            {entry.principalComment && (
                                <div className="rounded-md border border-blue-200 bg-white p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-700">
                                            Commentaire du Directeur
                                        </span>
                                        {entry.principalCommentedAt && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(
                                                    entry.principalCommentedAt
                                                ).toLocaleString("fr-FR")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {entry.principalComment}
                                    </p>
                                </div>
                            )}

                            {entry.inspectorComment && (
                                <div className="rounded-md border border-blue-200 bg-white p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-purple-700">
                                            Commentaire de l'Inspecteur
                                        </span>
                                        {entry.inspectorCommentedAt && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(
                                                    entry.inspectorCommentedAt
                                                ).toLocaleString("fr-FR")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {entry.inspectorComment}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sync Information */}
                    {entry.syncMetadata && (
                        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <h4 className="mb-2 text-sm font-medium text-blue-900">
                                Informations de synchronisation
                            </h4>
                            <div className="space-y-1 text-sm text-blue-700">
                                <p>
                                    <span className="font-medium">Statut:</span>{" "}
                                    {entry.syncMetadata.syncStatus}
                                </p>
                                {entry.syncMetadata.lastSyncAt && (
                                    <p>
                                        <span className="font-medium">
                                            Dernière sync:
                                        </span>{" "}
                                        {new Date(
                                            entry.syncMetadata.lastSyncAt
                                        ).toLocaleString("fr-FR")}
                                    </p>
                                )}
                                {entry.syncMetadata.hasConflict && (
                                    <p className="font-medium text-red-600">
                                        ⚠️ Conflit détecté - Intervention
                                        requise
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between rounded-lg border bg-white p-4">
                <Link href="/dashboard/textbooks">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la liste
                    </Button>
                </Link>
                <div className="flex items-center space-x-4">
                    {!isSubmitted && (
                        <>
                            <Link
                                href={`/dashboard/textbooks/${entry.slug}/edit`}
                            >
                                <Button className="bg-purple-500 hover:bg-purple-600">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </Button>
                            </Link>
                            <Button
                                className="bg-green-500 hover:bg-green-600"
                                onClick={handleSubmit}
                                disabled={submitTextbookMutation.isPending}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {submitTextbookMutation.isPending
                                    ? "Soumission..."
                                    : "Soumettre"}
                            </Button>
                        </>
                    )}
                    {isSubmitted && (
                        <div className="text-sm text-gray-500">
                            Cette entrée a été soumise et ne peut plus être
                            modifiée.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
