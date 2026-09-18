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
    logo: "/images/ldf.png",
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
    secteurActivite: "Peinture, revêtements bâtiment & carrosserie, étanchéité",
    logo: "/images/drocolor-logo.jfif",
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
    id: "FOUR-COM-003",
    code: "COMAF",
    nom: "COMAFRIQUE",
    raisonSociale: "Comafrique Technologies CI",
    adresse: "Boulevard de Marseille, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 75 80 00",
    email: "contact@comafrique.ci",
    siteWeb: "https://comafrique.ci",
    rccm: "CI-ABJ-2015-B-33445",
    numeroContribuable: "1533445566",
    secteurActivite: "Technologies, Informatique & Solutions digitales",
    logo: "/images/logo-comafrique.webp",
    agreVitalis: true,
    dateAgrementVitalis: "2023-05-10",
    numeroContratAFG: "CONT-AFG-COM-2023-003",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "M. Denis KANGA",
    emailCommercial: "ventes@comafrique.ci",
    telephoneCommercial: "+225 07 20 21 22 23",
  },
  {
    id: "FOUR-INO-004",
    code: "INOVIM",
    nom: "INOVIM",
    raisonSociale: "Groupe INOVIM Immobilier",
    adresse: "Cocody Ambassades, Rue des Jardins",
    ville: "Abidjan",
    quartier: "Cocody",
    telephone: "+225 27 22 40 85 00",
    email: "contact@inovim-group.com",
    siteWeb: "https://inovim-group.com",
    rccm: "CI-ABJ-2018-B-67890",
    numeroContribuable: "1867890123",
    secteurActivite: "Immobilier, Logement & Aménagement",
    logo: "/images/logo-inovim.jpg",
    agreVitalis: true,
    dateAgrementVitalis: "2023-04-12",
    numeroContratAFG: "CONT-AFG-INO-2023-004",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "Mme Sylvie KOUAME",
    emailCommercial: "b2b@inovim-group.com",
    telephoneCommercial: "+225 05 30 31 32 33",
  },
  {
    id: "FOUR-KAY-005",
    code: "KAYDAN",
    nom: "KAYDAN",
    raisonSociale: "KAYDAN Groupe",
    adresse: "Immeuble Kaydan, Cocody Riviera Golf",
    ville: "Abidjan",
    quartier: "Cocody",
    telephone: "+225 27 22 48 90 00",
    email: "contact@kaydan.ci",
    siteWeb: "https://kaydan.ci",
    rccm: "CI-ABJ-2016-B-23451",
    numeroContribuable: "1623451789",
    secteurActivite: "Promotion immobilière, BTP & Construction",
    logo: "/images/logo-kaydan.webp",
    agreVitalis: true,
    dateAgrementVitalis: "2023-03-15",
    numeroContratAFG: "CONT-AFG-KAY-2023-005",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "M. Stéphane DIOP",
    emailCommercial: "partenariats@kaydan.ci",
    telephoneCommercial: "+225 07 40 41 42 43",
  },
  {
    id: "FOUR-SCD-006",
    code: "SOCIDA",
    nom: "SOCIDA",
    raisonSociale: "Société de Concessionnaires pour l'Automobile (SOCIDA)",
    adresse: "Boulevard de Marseille, Km 4, Zone 3",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 21 40 00",
    email: "contact@socida.ci",
    siteWeb: "https://socida.ci",
    rccm: "CI-ABJ-1990-B-01234",
    numeroContribuable: "9001234567",
    secteurActivite: "Automobile, Véhicules neufs, Utilitaires & Pièces",
    logo: "/images/logo-socida.jpg",
    agreVitalis: true,
    dateAgrementVitalis: "2023-02-10",
    numeroContratAFG: "CONT-AFG-SCD-2023-006",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "M. Olivier MEITÉ",
    emailCommercial: "flottes@socida.ci",
    telephoneCommercial: "+225 01 50 51 52 53",
  },
  {
    id: "FOUR-RYM-007",
    code: "RYMCO",
    nom: "RYMCO",
    raisonSociale: "RYMCO Côte d'Ivoire",
    adresse: "Zone Industrielle de Vridi",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 25 00 00",
    email: "b2b@rymco.ci",
    rccm: "CI-ABJ-2017-B-90123",
    numeroContribuable: "9988776655",
    secteurActivite: "Automobile, Deux-roues, Équipements & Matériel",
    logo: "/images/logo_rymco.jpg",
    agreVitalis: true,
    dateAgrementVitalis: "2023-02-28",
    numeroContratAFG: "CONT-AFG-RYM-2023-007",
    dureePartenariatVitalis: 20,
    statut: "actif",
    responsableCommercial: "Mme Marie KOUAMÉ",
    emailCommercial: "corporate@rymco.ci",
    telephoneCommercial: "+225 05 44 55 66 77",
  },
  {
    id: "FOUR-LG-008",
    code: "LG",
    nom: "LG",
    raisonSociale: "LG Electronics Côte d'Ivoire",
    adresse: "Boulevard Valéry Giscard d'Estaing",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 75 00 00",
    email: "contact@lg-ci.com",
    rccm: "CI-ABJ-2016-B-55443",
    numeroContribuable: "6655443322",
    secteurActivite: "Électroménager, Climatisation & Électronique",
    logo: "/images/logo_lg.webp",
    agreVitalis: true,
    dateAgrementVitalis: "2023-05-12",
    numeroContratAFG: "CONT-AFG-LG-2023-008",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "M. Charles N'DOUBA",
    emailCommercial: "b2b@lg-ci.com",
    telephoneCommercial: "+225 07 10 20 30 40",
  },
  {
    id: "FOUR-SOD-009",
    code: "SODIMAC",
    nom: "SODIMAC",
    raisonSociale: "SODIMAC CI",
    adresse: "Boulevard de Marseille, Zone 3",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 24 50 00",
    email: "contact@sodimac.ci",
    rccm: "CI-ABJ-2014-B-88776",
    numeroContribuable: "8877665544",
    secteurActivite: "Matériaux de construction, Cimenterie & Aménagement",
    logo: "/images/logo_sodimac_ci.jpg",
    agreVitalis: true,
    dateAgrementVitalis: "2023-04-18",
    numeroContratAFG: "CONT-AFG-SOD-2023-009",
    dureePartenariatVitalis: 18,
    statut: "actif",
    responsableCommercial: "M. Fabrice GUEI",
    emailCommercial: "ventes@sodimac.ci",
    telephoneCommercial: "+225 05 11 22 33 44",
  },
  {
    id: "FOUR-SOC-010",
    code: "SOCIAM",
    nom: "SOCIAM",
    raisonSociale: "Société Ivoirienne d'Appareillage Ménager (SOCIAM)",
    adresse: "Zone Industrielle de Koumassi",
    ville: "Abidjan",
    quartier: "Koumassi",
    telephone: "+225 27 21 28 88 88",
    email: "contact@sociam.ci",
    rccm: "CI-ABJ-2011-B-33221",
    numeroContribuable: "3322110099",
    secteurActivite: "Électroménager, Image & Son, Froid",
    logo: "/images/sociam_logo.webp",
    agreVitalis: true,
    dateAgrementVitalis: "2023-01-22",
    numeroContratAFG: "CONT-AFG-SOC-2023-010",
    dureePartenariatVitalis: 24,
    statut: "actif",
    responsableCommercial: "M. Alain KOFFI",
    emailCommercial: "corporate@sociam.ci",
    telephoneCommercial: "+225 07 99 88 77 66",
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
    if (count !== fournisseurs.length) {
      console.log("ℹ️ Rafraîchissement des fournisseurs officiels Vitalis...");
      await db.fournisseurs.clear();
      await db.fournisseurs.bulkAdd(fournisseurs);
    }

    if (count > 0) {
      console.log("ℹ️ Base de données déjà initialisée");
      return;
    }

    // Insérer les agences AFG
    await db.agencesAFG.bulkAdd(agencesAFG);
    console.log(`✅ ${agencesAFG.length} agences AFG Bank ajoutées`);

    // Insérer les fournisseurs si pas fait
    const fCount = await db.fournisseurs.count();
    if (fCount === 0) {
      await db.fournisseurs.bulkAdd(fournisseurs);
      console.log(`✅ ${fournisseurs.length} fournisseurs ajoutés`);
    }

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
