// @ts-nocheck
// types/vitalis.ts — Types spécifiques au programme Vitalis AFG Bank
// Modèle métier : 1 Souscription → N Fournisseurs → N Devis → 1 Dossier → AFG Bank

// ============================================================
// CONSTANTES VITALIS
// ============================================================
export const VITALIS_CONFIG = {
  DUREE_PAR_DEFAUT: 36, // mois
  DELAI_LIVRAISON_ABIDJAN: "7 jours ouvrés",
  DELAI_LIVRAISON_INTERIEUR: "15 jours ouvrés",
  VALIDITE_DEVIS: "30 jours ouvrés",
  BANQUE_FINANCEUSE: "AFG-001", // ID unique AFG Bank
} as const;

// ============================================================
// TYPE SOUSCRIPTEUR
// ============================================================
export type TypeSouscripteur = "physique" | "morale";

export type SituationProfessionnelle = "salarie" | "fonctionnaire";

export type SituationMatrimoniale =
  | "celibataire"
  | "marie"
  | "divorce"
  | "veuf";

// ============================================================
// SOUSCRIPTEUR - Interface de base
// ============================================================
interface SouscripteurBase {
  id: string;
  typeSouscripteur: TypeSouscripteur;
  telephone: string;
  email: string;
  pays: string;
  region: string;
  departement?: string;
  ville: string;
  statut: "actif" | "inactif" | "suspendu";
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// SOUSCRIPTEUR - Personne Physique
// ============================================================
export interface SouscripteurPhysique extends SouscripteurBase {
  typeSouscripteur: "physique";
  nom: string;
  prenom: string;
  numeroCNI: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  situationProfessionnelle: SituationProfessionnelle;
  secteurActivite?: string;
  situationMatrimoniale?: SituationMatrimoniale;
  attestationMariageUrl?: string; // URL du document
  entrepriseEmployeur?: string;
  adresse: string;
  numeroCompte?: string;
  observations?: string;
}

// ============================================================
// SOUSCRIPTEUR - Personne Morale
// ============================================================
export interface SouscripteurMorale extends SouscripteurBase {
  typeSouscripteur: "morale";
  nomEntreprise: string;
  secteurActivite: string;
  rccm: string;
  compteContribuable: string;
  nomDirecteurGeneral: string;
  prenomDirecteurGeneral?: string;
  nombreEmployes: number;
  siegeSocial: string;
  dateCreationEntreprise?: string;
  capitalSocial?: number;
  numeroCompte?: string;
  observations?: string;
}

// ============================================================
// SOUSCRIPTEUR - Union type
// ============================================================
export type Souscripteur = SouscripteurPhysique | SouscripteurMorale;

// ============================================================
// SOUSCRIPTION (refonte complète)
// ============================================================
export type SouscriptionStatut =
  | "en_preparation" // 1. EN PRÉPARATION
  | "pret_pour_depot" // 2. DOSSIER PRÊT POUR DÉPÔT
  | "depose_banque" // 3. DÉPOSÉ À LA BANQUE
  | "en_analyse_bancaire" // 4. EN COURS D'ANALYSE BANCAIRE
  | "accepte" // 5. ACCEPTÉ
  | "refuse" // 6. REFUSÉ
  | "finance" // 7. FINANCÉ
  | "fournisseur_paye" // 8. FOURNISSEUR PAYÉ
  | "commande_en_preparation" // 9. COMMANDE EN PRÉPARATION
  | "livre" // 10. LIVRÉ
  | "cloture"; // 11. DOSSIER CLÔTURÉ

export interface Souscription {
  id: string;
  reference: string; // SUB-2026-00001
  souscripteurId: string;
  typeSouscripteur: TypeSouscripteur;

  // AFG Bank est la seule banque (pas de sélection)
  banqueId: "AFG-001"; // Toujours AFG Bank
  agenceAFGId?: string; // Agence AFG qui traite le dossier

  dateDebut: string;
  duree: number; // en mois (36 par défaut)
  montantTotal: number; // Calculé à partir de tous les devis

  observations?: string;
  statut: SouscriptionStatut;

