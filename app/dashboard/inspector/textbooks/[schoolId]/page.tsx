"use client";

import { Card } from "@/components/ui";
import { useInspectorSchoolTextbooks, useSchool } from "@/lib/hooks/api-hooks";
import { ArrowLeft, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface InspectorSchoolTextbooksPageProps {
    params: any;
}

const InspectorSchoolTextbooksPage = ({
    params,
}: InspectorSchoolTextbooksPageProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { data: school, isLoading: schoolLoading } = useSchool(
        params.schoolId
    );
    const { data: textbooksResponse, isLoading: textbooksLoading } =
        useInspectorSchoolTextbooks(params.schoolId, {
            search: searchTerm || undefined,
            status: statusFilter || undefined,
        });

    const schoolName = school?.name || "École";
    const textbookEntries = textbooksResponse?.data || [];

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
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/inspector/textbooks">
                    <button className="flex items-center text-gray-600 transition-colors hover:text-gray-900">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Retour
                    </button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    Cahier de textes - {schoolName}
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
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="viewed">Vu</option>
                            <option value="validated">Validé</option>
                            <option value="rejected">Rejeté</option>
                        </select>
                    </div>
                    <button className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600">
                        Rechercher
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
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
                            {textbooksLoading ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-flex items-center">
                                            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                                            <span className="text-gray-600">
                                                Chargement des cahiers de
                                                texte...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : textbookEntries.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Aucun cahier de texte trouvé
                                    </td>
                                </tr>
                            ) : (
                                textbookEntries.map(entry => (
                                    <tr
                                        key={entry.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={
                                                        entry.teacher?.avatar ||
                                                        "https://api.dicebear.com/7.x/avataaars/svg?seed=Default"
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
                                                        "Unknown Teacher"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-gray-900">
                                                    {entry.title ||
                                                        entry.subject}
                                                </span>
                                                {getStatusBadge(
                                                    entry.inspectorStatus
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dashboard/inspector/textbooks/${params.schoolId}/${entry.slug}`}
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

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-center space-x-2">
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
            </Card>
        </div>
    );
};

export default InspectorSchoolTextbooksPage;
