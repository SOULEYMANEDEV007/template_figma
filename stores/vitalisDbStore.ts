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
  raisonSociale?: string;
  nomDirecteur?: string;
  email: string;
  emailCommercial?: string;
  telephone: string;
  telephoneCommercial?: string;
  adresse: string;
  ville: string;
  region?: string;
  quartier?: string;
  rccm?: string;
  compteContribuable?: string;
  situationJuridique?: string;
  nombreEmployes?: number;
  dureePartenariatAFG?: number;
  numeroContratAFG?: string;
  nombreSouscriptions?: number;
  montantTotal?: number;
  secteurActivite?: string;
  logo?: string;
  agreVitalis: boolean;
  dateAgrementVitalis?: string;
  dateAgrement?: string;
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
  fournisseurNom?: string;
  devisIds: string[];
  // AFG Bank
  banqueId: 'AFG-001';
  banqueNom: 'AFG Bank';
  agenceId?: string;
  // Montant total (somme de tous les devis)
  montantTotal: number;
  montant?: number;
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
  banqueId?: string;
  banqueNom?: string;
  fournisseurId?: string;
  fournisseurNom?: string;
  montantTotal: number;
  montant?: number;
  repartitionFournisseurs: Array<{
    fournisseurId: string;
    fournisseurNom: string;
    devisId: string;
    montant: number;
    statut: 'en_attente' | 'transfere' | 'confirme';
  }>;
  statut: 'en_attente' | 'valide_afg' | 'en_cours_transfert' | 'termine' | 'en_cours' | 'encaisse' | 'servi' | 'fournisseur_paye';
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