  dateCreation: string;
  dateMiseAJour: string;
  dateValidation?: string;
  dateFinancement?: string;
  dateLivraison?: string;

  // Relations
  dossierId?: string; // Un seul dossier global pour tous les fournisseurs
  paiementId?: string;

  // Métadonnées
  creePar?: string; // ID utilisateur
  valideParAFG?: string; // ID agent AFG
}

// ============================================================
// RELATION SOUSCRIPTION-FOURNISSEUR (Nouvelle table de liaison)
// ============================================================
export interface SouscriptionFournisseur {
  id: string;
  souscriptionId: string;
  fournisseurId: string;
  devisId?: string; // Le devis créé par ce fournisseur
  ordre: number; // Ordre d'affichage (1, 2, 3...)
  statut: "en_attente" | "devis_cree" | "valide" | "rejete";
  dateAssociation: string;
  dateDevis?: string;
  observations?: string;
}

// ============================================================
// FOURNISSEUR AGRÉÉ VITALIS
// ============================================================
export interface FournisseurVitalis {
  id: string;
  code: string;
  nom: string;
  nomDirecteur: string;
  prenomDirecteur?: string;
  situationJuridique: string; // SARL, SA, etc.
  nombreEmployes: number;
  rccm: string;
  compteContribuable?: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  departement?: string;
  region?: string;

  // Spécifique Vitalis
  agreVitalis: boolean; // Agréé pour le programme Vitalis
  dateAgrement?: string;
  dureePartenariatAFG: number; // en mois
  numeroContratAFG?: string;

  // Statistiques
  nombreSouscriptions: number;
  montantTotal: number;

  statut: "prospect" | "en_cours_agrement" | "agree" | "actif" | "suspendu" | "expire";
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DEVIS (adapté pour multi-fournisseurs)
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
  remise: number; // en pourcentage
  montantHT: number; // Calculé : qte * PU * (1 - remise/100)
  raisonRemise?: string;
}

export interface Devis {
  id: string;
  reference: string; // DEV-2026-00001

  // Relations
  souscriptionId: string;
  souscriptionRef: string;
  fournisseurId: string;
  fournisseurNom: string;

  // Info souscripteur (dénormalisées pour affichage)
  souscripteurId: string;
  souscripteurNom: string;
  souscripteurPrenom?: string; // Si personne physique
  souscripteurEntreprise?: string; // Si personne morale

  // Articles avec remises détaillées
  articles: DevisArticle[];

  // Montants
  totalHT: number;
  tva: number;
  totalTTC: number;

  // Conditions
  conditions: string;
  conditionsLivraison: {
    delaiGrandAbidjan: string; // "7 jours ouvrés"
    delaiInterieur: string; // "15 jours ouvrés"
    validite: string; // "30 jours ouvrés"
  };

  // Géographie (Page 9 du cahier des charges)
  lieuDevis: {
    region: string;
    departement: string;
    ville: string;
    agenceOuPointDeVente: string;
  };
  lieuLivraison: {
    region: string;
    departement: string;
    ville: string;
    communeQuartier: string;
    adressePrecise: string;
    contactDestinataire: string;
  };

  // Dates
  dateCreation: string;
  dateExpiration: string;
  dateEnvoi?: string;
  dateValidation?: string;

  statut: DevisStatut;
  dateMiseAJour: string;

  // Métadonnées
  creePar?: string; // ID utilisateur fournisseur
  observationsFournisseur?: string;
  observationsAFG?: string;
}

// ============================================================
// DOSSIER (un seul dossier pour tous les devis)
// ============================================================
export type DossierStatut = SouscriptionStatut; // Le statut du dossier suit le statut global de la souscription

export interface Dossier {
  id: string;
  reference: string; // DOS-2026-00001

  // Relation principale
  souscriptionId: string;
  souscriptionRef: string;

  // Tous les devis associés (plusieurs fournisseurs)
  devisIds: string[]; // Liste de tous les devis de la souscription

  // Souscripteur
  souscripteurId: string;
  souscripteurNom: string;
  souscripteurPrenom?: string;
  typeSouscripteur: TypeSouscripteur;

