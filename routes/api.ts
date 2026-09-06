// routes/api.ts - Routes API ViFlo Finance
export const API_ROUTES = {
    // Auth
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
        CHANGE_PASSWORD: "/auth/change-password",
    },

    // Souscriptions
    SOUSCRIPTIONS: {
        INDEX: "/souscriptions",
        STORE: "/souscriptions",
        SHOW: (slug: string) => `/souscriptions/${slug}`,
        UPDATE: (slug: string) => `/souscriptions/${slug}`,
        DELETE: (slug: string) => `/souscriptions/${slug}`,
        EXPORT: "/souscriptions/export",
        STATS: "/souscriptions/stats",
    },

    // Devis
    DEVIS: {
        INDEX: "/devis",
        STORE: "/devis",
        SHOW: (slug: string) => `/devis/${slug}`,
        UPDATE: (slug: string) => `/devis/${slug}`,
        DELETE: (slug: string) => `/devis/${slug}`,
        EXPORT: "/devis/export",
        SEND: (slug: string) => `/devis/${slug}/send`,
    },

    // Dossiers
    DOSSIERS: {
        INDEX: "/dossiers",
        SHOW: (slug: string) => `/dossiers/${slug}`,
        VALIDATE: (slug: string) => `/dossiers/${slug}/validate`,
        REJECT: (slug: string) => `/dossiers/${slug}/reject`,
        EXPORT: "/dossiers/export",
    },

    // Paiements
    PAIEMENTS: {
        INDEX: "/paiements",
        SHOW: (slug: string) => `/paiements/${slug}`,
        UPDATE: (slug: string) => `/paiements/${slug}`,
        STATS: "/paiements/stats",
        EXPORT: "/paiements/export",
    },

    // Articles
    ARTICLES: {
        INDEX: "/articles",
        SHOW: (slug: string) => `/articles/${slug}`,
        MARK_SERVED: (slug: string) => `/articles/${slug}/served`,
    },

    // Fournisseurs
    FOURNISSEURS: {
        INDEX: "/fournisseurs",
        STORE: "/fournisseurs",
        SHOW: (slug: string) => `/fournisseurs/${slug}`,
        UPDATE: (slug: string) => `/fournisseurs/${slug}`,
        DELETE: (slug: string) => `/fournisseurs/${slug}`,
    },

    // Banques
    BANQUES: {
        INDEX: "/banques",
        STORE: "/banques",
        SHOW: (slug: string) => `/banques/${slug}`,
        UPDATE: (slug: string) => `/banques/${slug}`,
        DELETE: (slug: string) => `/banques/${slug}`,
    },

    // Utilisateurs
    USERS: {
        INDEX: "/users",
        STORE: "/users",
        SHOW: (slug: string) => `/users/${slug}`,
        UPDATE: (slug: string) => `/users/${slug}`,
        DELETE: (slug: string) => `/users/${slug}`,
    },

    // Notifications
    NOTIFICATIONS: {
        INDEX: "/notifications",
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: "/notifications/mark-all-read",
        DELETE: (id: string) => `/notifications/${id}`,
    },

    // Reports
    REPORTS: {
        DASHBOARD: "/reports/dashboard",
        SOUSCRIPTIONS: "/reports/souscriptions",
        PAIEMENTS: "/reports/paiements",
        EXPORT: {
            SOUSCRIPTIONS: "/reports/souscriptions/export",
            PAIEMENTS: "/reports/paiements/export",
            DOSSIERS: "/reports/dossiers/export",
        },
    },

    // Sync (pour PWA/offline)
    SYNC: {
        SOUSCRIPTIONS: "/sync/souscriptions",
        DEVIS: "/sync/devis",
        CHANGES: "/sync/changes",
        RESOLVE_CONFLICTS: "/sync/resolve-conflicts",
    },
} as const;

// Helper function to build API URLs with base URL
export const buildApiUrl = (
    route: string,
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL || ""
): string => {
    return `${baseUrl}${route}`;
};

// Helper function to build API URLs with query parameters
export const buildApiUrlWithParams = (
    route: string,
    params?: Record<string, string | number | boolean | undefined>,
    baseUrl?: string
): string => {
    const url = buildApiUrl(route, baseUrl);

    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.append(key, value.toString());
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
};

// Export types for better type safety
export type ApiRoutes = typeof API_ROUTES;
