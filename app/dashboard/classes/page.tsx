"use client";

import { Button, Input } from "@/components/ui";
import { mockClasses } from "@/lib/mockData";
import { Eye, MoreVertical, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ClassesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter classes based on search term
    const filteredClasses = mockClasses.filter(
        classItem =>
            classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClasses = filteredClasses.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Mes classes
                </h1>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Rechercher une classe"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button className="bg-green-500 hover:bg-green-600">
                    Rechercher
                </Button>
            </div>

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
                {/* Table Header */}
                <div className="bg-green-500 text-white">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm font-medium">
                        <div>Nom de la classe</div>
                        <div>Effectifs total</div>
                        <div>Action</div>
                        <div></div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                    {currentClasses.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            Aucune classe trouvée
                        </div>
                    ) : (
                        currentClasses.map(classItem => (
                            <div
                                key={classItem.id}
                                className="grid grid-cols-4 items-center gap-4 px-6 py-4 hover:bg-gray-50"
                            >
                                <div className="font-medium text-gray-900">
                                    {classItem.name}
                                </div>
                                <div className="text-gray-600">
                                    {classItem.totalStudents} élèves
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href={`/dashboard/classes/${classItem.id}`}
                                    >
                                        <Button
                                            size="sm"
                                            className="bg-orange-500 text-white hover:bg-orange-600"
                                        >
                                            <Eye className="mr-1 h-4 w-4" />
                                            Voir
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile Card View - Visible only on mobile and small tablets */}
            <div className="space-y-4 md:hidden">
                {currentClasses.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                        <div className="text-gray-500">
                            Aucune classe trouvée
                        </div>
                    </div>
                ) : (
                    currentClasses.map(classItem => (
                        <div
                            key={classItem.id}
                            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:shadow-md"
                        >
                            {/* Card Header */}
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {classItem.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {classItem.totalStudents} élèves
                                    </p>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="flex justify-end space-x-2 border-t border-gray-100 pt-3">
                                <Link
                                    href={`/dashboard/classes/${classItem.id}`}
                                >
                                    <Button
                                        size="sm"
                                        className="bg-orange-500 text-white hover:bg-orange-600"
                                    >
                                        <Eye className="mr-1 h-4 w-4" />
                                        Voir
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage(prev => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                    >
                        ‹
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        page => (
                            <Button
                                key={page}
                                variant={
                                    currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={
                                    currentPage === page
                                        ? "bg-green-500 hover:bg-green-600"
                                        : ""
                                }
                            >
                                {page}
                            </Button>
                        )
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage(prev =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        ›
                    </Button>
                </div>
            )}
        </div>
    );
}