  // Montant total (somme de tous les devis)
  montantTotal: number;

  // Gestion AFG Bank
  agenceAFGId?: string;
  agentAFGId?: string; // ID de l'agent qui traite
  statut: DossierStatut;
  commentaireAFG?: string;
  motifRejet?: string;
  informationsDemandees?: string;

  // Dates
  dateReception: string;
  dateDebutAnalyse?: string;
  dateValidation?: string;
  dateRejet?: string;
  dateMiseAJour: string;

  // Documents
  documentsUrls?: string[]; // URLs des documents joints
}

// ============================================================
// PAIEMENT / FINANCEMENT
// ============================================================
export type PaiementStatut =
  | "en_attente"
  | "valide_afg"
  | "en_cours_transfert"
  | "transfert_client_effectue"
  | "transfert_fournisseur_effectue"
  | "termine";

export interface Paiement {
  id: string;
  reference: string; // PAY-2026-00001

  // Relations
  souscriptionId: string;
  souscriptionRef: string;
  dossierId: string;
  dossierRef: string;

  // Souscripteur
  souscripteurId: string;
  souscripteurNom: string;
  numeroCompteClient?: string;

  // Montant total du financement
  montantTotal: number;

  // Répartition par fournisseur
  repartitionFournisseurs: PaiementFournisseur[];

  // AFG Bank
  agenceAFGId?: string;
  numeroTransactionAFG?: string;

  statut: PaiementStatut;

  // Dates
  dateCreation: string;
  dateValidationAFG?: string;
  dateTransfertClient?: string;
  dateTransfertFournisseurs?: string;
  dateMiseAJour: string;

  observations?: string;
}

export interface PaiementFournisseur {
  fournisseurId: string;
  fournisseurNom: string;
  devisId: string;
  montant: number;
  numeroCompteFournisseur?: string;
  dateTransfert?: string;
  referenceTransfert?: string;
  statut: "en_attente" | "transfere" | "confirme";
}

// ============================================================
// PRÉPARATION ET LIVRAISON
// ============================================================
export type StatutPreparation =
  | "commande_reçue"
  | "en_preparation"
  | "disponible"
  | "expediee"
  | "livraison_programmee"
  | "livree"
  | "anomalie";

export type ModeLivraison = "domicile" | "point_relais";

export interface Livraison {
  id: string;
  reference: string; // LIV-2026-00001

  // Relations
  devisId: string;
  souscriptionId: string;
  fournisseurId: string;
  fournisseurNom: string;

  // Articles à livrer
  articles: DevisArticle[];

  // Mode de livraison
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  pointRelaisId?: string;

  // Statut préparation
  statutPreparation: StatutPreparation;
  dateDebutPreparation?: string;
  datePrete?: string;
  dateExpedition?: string;
  dateLivraison?: string;

  // Suivi
  numeroSuivi?: string;
  transporteur?: string;
  observationsFournisseur?: string;
  observationsClient?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================
// POINT RELAIS
// ============================================================
export interface PointRelais {
  id: string;
  code: string;
  nom: string;
  adresse: string;
  ville: string;
  departement?: string;
  region: string;
  codePostal?: string;
  telephone: string;
  email?: string;
  horaires: string; // Ex: "Lun-Ven: 8h-18h, Sam: 9h-13h"
  responsable?: string;

  // Géolocalisation
  latitude?: number;
  longitude?: number;

  // Capacités
  capaciteStockage?: number; // en m³
  typesArticles?: string[]; // Types d'articles acceptés

  statut: "actif" | "inactif" | "complet";
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// AGENCE AFG BANK
// ============================================================
export interface AgenceAFG {
  id: string;
  code: string;
  nom: string;
  ville: string;
  departement?: string;
  region: string;
  adresse: string;
  telephone: string;
  email: string;

  // Gestion
  responsable: string;
  telephoneResponsable?: string;
  emailResponsable?: string;

  // Statistiques
  nombreDossiersActifs: number;
  nombreDossiersTraites: number;
  montantFinanceMoisEnCours: number;
  montantFinanceTotal: number;

