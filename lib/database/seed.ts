// @ts-nocheck
// lib/database/seed.ts
// Données initiales pour la base de données Vitalis

import type {
  AgenceAFG,
  Fournisseur,
  PointRelais,
  SouscripteurMorale,
  SouscripteurPhysique,
} from "@/types/vitalis";
import { db } from "./db";

// ============================================================
// AGENCES AFG BANK
// ============================================================
const agencesAFG: AgenceAFG[] = [
  {
    id: "AGE-AFG-001",
    code: "AFG-PLT",
    nom: "Agence Plateau",
    adresse: "Avenue Chardy, Immeuble SCIAM, Plateau",
    ville: "Abidjan",
    telephone: "+225 27 20 31 58 00",
    email: "plateau@afgbank.ci",
    responsable: "M. Kouadio KOFFI",
    statut: "actif",
  },
  {
    id: "AGE-AFG-002",
    code: "AFG-COC",
    nom: "Agence Cocody",
    adresse: "Boulevard Latrille, Cocody Angré",
    ville: "Abidjan",
    telephone: "+225 27 22 52 14 00",
    email: "cocody@afgbank.ci",
    responsable: "Mme Aya KONÉ",
    statut: "actif",
  },
  {
    id: "AGE-AFG-003",
    code: "AFG-BKE",
    nom: "Agence Bouaké",
    adresse: "Avenue Gon Coulibaly, Centre-ville",
    ville: "Bouaké",
    telephone: "+225 27 31 63 28 00",
    email: "bouake@afgbank.ci",
    responsable: "M. Souleymane TRAORÉ",
    statut: "actif",
  },
  {
    id: "AGE-AFG-004",
    code: "AFG-YAM",
    nom: "Agence Yamoussoukro",
    adresse: "Boulevard Giscard d'Estaing",
    ville: "Yamoussoukro",
    telephone: "+225 27 30 64 15 00",
    email: "yamoussoukro@afgbank.ci",
    responsable: "M. Jean-Marc BAMBA",
    statut: "actif",
  },
];

// ============================================================
// FOURNISSEURS AGRÉÉS VITALIS
// ============================================================
const fournisseurs: Fournisseur[] = [
  {
    id: "FOUR-LDF-001",
    code: "LDF-CI",
    nom: "Librairie de France Groupe",
    raisonSociale: "Librairie de France Groupe CI",
    adresse: "Boulevard Valéry Giscard d'Estaing, Marcory Zone 4",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 35 75 00",
    email: "contact@ldfgroupe.ci",
    siteWeb: "https://ldfgroupe.ci",
    rccm: "CI-ABJ-2015-B-12345",
    numeroContribuable: "1234567890",
    secteurActivite: "Fournitures scolaires et bureautiques",
    logo: "/logos/ldf-logo.png",
    agreVitalis: true,
    dateAgrementVitalis: "2023-01-15",
    numeroContratAFG: "CONT-AFG-LDF-2023-001",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "M. Konan YAO",
    emailCommercial: "commercial@ldfgroupe.ci",
    telephoneCommercial: "+225 07 08 09 10 11",
  },
  {
    id: "FOUR-DRO-002",
    code: "DROCO",
    nom: "Drocolor",
    raisonSociale: "Drocolor Côte d'Ivoire SARL",
    adresse: "Zone Industrielle de Yopougon",
    ville: "Abidjan",
    quartier: "Yopougon",
    telephone: "+225 27 23 45 67 89",
    email: "info@drocolor.ci",
    siteWeb: "https://drocolor.ci",
    rccm: "CI-ABJ-2018-B-45678",
    numeroContribuable: "0987654321",
    secteurActivite: "Matériel informatique et électronique",
    agreVitalis: true,
    dateAgrementVitalis: "2023-03-20",
    numeroContratAFG: "CONT-AFG-DRO-2023-002",
    dureePartenariatVitalis: 18,
    statut: "actif",
    responsableCommercial: "Mme Adjoua N'GUESSAN",
    emailCommercial: "ventes@drocolor.ci",
    telephoneCommercial: "+225 05 06 07 08 09",
  },
  {
    id: "FOUR-SMT-003",
    code: "SMART",
    nom: "SMART TECHNOLOGIE",
    raisonSociale: "Smart Technologie CI SA",
    adresse: "Rue des Jardins, Plateau",
    ville: "Abidjan",
    quartier: "Plateau",
    telephone: "+225 27 20 12 34 56",
    email: "contact@smarttech.ci",
    rccm: "CI-ABJ-2020-B-78901",
    numeroContribuable: "1122334455",
    secteurActivite: "Informatique et solutions digitales",
    agreVitalis: true,
    dateAgrementVitalis: "2023-06-10",
    numeroContratAFG: "CONT-AFG-SMT-2023-003",
    dureePartenariatVitalis: 12,
    statut: "actif",
    responsableCommercial: "M. Ibrahim DIALLO",
    emailCommercial: "b2b@smarttech.ci",
    telephoneCommercial: "+225 01 52 53 54 55",
  },
  {
    id: "FOUR-NAS-004",
    code: "NASKO",
    nom: "NASKO",
    raisonSociale: "NASKO Distribution SARL",
    adresse: "Boulevard de Marseille, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 98 76 54",
    email: "info@nasko.ci",
    rccm: "CI-ABJ-2019-B-23456",
    numeroContribuable: "5566778899",
    secteurActivite: "Meubles et équipements de bureau",
    agreVitalis: true,
    dateAgrementVitalis: "2023-04-15",
    numeroContratAFG: "CONT-AFG-NAS-2023-004",
    dureePartenariatVitalis: 15,
    statut: "actif",
    responsableCommercial: "M. Koffi KOUASSI",
    emailCommercial: "pro@nasko.ci",
    telephoneCommercial: "+225 07 77 88 99 00",
  },
  {
    id: "FOUR-CAR-005",
    code: "CARRF",
    nom: "CARREFOUR",
    raisonSociale: "Carrefour Côte d'Ivoire",
    adresse: "Centre Commercial Cap Sud, Marcory",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 25 00 00",
    email: "b2b@carrefour.ci",
    rccm: "CI-ABJ-2017-B-90123",
    numeroContribuable: "9988776655",
    secteurActivite: "Grande distribution multi-produits",
    agreVitalis: true,
    dateAgrementVitalis: "2023-02-28",
    numeroContratAFG: "CONT-AFG-CAR-2023-005",
    dureePartenariatVitalis: 20,
    statut: "actif",
    responsableCommercial: "Mme Marie KOUAMÉ",
    emailCommercial: "corporate@carrefour.ci",
    telephoneCommercial: "+225 05 44 55 66 77",
  },
];