export interface VUser {
  id: string;
  firstName: string;
  lastName: string;
  nom?: string;
  prenom?: string;
  email: string;
  role: 'admin' | 'banque' | 'fournisseur' | 'souscripteur' | 'owner';
  telephone?: string;
  phone?: string;
  organisationId?: string;
  organisationName?: string;
  banqueId?: string;
  fournisseurId?: string;
  statut?: 'actif' | 'inactif';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface VConnexionLog {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
  date: string;
  ip: string;
  appareil: string;
  statut: 'succes' | 'echec';
}

// ============================================================
// DONNÉES INITIALES (Seed)
// ============================================================

const SEED_USERS: VUser[] = [
  {
    id: 'USR-001',
    email: 'admin@viflo.ci',
    firstName: 'Administrateur',
    lastName: '',
    nom: '',
    prenom: 'Administrateur',
    role: 'admin',
    telephone: '+225 07 00 00 00 00',
    phone: '+225 07 00 00 00 00',
    organisationName: 'LDF Groupe',
    statut: 'actif',
    isActive: true,
    createdAt: '2026-01-01',
    lastLoginAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'USR-002',
    email: 'banque@afgbank.ci',
    firstName: 'Abdoulaye',
    lastName: 'Traoré',
    nom: 'Traoré',
    prenom: 'Abdoulaye',
    role: 'banque',
    banqueId: 'AFG-001',
    organisationId: 'AFG-001',
    organisationName: 'AFG Bank',
    telephone: '+225 07 01 00 00 00',
    phone: '+225 07 01 00 00 00',
    statut: 'actif',
    isActive: true,
    createdAt: '2026-01-01',
    lastLoginAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'USR-003',
    email: 'fournisseur@ldf.ci',
    firstName: 'LDF',
    lastName: 'Groupe',
    nom: 'Groupe LDF',
    prenom: 'Librairie de France',
    role: 'fournisseur',
    fournisseurId: 'FOUR-LDF-001',
    organisationId: 'FOUR-LDF-001',
    organisationName: 'Librairie de France Groupe',
    telephone: '+225 07 02 00 00 00',
    phone: '+225 07 02 00 00 00',
    statut: 'actif',
    isActive: true,
    createdAt: '2026-01-01',
    lastLoginAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
  },
  {
    id: 'USR-004',
    email: 'client@viflo.ci',
    firstName: 'Mamadou',
    lastName: 'Coulibaly',
    nom: 'Coulibaly',
    prenom: 'Mamadou',
    role: 'souscripteur',
    organisationName: 'Particulier',
    telephone: '+225 07 01 11 22 33',
    phone: '+225 07 01 11 22 33',
    statut: 'actif',
    isActive: true,
    createdAt: '2026-01-05',
    lastLoginAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'USR-OWNER-001',
    email: 'owner@viflo.ci',
    firstName: 'Propriétaire',
    lastName: '',
    nom: '',
    prenom: 'Propriétaire',
    role: 'owner',
    organisationName: 'LDF Groupe',
    telephone: '+225 07 00 00 00 01',
    phone: '+225 07 00 00 00 01',
    statut: 'inactif',
    isActive: false,
    createdAt: '2026-01-01',
    lastLoginAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

const SEED_CONNEXIONS_LOGS: VConnexionLog[] = [
  {
    id: 'LOG-001',
    userId: 'USR-001',
    userName: 'Administrateur',
    email: 'admin@viflo.ci',
    role: 'admin',
    date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    ip: '192.168.1.10 (Abidjan)',
    appareil: 'Chrome / Windows 11',
    statut: 'succes',
  },
  {
    id: 'LOG-002',
    userId: 'USR-OWNER-001',
    userName: 'Propriétaire',
    email: 'owner@viflo.ci',
    role: 'owner',
    date: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    ip: '192.168.1.15 (Abidjan)',
    appareil: 'Chrome / Windows 11',
    statut: 'succes',
  },
  {
    id: 'LOG-003',
    userId: 'USR-002',
    userName: 'Abdoulaye Traoré',
    email: 'banque@afgbank.ci',
    role: 'banque',
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    ip: '10.0.4.82 (Agence Plateau)',
    appareil: 'Edge / Windows 10',
    statut: 'succes',
  },
  {
    id: 'LOG-004',
    userId: 'USR-003',
    userName: 'Librairie de France Groupe',
    email: 'fournisseur@ldf.ci',
    role: 'fournisseur',
    date: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    ip: '160.154.21.90 (Abidjan)',
    appareil: 'Chrome / MacOS',
    statut: 'succes',
  },
  {
    id: 'LOG-005',
    userId: 'USR-004',
    userName: 'Mamadou Coulibaly',
    email: 'client@viflo.ci',
    role: 'souscripteur',
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    ip: '41.207.24.11 (Mobile Abidjan)',
    appareil: 'Mobile Safari / iOS',
    statut: 'succes',
  },
];

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
    logo: '/images/ldf.png', agreVitalis: true, dateAgrementVitalis: '2023-01-15', statut: 'actif',
  },
  {
    id: 'FOUR-DRO-002', code: 'DRO', nom: 'Drocolor', raisonSociale: "Drocolor Côte d'Ivoire SARL",
    email: 'info@drocolor.ci', emailCommercial: 'ventes@drocolor.ci',
    telephone: '+225 27 23 45 67 89', telephoneCommercial: '+225 05 06 07 08 09',
    adresse: 'Zone Industrielle de Yopougon', ville: 'Abidjan', quartier: 'Yopougon',
    rccm: 'CI-ABJ-2018-B-45678', secteurActivite: 'Peinture, revêtements bâtiment & carrosserie, étanchéité',
    logo: '/images/drocolor-logo.jfif', agreVitalis: true, dateAgrementVitalis: '2023-03-20', statut: 'actif',
  },
  {
    id: 'FOUR-COM-003', code: 'COMAF', nom: 'COMAFRIQUE', raisonSociale: 'Comafrique Technologies CI',
    email: 'contact@comafrique.ci', emailCommercial: 'b2b@comafrique.ci',
    telephone: '+225 27 21 75 80 00', telephoneCommercial: '+225 07 15 20 25 30',
    adresse: 'Boulevard de Marseille, Treichville', ville: 'Abidjan', quartier: 'Treichville',
    rccm: 'CI-ABJ-2015-B-44332', secteurActivite: 'Technologies, Informatique & Solutions digitales',
    logo: '/images/logo-comafrique.webp', agreVitalis: true, dateAgrementVitalis: '2023-06-10', statut: 'actif',
  },
  {
    id: 'FOUR-INO-004', code: 'INOVIM', nom: 'INOVIM', raisonSociale: 'Groupe INOVIM Immobilier',
    email: 'contact@inovim-group.com', emailCommercial: 'projets@inovim-group.com',
    telephone: '+225 27 22 40 85 00', telephoneCommercial: '+225 05 30 40 50 60',
    adresse: 'Cocody Ambassades, Rue des Jardins', ville: 'Abidjan', quartier: 'Cocody',
    rccm: 'CI-ABJ-2019-B-88771', secteurActivite: 'Immobilier, Logement & Aménagement',
    logo: '/images/logo-inovim.jpg', agreVitalis: true, dateAgrementVitalis: '2023-04-15', statut: 'actif',
  },
  {
    id: 'FOUR-KAY-005', code: 'KAYDAN', nom: 'KAYDAN', raisonSociale: 'KAYDAN Groupe',
    email: 'contact@kaydan.ci', emailCommercial: 'immobilier@kaydan.ci',
    telephone: '+225 27 22 48 90 00', telephoneCommercial: '+225 07 88 99 00 11',
    adresse: 'Immeuble Kaydan, Cocody Riviera Golf', ville: 'Abidjan', quartier: 'Cocody',
    rccm: 'CI-ABJ-2014-B-66554', secteurActivite: 'Promotion immobilière, BTP & Construction',
    logo: '/images/logo-kaydan.webp', agreVitalis: true, dateAgrementVitalis: '2023-03-12', statut: 'actif',
  },
  {
    id: 'FOUR-SCD-006', code: 'SOCIDA', nom: 'SOCIDA', raisonSociale: 'Société de Concessionnaires pour l\'Automobile (SOCIDA)',
    email: 'contact@socida.ci', emailCommercial: 'ventes@socida.ci',
    telephone: '+225 27 21 21 40 00', telephoneCommercial: '+225 07 01 02 03 04',
    adresse: 'Boulevard de Marseille, Km 4, Zone 3', ville: 'Abidjan', quartier: 'Treichville',
    rccm: 'CI-ABJ-2010-B-11998', secteurActivite: 'Automobile, Véhicules neufs, Utilitaires & Pièces',
    logo: '/images/logo-socida.jpg', agreVitalis: true, dateAgrementVitalis: '2023-01-18', statut: 'actif',
  },
  {
    id: 'FOUR-RYM-007', code: 'RYMCO', nom: 'RYMCO', raisonSociale: 'RYMCO Côte d\'Ivoire',
    email: 'b2b@rymco.ci', emailCommercial: 'commercial@rymco.ci',
    telephone: '+225 27 21 25 00 00', telephoneCommercial: '+225 05 44 55 66 77',
    adresse: 'Zone Industrielle de Vridi', ville: 'Abidjan', quartier: 'Treichville',
    rccm: 'CI-ABJ-2017-B-90123', secteurActivite: 'Automobile, Deux-roues, Équipements & Matériel',
    logo: '/images/logo_rymco.jpg', agreVitalis: true, dateAgrementVitalis: '2023-02-28', statut: 'actif',
  },
  {
    id: 'FOUR-LG-008', code: 'LG', nom: 'LG', raisonSociale: 'LG Electronics Côte d\'Ivoire',
    email: 'contact@lg-ci.com', emailCommercial: 'b2b@lg-ci.com',
    telephone: '+225 27 21 75 00 00', telephoneCommercial: '+225 07 10 20 30 40',
    adresse: 'Boulevard Valéry Giscard d\'Estaing', ville: 'Abidjan', quartier: 'Marcory',
    rccm: 'CI-ABJ-2016-B-55443', secteurActivite: 'Électroménager, Climatisation & Électronique',
    logo: '/images/logo_lg.webp', agreVitalis: true, dateAgrementVitalis: '2023-05-12', statut: 'actif',
  },
  {
    id: 'FOUR-SOD-009', code: 'SODIMAC', nom: 'SODIMAC', raisonSociale: 'SODIMAC CI',
    email: 'contact@sodimac.ci', emailCommercial: 'ventes@sodimac.ci',
    telephone: '+225 27 21 24 50 00', telephoneCommercial: '+225 05 11 22 33 44',
    adresse: 'Boulevard de Marseille, Zone 3', ville: 'Abidjan', quartier: 'Treichville',
    rccm: 'CI-ABJ-2014-B-88776', secteurActivite: 'Matériaux de construction, Cimenterie & Aménagement',
    logo: '/images/logo_sodimac_ci.jpg', agreVitalis: true, dateAgrementVitalis: '2023-04-18', statut: 'actif',
  },
  {
    id: 'FOUR-SOC-010', code: 'SOCIAM', nom: 'SOCIAM', raisonSociale: 'Société Ivoirienne d\'Appareillage Ménager (SOCIAM)',
    email: 'contact@sociam.ci', emailCommercial: 'corporate@sociam.ci',
    telephone: '+225 27 21 28 88 88', telephoneCommercial: '+225 07 99 88 77 66',
    adresse: 'Zone Industrielle de Koumassi', ville: 'Abidjan', quartier: 'Koumassi',
    rccm: 'CI-ABJ-2011-B-33221', secteurActivite: 'Électroménager, Image & Son, Froid',
    logo: '/images/sociam_logo.webp', agreVitalis: true, dateAgrementVitalis: '2023-01-22', statut: 'actif',
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
      { fournisseurId: 'FOUR-COM-003', fournisseurNom: 'COMAFRIQUE', statut: 'en_attente' },
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
    fournisseurs: [{ fournisseurId: 'FOUR-INO-004', fournisseurNom: 'INOVIM', statut: 'en_attente' }],
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
    montantTotal: 975000, duree: 36, statut: 'livre',
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
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '60 jours',
    statut: 'valide', dateCreation: oneWeekAgo, dateExpiration: today, dateValidation: twoDaysAgo, dateMiseAJour: twoDaysAgo,
  },
  {
    id: 'DEV-002', reference: 'DEV-2026-002', souscriptionId: 'SOUS-002', souscriptionRef: 'VF-2026-002',
    souscripteurNom: 'TOURÉ', souscripteurPrenom: 'Aminata',
    fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank',
    articles: [
      { id: 'ART-006', designation: 'Peinture Acrylique Extérieure Drocolor (Fût 25kg)', quantite: 8, prixUnitaire: 45000, remise: 5, montantHT: 342000 },
      { id: 'ART-007', designation: 'Sous-couche Primaire d\'Accrochage Façade (20L)', quantite: 4, prixUnitaire: 38000, remise: 0, montantHT: 152000 },
      { id: 'ART-008', designation: 'Kit outillage peintre Pro (Rouleaux, Brosses, Bâches)', quantite: 4, prixUnitaire: 39000, remise: 0, montantHT: 156000 },
    ],
    totalHT: 650000, tva: 0, totalTTC: 650000,
    conditions: "Livraison franco de port à l'adresse du client.",
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '60 jours',
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
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '60 jours',
    statut: 'en_attente_validation', dateCreation: twoDaysAgo, dateExpiration: today, dateMiseAJour: twoDaysAgo,
  },
  {
    id: 'DEV-005', reference: 'DEV-2026-005', souscriptionId: 'SOUS-005', souscriptionRef: 'VF-2026-005',
    souscripteurNom: 'ASSI', souscripteurPrenom: 'Brice',
    fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor',
    banqueId: 'AFG-001', banqueNom: 'AFG Bank',
    articles: [
      { id: 'ART-009', designation: 'Peinture Façade Hydrofuge Drocolor Pro 25L', quantite: 8, prixUnitaire: 65000, remise: 5, montantHT: 494000 },
      { id: 'ART-010', designation: 'Peinture Émulsion Intérieure Blanche Drocolor 20L', quantite: 8, prixUnitaire: 40000, remise: 0, montantHT: 320000 },
      { id: 'ART-011', designation: 'Enduit de lissage & garnissage Façade Pro', quantite: 6, prixUnitaire: 26833, remise: 0, montantHT: 161000 },
    ],
    totalHT: 975000, tva: 0, totalTTC: 975000,
    conditions: 'Garantie constructeur 2 ans incluse. Livraison à domicile.',
    delaiLivraisonAbidjan: '7 jours ouvrés', delaiLivraisonInterieur: '15 jours ouvrés', validiteDevis: '60 jours',
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
    commentaireAFG: 'Dossier conforme aux conditions du programme Vitalis.',
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
    fournisseursNoms: 'LDF Groupe + COMAFRIQUE', devisIds: ['DEV-003'],
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-001',
    montantTotal: 1200000, statut: 'depose_banque',
    dateCreation: today, dateReception: today, dateMiseAJour: today,
  },
  {
    id: 'DOS-004', reference: 'DOS-2026-004', souscriptionId: 'SOUS-005', souscriptionRef: 'VF-2026-005',
    souscripteurId: 'SCP-005', souscripteurNom: 'ASSI', souscripteurPrenom: 'Brice', typeSouscripteur: 'physique',
    fournisseursNoms: 'Drocolor', devisIds: ['DEV-005'],
    banqueId: 'AFG-001', banqueNom: 'AFG Bank', agenceId: 'AGE-AFG-004',
    montantTotal: 975000, statut: 'livre',
    commentaireAFG: 'Financement accordé — Équipements professionnels conformes au programme.',
    dateCreation: oneWeekAgo, dateReception: oneWeekAgo, dateDebutAnalyse: twoDaysAgo, dateValidation: yesterday, dateMiseAJour: yesterday,
  },
];

const DEMO_PAIEMENTS: VPaiement[] = [
  {
    id: 'PAY-001',
    reference: 'PAY-2026-001',
    souscriptionId: 'SOUS-005',
    souscriptionRef: 'VF-2026-005',
    dossierId: 'DOS-004',
    dossierRef: 'DOS-2026-004',
    souscripteurNom: 'ASSI Brice',
    banqueId: 'BNQ-AFG-001',
    banqueNom: 'AFG Bank',
    fournisseurId: 'FOUR-DRO-002',
    fournisseurNom: 'Drocolor',
    montantTotal: 975000,
    repartitionFournisseurs: [{ fournisseurId: 'FOUR-DRO-002', fournisseurNom: 'Drocolor', devisId: 'DEV-005', montant: 975000, statut: 'confirme' }],
    statut: 'servi',
    dateCreation: yesterday,
    dateValidationAFG: yesterday,
    dateTransfert: today,
    dateMiseAJour: today,
  },
  {
    id: 'PAY-002',
    reference: 'PAY-2026-002',
    souscriptionId: 'SOUS-001',
    souscriptionRef: 'VF-2026-001',
    dossierId: 'DOS-001',
    dossierRef: 'DOS-2026-001',
    souscripteurNom: 'KOUASSI Jean-Marc',
    banqueId: 'BNQ-AFG-001',
    banqueNom: 'AFG Bank',
    fournisseurId: 'FOUR-LDF-001',
    fournisseurNom: 'Librairie de France Groupe',
    montantTotal: 850000,
    repartitionFournisseurs: [{ fournisseurId: 'FOUR-LDF-001', fournisseurNom: 'Librairie de France Groupe', devisId: 'DEV-001', montant: 850000, statut: 'confirme' }],
    statut: 'encaisse',
    dateCreation: yesterday,
    dateValidationAFG: yesterday,
    dateTransfert: today,
    dateMiseAJour: today,
  },
  {
    id: 'PAY-003',
    reference: 'PAY-2026-003',
    souscriptionId: 'SOUS-003',
    souscriptionRef: 'VF-2026-003',
    dossierId: 'DOS-003',
    dossierRef: 'DOS-2026-003',
    souscripteurNom: 'KOFFI Amenan Marie',
    banqueId: 'BNQ-AFG-001',
    banqueNom: 'AFG Bank',
    fournisseurId: 'FOUR-LDF-001',
    fournisseurNom: 'Librairie de France Groupe',
    montantTotal: 540000,
    repartitionFournisseurs: [{ fournisseurId: 'FOUR-LDF-001', fournisseurNom: 'Librairie de France Groupe', devisId: 'DEV-003', montant: 540000, statut: 'en_attente' }],
    statut: 'en_cours',
    dateCreation: today,
    dateValidationAFG: today,
    dateMiseAJour: today,
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

  // ── ACTIONS FOURNISSEURS ───────────────────────────────────
  addFournisseur: (data: Partial<VFournisseur>) => VFournisseur;
  updateFournisseur: (id: string, data: Partial<VFournisseur>) => void;
  deleteFournisseur: (id: string) => void;
  getFournisseurById: (id: string) => VFournisseur | undefined;

  // ── ACTIONS AGENCES AFG ────────────────────────────────────
  addAgenceAFG: (data: Partial<VAgenceAFG>) => VAgenceAFG;
  updateAgenceAFG: (id: string, data: Partial<VAgenceAFG>) => void;
  deleteAgenceAFG: (id: string) => void;
  getAgenceAFGById: (id: string) => VAgenceAFG | undefined;

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
  getPaiementById: (id: string) => VPaiement | undefined;
  getPaiementBySouscription: (souscriptionId: string) => VPaiement | undefined;
  syncMissingPaiements: () => void;

  // ── HISTORIQUE ─────────────────────────────────────────────
  addHistorique: (data: Omit<VHistorique, 'id'>) => void;
  getHistoriqueBySouscription: (souscriptionId: string) => VHistorique[];

  // ── STATS ──────────────────────────────────────────────────
  getStatsAdmin: () => {
    totalSouscriptions: number; souscriptionsEnCours: number; souscriptionsValidees: number;
    totalDevis: number; devisValides: number;
    totalDossiers: number; dossiersEnAnalyse: number; dossiersValides: number; dossiersRejetes: number;
    totalPaiementsEffectues: number;
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
  syncMissingDossiers: () => void;
  reconcilierMontants: () => void;

  // ── UTILISATEURS & TRAÇABILITÉ CONNEXIONS ───────────────────
  users: VUser[];
  connexionsLogs: VConnexionLog[];
  addUser: (data: Partial<VUser>) => VUser;
  updateUser: (id: string, data: Partial<VUser>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => VUser | undefined;
  getUserByEmail: (email: string) => VUser | undefined;
  recordLogin: (email: string, details?: { ip?: string; appareil?: string; statut?: 'succes' | 'echec' }) => void;
  clearConnexionsLogs: () => void;
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
      users: SEED_USERS,
      connexionsLogs: SEED_CONNEXIONS_LOGS,
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
        const state = get();
        if (state._seeded) {
          if (!state.fournisseurs || state.fournisseurs.length === 0) {
            set({ fournisseurs: SEED_FOURNISSEURS });
          }
          if (!state.users || state.users.length === 0) {
            set({ users: SEED_USERS });
          }
          if (!state.connexionsLogs || state.connexionsLogs.length === 0) {
            set({ connexionsLogs: SEED_CONNEXIONS_LOGS });
          }
          return;
        }
        set({
          agencesAFG: SEED_AGENCES_AFG,
          fournisseurs: SEED_FOURNISSEURS,
          pointsRelais: SEED_POINTS_RELAIS,
          souscriptions: DEMO_SOUSCRIPTIONS,
          devis: DEMO_DEVIS,
          dossiers: DEMO_DOSSIERS,
          paiements: DEMO_PAIEMENTS,
          users: SEED_USERS,
          connexionsLogs: SEED_CONNEXIONS_LOGS,
          _seeded: true,
        });
      },

      resetAllData: () => set({
        souscriptions: DEMO_SOUSCRIPTIONS,
        devis: DEMO_DEVIS,
        dossiers: DEMO_DOSSIERS,
        paiements: DEMO_PAIEMENTS,
        historique: [],
        users: SEED_USERS,
        connexionsLogs: SEED_CONNEXIONS_LOGS,
      }),

      syncMissingDossiers: () => {
        const { souscriptions = [], dossiers = [], devis = [] } = get();
        let changed = false;
        const currentDossiers = [...dossiers];
        souscriptions.forEach(s => {
          const exists = currentDossiers.some(d => d.souscriptionId === s.id);
          if (!exists) {
            const devisLies = devis.filter(dev => dev.souscriptionId === s.id);
            currentDossiers.unshift({
              id: `DOS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              reference: s.reference.replace('VF-', 'DOS-').replace('SOUS-', 'DOS-'),
              souscriptionId: s.id,
              souscriptionRef: s.reference,
              souscripteurId: s.souscripteurId,
              souscripteurNom: s.souscripteurNom,
              souscripteurPrenom: s.souscripteurPrenom,
              typeSouscripteur: s.typeSouscripteur || 'physique',
              fournisseursNoms: (s.fournisseurs || []).map(f => f.fournisseurNom).join(', ') || 'Librairie de France Groupe',
              devisIds: devisLies.map(d => d.id),
              banqueId: 'AFG-001',
              banqueNom: 'AFG Bank',
              agenceId: s.agenceId || 'AGE-AFG-001',
              montantTotal: s.montantTotal || devisLies.reduce((acc, d) => acc + (d.totalTTC || 0), 0),
              statut: 'depose_banque',
              dateCreation: s.dateCreation || new Date().toISOString().split('T')[0],
              dateReception: s.dateCreation || new Date().toISOString().split('T')[0],
              dateMiseAJour: new Date().toISOString().split('T')[0],
            });
            changed = true;
          }
        });
        if (changed) {
          set({ dossiers: currentDossiers });
        }
      },

      // ── FOURNISSEURS ──────────────────────────────────────────
      addFournisseur: (data) => {
        const id = data.id || `FOUR-${Date.now()}`;
        const newF: VFournisseur = {
          id,
          code: data.code || (data.nom ? data.nom.substring(0, 6).toUpperCase().replace(/\s/g, '') : 'FOUR'),
          nom: data.nom || 'Nouveau Fournisseur',
          raisonSociale: data.raisonSociale || data.nom || 'Fournisseur',
          nomDirecteur: data.nomDirecteur || '',
          email: data.email || '',
          telephone: data.telephone || '',
          adresse: data.adresse || '',
          ville: data.ville || 'Abidjan',
          region: data.region || 'District Autonome d\'Abidjan',
          rccm: data.rccm || '',
          compteContribuable: data.compteContribuable || '',
          situationJuridique: data.situationJuridique || 'SARL',
          nombreEmployes: Number(data.nombreEmployes || 1),
          dureePartenariatAFG: Number(data.dureePartenariatAFG || 12),
          numeroContratAFG: data.numeroContratAFG || '',
          statut: data.statut || 'prospect',
          agreVitalis: data.statut === 'actif' || data.statut === 'agree',
          nombreSouscriptions: data.nombreSouscriptions || 0,
          montantTotal: data.montantTotal || 0,
          secteurActivite: data.secteurActivite || 'Commerce général & distribution',
          dateAgrementVitalis: (data.statut === 'actif' || data.statut === 'agree') ? new Date().toISOString().split('T')[0] : undefined,
          ...data,
        };
        set(s => ({ fournisseurs: [newF, ...s.fournisseurs] }));
        return newF;
      },

      updateFournisseur: (id, data) => set(s => ({
        fournisseurs: s.fournisseurs.map(f => {
          if (f.id === id) {
            const next = { ...f, ...data };
            if (data.statut) {
              next.agreVitalis = data.statut === 'actif' || data.statut === 'agree';
              if (next.agreVitalis && !next.dateAgrementVitalis) {
                next.dateAgrementVitalis = new Date().toISOString().split('T')[0];
              }
            }
            return next;
          }
          return f;
        }),
      })),

      deleteFournisseur: (id) => set(s => ({
        fournisseurs: s.fournisseurs.filter(f => f.id !== id),
      })),

      getFournisseurById: (id) => get().fournisseurs.find(f => f.id === id),

      // ── AGENCES AFG ──────────────────────────────────────────
      addAgenceAFG: (data) => {
        const id = data.id || `AGE-AFG-${String(get().agencesAFG.length + 1).padStart(3, '0')}`;
        const newAg: VAgenceAFG = {
          id,
          code: data.code || `AFG-${(data.nom || 'AGC').substring(0, 3).toUpperCase().replace(/\s/g, '')}`,
          nom: data.nom || 'Nouvelle Agence AFG',
          ville: data.ville || 'Abidjan',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          email: data.email || '',
          responsable: data.responsable || '',
          statut: data.statut || 'actif',
          ...data,
        };
        set(s => ({ agencesAFG: [...s.agencesAFG, newAg] }));
        return newAg;
      },

      updateAgenceAFG: (id, data) => set(s => ({
        agencesAFG: s.agencesAFG.map(a => a.id === id ? { ...a, ...data } : a),
      })),

      deleteAgenceAFG: (id) => set(s => ({
        agencesAFG: s.agencesAFG.filter(a => a.id !== id),
      })),

      getAgenceAFGById: (id) => get().agencesAFG.find(a => a.id === id),

      // ── SOUSCRIPTIONS ───────────────────────────────────────
      addSouscription: (data) => {
        const newItem: VSouscription = {
          ...data,
          id: `SOUS-${Date.now()}`,
        };
        set(s => ({
          souscriptions: [newItem, ...s.souscriptions],
        }));
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
          const fournisseurs = (sous.fournisseurs || []).map(f =>
            f.fournisseurId === data.fournisseurId ? { ...f, devisId: newItem.id, statut: 'devis_cree' as const } : f
          );

          // Calcul réel : Somme de tous les devis associés à cette souscription (y compris le nouveau devis)
          const autresDevis = get().devis.filter(d => d.souscriptionId === data.souscriptionId && d.id !== newItem.id);
          const tousDevisSous = [newItem, ...autresDevis];
          const sommeDevisTTC = tousDevisSous.reduce((acc, d) => acc + (Number(d.totalTTC) || 0), 0);
          const montantTotal = sommeDevisTTC > 0 ? sommeDevisTTC : (data.totalTTC || 0);

          const tousDevisSoumis = fournisseurs.every(f => !!f.devisId);

          if (tousDevisSoumis) {
            get().updateSouscription(sous.id, {
              fournisseurs,
              montantTotal,
              statut: 'depose_banque',
            });

            // Vérifier si un dossier existe déjà pour éviter les doublons et synchroniser son montant
            const dossierExistant = get().dossiers.find(d => d.souscriptionId === sous.id);
            if (dossierExistant) {
              get().updateDossier(dossierExistant.id, {
                montantTotal,
                montant: montantTotal,
                devisIds: fournisseurs.map(f => f.devisId as string).filter(Boolean),
                fournisseursNoms: fournisseurs.map(f => f.fournisseurNom).join(', '),
                statut: 'depose_banque',
              });
            } else {
              get().addDossier({
                reference: get().generateRef('DOS'),
                souscriptionId: sous.id,
                souscriptionRef: sous.reference,
                souscripteurId: sous.souscripteurId,
                souscripteurNom: sous.souscripteurNom,
                souscripteurPrenom: sous.souscripteurPrenom,
                typeSouscripteur: sous.typeSouscripteur,
                fournisseursNoms: fournisseurs.map(f => f.fournisseurNom).join(', '),
                fournisseurNom: fournisseurs.map(f => f.fournisseurNom).join(', '),
                devisIds: fournisseurs.map(f => f.devisId as string).filter(Boolean),
                banqueId: 'AFG-001',
                banqueNom: 'AFG Bank',
                agenceId: sous.agenceId || 'AGE-AFG-001',
                montantTotal,
                montant: montantTotal,
                statut: 'depose_banque',
                dateCreation: new Date().toISOString().split('T')[0],
                dateReception: new Date().toISOString().split('T')[0],
                dateMiseAJour: new Date().toISOString().split('T')[0],
              });
            }
          } else {
            get().updateSouscription(sous.id, {
              fournisseurs,
              montantTotal,
              statut: 'pret_pour_depot',
            });
            const dossierExistant = get().dossiers.find(d => d.souscriptionId === sous.id);
            if (dossierExistant) {
              get().updateDossier(dossierExistant.id, {
                montantTotal,
                montant: montantTotal,
              });
            }
          }
        }
        get().addHistorique({
          souscriptionId: data.souscriptionId,
          action: 'devis_cree',
          description: `Devis ${data.reference} soumis par ${data.fournisseurNom}`,
          date: new Date().toISOString(),
        });
        return newItem;
      },

      updateDevis: (id, data) => {
        set(s => ({
          devis: s.devis.map(item =>
            item.id === id ? { ...item, ...data, dateMiseAJour: new Date().toISOString().split('T')[0] } : item
          ),
        }));
        const devisModifie = get().devis.find(d => d.id === id);
        if (devisModifie && devisModifie.souscriptionId) {
          const tousDevis = get().devis.filter(d => d.souscriptionId === devisModifie.souscriptionId);
          const montantTotalReel = tousDevis.reduce((acc, d) => acc + (Number(d.totalTTC) || 0), 0);
          if (montantTotalReel > 0) {
            get().updateSouscription(devisModifie.souscriptionId, { montantTotal: montantTotalReel });
            const dossier = get().dossiers.find(d => d.souscriptionId === devisModifie.souscriptionId);
            if (dossier) {
              get().updateDossier(dossier.id, { montantTotal: montantTotalReel, montant: montantTotalReel });
            }
          }
        }
      },

      deleteDevis: (id) => set(s => ({ devis: s.devis.filter(d => d.id !== id) })),

      getDevisById: (id) => get().devis.find(d => d.id === id),

      getDevisBySouscription: (souscriptionId) =>
        get().devis.filter(d => d.souscriptionId === souscriptionId),

      getDevisByFournisseur: (fournisseurId) =>
        get().devis.filter(d => d.fournisseurId === fournisseurId),

      // ── DOSSIERS ─────────────────────────────────────────────
      addDossier: (data) => {
        const newItem: VDossier = {
          ...data,
          id: `DOS-${Date.now()}`,
          montant: data.montant || data.montantTotal || 0,
          montantTotal: data.montantTotal || data.montant || 0,
          fournisseurNom: data.fournisseurNom || data.fournisseursNoms,
          fournisseursNoms: data.fournisseursNoms || data.fournisseurNom || 'Librairie de France Groupe',
        };
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

      getPaiementById: (id) =>
        get().paiements.find(p => p.id === id || p.reference === id),

      getPaiementBySouscription: (souscriptionId) =>
        get().paiements.find(p => p.souscriptionId === souscriptionId),

      syncMissingPaiements: () => {
        const { souscriptions = [], paiements = [], devis = [], dossiers = [] } = get();
        let changed = false;
        const currentPaiements = [...paiements];

        DEMO_PAIEMENTS.forEach(dp => {
          if (!currentPaiements.some(p => p.id === dp.id || p.reference === dp.reference)) {
            currentPaiements.push(dp);
            changed = true;
          }
        });

        souscriptions.forEach(s => {
          if (['fournisseur_paye', 'commande_en_preparation', 'livre', 'servie', 'cloture'].includes(s.statut)) {
            const hasPayment = currentPaiements.some(p => p.souscriptionId === s.id);
            if (!hasPayment) {
              const devisLie = devis.find(d => d.souscriptionId === s.id);
              const dossierLie = dossiers.find(d => d.souscriptionId === s.id);
              const mnt = s.montantTotal || devisLie?.totalTTC || 0;
              const refP = `PAY-2026-${String(currentPaiements.length + 1).padStart(3, '0')}`;
              currentPaiements.unshift({
                id: `PAY-${Date.now()}-${s.id}`,
                reference: refP,
                souscriptionId: s.id,
                souscriptionRef: s.reference,
                dossierId: dossierLie?.id || '',
                dossierRef: dossierLie?.reference || '',
                souscripteurNom: `${s.souscripteurPrenom || ''} ${s.souscripteurNom || ''}`.trim(),
                banqueId: 'BNQ-AFG-001',
                banqueNom: s.banqueNom || 'AFG Bank',
                fournisseurId: devisLie?.fournisseurId || 'FOUR-LDF-001',
                fournisseurNom: devisLie?.fournisseurNom || s.fournisseurNom || 'Librairie de France Groupe',
                montantTotal: mnt,
                repartitionFournisseurs: [
                  {
                    fournisseurId: devisLie?.fournisseurId || 'FOUR-LDF-001',
                    fournisseurNom: devisLie?.fournisseurNom || s.fournisseurNom || 'Librairie de France Groupe',
                    devisId: devisLie?.id || '',
                    montant: mnt,
                    statut: 'confirme',
                  },
                ],
                statut: ['livre', 'servie', 'cloture'].includes(s.statut) ? 'servi' : 'encaisse',
                dateCreation: s.dateCreation,
                dateValidationAFG: s.dateCreation,
                dateTransfert: s.dateMiseAJour,
                dateMiseAJour: s.dateMiseAJour,
              });
              changed = true;
            }
          }
        });

        currentPaiements.forEach(p => {
          const sub = souscriptions.find(s => s.id === p.souscriptionId);
          if (sub && ['livre', 'servie', 'cloture'].includes(sub.statut) && p.statut !== 'servi') {
            p.statut = 'servi';
            changed = true;
          }
        });

        if (changed) {
          set({ paiements: currentPaiements });
        }
      },

      syncMissingDossiers: () => {
        const { devis = [], dossiers = [] } = get();
        let changed = false;
        const currentDossiers = [...dossiers];

        DEMO_DOSSIERS.forEach(dd => {
          if (!currentDossiers.some(d => d.id === dd.id || d.reference === dd.reference)) {
            currentDossiers.push(dd);
            changed = true;
          }
        });

        // Réconciliation stricte des montants des dossiers avec les devis réels
        currentDossiers.forEach(dossier => {
          const linkedDevis = devis.filter(dev =>
            dev.souscriptionId === dossier.souscriptionId || (Array.isArray(dossier.devisIds) && dossier.devisIds.includes(dev.id))
          );
          if (linkedDevis.length > 0) {
            const sumTTC = linkedDevis.reduce((acc, dev) => acc + (Number(dev.totalTTC) || 0), 0);
            if (sumTTC > 0 && (dossier.montantTotal !== sumTTC || dossier.montant !== sumTTC)) {
              dossier.montantTotal = sumTTC;
              dossier.montant = sumTTC;
              changed = true;
            }
          }
        });

        if (changed) {
          set({ dossiers: currentDossiers });
        }
      },

      reconcilierMontants: () => {
        get().syncMissingDossiers();
        get().syncMissingPaiements();
        const { dossiers = [], souscriptions = [], devis = [] } = get();
        let dossiersChanged = false;
        let souscriptionsChanged = false;

        const updatedDossiers = dossiers.map(d => {
          const linkedDevis = devis.filter(dev =>
            dev.souscriptionId === d.souscriptionId || (Array.isArray(d.devisIds) && d.devisIds.includes(dev.id))
          );
          if (linkedDevis.length > 0) {
            const sumTTC = linkedDevis.reduce((acc, dev) => acc + (Number(dev.totalTTC) || 0), 0);
            if (sumTTC > 0 && (d.montantTotal !== sumTTC || d.montant !== sumTTC)) {
              dossiersChanged = true;
              return { ...d, montantTotal: sumTTC, montant: sumTTC };
            }
          }
          return d;
        });

        const updatedSouscriptions = souscriptions.map(s => {
          const linkedDevis = devis.filter(dev => dev.souscriptionId === s.id);
          if (linkedDevis.length > 0) {
            const sumTTC = linkedDevis.reduce((acc, dev) => acc + (Number(dev.totalTTC) || 0), 0);
            if (sumTTC > 0 && s.montantTotal !== sumTTC) {
              souscriptionsChanged = true;
              return { ...s, montantTotal: sumTTC };
            }
          }
          return s;
        });

        if (dossiersChanged || souscriptionsChanged) {
          set({ dossiers: updatedDossiers, souscriptions: updatedSouscriptions });
        }
      },

      // ── HISTORIQUE ───────────────────────────────────────────
      addHistorique: (data) => set(s => ({
        historique: [{ ...data, id: `HIST-${Date.now()}` }, ...s.historique],
      })),

      getHistoriqueBySouscription: (souscriptionId) =>
        get().historique.filter(h => h.souscriptionId === souscriptionId),

      // ── STATS CALCULÉES ──────────────────────────────────────
      getStatsAdmin: () => {
        get().syncMissingDossiers();
        get().syncMissingPaiements();
        const { souscriptions = [], devis = [], dossiers = [], paiements = [], fournisseurs = [], agencesAFG = [], pointsRelais = [] } = get();
        const statuts_en_cours = ['en_attente', 'soumise', 'en_cours', 'en_preparation', 'pret_pour_depot', 'depose_banque', 'en_analyse_bancaire', 'en_cours_traitement', 'recu'];
        const statuts_valides = ['accepte', 'valide', 'finance', 'fournisseur_paye', 'commande_en_preparation', 'livre', 'servie', 'cloture'];
        const statuts_rejetes = ['refuse', 'rejete'];
        const statuts_paiement_effectue = ['termine', 'encaisse', 'servi', 'fournisseur_paye', 'confirme'];

        const dossiersValidesCount = (dossiers || []).filter(d => statuts_valides.includes(d.statut)).length;
        const dossiersRejetesCount = (dossiers || []).filter(d => statuts_rejetes.includes(d.statut)).length;
        const paiementsEffectues = (paiements || []).filter(p => statuts_paiement_effectue.includes(p.statut));

        return {
          totalSouscriptions: (souscriptions || []).length,
          souscriptionsEnCours: (souscriptions || []).filter(s => statuts_en_cours.includes(s.statut)).length,
          souscriptionsValidees: (souscriptions || []).filter(s => statuts_valides.includes(s.statut)).length,
          totalDevis: (devis || []).length,
          devisValides: (devis || []).filter(d => d.statut === 'valide').length,
          totalDossiers: (dossiers || []).length,
          dossiersEnAnalyse: (dossiers || []).filter(d => d.statut === 'en_analyse_bancaire' || d.statut === 'depose_banque' || d.statut === 'en_analyse').length,
          dossiersValides: dossiersValidesCount,
          dossiersRejetes: dossiersRejetesCount,
          totalPaiementsEffectues: paiementsEffectues.length,
          montantTotalSouscriptions: (souscriptions || []).reduce((acc, s) => acc + (s.montantTotal || 0), 0),
          montantTotalPaiements: paiementsEffectues.reduce((acc, p) => acc + (p.montantTotal || p.montant || 0), 0),
          totalFournisseurs: (fournisseurs || []).length,
          totalAgences: (agencesAFG || []).length,
          totalRelais: (pointsRelais || []).length,
        };
      },

      getStatsFournisseur: (fournisseurId) => {
        const { souscriptions = [], devis = [], dossiers = [] } = get();
        const statuts_valides = ['accepte', 'valide', 'finance', 'fournisseur_paye', 'commande_en_preparation', 'livre', 'servie', 'cloture'];
        const mesSouscriptions = (souscriptions || []).filter(s =>
          Array.isArray(s.fournisseurs) && s.fournisseurs.some(f => f.fournisseurId === fournisseurId)
        );
        const mesDevis = (devis || []).filter(d => d.fournisseurId === fournisseurId);
        const mesDossiers = (dossiers || []).filter(d => {
          const ids = Array.isArray(d.devisIds) ? d.devisIds : (d.devisId ? [d.devisId] : []);
          return ids.length > 0 && mesDevis.some(dev => ids.includes(dev.id));
        });
        return {
          mesSouscriptions: mesSouscriptions.length,
          mesDevis: mesDevis.length,
          mesDossiersValides: mesDossiers.filter(d => statuts_valides.includes(d.statut)).length,
          montantTotal: mesDevis.filter(d => d.statut === 'valide').reduce((acc, d) => acc + (d.totalTTC || 0), 0),
        };
      },

      getStatsBanque: () => {
        get().syncMissingDossiers();
        get().syncMissingPaiements();
        const { dossiers = [] } = get();
        const validDossiers = dossiers.filter(d => d.devisIds && d.devisIds.length > 0 && d.montantTotal > 0);
        const statuts_valides = ['accepte', 'valide', 'finance', 'fournisseur_paye', 'commande_en_preparation', 'livre', 'servie', 'cloture'];
        const statuts_rejetes = ['refuse', 'rejete'];
        const total = validDossiers.length;
        const valides = validDossiers.filter(d => statuts_valides.includes(d.statut)).length;
        const rejetes = validDossiers.filter(d => statuts_rejetes.includes(d.statut)).length;
        return {
          dossiersRecus: total,
          dossiersEnTraitement: validDossiers.filter(d => d.statut === 'en_analyse_bancaire' || d.statut === 'depose_banque' || d.statut === 'en_analyse').length,
          dossiersValides: valides,
          dossiersRejetes: rejetes,
          montantTotal: validDossiers.filter(d => statuts_valides.includes(d.statut)).reduce((acc, d) => acc + (d.montantTotal || d.montant || 0), 0),
          tauxApprobation: total > 0 ? Math.round((valides / total) * 100) : 0,
        };
      },

      // ── IMPLÉMENTATION UTILISATEURS & TRAÇABILITÉ CONNEXIONS ─────
      addUser: (data) => {
        const state = get();
        const currentUsers = state.users && state.users.length > 0 ? state.users : SEED_USERS;
        const id = data.id || `USR-${String(currentUsers.length + 1).padStart(3, "0")}`;
        const newUser: VUser = {
          id,
          firstName: data.firstName || data.prenom || "",
          lastName: data.lastName || data.nom || "",
          nom: data.nom || data.lastName || "",
          prenom: data.prenom || data.firstName || "",
          email: data.email || "",
          role: data.role || "fournisseur",
          telephone: data.telephone || data.phone || "",
          phone: data.telephone || data.phone || "",
          organisationId: data.organisationId,
          organisationName: data.organisationName || "LDF Groupe",
          statut: data.statut || (data.isActive === false ? "inactif" : "actif"),
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt || new Date().toISOString().split("T")[0],
          lastLoginAt: data.lastLoginAt,
        };
        set({ users: [...currentUsers, newUser] });
        return newUser;
      },

      updateUser: (id, data) => set(state => {
        const currentUsers = state.users && state.users.length > 0 ? state.users : SEED_USERS;
        return {
          users: currentUsers.map(u => {
            if (u.id !== id) return u;
            const updated = { ...u, ...data };
            if (data.firstName !== undefined) updated.prenom = data.firstName;
            if (data.lastName !== undefined) updated.nom = data.lastName;
            if (data.prenom !== undefined) updated.firstName = data.prenom;
            if (data.nom !== undefined) updated.lastName = data.nom;
            if (data.isActive !== undefined) updated.statut = data.isActive ? "actif" : "inactif";
            return updated;
          })
        };
      }),

      deleteUser: (id) => set(state => {
        const currentUsers = state.users && state.users.length > 0 ? state.users : SEED_USERS;
        return {
          users: currentUsers.filter(u => u.id !== id)
        };
      }),

      getUserById: (id) => {
        const currentUsers = get().users && get().users.length > 0 ? get().users : SEED_USERS;
        return currentUsers.find(u => u.id === id);
      },

      getUserByEmail: (email) => {
        const currentUsers = get().users && get().users.length > 0 ? get().users : SEED_USERS;
        return currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      },

      recordLogin: (email, details) => {
        const now = new Date().toISOString();
        const statut = details?.statut ?? 'succes';
        const ip = details?.ip ?? '127.0.0.1 (Abidjan)';
        const appareil = details?.appareil ?? (typeof window !== 'undefined' && navigator.userAgent.includes('Win') ? 'Chrome / Windows 11' : 'Navigateur Web');

        set(state => {
          const currentUsers = state.users && state.users.length > 0 ? state.users : SEED_USERS;
          const userIdx = currentUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
          let userName = email;
          let userRole = 'inconnu';
          let userId = 'USR-ANON';

          let updatedUsers = [...currentUsers];
          if (userIdx !== -1) {
            const u = currentUsers[userIdx];
            userName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.nom || email;
            userRole = u.role;
            userId = u.id;
            updatedUsers[userIdx] = {
              ...u,
              lastLoginAt: now,
            };
          }

          const newLog: VConnexionLog = {
            id: `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
            userId,
            userName,
            email,
            role: userRole,
            date: now,
            ip,
            appareil,
            statut,
          };

          const currentLogs = state.connexionsLogs && state.connexionsLogs.length > 0 ? state.connexionsLogs : SEED_CONNEXIONS_LOGS;

          return {
            users: updatedUsers,
            connexionsLogs: [newLog, ...currentLogs],
          };
        });
      },

      clearConnexionsLogs: () => set({ connexionsLogs: [] }),
    }),
    {
      name: 'vitalis-db-v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => { }, removeItem: () => { } })),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.reconcilierMontants?.();
        }
      },
      partialize: (state) => ({
        fournisseurs: state.fournisseurs,
        agencesAFG: state.agencesAFG,
        pointsRelais: state.pointsRelais,
        souscriptions: state.souscriptions,
        devis: state.devis,
        dossiers: state.dossiers,
        paiements: state.paiements,
        historique: state.historique,
        users: state.users,
        connexionsLogs: state.connexionsLogs,
        _seeded: state._seeded,
      }),
    }
  )
);