  statut: "active" | "inactive";
  dateOuverture: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// HISTORIQUE / TIMELINE
// ============================================================
export interface HistoriqueEvenement {
  id: string;
  souscriptionId: string;
  etape:
    | "souscription_creee"
    | "souscription_soumise"
    | "fournisseur_associe"
    | "devis_cree"
    | "devis_envoye"
    | "dossier_cree"
    | "dossier_en_analyse"
    | "informations_demandees"
    | "dossier_valide"
    | "dossier_rejete"
    | "financement_valide"
    | "transfert_effectue"
    | "preparation_commencee"
    | "livraison_expediee"
    | "livraison_effectuee"
    | "souscription_terminee";
  titre: string;
  description: string;
  utilisateurId?: string;
  utilisateurNom?: string;
  role?: string;
  date: string;
  heure: string;
  metadata?: Record<string, any>; // Données supplémentaires
}

// ============================================================
// NOTIFICATION
// ============================================================
export type NotificationCategorie =
  | "souscription"
  | "devis"
  | "dossier"
  | "paiement"
  | "livraison"
  | "systeme";

export interface Notification {
  id: string;
  titre: string;
  message: string;
  categorie: NotificationCategorie;
  priorite: "basse" | "normale" | "haute" | "urgente";
  estLue: boolean;
  lien?: string;
  reference?: string;
  date: string;
  heure: string;
  destinataireId?: string; // Si notification personnelle
  roles?: string[]; // Rôles qui peuvent voir cette notification
  metadata?: Record<string, any>;
}

// ============================================================
// STATISTIQUES DASHBOARD
// ============================================================
export interface DashboardStatsVitalis {
  // Souscriptions
  totalSouscriptions: number;
  souscriptionsEnCours: number;
  souscriptionsValidees: number;
  souscriptionsRejetees: number;
  souscriptionsTerminees: number;

  // Devis
  totalDevis: number;
  devisEnAttente: number;
  devisValides: number;

  // Dossiers
  dossiersEnAnalyse: number;
  dossiersValides: number;
  dossiersRejetes: number;

  // Paiements
  paiementsEnCours: number;
  paiementsEffectues: number;
  montantTotalFinance: number;

  // Livraisons
  livraisonsEnPreparation: number;
  livraisonsExpediees: number;
  livraisonsEffectuees: number;

  // Acteurs
  totalFournisseursAgrees: number;
  totalSouscripteursActifs: number;
  totalAgencesAFG: number;
  totalPointsRelais: number;

  // Montants
  montantTotalSouscriptions: number;
  montantMoisEnCours: number;
  montantAnnee: number;
}

// ============================================================
// RECHERCHE GLOBALE
// ============================================================
export interface SearchResult {
  id: string;
  type:
    | "souscription"
    | "devis"
    | "dossier"
    | "paiement"
    | "souscripteur"
    | "fournisseur"
    | "agence";
  reference?: string;
  titre: string;
  description: string;
  statut?: string;
  lien: string;
  metadata?: Record<string, any>;
}

// ============================================================
// CONDITIONS VITALIS
// ============================================================
export interface ConditionsVitalis {
  version: string;
  datePublication: string;
  sections: ConditionSection[];
}

export interface ConditionSection {
  id: string;
  titre: string;
  ordre: number;
  contenu: string; // Markdown ou HTML
  sousections?: ConditionSection[];
}

// ============================================================
// EXPORTS DE TYPES UTILITAIRES
// ============================================================

// Helper type pour les formulaires
export type SouscripteurFormData =
  | Omit<SouscripteurPhysique, "id" | "createdAt" | "updatedAt">
  | Omit<SouscripteurMorale, "id" | "createdAt" | "updatedAt">;

// Helper type pour vérifier le type à runtime
export function isSouscripteurPhysique(
  souscripteur: Souscripteur
): souscripteur is SouscripteurPhysique {
  return souscripteur.typeSouscripteur === "physique";
}

export function isSouscripteurMorale(
  souscripteur: Souscripteur
): souscripteur is SouscripteurMorale {
  return souscripteur.typeSouscripteur === "morale";
}
