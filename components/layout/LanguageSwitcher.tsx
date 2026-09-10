// @ts-nocheck
// src/components/language-switcher.tsx
/**
 * @author Elsa T. <elsazougouri224@gmail.com>
 */

"use client";

import { Locale, locales, useLocaleContext } from "@/context/i18n-context";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

// Définition des drapeaux par langue
const FLAGS = {
    fr: "🇫🇷", // drapeau français
    en: "🇬🇧", // drapeau britannique
    // Ajoutez d'autres drapeaux si vous avez d'autres langues
};

// Composant drapeau avec une animation légère au survol
const Flag = ({ country }: { country: string }) => {
    return (
        <span
            className="mr-1.5 inline-block text-lg transition-transform duration-200 group-hover:scale-110"
            role="img"
            aria-label={`Flag for ${country}`}
        >
            {FLAGS[country as keyof typeof FLAGS]}
        </span>
    );
};

export default function LanguageSwitcher() {
    const { locale, setLocale, isLoading } = useLocaleContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (loc: Locale) => {
        if (loc !== locale) {
            setLocale(loc);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute top-1/2 -left-6 -translate-y-1/2 transform">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-md border bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <Flag country={locale} />
                <span className="font-medium">{locale.toUpperCase()}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            {isOpen && (
                <ul
                    className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg"
                    role="listbox"
                >
                    {locales.map((loc: Locale) => (
                        <li
                            key={loc}
                            onClick={() => handleSelect(loc)}
                            className={`group flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100 ${
                                loc === locale ? "bg-gray-50 font-medium" : ""
                            }`}
                            role="option"
                            aria-selected={loc === locale}
                        >
                            <Flag country={loc} />
                            {loc.toUpperCase()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
