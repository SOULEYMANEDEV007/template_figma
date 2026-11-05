// lib/constants/ads.ts
import { IMAGES } from "./images";

export interface SupplierVideoAd {
    id: string;
    fournisseurId: string;
    code: string;
    nom: string;
    secteur: string;
    slogan: string;
    logo: string;
    videoSrc: string;
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
    },
];