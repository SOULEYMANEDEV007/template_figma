// routes/web.ts - Routes ViFlo Finance
export const WEB_ROUTES = {
    // Public routes
    HOME: "/",
    LOGIN: "/login",

    // Dashboard routes
    DASHBOARD: {
        INDEX: "/dashboard",
        SETTINGS: "/dashboard/parametres",
    },

    // Souscriptions routes
    SOUSCRIPTIONS: {
        INDEX: "/dashboard/souscriptions",
        SHOW: (id: string) => `/dashboard/souscriptions/${id}`,
        CREATE: "/dashboard/souscriptions/nouveau",
    },

    // Devis routes
    DEVIS: {
        INDEX: "/dashboard/devis",
        SHOW: (id: string) => `/dashboard/devis/${id}`,
        CREATE: "/dashboard/devis/nouveau",
    },

    // Dossiers routes
    DOSSIERS: {
        INDEX: "/dashboard/dossiers",
        SHOW: (id: string) => `/dashboard/dossiers/${id}`,
    },

    // Paiements routes
    PAIEMENTS: {
        INDEX: "/dashboard/paiements",
        SHOW: (id: string) => `/dashboard/paiements/${id}`,
    },

    // Articles routes
    ARTICLES: {
        INDEX: "/dashboard/articles",
    },

    // Admin routes
    ADMIN: {
        FOURNISSEURS: "/dashboard/admin/fournisseurs",
        BANQUES: "/dashboard/admin/banques",
        UTILISATEURS: "/dashboard/admin/utilisateurs",
    },

    // Banque routes
    BANQUE: {
        SOUSCRIPTEURS: "/dashboard/banque/souscripteurs",
        DOSSIERS: "/dashboard/banque/dossiers",
    },

    // Fournisseur routes
    FOURNISSEUR: {
        FEEDBACKS: "/dashboard/fournisseur/feedbacks",
    },

    // Reports routes
    REPORTS: {
        INDEX: "/dashboard/rapports",
    },

    // Notifications routes
    NOTIFICATIONS: "/dashboard/notifications",
} as const;

// Helper function to check if a route requires authentication
export const isProtectedRoute = (pathname: string): boolean => {
    const publicRoutes = [WEB_ROUTES.HOME, WEB_ROUTES.LOGIN];
    return !publicRoutes.includes(pathname as any);
};

// Helper function to get the active navigation item
export const getActiveRoute = (pathname: string): string => {
    if (pathname.startsWith("/dashboard/souscriptions")) return "souscriptions";
    if (pathname.startsWith("/dashboard/devis")) return "devis";
    if (pathname.startsWith("/dashboard/dossiers")) return "dossiers";
    if (pathname.startsWith("/dashboard/paiements")) return "paiements";
    if (pathname.startsWith("/dashboard/articles")) return "articles";
    if (pathname.startsWith("/dashboard/rapports")) return "rapports";
    if (pathname.startsWith("/dashboard/notifications")) return "notifications";
    if (pathname.startsWith("/dashboard/admin")) return "admin";
    if (pathname.startsWith("/dashboard/banque")) return "banque";
    if (pathname.startsWith("/dashboard/fournisseur")) return "fournisseur";
    if (pathname.startsWith("/dashboard/parametres")) return "parametres";
    if (pathname === "/dashboard") return "dashboard";
    return "";
};

// Helper function to build web URLs with query parameters
export const buildWebUrl = (
    route: string,
    params?: Record<string, string | number>
): string => {
    if (!params || Object.keys(params).length === 0) {
        return route;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
    });

    return `${route}?${searchParams.toString()}`;
};

// Navigation items for sidebar/header (basé sur le rôle - voir LDFSidebar.tsx)
export const NAVIGATION_ITEMS = [
    {
        label: "Dashboard",
        route: WEB_ROUTES.DASHBOARD.INDEX,
        icon: "home",
        key: "dashboard",
    },
    {
        label: "Souscriptions",
        route: WEB_ROUTES.SOUSCRIPTIONS.INDEX,
        icon: "file-text",
        key: "souscriptions",
    },
    {
        label: "Devis",
        route: WEB_ROUTES.DEVIS.INDEX,
        icon: "book-open",
        key: "devis",
    },
    {
        label: "Dossiers",
        route: WEB_ROUTES.DOSSIERS.INDEX,
        icon: "shield-check",
        key: "dossiers",
    },
    {
        label: "Paiements",
        route: WEB_ROUTES.PAIEMENTS.INDEX,
        icon: "credit-card",
        key: "paiements",
    },
] as const;

// Breadcrumb helpers
export const getBreadcrumbs = (
    pathname: string
): Array<{ label: string; href?: string }> => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; href?: string }> = [];

    if (segments.length === 0) {
        return [{ label: "Accueil" }];
    }

    // Always start with Dashboard for protected routes
    if (segments[0] === "dashboard") {
        breadcrumbs.push({
            label: "Dashboard",
            href: WEB_ROUTES.DASHBOARD.INDEX,
        });

        if (segments.length > 1) {
            switch (segments[1]) {
                case "souscriptions":
                    breadcrumbs.push({
                        label: "Souscriptions",
                        href: segments.length === 2 ? undefined : WEB_ROUTES.SOUSCRIPTIONS.INDEX,
                    });
                    if (segments.length > 2 && segments[2] !== "nouveau") {
                        breadcrumbs.push({ label: "Détail souscription" });
                    } else if (segments[2] === "nouveau") {
                        breadcrumbs.push({ label: "Nouvelle souscription" });
                    }
                    break;
                case "devis":
                    breadcrumbs.push({
                        label: "Devis",
                        href: segments.length === 2 ? undefined : WEB_ROUTES.DEVIS.INDEX,
                    });
                    if (segments.length > 2 && segments[2] !== "nouveau") {
                        breadcrumbs.push({ label: "Détail devis" });
                    } else if (segments[2] === "nouveau") {
                        breadcrumbs.push({ label: "Nouveau devis" });
                    }
                    break;
                case "dossiers":
                    breadcrumbs.push({
                        label: "Dossiers",
                        href: segments.length === 2 ? undefined : WEB_ROUTES.DOSSIERS.INDEX,
                    });
                    if (segments.length > 2) {
                        breadcrumbs.push({ label: "Détail dossier" });
                    }
                    break;
                case "paiements":
                    breadcrumbs.push({
                        label: "Paiements",
                        href: segments.length === 2 ? undefined : WEB_ROUTES.PAIEMENTS.INDEX,
                    });
                    if (segments.length > 2) {
                        breadcrumbs.push({ label: "Détail paiement" });
                    }
                    break;
                case "parametres":
                    breadcrumbs.push({ label: "Paramètres" });
                    break;
                case "admin":
                    breadcrumbs.push({ label: "Administration" });
                    if (segments.length > 2) {
                        const adminSection = segments[2].charAt(0).toUpperCase() + segments[2].slice(1);
                        breadcrumbs.push({ label: adminSection });
                    }
                    break;
                default:
                    breadcrumbs.push({
                        label: segments[1].charAt(0).toUpperCase() + segments[1].slice(1),
                    });
            }
        }
    }

    return breadcrumbs;
};

// Export types for better type safety
export type WebRoutes = typeof WEB_ROUTES;
export type NavigationItem = (typeof NAVIGATION_ITEMS)[number];
