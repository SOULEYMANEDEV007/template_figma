// Fichier complet avec toutes les données mockées nécessaires
// À copier dans ldfData.ts après vérification

export const mockBanques: any[] = [{ id: "AFG-001", code: "AFG", nom: "AFG Bank", sigle: "AFG" }];
export const mockFournisseurs: any[] = [];
export const mockSouscriptions: any[] = [];
export const mockDevis: any[] = [];
export const mockDossiers: any[] = [];
export const mockPaiements: any[] = [];
export const mockFeedbacks: any[] = [];
export const mockDashboardStats: any = {};
export const mockDashboardStatsBanque: any = {};
export const mockDashboardStatsFournisseur: any = {};
export const paiementsParMois: any[] = [];
export const souscriptionsParBanque: any[] = [];
export const souscriptionsParFournisseur: any[] = [];
export const souscriptionsParMois: any[] = [];
export const dossiersParStatut: any[] = [];

export const getDevisById = (id: string) => null;
export const getSouscriptionById = (id: string) => null;
export const getPaiementById = (id: string) => null;
export const getDossierById = (id: string) => null;
export const getDevisBySouscription = (id: string) => [];
export const getDossierBySouscription = (id: string) => null;
export const getHistoriqueBySouscription = (id: string) => [];

export const mockUsers = [
  { id: "USR-001", email: "admin@viflow.ci", password: "admin123", nom: "Admin", prenom: "Système", role: "admin" },
  { id: "USR-002", email: "banque@afgbank.ci", password: "banque123", nom: "Traoré", prenom: "Abdoulaye", role: "banque", banqueId: "AFG-001" },
];

export const mockSouscripteursUsers = [
  { id: "USRSCP-001", email: "client@viflow.ci", password: "client123", nom: "Coulibaly", prenom: "Mamadou", role: "souscripteur" },
];

export const demoAccounts = [
  { email: "admin@viflow.ci", password: "admin123", role: "admin", nom: "Admin", prenom: "Système" },
  { email: "banque@afgbank.ci", password: "banque123", role: "banque", nom: "Traoré", prenom: "Abdoulaye" },
  { email: "fournisseur@ldf.ci", password: "fournisseur123", role: "fournisseur", nom: "LDF", prenom: "Groupe" },
  { email: "client@viflow.ci", password: "client123", role: "souscripteur", nom: "Coulibaly", prenom: "Mamadou" },
];

export const mockNotifications: any[] = [];
