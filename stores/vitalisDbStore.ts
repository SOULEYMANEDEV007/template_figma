// @ts-nocheck
// stores/vitalisDbStore.ts
// Base de données virtuelle Vitalis — Zustand + LocalStorage
// Architecture : Store unique avec tables normalisées + CRUD complet
// Utilisation : const { souscriptions, addSouscription } = useVitalisDb()

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================
// TYPES ALLÉGÉS (compatibles avec le store localStorage)
// ============================================================

export interface VAgenceAFG {
  id: string;
  code: string;
  nom: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  responsable: string;
  statut: 'actif' | 'inactif';
}

export interface VFournisseur {
  id: string;
  code: string;
  nom: string;
  raisonSociale: string;
  email: string;
  emailCommercial?: string;
  telephone: string;
  telephoneCommercial?: string;
  adresse: string;
  ville: string;
  quartier?: string;
  rccm?: string;
  secteurActivite?: string;
  logo?: string;
  agreVitalis: boolean;
  dateAgrementVitalis?: string;
  statut: 'prospect' | 'en_cours_agrement' | 'agree' | 'actif' | 'suspendu' | 'expire';
}

export interface VPointRelais {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  quartier?: string;
  telephone: string;
  email?: string;
  horaires?: string;
  responsable?: string;
  statut: 'actif' | 'inactif';
  type: 'relais' | 'agence';
}

export interface VArticleDevis {
  id: string;
  designation: string;
  reference?: string;
  quantite: number;
  prixUnitaire: number;
  remise?: number;
  montantHT: number;
}

export interface VSouscription {
  id: string;
  reference: string;
  // Souscripteur
  souscripteurId: string;
  souscripteurNom: string;
  souscripteurPrenom?: string;
  souscripteurEntreprise?: string;
  souscripteurTelephone?: string;
  souscripteurEmail?: string;
  typeSouscripteur: 'physique' | 'morale';
  // Banque (toujours AFG)
  banqueId: 'AFG-001';
  banqueNom: 'AFG Bank';
  agenceId?: string;
  agenceNom?: string;
  // Fournisseurs associés
  fournisseurs: Array<{
    fournisseurId: string;
    fournisseurNom: string;
    devisId?: string;
    statut: 'en_attente' | 'devis_cree' | 'valide';
  }>;
  // Montants
  montantTotal: number;
  duree: number;
  // Statut
  statut: 'en_preparation' | 'pret_pour_depot' | 'depose_banque' | 'en_analyse_bancaire' | 'accepte' | 'refuse' | 'finance' | 'fournisseur_paye' | 'commande_en_preparation' | 'livre' | 'cloture';
  // Dates
  dateCreation: string;
  dateMiseAJour: string;
  dateValidation?: string;
  // Documents
  documentsCNI?: string[];   // référence fileStorage
  documentsRCCM?: string[];
  // Divers
  observations?: string;
}

export interface VDevis {
  id: string;
  reference: string;
  souscriptionId: string;
  souscriptionRef: string;
  // Souscripteur (dénormalisé pour affichage)
  souscripteurNom: string;
  souscripteurPrenom?: string;
  // Fournisseur
  fournisseurId: string;
  fournisseurNom: string;
  // Banque
  banqueId: 'AFG-001';
  banqueNom: 'AFG Bank';
  // Articles
  articles: VArticleDevis[];
  // Montants
  totalHT: number;
  tva: number;
  totalTTC: number;
  // Conditions
  conditions: string;
  delaiLivraisonAbidjan: string;
  delaiLivraisonInterieur: string;
  validiteDevis: string;
  lieuDevis?: {
    region: string;
    departement: string;
    ville: string;
    agenceOuPointDeVente: string;
  };
  lieuLivraison?: {
    region: string;
    departement: string;
    ville: string;
    communeQuartier: string;
    adressePrecise: string;
    contactDestinataire: string;
  };
  // Statut
  statut: 'brouillon' | 'envoye' | 'en_attente_validation' | 'valide' | 'refuse' | 'expire';
  // Dates
  dateCreation: string;
  dateExpiration: string;
  dateValidation?: string;
  dateMiseAJour: string;
  // Document PDF (référence fileStorage)
  pdfRef?: string;
  // Notes
  observationsFournisseur?: string;
  observationsAFG?: string;
}

export interface VDossier {
  id: string;
  reference: string;
  souscriptionId: string;
  souscriptionRef: string;
  // Souscripteur
  souscripteurId: string;
  souscripteurNom: string;
  souscripteurPrenom?: string;
  typeSouscripteur: 'physique' | 'morale';
  // Fournisseurs (résumé)
  fournisseursNoms: string;
  devisIds: string[];
  // AFG Bank
  banqueId: 'AFG-001';
  banqueNom: 'AFG Bank';
  agenceId?: string;
  // Montant total (somme de tous les devis)
  montantTotal: number;
  // Statut
  statut: 'en_preparation' | 'pret_pour_depot' | 'depose_banque' | 'en_analyse_bancaire' | 'accepte' | 'refuse' | 'finance' | 'fournisseur_paye' | 'commande_en_preparation' | 'livre' | 'cloture';
  commentaireAFG?: string;
  motifRejet?: string;
  // Dates
  dateCreation: string;
  dateReception: string;
  dateDebutAnalyse?: string;
  dateValidation?: string;
  dateMiseAJour: string;
  // Documents joints
  documentsRefs?: string[];
}

