/**
 * @author Elsa T. <elsazougouri224@gmail.com>
 */

"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

// Types pour notre context
type LocaleContextType = {
    locale: string;
    setLocale: (locale: string) => Promise<void>;
    isLoading: boolean;
};

// Définir les locales supportées
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

// Créer le context
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le context
export function useLocaleContext() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error(
            "useLocaleContext must be used within a LocaleProvider"
        );
    }
    return context;
}

// Props pour le provider
interface LocaleProviderProps {
    initialLocale: string;
    initialMessages: Record<string, unknown>;
    children: ReactNode;
}

// Provider component
export function LocaleProvider({
    initialLocale,
    initialMessages,
    children,
}: LocaleProviderProps) {
    const [locale, setLocaleState] = useState<string>(initialLocale);
    const [messages, setMessages] =
        useState<Record<string, unknown>>(initialMessages);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const timeZone = "Africa/Abidjan";

    // Fonction pour changer la locale
    const setLocale = async (newLocale: string) => {
        if (newLocale === locale) return;

        setIsLoading(true);
        try {
            // Charger dynamiquement les messages pour la nouvelle locale
            const newMessages = await import(`../messages/${newLocale}.json`);

            // Mettre à jour l'état
            setMessages(newMessages);
            setLocaleState(newLocale);

            // Stocker la préférence dans un cookie
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

            // Mettre à jour l'attribut lang de la balise HTML
            document.documentElement.lang = newLocale;
        } catch (error) {
            console.error(
                "Failed to load messages for locale:",
                newLocale,
                error
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
            <NextIntlClientProvider
                locale={locale}
                messages={messages}
                timeZone={timeZone}
            >
                {children}
            </NextIntlClientProvider>
        </LocaleContext.Provider>
    );
}
