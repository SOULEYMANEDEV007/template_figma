// src/i18n/request.ts
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

// Définissez vos locales supportées
const locales = ["fr", "en"];
const defaultLocale = "fr";

async function getLocaleFromHeaders() {
    // Récupérer les en-têtes Accept-Language
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";

    // Utiliser Negotiator pour déterminer la meilleure correspondance
    const languages = new Negotiator({
        headers: { "accept-language": acceptLanguage },
    }).languages();

    try {
        return match(languages, locales, defaultLocale);
    } catch (error) {
        return defaultLocale;
    }
}

async function getLocaleFromCookie() {
    // Récupérer la locale depuis un cookie si défini
    const cookieStore = await cookies();
    return cookieStore.get("NEXT_LOCALE")?.value;
}

export default getRequestConfig(async () => {
    // Priorité: Cookie > En-tête Accept-Language > Défaut
    const locale: any =
        getLocaleFromCookie() || getLocaleFromHeaders() || defaultLocale;

    // Vérifier si la locale est supportée
    const finalLocale = locales.includes(locale) ? locale : defaultLocale;

    // Récupérer le fuseau horaire correspondant à la locale
    //TODO: review this await getTimeZone(finalLocale)

    return {
        locale: finalLocale,
        messages: (await import(`../messages/${finalLocale}.json`)).default,
    };
});
