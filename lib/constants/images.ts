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

  // --- LOGOS DES FOURNISSEURS & PARTENAIRES ---
  partners: {
    smartTechno: "/logos/logo-smart-techno.png",
    nasko: "/logos/logo-nasko.png",
    sociam: "/images/sociam_logo.webp",
    rymco: "/images/logo_rymco.jpg",
    sodimac: "/images/logo_sodimac_ci.jpg",
    lg: "/images/logo_lg.webp",
    drocolor: "/images/logo-drocolor.jfif",
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
 * Fonction utilitaire pour récupérer le logo d'un fournisseur selon son nom ou ID
 * (remplace la logique dupliquée dans les pages de devis et commandes)
 */
export function getPartnerLogo(supplierName?: string, supplierId?: string): string {
  if (!supplierName && !supplierId) return IMAGES.logos.ldf;

  const query = `${supplierName || ""} ${supplierId || ""}`.toLowerCase();

  if (query.includes("ldf") || query.includes("librairie")) {
    return IMAGES.logos.ldf;
  }
  if (query.includes("dro") || query.includes("drocolor")) {
    return IMAGES.partners.drocolor;
  }
  if (query.includes("smt") || query.includes("smart")) {
    return IMAGES.partners.smartTechno;
  }
  if (query.includes("nas") || query.includes("nasko")) {
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

  return IMAGES.logos.ldf;
}