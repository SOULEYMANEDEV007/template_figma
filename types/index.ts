// @ts-nocheck
// Types génériques pour ViFlo - Plateforme de financement
// LEGACY: Ces types sont conservés pour compatibilité
// Utilisez les types Vitalis pour les nouvelles fonctionnalités
export type UserRole = "admin" | "banque" | "fournisseur";

export type User = {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    avatar?: string;
    matricule?: string;
    phone?: string;
    organisationName?: string;
};

export type DashboardData = {
    user: User;
    stats: {
        totalSouscriptions: number;
        dossiersValides: number;
        paiementsEncaisses: number;
        articlesServis: number;
    };
};

// ============================================================
// EXPORTS VITALIS (recommandé pour nouvelles fonctionnalités)
// ============================================================
export * from "./vitalis";
// export * from "./ldf";
