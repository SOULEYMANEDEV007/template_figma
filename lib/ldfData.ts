

// ============================================================
// COMPTES DÉMO (Connexion rapide)
// ============================================================
export const demoAccounts = [
  {
    email: "admin@viflow.ci",
    password: "admin123",
    role: "admin",
    nom: "Admin",
    prenom: "Système",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
  {
    email: "banque@afgbank.ci",
    password: "banque123",
    role: "banque",
    nom: "Traoré",
    prenom: "Abdoulaye",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
  {
    email: "fournisseur@ldf.ci",
    password: "fournisseur123",
    role: "fournisseur",
    nom: "Librairie de France",
    prenom: "Groupe",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
  {
    email: "client@viflow.ci",
    password: "client123",
    role: "souscripteur",
    nom: "Coulibaly",
    prenom: "Mamadou",
    banqueId: "AFG-001",
    banqueNom: "AFG Bank",
  },
];

// ============================================================
// NOTIFICATIONS (vide par défaut)
// ============================================================
export const mockNotifications: any[] = [];

// ============================================================
// UTILISATEURS SYSTÈME
// ============================================================
export const mockUsers = [
  {
    id: "USR-001",
    email: "admin@viflow.ci",
    password: "admin123",
    nom: "Admin",
    prenom: "Système",
    role: "admin",
    telephone: "+225 07 00 00 00 00",
    statut: "actif",
    createdAt: "2024-01-01",
  },
  {
    id: "USR-002",
    email: "banque@afgbank.ci",
    password: "banque123",
    nom: "Traoré",
    prenom: "Abdoulaye",
    role: "banque",
    banqueId: "AFG-001",
    telephone: "+225 07 01 00 00 00",
    statut: "actif",
    createdAt: "2024-01-01",
  },
  {
    id: "USR-003",
    email: "fournisseur@ldf.ci",
    password: "fournisseur123",
    nom: "Librairie de France",
    prenom: "Groupe",
    role: "fournisseur",
    fournisseurId: "FRN-001",
    telephone: "+225 07 02 00 00 00",
    statut: "actif",
    createdAt: "2024-01-01",
  },
];

// ============================================================
// UTILISATEURS SOUSCRIPTEURS
// ============================================================
export const mockSouscripteursUsers = [
  {
    id: "USRSCP-001",
    email: "client@viflow.ci",
    password: "client123",
    nom: "Coulibaly",
    prenom: "Mamadou",
    role: "souscripteur",
    souscripteurId: "SCP-001",
    telephone: "+225 07 01 11 22 33",
    statut: "actif",
    createdAt: "2026-01-05",
  },
];

// ============================================================
// BANQUES (AFG Bank uniquement)
// ============================================================
export const mockBanques = [{
  id: "AFG-001",
  code: "AFG",
  nom: "AFG Bank",
  sigle: "AFG",
  statut: "actif"
}];

// ============================================================
// FOURNISSEURS
// ============================================================
export const mockFournisseurs = [
  { id: "FOUR-LDF-001", code: "LDF", nom: "Librairie de France Groupe", statut: "actif" },
  { id: "FOUR-DRO-002", code: "DRO", nom: "Drocolor", statut: "actif" },
];

// ============================================================
// SOUSCRIPTIONS
// ============================================================
export const mockSouscriptions = [
  {
    id: "SOUS-001",
    reference: "VF-2026-001",
    souscripteurNom: "Kouassi",
    souscripteurPrenom: "Jean-Marc",
    souscripteurEmail: "client@viflow.ci",
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
