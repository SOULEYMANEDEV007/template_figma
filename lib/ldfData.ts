// @ts-nocheck
// lib/ldfData.ts — Données mock ViFlo (Vitalis · AFG Bank)
// Modèle métier : 1 Souscription → N Fournisseurs → N Devis → 1 Dossier → AFG Bank

// ============================================================
// COMPTES DÉMO (Connexion rapide)
// ============================================================
export const demoAccounts = [
  {
    email: "admin@viflo.ci",
    password: "admin123",
    role: "admin",
    label: "Administrateur ViFlo",
    nom: "Admin",
    prenom: "Système",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
  {
    email: "banque@afgbank.ci",
    password: "banque123",
    role: "banque",
    label: "Responsable AFG Bank",
    nom: "Traoré",
    prenom: "Abdoulaye",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
  {
    email: "fournisseur@ldf.ci",
    password: "fournisseur123",
    role: "fournisseur",
    label: "Fournisseur — LDF Groupe",
    nom: "Librairie de France",
    prenom: "Groupe",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
  {
    email: "client@viflo.ci",
    password: "client123",
    role: "souscripteur",
    label: "Client / Souscripteur",
    nom: "Coulibaly",
    prenom: "Mamadou",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const mockNotifications: any[] = [];

// ============================================================
// UTILISATEURS SYSTÈME
// ============================================================
export const mockUsers = [
  {
    id: "USR-001",
    email: "admin@viflo.ci",
    password: "admin123",
    nom: "Admin",
    prenom: "Système",
    firstName: "Système",
    lastName: "Admin",
    role: "admin",
    telephone: "+225 07 00 00 00 00",
    statut: "actif",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "USR-002",
    email: "banque@afgbank.ci",
    password: "banque123",
    nom: "Traoré",
    prenom: "Abdoulaye",
    firstName: "Abdoulaye",
    lastName: "Traoré",
    role: "banque",
    banqueId: "AFG-001",
    organisationId: "AFG-001",
    organisationName: "AFG Bank",
    telephone: "+225 07 01 00 00 00",
    statut: "actif",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "USR-003",
    email: "fournisseur@ldf.ci",
    password: "fournisseur123",
    nom: "Groupe LDF",
    prenom: "Librairie de France",
    firstName: "LDF",
    lastName: "Groupe",
    role: "fournisseur",
    fournisseurId: "FOUR-LDF-001",
    organisationId: "FOUR-LDF-001",
    organisationName: "Librairie de France Groupe",
    telephone: "+225 07 02 00 00 00",
    statut: "actif",
    isActive: true,
    createdAt: "2024-01-01",
  },
];

// ============================================================
// UTILISATEURS SOUSCRIPTEURS
// ============================================================
export const mockSouscripteursUsers = [
  {
    id: "USRSCP-001",
    email: "client@viflo.ci",
    password: "client123",
    nom: "Coulibaly",
    prenom: "Mamadou",
    firstName: "Mamadou",
    lastName: "Coulibaly",
    role: "souscripteur",
    souscripteurId: "SCP-001",
    telephone: "+225 07 01 11 22 33",
    statut: "actif",
    isActive: true,
    createdAt: "2026-01-05",
  },
];

// ============================================================
// BANQUES — AFG Bank est la seule banque financeuse du programme Vitalis
// ============================================================
export const mockBanques = [{
  id: "AFG-001",
  code: "AFG",
  nom: "AFG Bank",
  sigle: "AFG Bank",
  statut: "actif",
}];

// ============================================================
// AGENCES AFG BANK
// ============================================================
export const mockAgencesAFG = [
  { id: "AGC-001", code: "AGC-01", nom: "Agence Plateau", ville: "Abidjan", region: "Abidjan", statut: "active" },
  { id: "AGC-002", code: "AGC-02", nom: "Agence Cocody", ville: "Abidjan", region: "Abidjan", statut: "active" },
  { id: "AGC-003", code: "AGC-03", nom: "Agence Marcory", ville: "Abidjan", region: "Abidjan", statut: "active" },
  { id: "AGC-004", code: "AGC-04", nom: "Agence Yopougon", ville: "Abidjan", region: "Abidjan", statut: "active" },
  { id: "AGC-005", code: "AGC-05", nom: "Agence Bouaké", ville: "Bouaké", region: "Gbêkê", statut: "active" },
  { id: "AGC-006", code: "AGC-06", nom: "Agence San Pedro", ville: "San-Pédro", region: "San-Pédro", statut: "active" },
  { id: "AGC-007", code: "AGC-07", nom: "Agence Korhogo", ville: "Korhogo", region: "Poro", statut: "active" },
];

// ============================================================
// FOURNISSEURS AGRÉÉS VITALIS
// ============================================================
export const mockFournisseurs = [
  {
    id: "FOUR-LDF-001",
    code: "LDF",
    nom: "Librairie de France Groupe",
    nomDirecteur: "Kouamé N'Guessan",
    situationJuridique: "SARL",
    nombreEmployes: 85,
    rccm: "CI-ABJ-2005-B-12341",
    email: "contact@ldfgroupe.ci",
    telephone: "+225 27 22 41 30 00",
    adresse: "Zone industrielle, Marcory",
    ville: "Abidjan",
    agreVitalis: true,
    nombreSouscriptions: 28,
    montantTotal: 62000000,
    statut: "actif",
    createdAt: "2022-03-15",
  },
  {
    id: "FOUR-DRO-002",
    code: "DRO",
    nom: "Drocolor",
    nomDirecteur: "Yao Kouassi Bernard",
    situationJuridique: "SA",
    nombreEmployes: 42,
    rccm: "CI-ABJ-2008-B-08720",
    email: "contact@drocolor.ci",
    telephone: "+225 27 22 51 20 10",
    adresse: "Treichville, Abidjan",
    ville: "Abidjan",
    agreVitalis: true,
    nombreSouscriptions: 19,
    montantTotal: 36500000,
    statut: "actif",
    createdAt: "2023-01-10",
  },
];

// ============================================================
// SOUSCRIPTIONS
// Modèle correct : 1 souscription → N fournisseurs (fournisseurs[])
// ============================================================
/*export const mockSouscriptions = [
  {
    id: "SOUS-001",
    reference: "VF-2026-001",
    souscripteurId: "SCP-001",
    souscripteurNom: "Kouassi",
    souscripteurPrenom: "Jean-Marc",
    souscripteurTelephone: "+225 07 01 11 22 33",
    souscripteurEmail: "jm.kouassi@gmail.com",
    typeSouscripteur: "physique",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-001",
    fournisseurs: [
      { fournisseurId: "FOUR-LDF-001", fournisseurNom: "LDF Groupe", devisId: "DEV-001", statut: "devis_cree" },
    ],
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "LDF Groupe",
    devisId: "DEV-001",
    montantTotal: 850000,
    duree: 36,
    statut: "validee",
    dateCreation: "2026-09-01",
    dateMiseAJour: "2026-09-03",
    observations: "Souscription pour fournitures scolaires école primaire",
  },
  {
    id: "SOUS-002",
    reference: "VF-2026-002",
    souscripteurId: "SCP-002",
    souscripteurNom: "Touré",
    souscripteurPrenom: "Aminata",
    souscripteurTelephone: "+225 05 45 67 89 00",
    souscripteurEmail: "a.toure@gmail.com",
    typeSouscripteur: "physique",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-002",
    fournisseurs: [
      { fournisseurId: "FOUR-DRO-002", fournisseurNom: "Drocolor", devisId: "DEV-002", statut: "devis_cree" },
    ],
    fournisseurId: "FOUR-DRO-002",
    fournisseurNom: "Drocolor",
    devisId: null,
    montantTotal: 650000,
    duree: 36,
    statut: "soumise",
    dateCreation: "2026-09-05",
    dateMiseAJour: "2026-09-05",
    observations: "",
  },
  {
    id: "SOUS-003",
    reference: "VF-2026-003",
    souscripteurId: "SCP-003",
    souscripteurNom: "Koné",
    souscripteurPrenom: "Ibrahim",
    souscripteurTelephone: "+225 07 77 88 99 00",
    souscripteurEmail: "i.kone@gmail.com",
    typeSouscripteur: "physique",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-003",
    fournisseurs: [
      { fournisseurId: "FOUR-LDF-001", fournisseurNom: "LDF Groupe", devisId: "DEV-003", statut: "devis_cree" },
      { fournisseurId: "FOUR-DRO-002", fournisseurNom: "Drocolor", devisId: null, statut: "en_attente" },
    ],
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "LDF Groupe + Drocolor",
    devisId: "DEV-003",
    montantTotal: 1200000,
    duree: 36,
    statut: "en_attente",
    dateCreation: "2026-09-06",
    dateMiseAJour: "2026-09-07",
    observations: "Commande multi-fournisseurs",
  },
  {
    id: "SOUS-004",
    reference: "VF-2026-004",
    souscripteurId: "SCP-004",
    souscripteurNom: "Diallo",
    souscripteurPrenom: "Fatoumata",
    souscripteurTelephone: "+225 01 23 45 67 89",
    souscripteurEmail: "f.diallo@outlook.com",
    typeSouscripteur: "morale",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-001",
    fournisseurs: [
      { fournisseurId: "FOUR-LDF-001", fournisseurNom: "LDF Groupe", devisId: null, statut: "en_attente" },
    ],
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "LDF Groupe",
    devisId: null,
    montantTotal: 2000000,
    duree: 36,
    statut: "brouillon",
    dateCreation: "2026-09-08",
    dateMiseAJour: "2026-09-08",
    observations: "Dossier en cours de constitution",
  },
  {
    id: "SOUS-005",
    reference: "VF-2026-005",
    souscripteurId: "SCP-005",
    souscripteurNom: "Assi",
    souscripteurPrenom: "Brice",
    souscripteurTelephone: "+225 05 87 65 43 21",
    souscripteurEmail: "b.assi@yahoo.fr",
    typeSouscripteur: "physique",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-002",
    fournisseurs: [
      { fournisseurId: "FOUR-DRO-002", fournisseurNom: "Drocolor", devisId: "DEV-005", statut: "valide" },
    ],
    fournisseurId: "FOUR-DRO-002",
    fournisseurNom: "Drocolor",
    devisId: "DEV-005",
    montantTotal: 975000,
    duree: 36,
    statut: "payee",
    dateCreation: "2026-08-20",
    dateMiseAJour: "2026-09-01",
    observations: "",
  },
];

// ============================================================
// DEVIS
// ============================================================
export const mockDevis = [
  {
    id: "DEV-001",
    reference: "DEV-2026-001",
    souscriptionId: "SOUS-001",
    souscriptionRef: "VF-2026-001",
    souscripteurNom: "Kouassi",
    souscripteurPrenom: "Jean-Marc",
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "LDF Groupe",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    articles: [
      { id: "ART-001", designation: "Cahiers 96 pages", reference: "CAH-96", quantite: 50, prixUnitaire: 500, remise: 0, montantHT: 25000 },
      { id: "ART-002", designation: "Stylos bleus Bic", reference: "STY-BLU", quantite: 100, prixUnitaire: 200, remise: 5, montantHT: 19000 },
      { id: "ART-003", designation: "Règles 30cm", reference: "REG-30", quantite: 50, prixUnitaire: 300, remise: 0, montantHT: 15000 },
    ],
    totalHT: 780000,
    tva: 0,
    totalTTC: 780000,
    montantHT: 780000,
    montantTTC: 780000,
    conditions: "Paiement à réception de la commande validée par AFG Bank.",
    conditionsLivraison: {
      delaiGrandAbidjan: "7 jours ouvrés",
      delaiInterieur: "15 jours ouvrés",
      validite: "30 jours ouvrés",
    },
    statut: "valide",
    dateCreation: "2026-09-02",
    dateExpiration: "2026-10-12",
    dateValidation: "2026-09-03",
    dateMiseAJour: "2026-09-03",
  },
  {
    id: "DEV-002",
    reference: "DEV-2026-002",
    souscriptionId: "SOUS-002",
    souscriptionRef: "VF-2026-002",
    souscripteurNom: "Touré",
    souscripteurPrenom: "Aminata",
    fournisseurId: "FOUR-DRO-002",
    fournisseurNom: "Drocolor",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    articles: [
      { id: "ART-004", designation: "Cartables scolaires", reference: "CART-SC", quantite: 30, prixUnitaire: 15000, remise: 10, montantHT: 405000 },
    ],
    totalHT: 405000,
    tva: 0,
    totalTTC: 405000,
    montantHT: 405000,
    montantTTC: 405000,
    conditions: "Livraison franco de port à l'adresse du client.",
    conditionsLivraison: {
      delaiGrandAbidjan: "7 jours ouvrés",
      delaiInterieur: "15 jours ouvrés",
      validite: "30 jours ouvrés",
    },
    statut: "envoye",
    dateCreation: "2026-09-06",
    dateExpiration: "2026-10-16",
    dateMiseAJour: "2026-09-06",
  },
  {
    id: "DEV-003",
    reference: "DEV-2026-003",
    souscriptionId: "SOUS-003",
    souscriptionRef: "VF-2026-003",
    souscripteurNom: "Koné",
    souscripteurPrenom: "Ibrahim",
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "LDF Groupe",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    articles: [
      { id: "ART-005", designation: "Classeurs A4", reference: "CLA-A4", quantite: 20, prixUnitaire: 3500, remise: 0, montantHT: 70000 },
      { id: "ART-006", designation: "Ramettes papier A4", reference: "PAP-A4", quantite: 15, prixUnitaire: 5000, remise: 5, montantHT: 71250 },
    ],
    totalHT: 600000,
    tva: 0,
    totalTTC: 600000,
    montantHT: 600000,
    montantTTC: 600000,
    conditions: "Livraison franco de port.",
    conditionsLivraison: {
      delaiGrandAbidjan: "7 jours ouvrés",
      delaiInterieur: "15 jours ouvrés",
      validite: "30 jours ouvrés",
    },
    statut: "en_attente_validation",
    dateCreation: "2026-09-07",
    dateExpiration: "2026-10-17",
    dateMiseAJour: "2026-09-07",
  },
  {
    id: "DEV-005",
    reference: "DEV-2026-005",
    souscriptionId: "SOUS-005",
    souscriptionRef: "VF-2026-005",
    souscripteurNom: "Assi",
    souscripteurPrenom: "Brice",
    fournisseurId: "FOUR-DRO-002",
    fournisseurNom: "Drocolor",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    articles: [
      { id: "ART-007", designation: "Ordinateurs portables HP", reference: "HP-LAPTOP", quantite: 3, prixUnitaire: 275000, remise: 5, montantHT: 783750 },
      { id: "ART-008", designation: "Imprimante Brother", reference: "BROT-IMP", quantite: 1, prixUnitaire: 180000, remise: 0, montantHT: 180000 },
    ],
    totalHT: 963750,
    tva: 0,
    totalTTC: 963750,
    montantHT: 963750,
    montantTTC: 963750,
    conditions: "Garantie constructeur 2 ans incluse.",
    conditionsLivraison: {
      delaiGrandAbidjan: "7 jours ouvrés",
      delaiInterieur: "15 jours ouvrés",
      validite: "30 jours ouvrés",
    },
    statut: "valide",
    dateCreation: "2026-08-22",
    dateExpiration: "2026-09-30",
    dateValidation: "2026-08-25",
    dateMiseAJour: "2026-08-25",
  },
];

// ============================================================
// DOSSIERS
// ============================================================
export const mockDossiers = [
  {
    id: "DOS-001",
    reference: "DOS-2026-001",
    souscriptionId: "SOUS-001",
    souscriptionRef: "VF-2026-001",
    souscripteurId: "SCP-001",
    souscripteurNom: "Kouassi",
    souscripteurPrenom: "Jean-Marc",
    typeSouscripteur: "physique",
    fournisseurNom: "LDF Groupe",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-001",
    devisIds: ["DEV-001"],
    montant: 850000,
    montantTotal: 850000,
    statut: "valide",
    commentaireAFG: "Dossier conforme aux conditions du programme Vitalis.",
    dateReception: "2026-09-03",
    dateDebutAnalyse: "2026-09-03",
    dateValidation: "2026-09-04",
    dateMiseAJour: "2026-09-04",
  },
  {
    id: "DOS-002",
    reference: "DOS-2026-002",
    souscriptionId: "SOUS-002",
    souscriptionRef: "VF-2026-002",
    souscripteurId: "SCP-002",
    souscripteurNom: "Touré",
    souscripteurPrenom: "Aminata",
    typeSouscripteur: "physique",
    fournisseurNom: "Drocolor",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-002",
    devisIds: ["DEV-002"],
    montant: 650000,
    montantTotal: 650000,
    statut: "en_cours_traitement",
    commentaireAFG: "",
    dateReception: "2026-09-06",
    dateDebutAnalyse: "2026-09-07",
    dateMiseAJour: "2026-09-07",
  },
  {
    id: "DOS-003",
    reference: "DOS-2026-003",
    souscriptionId: "SOUS-003",
    souscriptionRef: "VF-2026-003",
    souscripteurId: "SCP-003",
    souscripteurNom: "Koné",
    souscripteurPrenom: "Ibrahim",
    typeSouscripteur: "physique",
    fournisseurNom: "LDF Groupe + Drocolor",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-001",
    devisIds: ["DEV-003"],
    montant: 1200000,
    montantTotal: 1200000,
    statut: "recu",
    commentaireAFG: "",
    dateReception: "2026-09-08",
    dateMiseAJour: "2026-09-08",
  },
  {
    id: "DOS-004",
    reference: "DOS-2026-004",
    souscriptionId: "SOUS-005",
    souscriptionRef: "VF-2026-005",
    souscripteurId: "SCP-005",
    souscripteurNom: "Assi",
    souscripteurPrenom: "Brice",
    typeSouscripteur: "physique",
    fournisseurNom: "Drocolor",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    agenceId: "AGC-002",
    devisIds: ["DEV-005"],
    montant: 975000,
    montantTotal: 975000,
    statut: "valide",
    commentaireAFG: "Financement accordé — Equipements professionnels conformes.",
    dateReception: "2026-08-23",
    dateDebutAnalyse: "2026-08-24",
    dateValidation: "2026-08-26",
    dateMiseAJour: "2026-08-26",
  },
];

// ============================================================
// PAIEMENTS
// ============================================================
export const mockPaiements = [
  {
    id: "PAY-001",
    reference: "PAY-2026-001",
    souscriptionId: "SOUS-001",
    souscriptionRef: "VF-2026-001",
    dossierId: "DOS-001",
    dossierRef: "DOS-2026-001",
    souscripteurId: "SCP-001",
    souscripteurNom: "Kouassi Jean-Marc",
    banqueId: "AFG-001",
    montant: 850000,
    montantTotal: 850000,
    statut: "termine",
    dateCreation: "2026-09-04",
    dateValidationAFG: "2026-09-04",
    dateTransfertClient: "2026-09-04",
    dateTransfertFournisseurs: "2026-09-05",
    dateMiseAJour: "2026-09-05",
  },
  {
    id: "PAY-002",
    reference: "PAY-2026-002",
    souscriptionId: "SOUS-005",
    souscriptionRef: "VF-2026-005",
    dossierId: "DOS-004",
    dossierRef: "DOS-2026-004",
    souscripteurId: "SCP-005",
    souscripteurNom: "Assi Brice",
    banqueId: "AFG-001",
    montant: 975000,
    montantTotal: 975000,
    statut: "termine",
    dateCreation: "2026-08-27",
    dateValidationAFG: "2026-08-27",
    dateTransfertClient: "2026-08-28",
    dateTransfertFournisseurs: "2026-08-29",
    dateMiseAJour: "2026-08-29",
  },
];

// ============================================================
// FEEDBACKS
// ============================================================
export const mockFeedbacks = [
  {
    id: "FEED-001",
    souscriptionId: "SOUS-001",
    fournisseurId: "FOUR-LDF-001",
    note: 5,
    commentaire: "Excellent service, livraison dans les délais.",
    dateCreation: "2026-09-06",
  },
];

// ============================================================
// STATS DASHBOARD ADMIN (tous les champs nécessaires)
// ============================================================
export const mockDashboardStats = {
  totalSouscriptions: 47,
  souscriptionsEnAttente: 8,
  souscriptionsEnCours: 12,
  souscriptionsValidees: 21,
  souscriptionsRejetees: 3,
  souscriptionsTerminees: 13,
  montantTotalSouscriptions: 98500000,
  dossiersRecus: 39,
  dossiersEnAnalyse: 7,
  dossiersValides: 28,
  dossiersRejetes: 4,
  totalDevis: 52,
  devisEnAttente: 9,
  devisValides: 31,
  paiementsEnCours: 5,
  paiementsEncaisses: 24,
  montantTotalPaiements: 78200000,
  articlesServis: 18,
  livraisonsEnCours: 6,
  livraisonsEffectuees: 14,
  totalFournisseurs: 2,
  totalSouscripteurs: 47,
  totalAgences: 7,
};

// ============================================================
// STATS DASHBOARD BANQUE
// ============================================================
export const mockDashboardStatsBanque = {
  dossiersRecus: 39,
  dossiersEnTraitement: 7,
  dossiersValides: 28,
  dossiersRejetes: 4,
  montantTotal: 98500000,
  montantMoisEnCours: 12300000,
  tauxApprobation: 87,
  dossiersUrgents: 3,
};

// ============================================================
// STATS DASHBOARD FOURNISSEUR
// ============================================================
export const mockDashboardStatsFournisseur = {
  mesSouscriptions: 28,
  mesDevis: 31,
  mesDossiersValides: 21,
  mesPaiements: 19,
  montantTotalMesSouscriptions: 62000000,
  montantTotalMesPaiements: 48500000,
  commandesRecues: 19,
  commandesLivrees: 14,
  commandesEnCours: 5,
  montantTotal: 62000000,
  tauxLivraison: 74,
};

// ============================================================
// DONNÉES GRAPHIQUES
// ============================================================
export const paiementsParMois = [
  { mois: "Janv", montant: 4250000 },
  { mois: "Févr", montant: 5820000 },
  { mois: "Mars", montant: 6280000 },
  { mois: "Avr",  montant: 7350000 },
  { mois: "Mai",  montant: 8420000 },
  { mois: "Juin", montant: 9380000 },
  { mois: "Juil", montant: 7900000 },
  { mois: "Août", montant: 10200000 },
  { mois: "Sept", montant: 12300000 },
];

// AFG Bank est la seule banque — graphique de répartition par fournisseur
export const souscriptionsParBanque = [
  { banque: "AFG Bank", valeur: 100, couleur: "#ff6b35" },
];

export const souscriptionsParFournisseur = [
  { fournisseur: "LDF Groupe", valeur: 59, couleur: "#ff6b35" },
  { fournisseur: "Drocolor",   valeur: 41, couleur: "#ff8c42" },
];

export const souscriptionsParStatut = [
  { statut: "Validées",   valeur: 21, couleur: "#00c853" },
  { statut: "En attente", valeur: 8,  couleur: "#ffc947" },
  { statut: "En cours",   valeur: 12, couleur: "#ff8c42" },
  { statut: "Rejetées",   valeur: 3,  couleur: "#d84315" },
  { statut: "Terminées",  valeur: 13, couleur: "#78909c" },
];

export const souscriptionsParMois = [
  { mois: "Janv", souscriptions: 3 },
  { mois: "Févr", souscriptions: 5 },
  { mois: "Mars", souscriptions: 4 },
  { mois: "Avr",  souscriptions: 7 },
  { mois: "Mai",  souscriptions: 6 },
  { mois: "Juin", souscriptions: 5 },
  { mois: "Juil", souscriptions: 4 },
  { mois: "Août", souscriptions: 6 },
  { mois: "Sept", souscriptions: 7 },
];

export const dossiersParStatut = [
  { statut: "Validés",       nombre: 28, couleur: "#00c853" },
  { statut: "En traitement", nombre: 7,  couleur: "#ff8c42" },
  { statut: "Reçus",         nombre: 4,  couleur: "#ffc947" },
  { statut: "Rejetés",       nombre: 4,  couleur: "#d84315" },
];*/

// ============================================================
// FONCTIONS HELPER
// ============================================================
/*export const getDevisById             = (id: string) => mockDevis.find(d => d.id === id) || null;
export const getSouscriptionById      = (id: string) => mockSouscriptions.find(s => s.id === id) || null;
export const getPaiementById          = (id: string) => mockPaiements.find(p => p.id === id) || null;
export const getDossierById           = (id: string) => mockDossiers.find(d => d.id === id) || null;
export const getDevisBySouscription   = (id: string) => mockDevis.filter(d => d.souscriptionId === id);
export const getDossierBySouscription = (id: string) => mockDossiers.find(d => d.souscriptionId === id) || null;
export const getHistoriqueBySouscription = (_id: string) => [];
export const getFournisseurById       = (id: string) => mockFournisseurs.find(f => f.id === id) || null;
*/


// ============================================================
// SOUSCRIPTIONS
// ============================================================
export const mockSouscriptions = [
  {
    id: "SOUS-001",
    reference: "VF-2026-001",
    souscripteurNom: "Kouassi",
    souscripteurPrenom: "Jean-Marc",
    souscripteurEmail: "client@viflo.ci",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "Librairie de France Groupe",
    montantTotal: 850000,
    statut: "validee",
    dateCreation: "2026-09-01",
    articles: [
      { designation: "Cahiers 96 pages", quantite: 50, prixUnitaire: 500 },
      { designation: "Stylos bleus", quantite: 100, prixUnitaire: 200 },
    ],
  },
  {
    id: "SOUS-002",
    reference: "VF-2026-002",
    souscripteurNom: "Touré",
    souscripteurPrenom: "Aminata",
    souscripteurEmail: "a.toure@education.gouv.ci",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
    fournisseurId: "FOUR-DRO-002",
    fournisseurNom: "Drocolor",
    montantTotal: 650000,
    statut: "en_cours",
    dateCreation: "2026-09-05",
    articles: [
      { designation: "Cartables", quantite: 30, prixUnitaire: 15000 },
    ],
  },
];

// ============================================================
// DEVIS
// ============================================================
export const mockDevis = [
  {
    id: "DEV-001",
    reference: "DEV-2026-001",
    souscriptionId: "SOUS-001",
    souscripteurNom: "Kouassi Jean-Marc",
    fournisseurId: "FOUR-LDF-001",
    fournisseurNom: "Librairie de France Groupe",
    montantHT: 780000,
    montantTTC: 850000,
    statut: "valide",
    dateCreation: "2026-09-02",
  },
];

// ============================================================
// DOSSIERS
// ============================================================
export const mockDossiers = [
  {
    id: "DOS-001",
    reference: "DOS-2026-001",
    souscriptionId: "SOUS-001",
    souscripteurNom: "Kouassi Jean-Marc",
    banqueId: "AFG-001",
    statut: "approuve",
    montant: 850000,
    dateCreation: "2026-09-03",
  },
];

// ============================================================
// PAIEMENTS
// ============================================================
export const mockPaiements = [
  {
    id: "PAY-001",
    reference: "PAY-2026-001",
    souscriptionId: "SOUS-001",
    souscripteurNom: "Kouassi Jean-Marc",
    fournisseurId: "FOUR-LDF-001",
    montant: 850000,
    statut: "effectue",
    dateCreation: "2026-09-04",
  },
];

// ============================================================
// FEEDBACKS
// ============================================================
export const mockFeedbacks = [
  {
    id: "FEED-001",
    souscriptionId: "SOUS-001",
    fournisseurId: "FOUR-LDF-001",
    note: 5,
    commentaire: "Excellent service",
    dateCreation: "2026-09-06",
  },
];

// ============================================================
// STATS DASHBOARD
// ============================================================
export const mockDashboardStats = {
  totalSouscriptions: 2,
  souscriptionsEnCours: 1,
  totalPaiements: 1,
  tauxReussite: 95,
  montantTotal: 1500000,
};

export const mockDashboardStatsBanque = {
  dossiersRecus: 1,
  dossiersTraites: 1,
  montantTotal: 850000,
  tauxApprobation: 100,
};

export const mockDashboardStatsFournisseur = {
  mesSouscriptions: 1,
  mesDevis: 1,
  mesDossiersValides: 1,
  mesPaiements: 1,
  montantTotalMesSouscriptions: 850000,
  montantTotalMesPaiements: 850000,
  commandesRecues: 1,
  commandesLivrees: 1,
  montantTotal: 850000,
  tauxLivraison: 100,
};

// ============================================================
// DONNÉES GRAPHIQUES
// ============================================================
export const paiementsParMois = [
  { mois: "Janv", montant: 250000 },
  { mois: "Févr", montant: 320000 },
  { mois: "Mars", montant: 280000 },
  { mois: "Avr", montant: 350000 },
  { mois: "Mai", montant: 420000 },
  { mois: "Juin", montant: 380000 },
];

export const souscriptionsParBanque = [
  { banque: "AFG Bank", valeur: 100, couleur: "#ff6b35" },
];

export const souscriptionsParFournisseur = [
  { fournisseur: "LDF Groupe", valeur: 50, couleur: "#ff6b35" },
  { fournisseur: "Drocolor", valeur: 50, couleur: "#ff8c42" },
];

export const souscriptionsParMois = [
  { mois: "Janv", nombre: 5 },
  { mois: "Févr", nombre: 8 },
  { mois: "Mars", nombre: 6 },
  { mois: "Avr", nombre: 10 },
  { mois: "Mai", nombre: 12 },
  { mois: "Juin", nombre: 9 },
];

export const dossiersParStatut = [
  { statut: "Approuvé", nombre: 1, couleur: "#00c853" },
  { statut: "En cours", nombre: 0, couleur: "#ff8c42" },
  { statut: "Rejeté", nombre: 0, couleur: "#d84315" },
];

// ============================================================
// FONCTIONS HELPER
// ============================================================
export const getDevisById = (id: string) => mockDevis.find(d => d.id === id) || null;
export const getSouscriptionById = (id: string) => mockSouscriptions.find(s => s.id === id) || null;
export const getPaiementById = (id: string) => mockPaiements.find(p => p.id === id) || null;
export const getDossierById = (id: string) => mockDossiers.find(d => d.id === id) || null;
export const getDevisBySouscription = (id: string) => mockDevis.filter(d => d.souscriptionId === id);
export const getDossierBySouscription = (id: string) => mockDossiers.find(d => d.souscriptionId === id) || null;
export const getHistoriqueBySouscription = (id: string) => [];