export interface VPaiement {
  id: string;
  reference: string;
  souscriptionId: string;
  souscriptionRef: string;
  dossierId: string;
  dossierRef: string;
  souscripteurNom: string;
  montantTotal: number;
  repartitionFournisseurs: Array<{
    fournisseurId: string;
    fournisseurNom: string;
    devisId: string;
    montant: number;
    statut: 'en_attente' | 'transfere' | 'confirme';
  }>;
  statut: 'en_attente' | 'valide_afg' | 'en_cours_transfert' | 'termine';
  dateCreation: string;
  dateValidationAFG?: string;
  dateTransfert?: string;
  dateMiseAJour: string;
}

export interface VHistorique {
  id: string;
  souscriptionId: string;
  action: string;
  description: string;
  auteur?: string;
  date: string;
}

// ============================================================
// DONNÉES INITIALES (Seed)
// ============================================================

const SEED_AGENCES_AFG: VAgenceAFG[] = [
  { id: 'AGE-AFG-001', code: 'AFG-PLT', nom: 'Agence Plateau', ville: 'Abidjan', adresse: 'Avenue Chardy, Immeuble SCIAM, Plateau', telephone: '+225 27 20 31 58 00', email: 'plateau@afgbank.ci', responsable: 'M. Kouadio KOFFI', statut: 'actif' },
  { id: 'AGE-AFG-002', code: 'AFG-COC', nom: 'Agence Cocody', ville: 'Abidjan', adresse: 'Boulevard Latrille, Cocody Angré', telephone: '+225 27 22 52 14 00', email: 'cocody@afgbank.ci', responsable: 'Mme Aya KONÉ', statut: 'actif' },
  { id: 'AGE-AFG-003', code: 'AFG-MAR', nom: 'Agence Marcory', ville: 'Abidjan', adresse: 'Boulevard VGE, face Pharmacie Bethesda', telephone: '+225 27 21 44 55 66', email: 'marcory@afgbank.ci', responsable: 'M. Adama COULIBALY', statut: 'actif' },
  { id: 'AGE-AFG-004', code: 'AFG-YOP', nom: 'Agence Yopougon', ville: 'Abidjan', adresse: 'Face Cité SICOGI, Quartier Maroc', telephone: '+225 27 23 55 66 77', email: 'yopougon@afgbank.ci', responsable: 'Mme Nathalie ASSI', statut: 'actif' },
  { id: 'AGE-AFG-005', code: 'AFG-BKE', nom: 'Agence Bouaké', ville: 'Bouaké', adresse: 'Avenue Gon Coulibaly, Centre-ville', telephone: '+225 27 31 63 28 00', email: 'bouake@afgbank.ci', responsable: 'M. Souleymane TRAORÉ', statut: 'actif' },
  { id: 'AGE-AFG-006', code: 'AFG-YAM', nom: 'Agence Yamoussoukro', ville: 'Yamoussoukro', adresse: "Boulevard Giscard d'Estaing, Centre", telephone: '+225 27 30 64 15 00', email: 'yamoussoukro@afgbank.ci', responsable: 'M. Jean-Marc BAMBA', statut: 'actif' },
  { id: 'AGE-AFG-007', code: 'AFG-SPD', nom: 'Agence San-Pedro', ville: 'San-Pedro', adresse: 'Avenue du Port, Quartier Bardot', telephone: '+225 27 34 99 00 11', email: 'sanpedro@afgbank.ci', responsable: 'M. Assoa GNABRO', statut: 'actif' },
];

const SEED_FOURNISSEURS: VFournisseur[] = [
  {
    id: 'FOUR-LDF-001', code: 'LDF', nom: 'Librairie de France Groupe', raisonSociale: 'Librairie de France Groupe CI',
    email: 'contact@ldfgroupe.ci', emailCommercial: 'commercial@ldfgroupe.ci',
    telephone: '+225 27 21 35 75 00', telephoneCommercial: '+225 07 08 09 10 11',
    adresse: 'Boulevard Valéry Giscard d\'Estaing, Marcory Zone 4', ville: 'Abidjan', quartier: 'Marcory',
    rccm: 'CI-ABJ-2015-B-12345', secteurActivite: 'Fournitures scolaires et bureautiques',
    logo: '/images/ldfgroupe-icon-app.webp', agreVitalis: true, dateAgrementVitalis: '2023-01-15', statut: 'actif',
  },
  {
    id: 'FOUR-DRO-002', code: 'DRO', nom: 'Drocolor', raisonSociale: "Drocolor Côte d'Ivoire SARL",
    email: 'info@drocolor.ci', emailCommercial: 'ventes@drocolor.ci',
    telephone: '+225 27 23 45 67 89', telephoneCommercial: '+225 05 06 07 08 09',
    adresse: 'Zone Industrielle de Yopougon', ville: 'Abidjan', quartier: 'Yopougon',
    rccm: 'CI-ABJ-2018-B-45678', secteurActivite: 'Matériel informatique et électronique',
    logo: '/images/logo-drocolor.jfif', agreVitalis: true, dateAgrementVitalis: '2023-03-20', statut: 'actif',
  },
  {
    id: 'FOUR-SMT-003', code: 'SMART', nom: 'SMART TECHNOLOGIE', raisonSociale: 'Smart Technologie CI SA',
    email: 'contact@smarttech.ci', emailCommercial: 'b2b@smarttech.ci',
    telephone: '+225 27 20 12 34 56', telephoneCommercial: '+225 01 52 53 54 55',
    adresse: 'Rue des Jardins, Plateau', ville: 'Abidjan', quartier: 'Plateau',
    rccm: 'CI-ABJ-2020-B-78901', secteurActivite: 'Informatique et solutions digitales',
    logo: '/images/logo-smart-techno.png', agreVitalis: true, dateAgrementVitalis: '2023-06-10', statut: 'actif',
  },
  {
    id: 'FOUR-NAS-004', code: 'NASKO', nom: 'NASKO', raisonSociale: 'NASKO Distribution SARL',
    email: 'info@nasko.ci', emailCommercial: 'pro@nasko.ci',
    telephone: '+225 27 21 98 76 54', telephoneCommercial: '+225 07 77 88 99 00',
    adresse: 'Boulevard de Marseille, Treichville', ville: 'Abidjan', quartier: 'Treichville',
    rccm: 'CI-ABJ-2019-B-34567', secteurActivite: 'Meubles et équipements de bureau',
    logo: '/images/logo-nasko.png', agreVitalis: true, dateAgrementVitalis: '2023-09-05', statut: 'actif',
  },
  {
    id: 'FOUR-CAR-005', code: 'CARRF', nom: 'CARREFOUR', raisonSociale: "Carrefour Côte d'Ivoire",
    email: 'b2b@carrefour.ci', emailCommercial: 'corporate@carrefour.ci',
    telephone: '+225 27 21 25 00 00', telephoneCommercial: '+225 05 44 55 66 77',
    adresse: 'Centre Commercial Cap Sud, Marcory', ville: 'Abidjan', quartier: 'Marcory',
    rccm: 'CI-ABJ-2017-B-90123', secteurActivite: 'Grande distribution multi-produits',
    logo: '/images/logo-carrefour.png', agreVitalis: true, dateAgrementVitalis: '2023-02-28', statut: 'actif',
  },
];

