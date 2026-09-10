// @ts-nocheck

// types/api.ts - Types API ViFlo Finance

// ═══════════════════════════════════════════════════════════
// USER & AUTH TYPES
// ═══════════════════════════════════════════════════════════

export interface User {
    id: number;
    slug: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: "admin" | "banque" | "fournisseur";
    roleId: number;
    roleLabel: string;
    matricule: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    organisationName?: string;
    organisationId?: number;
    permissions?: string[];
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

// ═══════════════════════════════════════════════════════════
// SOUSCRIPTION TYPES
// ═══════════════════════════════════════════════════════════

export interface Souscription {
    id: number;
    slug: string;
    reference: string;
    souscripteurNom: string;
    souscripteurPrenom: string;
    souscripteurEmail: string;
    souscripteurTelephone: string;
    fournisseurId: number;
    fournisseurNom: string;
    banqueId: number;
    banqueNom: string;
    montantTotal: number;
    statut:
    | "brouillon"
    | "soumise"
    | "validee"
    | "rejetee"
    | "payee"
    | "servie";
    articles: SouscriptionArticle[];
    dateCreation: string;
    dateValidation?: string;
    dateService?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SouscriptionArticle {
    id: number;
    articleNom: string;
    quantite: number;
    prixUnitaire: number;
    montantTotal: number;
}

export interface CreateSouscriptionData {
    souscripteurNom: string;
    souscripteurPrenom: string;
    souscripteurEmail: string;
    souscripteurTelephone: string;
    fournisseurId: number;
    banqueId: number;
    articles: Array<{
        articleNom: string;
        quantite: number;
        prixUnitaire: number;
    }>;
}

// ═══════════════════════════════════════════════════════════
// DEVIS TYPES
// ═══════════════════════════════════════════════════════════

export interface Devis {
    id: number;
    slug: string;
    reference: string;
    souscriptionId: number;
    souscriptionReference: string;
    souscripteurNom: string;
    fournisseurId: number;
    fournisseurNom: string;
    banqueId: number;
    banqueNom: string;
    montantTotal: number;
    statut:
    | "envoye"
    | "en_attente_validation"
    | "valide"
    | "refuse"
    | "expire";
    articles: DevisArticle[];
    dateEnvoi: string;
    dateExpiration?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DevisArticle {
    id: number;
    articleNom: string;
    quantite: number;
    prixUnitaire: number;
    montantTotal: number;
}

// ═══════════════════════════════════════════════════════════
// DOSSIER TYPES
// ═══════════════════════════════════════════════════════════

export interface Dossier {
    id: number;
    slug: string;
    reference: string;
    souscriptionId: number;
    souscriptionReference: string;
    devisId: number;
    devisReference: string;
    souscripteurNom: string;
    souscripteurPrenom: string;
    banqueId: number;
    banqueNom: string;
    montantTotal: number;
    statut:
    | "recu"
    | "en_cours_traitement"
    | "valide"
    | "rejete"
    | "informations_demandees";
    motifRejet?: string;
    dateReception: string;
    dateValidation?: string;
    validePar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ValidateDossierData {
    montantApprouve?: number;
    commentaire?: string;
}

export interface RejectDossierData {
    motifRejet: string;
}

// ═══════════════════════════════════════════════════════════
// PAIEMENT TYPES
// ═══════════════════════════════════════════════════════════

export interface Paiement {
    id: number;
    slug: string;
    reference: string;
    dossierId: number;
    dossierReference: string;
    souscripteurNom: string;
    souscripteurPrenom: string;
    banqueId: number;
    banqueNom: string;
    fournisseurId: number;
    fournisseurNom: string;
    montant: number;
    statut:
    | "en_attente"
    | "programme"
    | "en_cours"
    | "effectue"
    | "echec"
    | "encaisse";
    datePrevue?: string;
    dateEffective?: string;
    dateEncaissement?: string;
    referenceTransaction?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdatePaiementData {
    statut?:
    | "en_attente"
    | "programme"
    | "en_cours"
    | "effectue"
    | "echec"
    | "encaisse";
    dateEffective?: string;
    dateEncaissement?: string;
    referenceTransaction?: string;
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════

export interface Notification {
    id: string;
    titre: string;
    message: string;
    categorie:
    | "souscription"
    | "devis"
    | "dossier"
    | "paiement"
    | "systeme";
    estLue: boolean;
    lien?: string;
    date: string;
    heure: string;
    createdAt: string;
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD TYPES
// ═══════════════════════════════════════════════════════════

export interface DashboardStats {
    totalSouscriptions: number;
    montantTotalSouscriptions: number;
    souscriptionsEnAttente: number;
    dossiersValides: number;
    dossiersRejetes: number;
    devisEnAttente: number;
    paiementsEncaisses: number;
    paiementsEnCours: number;
    montantTotalPaiements: number;
    articlesServis: number;
}

// ═══════════════════════════════════════════════════════════
// ATTENDANCE TYPES
// ═══════════════════════════════════════════════════════════

export interface Attendance {
    id: number;
    slug?: string;

    userId: number;
    userName?: string;

    date: string;
    checkIn?: string;
    checkOut?: string;

    status?: "present" | "absent" | "late" | "leave";

    notes?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateAttendanceData {
    userId: number;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status?: "present" | "absent" | "late" | "leave";
    notes?: string;
}

export interface UpdateAttendanceData {
    date?: string;
    checkIn?: string;
    checkOut?: string;
    status?: "present" | "absent" | "late" | "leave";
    notes?: string;
}

// ═══════════════════════════════════════════════════════════
// PAGINATION & API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════

export interface PaginationMeta {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number;
    to: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    statusCode: number;
}

// ═══════════════════════════════════════════════════════════
// FILTER & SORT TYPES
// ═══════════════════════════════════════════════════════════

export interface BaseFilters {
    search?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface QueryParams extends BaseFilters {
    [key: string]: string | number | boolean | undefined;
}

export interface SouscriptionFilters extends BaseFilters {
    statut?: string;
    fournisseurId?: number;
    banqueId?: number;
    dateDebut?: string;
    dateFin?: string;
}

export interface DevisFilters extends BaseFilters {
    statut?: string;
    fournisseurId?: number;
    banqueId?: number;
}

export interface DossierFilters extends BaseFilters {
    statut?: string;
    banqueId?: number;
}

export interface PaiementFilters extends BaseFilters {
    statut?: string;
    banqueId?: number;
    fournisseurId?: number;
}
