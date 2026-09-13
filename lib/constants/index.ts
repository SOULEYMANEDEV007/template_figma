export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: {
    INDEX: "/dashboard",
    SOUSCRIPTIONS: "/dashboard/souscriptions",
    DEVIS: "/dashboard/devis",
    DOSSIERS: "/dashboard/dossiers",
    PAIEMENTS: "/dashboard/paiements",
    ADMIN: "/dashboard/admin",
    SETTINGS: "/dashboard/parametres",
  },
} as const;

export const ROLES = {
  ADMIN: "admin",
  BANQUE: "banque",
  FOURNISSEUR: "fournisseur",
  SOUSCRIPTEUR: "souscripteur",
} as const;

export const STATUS = {
  BROUILLON: "brouillon",
  SOUMISE: "soumise",
  EN_TRAITEMENT: "en_traitement",
  VALIDEE: "validee",
  REJETEE: "rejetee",
  FINANCEE: "financee",
} as const;
