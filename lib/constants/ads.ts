// lib/constants/ads.ts
import { IMAGES } from "./images";

/**
 * Taille maximale autorisée par fichier vidéo dans le prototype (en Mo)
 */
export const MAX_VIDEO_SIZE_MB = 20;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export type AdPlacement = "splash" | "login" | "client" | "fournisseur";

export const AD_PLACEMENTS_META: { value: AdPlacement; label: string; description: string }[] = [
    { value: "splash", label: "Splash Screen", description: "Écran d'entrée orbital (/)" },
    { value: "login", label: "Page Connexion", description: "Encart colonne bleue (/login)" },
    { value: "client", label: "Espace Client", description: "Dashboard Souscripteur" },
    { value: "fournisseur", label: "Espace Fournisseur", description: "Dashboard Fournisseur" },
];
export interface SupplierVideoAd {
    id: string;
    fournisseurId: string;
    code: string;
    nom: string;
    secteur: string;
    slogan: string;
    logo: string;
    videoSrc: string;
    statut: "actif" | "pause";
    emplacements: AdPlacement[];
    tailleMo?: number;
    dateCreation?: string;
    isDefault?: boolean;
}

/**
 * Registre centralisé des spots publicitaires vidéo des fournisseurs agréés ViFlo.
 * Déposer les nouveaux fichiers .mp4/.webm dans public/videos/ads/ puis les déclarer ici.
 */
export const SUPPLIER_VIDEO_ADS: SupplierVideoAd[] = [
    {
        id: "AD-LDF-01",
        fournisseurId: "FOUR-LDF-001",
        code: "LDF",
        nom: "Librairie de France Groupe",
        secteur: "Éducation, Fournitures & Informatique",
        slogan: "Équipez-vous aujourd'hui grâce au financement structuré Vitalis.",
        logo: IMAGES.partners.ldf,
        videoSrc: "/videos/ads/ldf-groupe.mp4",
        statut: "actif",
        emplacements: ["splash", "login", "client", "fournisseur"],
        tailleMo: 12.9,
        dateCreation: "2026-11-01",
        isDefault: true,
    },
    {
        id: "AD-BER-02",
        fournisseurId: "FOUR-BER-011",
        code: "BERNABE",
        nom: "Bernabé CI",
        secteur: "Bâtiment, Matériel de construction & Outillage",
        slogan: "Tous vos matériaux et équipements pros financés avec ViFlo.",
        logo: IMAGES.partners.bernabe,
        videoSrc: "/videos/ads/bernabe-video.mp4",
        statut: "actif",
        emplacements: ["splash", "login", "client", "fournisseur"],
        tailleMo: 14.2,
        dateCreation: "2026-11-01",
        isDefault: true,

    },
    {
        id: "AD-ORI-03",
        fournisseurId: "FOUR-ORI-014",
        code: "ORIBAT",
        nom: "Oribat",
        secteur: "Logement & Promotion immobilière",
        slogan: "Concrétisez votre projet immobilier avec l'accompagnement ViFlo.",
        logo: IMAGES.partners.oribat,
        videoSrc: "/videos/ads/oribat-video.mp4",
        statut: "actif",
        emplacements: ["splash", "login", "client", "fournisseur"],
        tailleMo: 5.7,
        dateCreation: "2026-11-03",
        isDefault: true,
    },
    {
        id: "AD-SOD-04",
        fournisseurId: "FOUR-SOD-009",
        code: "SODISMAD",
        nom: "SODIS-MAD CI",
        secteur: "Bâtiment, Gros œuvre & Matériaux de construction",
        slogan: "Vos matériaux de chantier financés en toute simplicité.",
        logo: IMAGES.partners.sodismad,
        videoSrc: "/videos/ads/sodis-mad-ci.mp4",
        statut: "actif",
        emplacements: ["splash", "login", "client", "fournisseur"],
        tailleMo: 15.0,
        dateCreation: "2026-11-03",
        isDefault: true,
    },
];