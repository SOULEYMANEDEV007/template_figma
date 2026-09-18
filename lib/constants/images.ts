/**
 * Centralisation de toutes les images et logos de l'application ViFlo / Vitalis.
 * 
 * Avantage : Si un logo ou une image change de nom ou d'emplacement,
 * vous ne le modifiez qu'ici, et tout le projet est automatiquement mis à jour.
 * 
 * @example
 * import { IMAGES } from "@/lib/constants/images";
 * 
 * <Image src={IMAGES.logos.viflo} alt="ViFlo Logo" width={160} height={160} />
 * <img src={IMAGES.logos.afgBank} alt="AFG Bank" />
 */

export const IMAGES = {
  // --- LOGOS OFFICIELS DE L'APPLICATION & INSTITUTIONS ---
  logos: {
    viflo: "/logos/viflo-logo.png",
    vifloNew: "/logos/new_logo-viflo.JPG",
    vifloText: "/logos/logo-viflo-text.png",
    vifloIcon: "/logos/icon-viflo.png",
    vifloDefault: "/images/viflo_logo.png",

    afgBank: "/logos/logo-afg-bank_atlantic.png",
    afgBankJpg: "/logos/LOGO-AFG-Bank.jpg",
    fades: "/logos/logo-fades.PNG",
    ldf: "/images/ldf.png",
  },

  // --- LOGOS DES FOURNISSEURS & PARTENAIRES AGRÉÉS ---
  partners: {
    ldf: "/images/ldf.png",
    drocolor: "/images/drocolor-logo.jfif", // Premier logo Drocolor (fond rouge)
    comafrique: "/images/logo-comafrique.webp",
    inovim: "/images/logo-inovim.jpg",
    kaydan: "/images/logo-kaydan.webp",
    socida: "/images/logo-socida.jpg",
    rymco: "/images/logo_rymco.jpg",
    lg: "/images/logo_lg.webp",
    sodimac: "/images/logo_sodimac_ci.jpg",
    sociam: "/images/sociam_logo.webp",
  },

  // --- PLACEHOLDERS & FALLBACKS ---
  placeholders: {
    avatar: "/images/avatar-placeholder.png",
    logoPlaceholder: "/logos/icon-viflo.png",
  },
} as const;

/**
 * Type strict pour les clés d'images
 */
export type AppImages = typeof IMAGES;

/**
 * Métadonnées d'accessibilité et d'affichage par défaut
 */
export const IMAGE_META = {
  viflo: {
    src: IMAGES.logos.vifloNew,
    alt: "ViFlo - Plateforme de Financement Vitalis",
  },
  afgBank: {
    src: IMAGES.logos.afgBank,
    alt: "AFG Bank - Partenaire Bancaire",
  },
  fades: {
    src: IMAGES.logos.fades,
    alt: "FADES - Fonds d'Appui au Développement Économique et Social",
  },
  ldf: {
    src: IMAGES.logos.ldf,
    alt: "LDF Groupe - Librairie de France",
  },
} as const;

/**
 * Liste officielle des 10 fournisseurs agréés Vitalis
 */
