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
    smartTechno: "/images/logo-smart-techno.png",
    nasko: "/images/logo-nasko.png",
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
 * Liste officielle des 8 fournisseurs agréés Vitalis
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
    secteurActivite: "Matériel informatique et électronique",
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
    id: "FOUR-SMT-003",
    code: "SMART",
    nom: "SMART TECHNOLOGIE",
    raisonSociale: "Smart Technologie CI SA",
    secteurActivite: "Informatique et solutions digitales",
    logo: IMAGES.partners.smartTechno,
    adresse: "Rue des Jardins, Plateau",
    ville: "Abidjan",
    quartier: "Plateau",
    telephone: "+225 27 20 12 34 56",
    email: "contact@smarttech.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-NAS-004",
    code: "NASCO",
    nom: "NASCO",
    raisonSociale: "NASCO Distribution SARL",
    secteurActivite: "Électroménager, meubles et équipements",
    logo: IMAGES.partners.nasko,
    adresse: "Boulevard de Marseille, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 98 76 54",
    email: "info@nasko.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-RYM-005",
    code: "RYMCO",
    nom: "RYMCO",
    raisonSociale: "RYMCO Côte d'Ivoire",
    secteurActivite: "Équipements, matériel & quincaillerie",
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
    id: "FOUR-LG-006",
    code: "LG",
    nom: "LG",
    raisonSociale: "LG Electronics Côte d'Ivoire",
    secteurActivite: "Électroménager et électronique grand public",
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
    id: "FOUR-SOD-007",
    code: "SODIMAC",
    nom: "SODIMAC",
    raisonSociale: "SODIMAC CI",
    secteurActivite: "Matériaux, outillage et aménagement maison",
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
    id: "FOUR-SOC-008",
    code: "SOCIAM",
    nom: "SOCIAM",
    raisonSociale: "Société Ivoirienne d'Appareillage Ménager (SOCIAM)",
    secteurActivite: "Électroménager, image & son, froid",
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

  if (query.includes("ldf") || query.includes("librairie")) {
    return IMAGES.partners.ldf;
  }
  if (query.includes("dro") || query.includes("drocolor")) {
    return IMAGES.partners.drocolor;
  }
  if (query.includes("smt") || query.includes("smart")) {
    return IMAGES.partners.smartTechno;
  }
  if (query.includes("nas") || query.includes("nasko") || query.includes("nasco")) {
    return IMAGES.partners.nasko;
  }
  if (query.includes("soc") || query.includes("sociam")) {
    return IMAGES.partners.sociam;
  }
  if (query.includes("rym") || query.includes("rymco")) {
    return IMAGES.partners.rymco;
  }
  if (query.includes("sod") || query.includes("sodimac")) {
    return IMAGES.partners.sodimac;
  }
  if (query.includes("lg")) {
    return IMAGES.partners.lg;
  }

  return IMAGES.partners.ldf;
}