// app/dashboard/textbooks/create/page.tsx
"use client";

import TextbookForm from "@/components/forms/TextbookForm";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateTextbookPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center space-x-4">
                            <Link href="/dashboard/textbooks">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour au cahier de texte
                                </Button>
                            </Link>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                    <span className="block sm:hidden">
                                        Nouvelle entrée
                                    </span>
                                    <span className="hidden sm:block">
                                        Nouvelle entrée de cahier de texte
                                    </span>
                                </h1>
                                <p className="text-sm text-gray-600">
                                    <span className="block sm:hidden">
                                        Créer une nouvelle entrée
                                    </span>
                                    <span className="hidden sm:block">
                                        Créer une nouvelle entrée dans le cahier
                                        de textes
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl py-6">
                <TextbookForm mode="create" />
            </div>
        </div>
    );
}
