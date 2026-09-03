"use client";

import { Card } from "@/components/ui";
import { useInspectorSchools } from "@/lib/hooks/api-hooks";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const InspectorTextbooksPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: schoolsResponse, isLoading: schoolsLoading } =
        useInspectorSchools({
            search: searchTerm || undefined,
        });

    const handleSearch = () => {
        // Search is automatically handled by the query when searchTerm changes
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Cahier de texte
                </h1>
            </div>

            {/* Search and Schools List */}
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
                    </div>
                    <button
                        onClick={handleSearch}
                        className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600"
                    >
                        Rechercher
                    </button>
                </div>

                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="px-6 py-4 text-left font-medium">
                                    Établissement
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {schoolsLoading ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-flex items-center">
                                            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                                            <span className="text-gray-600">
                                                Chargement des écoles...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (schoolsResponse?.data || []).length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Aucune école trouvée
                                    </td>
                                </tr>
                            ) : (
                                (schoolsResponse?.data || []).map(school => (
                                    <tr
                                        key={school.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">
                                                {school.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dashboard/inspector/textbooks/${school.slug}`}
                                            >
                                                <button className="flex items-center text-gray-600 transition-colors hover:text-gray-900">
                                                    <ChevronRight className="h-5 w-5" />
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
                    {schoolsLoading ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="inline-flex items-center">
                                <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                                <span className="text-gray-600">
                                    Chargement des écoles...
                                </span>
                            </div>
                        </div>
                    ) : (schoolsResponse?.data || []).length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                            <div className="text-gray-500">
                                Aucune école trouvée
                            </div>
                        </div>
                    ) : (
                        (schoolsResponse?.data || []).map(school => (
                            <Link
                                key={school.id}
                                href={`/dashboard/inspector/textbooks/${school.slug}`}
                                className="block"
                            >
                                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">
                                            {school.name}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
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

export default InspectorTextbooksPage;