// ============================================================
// POINTS RELAIS
// ============================================================
const pointsRelais: PointRelais[] = [
  // ABIDJAN
  {
    id: "REL-ABJ-001",
    nom: "Point Relais Plateau Centre",
    adresse: "Avenue Franchet d'Esperey, près Poste Centrale",
    ville: "Abidjan",
    quartier: "Plateau",
    telephone: "+225 27 20 22 22 22",
    email: "plateau@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-18h, Sam: 8h-13h",
    capaciteStockage: 200,
    responsable: "M. Kofi ASSAMOI",
    coordonneesGPS: { latitude: 5.316667, longitude: -4.016667 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-ABJ-002",
    nom: "Point Relais Cocody Angré",
    adresse: "Carrefour Angré 8ème tranche",
    ville: "Abidjan",
    quartier: "Cocody",
    telephone: "+225 27 22 33 44 55",
    email: "cocody@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-18h, Sam: 8h-13h",
    capaciteStockage: 150,
    responsable: "Mme Akissi BROU",
    coordonneesGPS: { latitude: 5.378889, longitude: -3.978889 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-ABJ-003",
    nom: "Point Relais Marcory Zone 4",
    adresse: "Boulevard VGE, face Pharmacie Bethesda",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 44 55 66",
    email: "marcory@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-18h, Sam: 8h-13h",
    capaciteStockage: 180,
    responsable: "M. Mamadou SANOGO",
    coordonneesGPS: { latitude: 5.291667, longitude: -3.991667 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-ABJ-004",
    nom: "Point Relais Yopougon Maroc",
    adresse: "Face Cité SICOGI, Quartier Maroc",
    ville: "Abidjan",
    quartier: "Yopougon",
    telephone: "+225 27 23 55 66 77",
    email: "yopougon@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-18h, Sam: 8h-13h",
    capaciteStockage: 120,
    responsable: "M. Ibrahim COULIBALY",
    coordonneesGPS: { latitude: 5.345, longitude: -4.082 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-ABJ-005",
    nom: "Point Relais Adjamé 220 logements",
    adresse: "Carrefour 220 logements",
    ville: "Abidjan",
    quartier: "Adjamé",
    telephone: "+225 27 20 66 77 88",
    email: "adjame@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-18h, Sam: 8h-13h",
    capaciteStockage: 100,
    responsable: "Mme Fatou TOURÉ",
    coordonneesGPS: { latitude: 5.361, longitude: -4.023 },
    statut: "actif",
    type: "relais",
  },

  // INTÉRIEUR
  {
    id: "REL-BKE-001",
    nom: "Point Relais Bouaké Centre",
    adresse: "Avenue Gon Coulibaly, près Marché Central",
    ville: "Bouaké",
    quartier: "Centre-ville",
    telephone: "+225 27 31 77 88 99",
    email: "bouake@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-17h, Sam: 8h-12h",
    capaciteStockage: 80,
    responsable: "M. Lassina OUATTARA",
    coordonneesGPS: { latitude: 7.689, longitude: -5.031 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-YAM-001",
    nom: "Point Relais Yamoussoukro",
    adresse: "Boulevard Giscard d'Estaing, près Hôtel Président",
    ville: "Yamoussoukro",
    quartier: "Centre",
    telephone: "+225 27 30 88 99 00",
    email: "yamoussoukro@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-17h, Sam: 8h-12h",
    capaciteStockage: 60,
    responsable: "M. Jean-Claude N'DRI",
    coordonneesGPS: { latitude: 6.827, longitude: -5.277 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-SPD-001",
    nom: "Point Relais San-Pedro",
    adresse: "Avenue du Port, Quartier Bardot",
    ville: "San-Pedro",
    quartier: "Bardot",
    telephone: "+225 27 34 99 00 11",
    email: "sanpedro@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-17h, Sam: 8h-12h",
    capaciteStockage: 50,
    responsable: "M. Assoa GNABRO",
    coordonneesGPS: { latitude: 4.747, longitude: -6.636 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-KOR-001",
    nom: "Point Relais Korhogo",
    adresse: "Route de Ferkessédougou, près Marché",
    ville: "Korhogo",
    quartier: "Centre",
    telephone: "+225 27 36 00 11 22",
    email: "korhogo@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-17h, Sam: 8h-12h",
    capaciteStockage: 40,
    responsable: "M. Bakary SORO",
    coordonneesGPS: { latitude: 9.458, longitude: -5.629 },
    statut: "actif",
    type: "relais",
  },
  {
    id: "REL-DAL-001",
    nom: "Point Relais Daloa",
    adresse: "Boulevard de la République",
    ville: "Daloa",
    quartier: "Centre-ville",
    telephone: "+225 27 32 11 22 33",
    email: "daloa@vitalis-relais.ci",
    horaires: "Lun-Ven: 8h-17h, Sam: 8h-12h",
    capaciteStockage: 45,
    responsable: "Mme Aminata DOUMBIA",
    coordonneesGPS: { latitude: 6.877, longitude: -6.451 },
    statut: "actif",
    type: "relais",
  },
];

// ============================================================
// SOUSCRIPTEURS EXEMPLES (PHYSIQUES)
// ============================================================
const souscripteursPhysiques: SouscripteurPhysique[] = [
  {
    id: "PHY-001",
    nom: "KOUASSI",
    prenom: "Jean-Marc",
    dateNaissance: "1985-03-15",
    cni: "CI8503150987654",
    situationMatrimoniale: "marie",
    situationProfessionnelle: "salarie",
    employeur: "Orange Côte d'Ivoire",
    telephone: "+225 07 12 34 56 78",
    email: "jm.kouassi@example.ci",
    adresse: "Cocody Angré 8ème tranche, Abidjan",
  },
  {
    id: "PHY-002",
    prenom: "Aminata",
    nom: "TOURÉ",
    dateNaissance: "1990-07-22",
    cni: "CI9007221234567",
    situationMatrimoniale: "celibataire",
    situationProfessionnelle: "fonctionnaire",
    employeur: "Ministère de l'Éducation Nationale",
    telephone: "+225 05 23 45 67 89",
    email: "a.toure@education.gouv.ci",
    adresse: "Plateau, Avenue Chardy, Abidjan",
  },
];

// ============================================================
// SOUSCRIPTEURS EXEMPLES (MORALES)
// ============================================================
const souscripteursMorales: SouscripteurMorale[] = [
  {
    id: "MOR-001",
    raisonSociale: "DIGITAL SOLUTIONS CI",
    rccm: "CI-ABJ-2020-B-11223",
    numeroContribuable: "2020112233",
    formeJuridique: "SARL",
    secteurActivite: "Services informatiques",
    nomDirigeant: "M. Kouadio KOUASSI",
    nombreEmployes: 15,
    capitalSocial: 10000000,
    telephone: "+225 27 22 33 44 55",
    email: "contact@digitalsolutions.ci",
    adresse: "Cocody II Plateaux, Abidjan",
  },
];

// ============================================================
// FONCTION SEED
// ============================================================
export async function seedDatabase() {
  try {
    console.log("🌱 Initialisation de la base de données...");

    // Vérifier si déjà initialisée
    const count = await db.fournisseurs.count();
    if (count > 0) {
      console.log("ℹ️ Base de données déjà initialisée");
      return;
    }

    // Insérer les agences AFG
    await db.agencesAFG.bulkAdd(agencesAFG);
    console.log(`✅ ${agencesAFG.length} agences AFG Bank ajoutées`);

    // Insérer les fournisseurs
    await db.fournisseurs.bulkAdd(fournisseurs);
    console.log(`✅ ${fournisseurs.length} fournisseurs ajoutés`);

    // Insérer les points relais
    await db.pointsRelais.bulkAdd(pointsRelais);
    console.log(`✅ ${pointsRelais.length} points relais ajoutés`);

    // Insérer les souscripteurs exemples
    await db.souscripteursPhysiques.bulkAdd(souscripteursPhysiques);
    console.log(`✅ ${souscripteursPhysiques.length} souscripteurs physiques ajoutés`);

    await db.souscripteursMorales.bulkAdd(souscripteursMorales);
    console.log(`✅ ${souscripteursMorales.length} souscripteurs morales ajoutés`);

    console.log("✅ Base de données initialisée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation :", error);
    throw error;
  }
}
