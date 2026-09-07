// types/ldf.ts — Types métier complets LDF Groupe

// ============================================================
// RÔLES
// ============================================================
export type LDFUserRole = "admin" | "banque" | "fournisseur" | "souscripteur";

export interface LDFUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: LDFUserRole;
  avatar?: string;
  phone?: string;
  organisationId?: string; // banqueId ou fournisseurId
  organisationName?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// ============================================================
// SOUSCRIPTEUR USER (rôle)
// ============================================================
export interface SouscripteurUser extends LDFUser {
  role: "souscripteur";
  numeroCNI: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  profession?: string;
  salaire?: number;
  banqueId: string;
  numeroCompte: string;
  souscriptionIds: string[];
}

// ============================================================
// FOURNISSEUR
// ============================================================
export interface Fournisseur {
  id: string;
  code: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  responsable: string;
  nombreSouscriptions: number;
  montantTotal: number;
  statut: "actif" | "inactif";
  createdAt: string;
}

// ============================================================
// BANQUE
// ============================================================
export interface Banque {
  id: string;
  code: string;
  nom: string;
  sigle: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  directeur: string;
  nombreDossiers: number;
  montantFinance: number;
  statut: "active" | "inactive";
  createdAt: string;
}

// ============================================================
// SOUSCRIPTEUR
// ============================================================
export interface Souscripteur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  banqueId: string;
  banqueNom: string;
  numeroCompte: string;
  createdAt: string;
}

// ============================================================
// ARTICLE
// ============================================================
export interface Article {
  id: string;
  designation: string;
  reference: string;
  quantite: number;
  prixUnitaire: number;
  remise: number;
  montantHT: number;
}

// ============================================================
// SOUSCRIPTION
// ============================================================
export type SouscriptionStatut =
  | "brouillon"
  | "soumise"
  | "en_attente"
  | "validee"
  | "rejetee"
  | "payee"
  | "servie";

export interface Souscription {
  id: string;
  reference: string;
  souscripteurId: string;
  souscripteurNom: string;
  souscripteurPrenom: string;
  souscripteurTelephone: string;
  souscripteurEmail: string;
  fournisseurId: string;
  fournisseurNom: string;
  banqueId: string;
  banqueNom: string;
  articles: Article[];
  montantTotal: number;
  duree: number; // en mois
  observations?: string;
  statut: SouscriptionStatut;
  dateCreation: string;
  dateMiseAJour: string;
  devisId?: string;
  dossierId?: string;
  paiementId?: string;
}

// ============================================================
// DEVIS
// ============================================================
export type DevisStatut =
  | "brouillon"
  | "envoye"
  | "en_attente_validation"
  | "valide"
  | "refuse"
  | "expire";

export interface DevisArticle {
  id: string;
  designation: string;
  reference: string;
  quantite: number;
  prixUnitaire: number;
  remise: number;
  montantHT: number;
}

export interface Devis {
  id: string;
  reference: string;
  souscriptionId: string;
  souscriptionRef: string;
  souscripteurNom: string;
  souscripteurPrenom: string;
  fournisseurId: string;
  fournisseurNom: string;
  banqueId: string;
  banqueNom: string;
  articles: DevisArticle[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  conditions: string;
  dateCreation: string;
  dateExpiration: string;
  statut: DevisStatut;
  dateMiseAJour: string;
}

// ============================================================
// DOSSIER
// ============================================================
export type DossierStatut =
  | "recu"
  | "en_cours_traitement"
  | "valide"
  | "rejete"
  | "informations_demandees";

export interface Dossier {
  id: string;
  reference: string;
  souscriptionId: string;
  souscriptionRef: string;
  devisId: string;
  devisRef: string;
  souscripteurId: string;
  souscripteurNom: string;
  souscripteurPrenom: string;
  fournisseurId: string;
  fournisseurNom: string;
  banqueId: string;
  banqueNom: string;
  montant: number;
  statut: DossierStatut;
  commentaireBanque?: string;
  motifRejet?: string;
  dateReception: string;
  dateTraitement?: string;
  dateMiseAJour: string;
}

// ============================================================
// PAIEMENT
// ============================================================
export type PaiementStatut = "en_cours" | "encaisse" | "servi";

export interface Paiement {
  id: string;
  reference: string;
  souscriptionId: string;
  souscriptionRef: string;
  devisId: string;
  devisRef: string;
  souscripteurNom: string;
  souscripteurPrenom: string;
  fournisseurId: string;
  fournisseurNom: string;
  banqueId: string;
  banqueNom: string;
  montant: number;
  statut: PaiementStatut;
  datePaiement: string;
  dateEncaissement?: string;
  dateService?: string;
  dateMiseAJour: string;
}

// ============================================================
// HISTORIQUE / TIMELINE
// ============================================================
export interface HistoriqueEvenement {
  id: string;
  souscriptionId: string;
  etape:
    | "souscription_creee"
    | "souscription_envoyee"
    | "devis_cree"
    | "devis_envoye"
    | "dossier_recu"
    | "dossier_valide"
    | "dossier_rejete"
    | "paiement_effectue"
    | "paiement_encaisse"
    | "articles_servis"
    | "informations_demandees";
  titre: string;
  description: string;
  utilisateur: string;
  role: LDFUserRole | "souscripteur";
  date: string;
  heure: string;
  statut: "complete" | "en_cours" | "en_attente" | "rejete";
}

// ============================================================
// NOTIFICATION
// ============================================================
export type NotificationCategorie =
  | "souscription"
  | "devis"
  | "dossier"
  | "paiement"
  | "systeme";

export interface Notification {
  id: string;
  titre: string;
  message: string;
  categorie: NotificationCategorie;
  estLue: boolean;
  lien?: string;
  reference?: string;
  date: string;
  heure: string;
  roles?: string[]; // admin, banque, fournisseur, souscripteur
}

// ============================================================
// FEEDBACK BANQUE
// ============================================================
export interface FeedbackBanque {
  id: string;
  dossierId: string;
  dossierRef: string;
  souscripteurNom: string;
  banqueId: string;
  banqueNom: string;
  fournisseurId: string;
  statut: "valide" | "rejete" | "informations_demandees";
  commentaire: string;
  date: string;
}

// ============================================================
// STATS DASHBOARD
// ============================================================
export interface DashboardStatsLDF {
  totalSouscriptions: number;
  souscriptionsEnAttente: number;
  dossiersValides: number;
  dossiersRejetes: number;
  devisEnAttente: number;
  paiementsEnCours: number;
  paiementsEncaisses: number;
  articlesServis: number;
  totalFournisseurs: number;
  totalBanques: number;
  totalDevis: number;
  totalPaiements: number;
  montantTotalSouscriptions: number;
  montantTotalPaiements: number;
}

// ============================================================
// RÉSULTATS DE RECHERCHE GLOBALE
// ============================================================
export interface SearchResult {
  id: string;
  type: "souscription" | "devis" | "dossier" | "paiement" | "souscripteur" | "fournisseur" | "banque";
  reference?: string;
  titre: string;
  description: string;
  statut?: string;
  lien: string;
}
