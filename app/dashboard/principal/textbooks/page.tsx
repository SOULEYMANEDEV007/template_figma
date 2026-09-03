"use client";

import { Card } from "@/components/ui";
import { usePrincipalReviews } from "@/lib/hooks/api-hooks";
import { Eye, Filter, Loader, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PrincipalTextbooksPage = () => {
    const [filters, setFilters] = useState({
        subject: "",
        class_id: undefined as number | undefined,
        per_page: 15,
        page: 1,
    });

    const {
        data: reviewsData,
        isLoading,
        error,
    } = usePrincipalReviews(filters);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
                        En attente
                    </span>
                );
            case "viewed":
                return (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
                        Vu
                    </span>
                );
            case "validated":
                return (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
                        Validé
                    </span>
                );
            case "rejected":
                return (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-sm text-red-800">
                        Rejeté
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                        -
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Cahier de textes
                </h1>
            </div>

            {/* Search and Filter */}
            <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-4">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cliquez pour rechercher"
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtres
                        </button>
                    </div>
                    <button className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600">
                        Rechercher
                    </button>
                </div>

                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="px-6 py-4 text-left font-medium">
                                    Nom du professeur
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Documents
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex items-center justify-center">
                                            <Loader className="mr-3 h-6 w-6 animate-spin text-gray-400" />
                                            <span className="text-gray-500">
                                                Chargement...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-12 text-center text-red-600"
                                    >
                                        Erreur lors du chargement des données
                                    </td>
                                </tr>
                            ) : reviewsData?.data?.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Aucun cahier de texte en attente de
                                        révision
                                    </td>
                                </tr>
                            ) : (
                                reviewsData?.data?.data?.map(entry => (
                                    <tr
                                        key={entry.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={
                                                        entry.teacher?.avatar ||
                                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.teacher?.fullName || "Default"}`
                                                    }
                                                    alt={
                                                        entry.teacher
                                                            ?.fullName ||
                                                        "Teacher"
                                                    }
                                                    className="h-10 w-10 rounded-full"
                                                />
                                                <span className="font-medium text-gray-900">
                                                    {entry.teacher?.fullName ||
                                                        "Enseignant inconnu"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {entry.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {entry.subject} •{" "}
                                                        {entry.class?.name}
                                                    </div>
                                                </div>
                                                {getStatusBadge(
                                                    entry.principalStatus
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dashboard/principal/textbooks/${entry.slug}`}
                                            >
                                                <button className="flex items-center rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-200">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Voir
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View - Visible only on mobile */}
                <div className="space-y-4 md:hidden">
                    {isLoading ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="flex items-center justify-center">
                                <Loader className="mr-3 h-6 w-6 animate-spin text-gray-400" />
                                <span className="text-gray-500">
                                    Chargement...
                                </span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="text-red-600">
                                Erreur lors du chargement des données
                            </div>
                        </div>
                    ) : reviewsData?.data?.data?.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="text-gray-500">
                                Aucun cahier de texte en attente de révision
                            </div>
                        </div>
                    ) : (
                        reviewsData?.data?.data?.map(entry => (
                            <div
                                key={entry.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:shadow-md"
                            >
                                {/* Teacher Info */}
                                <div className="mb-3 flex items-center space-x-3">
                                    <img
                                        src={
                                            entry.teacher?.avatar ||
                                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.teacher?.fullName || "Default"}`
                                        }
                                        alt={
                                            entry.teacher?.fullName || "Teacher"
                                        }
                                        className="h-10 w-10 rounded-full"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {entry.teacher?.fullName ||
                                                "Enseignant inconnu"}
                                        </div>
                                    </div>
                                </div>

                                {/* Document Info */}
                                <div className="mb-3">
                                    <div className="mb-1 font-medium text-gray-900">
                                        {entry.title}
                                    </div>
                                    <div className="mb-2 text-sm text-gray-500">
                                        {entry.subject} • {entry.class?.name}
                                    </div>
                                    {getStatusBadge(entry.principalStatus)}
                                </div>

                                {/* Action Button */}
                                <div className="flex justify-end border-t border-gray-100 pt-3">
                                    <Link
                                        href={`/dashboard/principal/textbooks/${entry.slug}`}
                                    >
                                        <button className="flex items-center rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-200">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Voir
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {reviewsData?.data.meta && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Affichage de {reviewsData.data.meta.from || 0} à{" "}
                            {reviewsData.data.meta.to || 0} sur{" "}
                            {reviewsData.data.meta.total} résultats
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    setFilters(prev => ({
                                        ...prev,
                                        page: Math.max(1, prev.page - 1),
                                    }))
                                }
                                disabled={
                                    reviewsData.data.meta.current_page <= 1
                                }
                                className="px-3 py-2 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            {Array.from(
                                { length: reviewsData.data.meta.last_page },
                                (_, i) => i + 1
                            ).map(page => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        setFilters(prev => ({ ...prev, page }))
                                    }
                                    className={`rounded-lg px-3 py-2 font-medium transition-colors ${
                                        page ===
                                        reviewsData.data.meta.current_page
                                            ? "bg-green-500 text-white"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setFilters(prev => ({
                                        ...prev,
                                        page: Math.min(
                                            reviewsData.data.meta.last_page,
                                            prev.page + 1
                                        ),
                                    }))
                                }
                                disabled={
                                    reviewsData.data.meta.current_page >=
                                    reviewsData.data.meta.last_page
                                }
                                className="px-3 py-2 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PrincipalTextbooksPage;