const SEED_POINTS_RELAIS: VPointRelais[] = [
  // ABIDJAN
  { id: 'REL-ABJ-001', nom: 'Point Relais Plateau Centre', adresse: "Avenue Franchet d'Esperey, près Poste Centrale", ville: 'Abidjan', quartier: 'Plateau', telephone: '+225 27 20 22 22 22', email: 'plateau@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'M. Kofi ASSAMOI', statut: 'actif', type: 'relais' },
  { id: 'REL-ABJ-002', nom: 'Point Relais Cocody Angré', adresse: 'Carrefour Angré 8ème tranche', ville: 'Abidjan', quartier: 'Cocody', telephone: '+225 27 22 33 44 55', email: 'cocody@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'Mme Akissi BROU', statut: 'actif', type: 'relais' },
  { id: 'REL-ABJ-003', nom: 'Point Relais Marcory Zone 4', adresse: 'Boulevard VGE, face Pharmacie Bethesda', ville: 'Abidjan', quartier: 'Marcory', telephone: '+225 27 21 44 55 66', email: 'marcory@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'M. Mamadou SANOGO', statut: 'actif', type: 'relais' },
  { id: 'REL-ABJ-004', nom: 'Point Relais Yopougon Maroc', adresse: 'Face Cité SICOGI, Quartier Maroc', ville: 'Abidjan', quartier: 'Yopougon', telephone: '+225 27 23 55 66 77', email: 'yopougon@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'M. Ibrahim COULIBALY', statut: 'actif', type: 'relais' },
  { id: 'REL-ABJ-005', nom: 'Point Relais Adjamé 220 Logements', adresse: 'Carrefour 220 logements', ville: 'Abidjan', quartier: 'Adjamé', telephone: '+225 27 20 66 77 88', email: 'adjame@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'Mme Fatou TOURÉ', statut: 'actif', type: 'relais' },
  { id: 'REL-ABJ-006', nom: 'Point Relais Abobo Sogefia', adresse: 'Derrière Mairie Abobo', ville: 'Abidjan', quartier: 'Abobo', telephone: '+225 27 24 11 22 33', email: 'abobo@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'M. Daouda KONATÉ', statut: 'actif', type: 'relais' },
  { id: 'REL-ABJ-007', nom: 'Point Relais Treichville', adresse: 'Avenue Briaut, près Grand Marché', ville: 'Abidjan', quartier: 'Treichville', telephone: '+225 27 21 77 88 99', email: 'treichville@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-18h, Sam: 8h-13h', responsable: 'Mme Sylvie KOUAMÉ', statut: 'actif', type: 'relais' },
  // INTÉRIEUR
  { id: 'REL-BKE-001', nom: 'Point Relais Bouaké Centre', adresse: 'Avenue Gon Coulibaly, près Marché Central', ville: 'Bouaké', quartier: 'Centre-ville', telephone: '+225 27 31 77 88 99', email: 'bouake@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-17h, Sam: 8h-12h', responsable: 'M. Lassina OUATTARA', statut: 'actif', type: 'relais' },
  { id: 'REL-YAM-001', nom: 'Point Relais Yamoussoukro', adresse: "Boulevard Giscard d'Estaing, près Hôtel Président", ville: 'Yamoussoukro', quartier: 'Centre', telephone: '+225 27 30 88 99 00', email: 'yamoussoukro@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-17h, Sam: 8h-12h', responsable: "M. Jean-Claude N'DRI", statut: 'actif', type: 'relais' },
  { id: 'REL-SPD-001', nom: 'Point Relais San-Pedro', adresse: 'Avenue du Port, Quartier Bardot', ville: 'San-Pedro', quartier: 'Bardot', telephone: '+225 27 34 99 00 11', email: 'sanpedro@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-17h, Sam: 8h-12h', responsable: 'M. Assoa GNABRO', statut: 'actif', type: 'relais' },
  { id: 'REL-KOR-001', nom: 'Point Relais Korhogo', adresse: 'Route de Ferkessédougou, près Marché', ville: 'Korhogo', quartier: 'Centre', telephone: '+225 27 36 00 11 22', email: 'korhogo@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-17h, Sam: 8h-12h', responsable: 'M. Bakary SORO', statut: 'actif', type: 'relais' },
  { id: 'REL-DAL-001', nom: 'Point Relais Daloa', adresse: 'Boulevard de la République', ville: 'Daloa', quartier: 'Centre-ville', telephone: '+225 27 32 11 22 33', email: 'daloa@vitalis-relais.ci', horaires: 'Lun-Ven: 8h-17h, Sam: 8h-12h', responsable: 'Mme Aminata DOUMBIA', statut: 'actif', type: 'relais' },
];

// ============================================================
// DONNÉES DÉMO (pour la présentation AFG Bank)
// ============================================================

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
const oneWeekAgo = new Date(Date.now() - 604800000).toISOString().split('T')[0];

const DEMO_SOUSCRIPTIONS: VSouscription[] = [
  {
    id: 'SOUS-001', reference: 'VF-2026-001', typeSouscripteur: 'physique',
    souscripteurId: 'SCP-001', souscripteurNom: 'KOUASSI', souscripteurPrenom: 'Jean-Marc',
    souscripteurTelephone: '+225 07 12 34 56 78', souscripteurEmail: 'jm.kouassi@example.ci',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-001', agenceNom: 'Agence Plateau',
    fournisseurs: [{ fournisseurId: 'FOUR-LDF-001', fournisseurNom: 'Librairie de France Groupe', devisId: 'DEV-001', statut: 'valide' }],
    montantTotal: 850000, duree: 36, statut: 'accepte',
    dateCreation: oneWeekAgo, dateMiseAJour: twoDaysAgo, dateValidation: twoDaysAgo,
    observations: 'Fournitures scolaires pour école primaire privée.',
  },
  {
    id: 'SOUS-002', reference: 'VF-2026-002', typeSouscripteur: 'physique',
    souscripteurId: 'SCP-002', souscripteurNom: 'TOURÉ', souscripteurPrenom: 'Aminata',
    souscripteurTelephone: '+225 05 23 45 67 89', souscripteurEmail: 'a.toure@education.gouv.ci',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-002', agenceNom: 'Agence Cocody',
    fournisseurs: [{ fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor', devisId: 'DEV-002', statut: 'devis_cree' }],
    montantTotal: 650000, duree: 36, statut: 'pret_pour_depot',
    dateCreation: yesterday, dateMiseAJour: yesterday,
  },
  {
    id: 'SOUS-003', reference: 'VF-2026-003', typeSouscripteur: 'physique',
    souscripteurId: 'SCP-003', souscripteurNom: 'KONÉ', souscripteurPrenom: 'Ibrahim',
    souscripteurTelephone: '+225 07 77 88 99 00', souscripteurEmail: 'i.kone@gmail.com',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-001', agenceNom: 'Agence Plateau',
    fournisseurs: [
      { fournisseurId: 'FOUR-LDF-001', fournisseurNom: 'Librairie de France Groupe', devisId: 'DEV-003', statut: 'devis_cree' },
      { fournisseurId: 'FOUR-SMT-003', fournisseurNom: 'SMART TECHNOLOGIE', statut: 'en_attente' },
    ],
    montantTotal: 1200000, duree: 36, statut: 'en_analyse_bancaire',
    dateCreation: twoDaysAgo, dateMiseAJour: yesterday,
    observations: 'Commande multi-fournisseurs : fournitures + matériel informatique.',
  },
  {
    id: 'SOUS-004', reference: 'VF-2026-004', typeSouscripteur: 'morale',
    souscripteurId: 'SCP-004', souscripteurNom: 'DIALLO', souscripteurPrenom: 'Fatoumata',
    souscripteurEntreprise: 'DIGITAL SOLUTIONS CI', souscripteurTelephone: '+225 27 22 33 44 55',
    souscripteurEmail: 'contact@digitalsolutions.ci',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-003', agenceNom: 'Agence Marcory',
    fournisseurs: [{ fournisseurId: 'FOUR-CAR-005', fournisseurNom: 'CARREFOUR', statut: 'en_attente' }],
    montantTotal: 2500000, duree: 36, statut: 'en_preparation',
    dateCreation: today, dateMiseAJour: today,
    observations: 'Dossier en cours de constitution.',
  },
  {
    id: 'SOUS-005', reference: 'VF-2026-005', typeSouscripteur: 'physique',
    souscripteurId: 'SCP-005', souscripteurNom: 'ASSI', souscripteurPrenom: 'Brice',
    souscripteurTelephone: '+225 05 87 65 43 21', souscripteurEmail: 'b.assi@yahoo.fr',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-004', agenceNom: 'Agence Yopougon',
    fournisseurs: [{ fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor', devisId: 'DEV-005', statut: 'valide' }],
    montantTotal: 975000, duree: 36, statut: 'fournisseur_paye',
    dateCreation: oneWeekAgo, dateMiseAJour: yesterday, dateValidation: twoDaysAgo,
  },
];

const DEMO_DEVIS: VDevis[] = [
  {
    id: 'DEV-001', reference: 'DEV-2026-001', souscriptionId: 'SOUS-001', souscriptionRef: 'VF-2026-001',
    souscripteurNom: 'KOUASSI', souscripteurPrenom: 'Jean-Marc',
    fournisseurId: 'FOUR-LDF-001', fournisseurNom: 'Librairie de France Groupe',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank',
    articles: [
      { id: 'ART-001', designation: 'Cahiers 96 pages', quantite: 50, prixUnitaire: 500, remise: 0, montantHT: 25000 },
      { id: 'ART-002', designation: 'Stylos bleus Bic (boîte)', quantite: 20, prixUnitaire: 2500, remise: 5, montantHT: 47500 },
      { id: 'ART-003', designation: 'Règles 30cm', quantite: 50, prixUnitaire: 300, remise: 0, montantHT: 15000 },
      { id: 'ART-004', designation: 'Classeurs A4 rigides', quantite: 30, prixUnitaire: 3500, remise: 0, montantHT: 105000 },
      { id: 'ART-005', designation: 'Ramettes Papier A4 (500 feuilles)', quantite: 20, prixUnitaire: 5000, remise: 5, montantHT: 95000 },
    ],
    totalHT: 287500, tva: 0, totalTTC: 287500,
    conditions: 'Paiement à la réception de la commande validée par AFG Bank. Livraison franco de port à Abidjan.',
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '30 jours ouvrés',
    statut: 'valide', dateCreation: oneWeekAgo, dateExpiration: today, dateValidation: twoDaysAgo, dateMiseAJour: twoDaysAgo,
  },
  {
    id: 'DEV-002', reference: 'DEV-2026-002', souscriptionId: 'SOUS-002', souscriptionRef: 'VF-2026-002',
    souscripteurNom: 'TOURÉ', souscripteurPrenom: 'Aminata',
    fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank',
    articles: [
      { id: 'ART-006', designation: 'Cartables scolaires', quantite: 30, prixUnitaire: 15000, remise: 10, montantHT: 405000 },
    ],
    totalHT: 405000, tva: 0, totalTTC: 405000,
    conditions: "Livraison franco de port à l'adresse du client.",
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '30 jours ouvrés',
    statut: 'envoye', dateCreation: yesterday, dateExpiration: today, dateMiseAJour: yesterday,
  },
  {
    id: 'DEV-003', reference: 'DEV-2026-003', souscriptionId: 'SOUS-003', souscriptionRef: 'VF-2026-003',
    souscripteurNom: 'KONÉ', souscripteurPrenom: 'Ibrahim',
    fournisseurId: 'FOUR-LDF-001', fournisseurNom: 'Librairie de France Groupe',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank',
    articles: [
      { id: 'ART-007', designation: 'Classeurs A4', quantite: 20, prixUnitaire: 3500, remise: 0, montantHT: 70000 },
      { id: 'ART-008', designation: 'Ramettes papier A4', quantite: 15, prixUnitaire: 5000, remise: 5, montantHT: 71250 },
    ],
    totalHT: 141250, tva: 0, totalTTC: 141250,
    conditions: 'Livraison franco de port.',
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '30 jours ouvrés',
    statut: 'en_attente_validation', dateCreation: twoDaysAgo, dateExpiration: today, dateMiseAJour: twoDaysAgo,
  },
  {
    id: 'DEV-005', reference: 'DEV-2026-005', souscriptionId: 'SOUS-005', souscriptionRef: 'VF-2026-005',
    souscripteurNom: 'ASSI', souscripteurPrenom: 'Brice',
    fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank',
    articles: [
      { id: 'ART-009', designation: 'Ordinateurs portables HP 15" i5', quantite: 3, prixUnitaire: 275000, remise: 5, montantHT: 783750 },
      { id: 'ART-010', designation: 'Imprimante Brother DCP-L2550', quantite: 1, prixUnitaire: 180000, remise: 0, montantHT: 180000 },
    ],
    totalHT: 963750, tva: 0, totalTTC: 963750,
    conditions: 'Garantie constructeur 2 ans incluse. Livraison à domicile.',
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '30 jours ouvrés',
    statut: 'valide', dateCreation: oneWeekAgo, dateExpiration: today, dateValidation: twoDaysAgo, dateMiseAJour: twoDaysAgo,
  },
];

const DEMO_DOSSIERS: VDossier[] = [
  {
    id: 'DOS-001', reference: 'DOS-2026-001', souscriptionId: 'SOUS-001', souscriptionRef: 'VF-2026-001',
    souscripteurId: 'SCP-001', souscripteurNom: 'KOUASSI', souscripteurPrenom: 'Jean-Marc', typeSouscripteur: 'physique',
    fournisseursNoms: 'Librairie de France Groupe', devisIds: ['DEV-001'],
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-001',
    montantTotal: 850000, statut: 'accepte',
    commentaireAFG: 'Dossier conforme aux conditions du programme Vitalis. Financement accordé.',
    dateCreation: twoDaysAgo, dateReception: twoDaysAgo, dateDebutAnalyse: yesterday, dateValidation: today, dateMiseAJour: today,
  },
  {
    id: 'DOS-002', reference: 'DOS-2026-002', souscriptionId: 'SOUS-002', souscriptionRef: 'VF-2026-002',
    souscripteurId: 'SCP-002', souscripteurNom: 'TOURÉ', souscripteurPrenom: 'Aminata', typeSouscripteur: 'physique',
    fournisseursNoms: 'Drocolor', devisIds: ['DEV-002'],
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-002',
    montantTotal: 650000, statut: 'en_analyse_bancaire',
    dateCreation: yesterday, dateReception: yesterday, dateDebutAnalyse: today, dateMiseAJour: today,
  },
  {
    id: 'DOS-003', reference: 'DOS-2026-003', souscriptionId: 'SOUS-003', souscriptionRef: 'VF-2026-003',
    souscripteurId: 'SCP-003', souscripteurNom: 'KONÉ', souscripteurPrenom: 'Ibrahim', typeSouscripteur: 'physique',
    fournisseursNoms: 'LDF Groupe + SMART TECHNOLOGIE', devisIds: ['DEV-003'],
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-001',
    montantTotal: 1200000, statut: 'depose_banque',
    dateCreation: today, dateReception: today, dateMiseAJour: today,
  },
  {
    id: 'DOS-004', reference: 'DOS-2026-004', souscriptionId: 'SOUS-005', souscriptionRef: 'VF-2026-005',
    souscripteurId: 'SCP-005', souscripteurNom: 'ASSI', souscripteurPrenom: 'Brice', typeSouscripteur: 'physique',
    fournisseursNoms: 'Drocolor', devisIds: ['DEV-005'],
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-004',
    montantTotal: 975000, statut: 'accepte',
    commentaireAFG: 'Financement accordé — Équipements professionnels conformes au programme.',
    dateCreation: oneWeekAgo, dateReception: oneWeekAgo, dateDebutAnalyse: twoDaysAgo, dateValidation: yesterday, dateMiseAJour: yesterday,
  },
];

const DEMO_PAIEMENTS: VPaiement[] = [
  {
    id: 'PAY-001', reference: 'PAY-2026-001', souscriptionId: 'SOUS-005', souscriptionRef: 'VF-2026-005',
    dossierId: 'DOS-004', dossierRef: 'DOS-2026-004', souscripteurNom: 'ASSI Brice',
    montantTotal: 975000,
    repartitionFournisseurs: [{ fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor', devisId: 'DEV-005', montant: 975000, statut: 'confirme' }],
    statut: 'termine', dateCreation: yesterday, dateValidationAFG: yesterday, dateTransfert: today, dateMiseAJour: today,
  },
];

// ============================================================
// STORE ZUSTAND
// ============================================================

export interface VNotification {
  id: string;
  userId?: string;
  titre: string;
  message: string;
  lue: boolean;
  date: string;
}

interface VitalisDbState {
  // Tables
  agencesAFG: VAgenceAFG[];
  fournisseurs: VFournisseur[];
  pointsRelais: VPointRelais[];
  souscriptions: VSouscription[];
  devis: VDevis[];
  dossiers: VDossier[];
  paiements: VPaiement[];
  historique: VHistorique[];
  notifications: VNotification[];
  _seeded: boolean;

  // ── ACTIONS NOTIFICATIONS ──────────────────────────────────
  addNotification: (data: Omit<VNotification, 'id' | 'lue' | 'date'>) => void;
  markNotificationAsRead: (id: string) => void;
  getUnreadNotifications: (userId?: string) => VNotification[];

  // ── ACTIONS SOUSCRIPTIONS ──────────────────────────────────
  addSouscription: (data: Omit<VSouscription, 'id'>) => VSouscription;
  updateSouscription: (id: string, data: Partial<VSouscription>) => void;
  deleteSouscription: (id: string) => void;
  getSouscriptionById: (id: string) => VSouscription | undefined;

  // ── ACTIONS DEVIS ──────────────────────────────────────────
  addDevis: (data: Omit<VDevis, 'id'>) => VDevis;
  updateDevis: (id: string, data: Partial<VDevis>) => void;
  deleteDevis: (id: string) => void;
  getDevisById: (id: string) => VDevis | undefined;
  getDevisBySouscription: (souscriptionId: string) => VDevis[];
  getDevisByFournisseur: (fournisseurId: string) => VDevis[];

  // ── ACTIONS DOSSIERS ───────────────────────────────────────
  addDossier: (data: Omit<VDossier, 'id'>) => VDossier;
  updateDossier: (id: string, data: Partial<VDossier>) => void;
  getDossierById: (id: string) => VDossier | undefined;
  getDossierBySouscription: (souscriptionId: string) => VDossier | undefined;

  // ── ACTIONS PAIEMENTS ──────────────────────────────────────
  addPaiement: (data: Omit<VPaiement, 'id'>) => VPaiement;
  updatePaiement: (id: string, data: Partial<VPaiement>) => void;

  // ── HISTORIQUE ─────────────────────────────────────────────
  addHistorique: (data: Omit<VHistorique, 'id'>) => void;
  getHistoriqueBySouscription: (souscriptionId: string) => VHistorique[];

  // ── STATS ──────────────────────────────────────────────────
  getStatsAdmin: () => {
    totalSouscriptions: number; souscriptionsEnCours: number; souscriptionsValidees: number;
    totalDevis: number; devisValides: number;
    totalDossiers: number; dossiersEnAnalyse: number; dossiersValides: number;
    montantTotalSouscriptions: number; montantTotalPaiements: number;
    totalFournisseurs: number; totalAgences: number; totalRelais: number;
  };
  getStatsFournisseur: (fournisseurId: string) => {
    mesSouscriptions: number; mesDevis: number; mesDossiersValides: number; montantTotal: number;
  };
  getStatsBanque: () => {
    dossiersRecus: number; dossiersEnTraitement: number; dossiersValides: number; dossiersRejetes: number;
    montantTotal: number; tauxApprobation: number;
  };

  // ── UTILITAIRES ────────────────────────────────────────────
  generateRef: (prefix: string) => string;
  seedIfNeeded: () => void;
  resetAllData: () => void;
}

export const useVitalisDb = create<VitalisDbState>()(
  persist(
    (set, get) => ({
      // ── State initial (sera remplacé par seed) ──────────────
      agencesAFG: SEED_AGENCES_AFG,
      fournisseurs: SEED_FOURNISSEURS,
      pointsRelais: SEED_POINTS_RELAIS,
      souscriptions: DEMO_SOUSCRIPTIONS,
      devis: DEMO_DEVIS,
      dossiers: DEMO_DOSSIERS,
      paiements: DEMO_PAIEMENTS,
      historique: [],
      notifications: [
        { id: 'NOTIF-001', titre: 'Bienvenue', message: 'Bienvenue sur la plateforme Vitalis AFG Bank', lue: false, date: new Date().toISOString() }
      ],
      _seeded: true,

      addNotification: (data) => set((state) => {
        const nouvelle: VNotification = {
          ...data,
          id: `NOTIF-${Date.now()}`,
          lue: false,
          date: new Date().toISOString(),
        };
        return { notifications: [nouvelle, ...state.notifications] };
      }),

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, lue: true } : n)
      })),

      getUnreadNotifications: (userId) => {
        const { notifications } = get();
        return notifications.filter(n => !n.lue && (!n.userId || n.userId === userId));
      },

      // ── Utilitaires ─────────────────────────────────────────
      generateRef: (prefix) => {
        const year = new Date().getFullYear();
        const seq = String(Date.now()).slice(-5);
        return `${prefix}-${year}-${seq}`;
      },

      seedIfNeeded: () => {
        if (get()._seeded) return;
        set({
          agencesAFG: SEED_AGENCES_AFG,
          fournisseurs: SEED_FOURNISSEURS,
          pointsRelais: SEED_POINTS_RELAIS,
          souscriptions: DEMO_SOUSCRIPTIONS,
          devis: DEMO_DEVIS,
          dossiers: DEMO_DOSSIERS,
          paiements: DEMO_PAIEMENTS,
          _seeded: true,
        });
      },

      resetAllData: () => set({
        souscriptions: DEMO_SOUSCRIPTIONS,
        devis: DEMO_DEVIS,
        dossiers: DEMO_DOSSIERS,
        paiements: DEMO_PAIEMENTS,
        historique: [],
      }),

      // ── SOUSCRIPTIONS ───────────────────────────────────────
      addSouscription: (data) => {
        const newItem: VSouscription = {
          ...data,
          id: `SOUS-${Date.now()}`,
        };
        set(s => ({ souscriptions: [newItem, ...s.souscriptions] }));
        // Créer l'évènement historique
        get().addHistorique({
          souscriptionId: newItem.id,
          action: 'souscription_creee',
          description: `Souscription ${newItem.reference} créée`,
          date: new Date().toISOString(),
        });
        return newItem;
      },

      updateSouscription: (id, data) => set(s => ({
        souscriptions: s.souscriptions.map(item =>
          item.id === id ? { ...item, ...data, dateMiseAJour: new Date().toISOString().split('T')[0] } : item
        ),
      })),

      deleteSouscription: (id) => set(s => ({
        souscriptions: s.souscriptions.filter(item => item.id !== id),
      })),

      getSouscriptionById: (id) => get().souscriptions.find(s => s.id === id),

      // ── DEVIS ────────────────────────────────────────────────
      addDevis: (data) => {
        const newItem: VDevis = { ...data, id: `DEV-${Date.now()}` };
        set(s => ({ devis: [newItem, ...s.devis] }));
        // Mettre à jour la souscription liée
        const sous = get().souscriptions.find(s => s.id === data.souscriptionId);
        if (sous) {
          const fournisseurs = sous.fournisseurs.map(f =>
            f.fournisseurId === data.fournisseurId ? { ...f, devisId: newItem.id, statut: 'devis_cree' as const } : f
          );
          get().updateSouscription(sous.id, { fournisseurs });
        }
        get().addHistorique({
          souscriptionId: data.souscriptionId,
          action: 'devis_cree',
          description: `Devis ${data.reference} créé par ${data.fournisseurNom}`,
          date: new Date().toISOString(),
        });
        return newItem;
      },

      updateDevis: (id, data) => set(s => ({
        devis: s.devis.map(item =>
          item.id === id ? { ...item, ...data, dateMiseAJour: new Date().toISOString().split('T')[0] } : item
        ),
      })),

      deleteDevis: (id) => set(s => ({ devis: s.devis.filter(d => d.id !== id) })),

      getDevisById: (id) => get().devis.find(d => d.id === id),

      getDevisBySouscription: (souscriptionId) =>
        get().devis.filter(d => d.souscriptionId === souscriptionId),

      getDevisByFournisseur: (fournisseurId) =>
        get().devis.filter(d => d.fournisseurId === fournisseurId),

      // ── DOSSIERS ─────────────────────────────────────────────
      addDossier: (data) => {
        const newItem: VDossier = { ...data, id: `DOS-${Date.now()}` };
        set(s => ({ dossiers: [newItem, ...s.dossiers] }));
        get().addHistorique({
          souscriptionId: data.souscriptionId,
          action: 'dossier_cree',
          description: `Dossier ${data.reference} soumis à AFG Bank`,
          date: new Date().toISOString(),
        });
        return newItem;
      },

      updateDossier: (id, data) => {
        set(s => ({
          dossiers: s.dossiers.map(item =>
            item.id === id ? { ...item, ...data, dateMiseAJour: new Date().toISOString().split('T')[0] } : item
          ),
        }));
        if (data.statut) {
          const dossier = get().dossiers.find(d => d.id === id);
          if (dossier) {
            get().addHistorique({
              souscriptionId: dossier.souscriptionId,
              action: `dossier_${data.statut}`,
              description: `Dossier passé au statut : ${data.statut}`,
              date: new Date().toISOString(),
            });
          }
        }
      },

      getDossierById: (id) => get().dossiers.find(d => d.id === id),

      getDossierBySouscription: (souscriptionId) =>
        get().dossiers.find(d => d.souscriptionId === souscriptionId),

      // ── PAIEMENTS ────────────────────────────────────────────
      addPaiement: (data) => {
        const newItem: VPaiement = { ...data, id: `PAY-${Date.now()}` };
        set(s => ({ paiements: [newItem, ...s.paiements] }));
        return newItem;
      },

      updatePaiement: (id, data) => set(s => ({
        paiements: s.paiements.map(item =>
          item.id === id ? { ...item, ...data, dateMiseAJour: new Date().toISOString().split('T')[0] } : item
        ),
      })),

      // ── HISTORIQUE ───────────────────────────────────────────
      addHistorique: (data) => set(s => ({
        historique: [{ ...data, id: `HIST-${Date.now()}` }, ...s.historique],
      })),

      getHistoriqueBySouscription: (souscriptionId) =>
        get().historique.filter(h => h.souscriptionId === souscriptionId),

      // ── STATS CALCULÉES ──────────────────────────────────────
      getStatsAdmin: () => {
        const { souscriptions, devis, dossiers, paiements, fournisseurs, agencesAFG, pointsRelais } = get();
        const statuts_en_cours = ['en_preparation', 'pret_pour_depot', 'depose_banque', 'en_analyse_bancaire'];
        return {
          totalSouscriptions: souscriptions.length,
          souscriptionsEnCours: souscriptions.filter(s => statuts_en_cours.includes(s.statut)).length,
          souscriptionsValidees: souscriptions.filter(s => s.statut === 'accepte' || s.statut === 'finance' || s.statut === 'fournisseur_paye' || s.statut === 'cloture').length,
          totalDevis: devis.length,
          devisValides: devis.filter(d => d.statut === 'valide').length,
          totalDossiers: dossiers.length,
          dossiersEnAnalyse: dossiers.filter(d => d.statut === 'en_analyse_bancaire' || d.statut === 'depose_banque').length,
          dossiersValides: dossiers.filter(d => d.statut === 'accepte').length,
          montantTotalSouscriptions: souscriptions.reduce((acc, s) => acc + s.montantTotal, 0),
          montantTotalPaiements: paiements.filter(p => p.statut === 'termine').reduce((acc, p) => acc + p.montantTotal, 0),
          totalFournisseurs: fournisseurs.length,
          totalAgences: agencesAFG.length,
          totalRelais: pointsRelais.length,
        };
      },

      getStatsFournisseur: (fournisseurId) => {
        const { souscriptions, devis, dossiers } = get();
        const mesSouscriptions = souscriptions.filter(s => s.fournisseurs.some(f => f.fournisseurId === fournisseurId));
        const mesDevis = devis.filter(d => d.fournisseurId === fournisseurId);
        const mesDossiers = dossiers.filter(d => mesDevis.some(dev => d.devisIds.includes(dev.id)));
        return {
          mesSouscriptions: mesSouscriptions.length,
          mesDevis: mesDevis.length,
          mesDossiersValides: mesDossiers.filter(d => d.statut === 'accepte').length,
          montantTotal: mesDevis.filter(d => d.statut === 'valide').reduce((acc, d) => acc + d.totalTTC, 0),
        };
      },

      getStatsBanque: () => {
        const { dossiers } = get();
        const total = dossiers.length;
        const valides = dossiers.filter(d => d.statut === 'accepte').length;
        const rejetes = dossiers.filter(d => d.statut === 'refuse').length;
        return {
          dossiersRecus: total,
          dossiersEnTraitement: dossiers.filter(d => d.statut === 'en_analyse_bancaire').length,
          dossiersValides: valides,
          dossiersRejetes: rejetes,
          montantTotal: dossiers.filter(d => d.statut === 'accepte').reduce((acc, d) => acc + d.montantTotal, 0),
          tauxApprobation: total > 0 ? Math.round((valides / total) * 100) : 0,
        };
      },
    }),
    {
      name: 'vitalis-db-v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => { }, removeItem: () => { } })),
      partialize: (state) => ({
        souscriptions: state.souscriptions,
        devis: state.devis,
        dossiers: state.dossiers,
        paiements: state.paiements,
        historique: state.historique,
        _seeded: state._seeded,
        // Les données de référence (agences, fournisseurs, relais) ne changent pas : pas besoin de les persister
      }),
    }
  )
);
