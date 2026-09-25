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
    drocolor: "/images/drocolor_logo.jpg", // Premier logo Drocolor (fond rouge)
    comafrique: "/images/atc-comafrique-logo.webp",
    atcComafrique: "/images/atc-comafrique-logo.webp",
    inovim: "/images/logo-inovim.jpg",
    kaydan: "/images/logo-kaydan.webp",
    socida: "/images/logo-socida.jpg",
    rymco: "/images/logo_rymco.jpg",
    lg: "/images/logo_lg.webp",
    sodimac: "/images/sodis-mac-logo.webp",
    sodismad: "/images/sodis-mac-logo.webp",
    sociam: "/images/sociam_logo.webp",
    bernabe: "/images/bernabe-ci-logo2.webp", // Second logo Bernabé (fond bleu/texte)
    technibat: "/images/technibat-logo.webp",
    sippec: "/images/sippec-logo.webp",
    oribat: "/images/oribat-logo.webp",
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
 * Liste officielle des fournisseurs agréés Vitalis
 */
export const OFFICIAL_FOURNISSEURS = [
  {
    id: "FOUR-LDF-001",
    code: "LDF",
    nom: "Librairie de France Groupe",
    raisonSociale: "Librairie de France Groupe CI",
    secteurActivite: "Éducation, Fournitures scolaires & bureautiques",
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
    id: "FOUR-SPE-013",
    code: "SIPPEC",
    nom: "SIPPEC",
    raisonSociale: "Société Industrielle de Produits Plastiques et Chimiques (SIPPEC)",
    secteurActivite: "Peinture bâtiment, carrosserie, industrie & plasturgie",
    logo: IMAGES.partners.sippec,
    adresse: "Zone Industrielle de Yopougon",
    ville: "Abidjan",
    quartier: "Yopougon",
    telephone: "+225 27 23 46 62 20",
    email: "contact@sippec.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-ATC-003",
    code: "ATC",
    nom: "ATC Comafrique",
    raisonSociale: "ATC Comafrique CI SA",
    secteurActivite: "Automobile, Véhicules neufs, utilitaires & engins",
    logo: IMAGES.partners.atcComafrique,
    adresse: "Boulevard de Marseille, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 75 80 00",
    email: "contact@atccomafrique.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-RYM-007",
    code: "RYMCO",
    nom: "Rimco",
    raisonSociale: "RYMCO Côte d'Ivoire (Rimco Motors)",
    secteurActivite: "Automobile, Concessionnaire véhicules, deux-roues & pièces",
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
    id: "FOUR-ORI-014",
    code: "ORIBAT",
    nom: "Oribat",
    raisonSociale: "ORIBAT SARL (Organisation Ivoirienne de Bâtiment)",
    secteurActivite: "Logement & Promotion immobilière (Logements économiques & standing, aménagement foncier)",
    logo: IMAGES.partners.oribat,
    adresse: "Cocody Angré, Carrefour les Oscars",
    ville: "Abidjan",
    quartier: "Cocody",
    telephone: "+225 27 22 42 57 87",
    email: "contact@oribat.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-INO-004",
    code: "INOVIM",
    nom: "InOovIm",
    raisonSociale: "Groupe InOovIm Immobilier",
    secteurActivite: "Logement, Promotion immobilière & Aménagement",
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
    nom: "Kaydan Group",
    raisonSociale: "KAYDAN Groupe SA",
    secteurActivite: "Logement, Promotion immobilière, BTP & Architecture",
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
    id: "FOUR-BER-011",
    code: "BERNABE",
    nom: "Bernabé CI",
    raisonSociale: "Bernabé Côte d'Ivoire SA",
    secteurActivite: "Bâtiment, Matériel de construction, quincaillerie industrielle & outillage",
    logo: IMAGES.partners.bernabe,
    adresse: "Boulevard de Marseille, Km 4, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 35 76 47",
    email: "info.ci@bernabeafrique.com",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-SOD-009",
    code: "SODISMAD",
    nom: "SODIS-MAD CI",
    raisonSociale: "Société de Distribution de Matériaux Divers en Côte d'Ivoire",
    secteurActivite: "Bâtiment, Matériaux de construction, gros œuvre & matériaux divers",
    logo: IMAGES.partners.sodismad,
    adresse: "Zone Industrielle de Yopougon",
    ville: "Abidjan",
    quartier: "Yopougon",
    telephone: "+225 27 21 24 50 00",
    email: "contact@sodismadci.com",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-TNB-012",
    code: "TECHNIBAT",
    nom: "Technibat",
    raisonSociale: "Technibat Côte d'Ivoire (Yeshi Group)",
    secteurActivite: "Aménagement d'intérieur, mobilier, quincaillerie d'ameublement & sanitaire",
    logo: IMAGES.partners.technibat,
    adresse: "Boulevard de Marseille, Km 4, Treichville",
    ville: "Abidjan",
    quartier: "Treichville",
    telephone: "+225 27 21 21 39 39",
    email: "contact@technibat.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-SOC-010",
    code: "SOCIAM",
    nom: "SOCIAM",
    raisonSociale: "Société Ivoirienne d'Appareillage Ménager (SOCIAM)",
    secteurActivite: "Électroménager, Image & Son, Téléviseurs, Froid",
    logo: IMAGES.partners.sociam,
    adresse: "Zone Industrielle de Koumassi",
    ville: "Abidjan",
    quartier: "Koumassi",
    telephone: "+225 27 21 28 88 88",
    email: "contact@sociam.ci",
    agreVitalis: true,
    statut: "actif" as const,
  },
  {
    id: "FOUR-LG-008",
    code: "LG",
    nom: "LG",
    raisonSociale: "LG Electronics Côte d'Ivoire",
    secteurActivite: "Électroménager haut de gamme, Climatisation & Électronique",
    logo: IMAGES.partners.lg,
    adresse: "Boulevard Valéry Giscard d'Estaing",
    ville: "Abidjan",
    quartier: "Marcory",
    telephone: "+225 27 21 75 00 00",
    email: "contact@lg-ci.com",
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

  if (query.includes("oribat") || query.includes("ori-014") || query.includes("four-ori")) return IMAGES.partners.oribat;
  if (query.includes("bernab") || query.includes("ber-011") || query.includes("four-ber")) return IMAGES.partners.bernabe;
  if (query.includes("technibat") || query.includes("tnb-012") || query.includes("four-tnb")) return IMAGES.partners.technibat;
  if (query.includes("sippec") || query.includes("spe-013") || query.includes("four-spe")) return IMAGES.partners.sippec;
  if (query.includes("ldf") || query.includes("librairie")) return IMAGES.partners.ldf;
  if (query.includes("dro") || query.includes("drocolor")) return IMAGES.partners.drocolor;
  if (query.includes("comafrique") || query.includes("atc") || query.includes("comaf")) return IMAGES.partners.atcComafrique;
  if (query.includes("inovim") || query.includes("inoovim")) return IMAGES.partners.inovim;
  if (query.includes("kaydan")) return IMAGES.partners.kaydan;
  if (query.includes("socida")) return IMAGES.partners.socida;
  if (query.includes("sociam") || query.includes("soc-010") || query.includes("four-soc")) return IMAGES.partners.sociam;
  if (query.includes("rym") || query.includes("rymco") || query.includes("rimco")) return IMAGES.partners.rymco;
  if (query.includes("sodimac") || query.includes("sodismad") || query.includes("sod-009") || query.includes("four-sod")) return IMAGES.partners.sodismad;
  if (query.includes("lg")) return IMAGES.partners.lg;

  return IMAGES.partners.ldf;
}