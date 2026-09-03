"use client";

import { Button, Card } from "@/components/ui";
import {
    useInspectorTextbookDetail,
    useInspectorUpdateTextbookStatus,
} from "@/lib/hooks/api-hooks";
import DOMPurify from "dompurify";
import { ArrowLeft, Eye, Loader } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface InspectorTextbookDetailPageProps {
    params: any;
}

const InspectorTextbookDetailPage = ({
    params,
}: InspectorTextbookDetailPageProps) => {
    const [comment, setComment] = useState("");
    const [status, setStatus] = useState<
        "pending" | "viewed" | "validated" | "rejected"
    >("viewed");

    const { data: textbookEntry, isLoading } = useInspectorTextbookDetail(
        params.schoolId,
        params.id
    );

    const updateStatusMutation = useInspectorUpdateTextbookStatus({
        onSuccess: () => {
            toast.success("Commentaire ajouté avec succès");
            setComment("");
        },
        onError: error => {
            toast.error(
                error.message || "Erreur lors de l'ajout du commentaire"
            );
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader className="mx-auto h-8 w-8 animate-spin text-green-500" />
                    <p className="mt-2 text-gray-600">
                        Chargement du cahier de texte...
                    </p>
                </div>
            </div>
        );
    }

    if (!textbookEntry) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Cahier de texte non trouvé
                    </h2>
                    <p className="mt-2 text-gray-600">
                        L'entrée demandée n'existe pas ou n'est plus disponible.
                    </p>
                    <Link
                        href={`/dashboard/inspector/textbooks/${params.schoolId}`}
                    >
                        <Button className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmitComment = async () => {
        updateStatusMutation.mutate({
            schoolSlug: params.schoolId,
            textbookSlug: params.id,
            data: {
                status,
                comment: comment.trim() || undefined,
            },
        });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link
                    href={`/dashboard/inspector/textbooks/${params.schoolId}`}
                >
                    <button className="flex items-center text-gray-600 transition-colors hover:text-gray-900">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Retour
                    </button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    Cahier de textes /{" "}
                    {textbookEntry.teacher?.fullName || "Enseignant"} -{" "}
                    {textbookEntry.class?.name || "Classe"}
                </h1>
            </div>

            {/* Search Bar */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-4">
                        <div className="relative max-w-md flex-1">
                            <input
                                type="text"
                                placeholder="Cliquez pour rechercher"
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-4 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50">
                            Filtres
                        </button>
                    </div>
                    <button className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600">
                        Rechercher
                    </button>
                </div>
            </Card>

            {/* Textbook Entry Details */}
            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="px-6 py-4 text-left font-medium">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Classe
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="px-6 py-4">
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-900">
                                            {textbookEntry.title}
                                        </h3>
                                        {textbookEntry.description && (
                                            <p className="text-sm text-gray-600">
                                                {textbookEntry.description}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                                        {textbookEntry.class?.name ||
                                            "Non défini"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        className="flex items-center rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-200"
                                        onClick={() => {
                                            // Toggle detailed view
                                            const detailsSection =
                                                document.getElementById(
                                                    "textbook-details"
                                                );
                                            if (detailsSection) {
                                                detailsSection.classList.toggle(
                                                    "hidden"
                                                );
                                            }
                                        }}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Voir
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detailed View Modal/Section */}
            <div id="textbook-details" className="hidden">
                <Card className="p-6">
                    <div className="space-y-6">
                        {/* Header Details */}
                        <div className="rounded-lg bg-green-50 p-4">
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <div>
                                    <span className="font-medium text-green-700">
                                        Professeur principal:
                                    </span>
                                    <span className="ml-2 text-green-900">
                                        {textbookEntry.teacher?.fullName ||
                                            "Non défini"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-700">
                                        Salle de classe:
                                    </span>
                                    <span className="ml-2 text-green-900">
                                        {textbookEntry.class?.name ||
                                            "Non défini"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-700">
                                        Sujet:
                                    </span>
                                    <span className="ml-2 text-green-900">
                                        {textbookEntry.subject}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-700">
                                        Date de soumission:
                                    </span>
                                    <span className="ml-2 text-green-900">
                                        {textbookEntry.submissionDate ||
                                            "Non défini"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-700">
                                        Heure:
                                    </span>
                                    <span className="ml-2 text-green-900">
                                        {textbookEntry.sessionTime ||
                                            "Non défini"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-700">
                                        Prochaine session:
                                    </span>
                                    <span className="ml-2 text-green-900">
                                        {textbookEntry.nextSession ||
                                            "Non défini"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Course Content */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-green-700">
                                Contenu du cours
                            </h3>

                            <div className="min-h-64 rounded-md border border-gray-300 bg-gray-50 p-4">
                                <div
                                    className="ql-editor"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            textbookEntry.content
                                        ),
                                    }}
                                />
                            </div>
                        </div>

                        {/* Existing Comments */}
                        {(textbookEntry.principalComment ||
                            textbookEntry.inspectorComment) && (
                            <div className="space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                                <h3 className="text-lg font-semibold text-blue-900">
                                    💬 Commentaires existants
                                </h3>

                                {textbookEntry.principalComment && (
                                    <div className="rounded-md border border-blue-200 bg-white p-3">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-medium text-blue-700">
                                                Commentaire du Directeur
                                            </span>
                                            {textbookEntry.principalCommentedAt && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(
                                                        textbookEntry.principalCommentedAt
                                                    ).toLocaleString("fr-FR")}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {textbookEntry.principalComment}
                                        </p>
                                    </div>
                                )}

                                {textbookEntry.inspectorComment && (
                                    <div className="rounded-md border border-blue-200 bg-white p-3">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-medium text-purple-700">
                                                Commentaire de l'Inspecteur
                                            </span>
                                            {textbookEntry.inspectorCommentedAt && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(
                                                        textbookEntry.inspectorCommentedAt
                                                    ).toLocaleString("fr-FR")}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {textbookEntry.inspectorComment}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Comment Section */}
                        <div className="border-t pt-6">
                            <h3 className="mb-4 text-lg font-semibold text-green-700">
                                Ajouter un commentaire
                            </h3>

                            <div className="space-y-4">
                                {/* Status Selector */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Statut de révision
                                    </label>
                                    <select
                                        value={status}
                                        onChange={e =>
                                            setStatus(e.target.value as any)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="viewed">👁️ Vu</option>
                                        <option value="validated">
                                            ✅ Validé
                                        </option>
                                        <option value="rejected">
                                            ❌ Rejeté
                                        </option>
                                        <option value="pending">
                                            ⏳ En attente
                                        </option>
                                    </select>
                                </div>

                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Cliquez ici pour commenter (optionnel)"
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    {comment.length}/1000 caractères
                                </p>

                                <div className="flex items-center justify-end space-x-3">
                                    <button
                                        onClick={() => setComment("")}
                                        className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
                                        disabled={
                                            updateStatusMutation.isPending
                                        }
                                    >
                                        Annuler
                                    </button>
                                    <Button
                                        onClick={handleSubmitComment}
                                        disabled={
                                            updateStatusMutation.isPending
                                        }
                                        className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {updateStatusMutation.isPending
                                            ? "Envoi..."
                                            : "Envoyer"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2">
                <button className="px-3 py-2 text-gray-400 transition-colors hover:text-gray-600">
                    &lt;
                </button>
                <button className="rounded-lg bg-green-500 px-3 py-2 font-medium text-white">
                    1
                </button>
                <button className="px-3 py-2 text-gray-600 transition-colors hover:text-gray-900">
                    2
                </button>
                <button className="px-3 py-2 text-gray-600 transition-colors hover:text-gray-900">
                    3
                </button>
                <button className="px-3 py-2 text-gray-600 transition-colors hover:text-gray-900">
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default InspectorTextbookDetailPage;