export const OFFICIAL_FOURNISSEURS = [
  {
    id: "FOUR-LDF-001",
    code: "LDF",
    nom: "Librairie de France Groupe",
    raisonSociale: "Librairie de France Groupe CI",
    secteurActivite: "Fournitures scolaires et bureautiques",
    logo: IMAGES.partners.ldf,
    adresse: "Boulevard Valéry Giscard d'Estaing, Marcory Zone 4",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 35 75 00",
    email: "contact@ldfgroupe.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-DRO-002",
    code: "DRO",
    nom: "Drocolor",
    raisonSociale: "Drocolor Côte d'Ivoire SARL",
    secteurActivite: "Peinture bâtiment & carrosserie, revêtements & étanchéité",
    logo: IMAGES.partners.drocolor,
    adresse: "Zone Industrielle de Yopougon",
    ville: "Abidjan",
    quartier: "Yopougon",
    telephone: "+225 27 23 45 67 89",
    email: "info@drocolor.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-COM-003",
    code: "COMAF",
    nom: "COMAFRIQUE",
    raisonSociale: "Comafrique Technologies CI",
    secteurActivite: "Technologies, Informatique & Solutions digitales",
    logo: IMAGES.partners.comafrique,
    adresse: "Boulevard de Marseille, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 75 80 00",
    email: "contact@comafrique.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-INO-004",
    code: "INOVIM",
    nom: "INOVIM",
    raisonSociale: "Groupe INOVIM Immobilier",
    secteurActivite: "Immobilier, Logement & Aménagement",
    logo: IMAGES.partners.inovim,
    adresse: "Cocody Ambassades, Rue des Jardins",
    ville: "Abidjan",
    quartier: "Cocody",
    telephone: "+225 27 22 40 85 00",
    email: "contact@inovim-group.com",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-KAY-005",
    code: "KAYDAN",
    nom: "KAYDAN",
    raisonSociale: "KAYDAN Groupe",
    secteurActivite: "Promotion immobilière, BTP & Construction",
    logo: IMAGES.partners.kaydan,
    adresse: "Immeuble Kaydan, Cocody Riviera Golf",
    ville: "Abidjan",
    quartier: "Cocody",
    telephone: "+225 27 22 48 90 00",
    email: "contact@kaydan.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-SCD-006",
    code: "SOCIDA",
    nom: "SOCIDA",
    raisonSociale: "Société de Concessionnaires pour l'Automobile (SOCIDA)",
    secteurActivite: "Automobile, Véhicules neufs, Utilitaires & Pièces",
    logo: IMAGES.partners.socida,
    adresse: "Boulevard de Marseille, Km 4, Zone 3",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 21 40 00",
    email: "contact@socida.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-RYM-007",
    code: "RYMCO",
    nom: "RYMCO",
    raisonSociale: "RYMCO Côte d'Ivoire",
    secteurActivite: "Automobile, Deux-roues, Équipements & Matériel",
    logo: IMAGES.partners.rymco,
    adresse: "Zone Industrielle de Vridi",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 25 00 00",
    email: "b2b@rymco.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-LG-008",
    code: "LG",
    nom: "LG",
    raisonSociale: "LG Electronics Côte d'Ivoire",
    secteurActivite: "Électroménager, Climatisation & Électronique",
    logo: IMAGES.partners.lg,
    adresse: "Boulevard Valéry Giscard d'Estaing",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 75 00 00",
    email: "contact@lg-ci.com",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-SOD-009",
    code: "SODIMAC",
    nom: "SODIMAC",
    raisonSociale: "SODIMAC CI",
    secteurActivite: "Matériaux de construction, Cimenterie & Aménagement",
    logo: IMAGES.partners.sodimac,
    adresse: "Boulevard de Marseille, Zone 3",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 24 50 00",
    email: "contact@sodimac.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-SOC-010",
    code: "SOCIAM",
    nom: "SOCIAM",
    raisonSociale: "Société Ivoirienne d'Appareillage Ménager (SOCIAM)",
    secteurActivite: "Électroménager, Image & Son, Froid",
    logo: IMAGES.partners.sociam,
    adresse: "Zone Industrielle de Koumassi",
    ville: "Abidjan",
    quartier: "Koumassi",
    telephone: "+225 27 21 28 88 88",
    email: "contact@sociam.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
];

/**
 * Fonction utilitaire pour récupérer le logo d'un fournisseur selon son nom ou ID
 */
export function getPartnerLogo(supplierName?: string, supplierId?: string): string {
  if (!supplierName && !supplierId) return IMAGES.partners.ldf;

  const query = `${supplierName || ""} ${supplierId || ""}`.toLowerCase();

  if (query.includes("ldf") || query.includes("librairie")) return IMAGES.partners.ldf;
  if (query.includes("dro") || query.includes("drocolor")) return IMAGES.partners.drocolor;
  if (query.includes("comafrique") || query.includes("comaf")) return IMAGES.partners.comafrique;
  if (query.includes("inovim")) return IMAGES.partners.inovim;
  if (query.includes("kaydan")) return IMAGES.partners.kaydan;
  if (query.includes("socida")) return IMAGES.partners.socida;
  if (query.includes("soc") || query.includes("sociam")) return IMAGES.partners.sociam;
  if (query.includes("rym") || query.includes("rymco")) return IMAGES.partners.rymco;
  if (query.includes("sod") || query.includes("sodimac")) return IMAGES.partners.sodimac;
  if (query.includes("lg")) return IMAGES.partners.lg;

  return IMAGES.partners.ldf;
}