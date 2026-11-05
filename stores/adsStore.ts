// @ts-nocheck
"use client";

import Dexie, { type Table } from "dexie";
import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
    MAX_VIDEO_SIZE_BYTES,
    MAX_VIDEO_SIZE_MB,
    SUPPLIER_VIDEO_ADS,
    type AdPlacement,
    type SupplierVideoAd,
} from "@/lib/constants/ads";

// ─── Base IndexedDB dédiée aux Blobs vidéo importés en démo ─────────────────
interface StoredVideoBlob {
    id: string;
    blob: Blob;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}

class ViFloAdsMediaDatabase extends Dexie {
    videos!: Table<StoredVideoBlob, string>;

    constructor() {
        super("ViFloAdsMediaDB");
        this.version(1).stores({
            videos: "id, fileName, createdAt",
        });
    }
}

let mediaDb: ViFloAdsMediaDatabase | null = null;

function getAdsMediaDb(): ViFloAdsMediaDatabase | null {
    if (typeof window === "undefined") return null;
    if (!mediaDb) {
        mediaDb = new ViFloAdsMediaDatabase();
    }
    return mediaDb;
}

/** Valide et sauvegarde un fichier vidéo dans IndexedDB (limite MAX_VIDEO_SIZE_MB) */
export async function saveAdVideoFile(
    adId: string,
    file: File
): Promise<{ videoSrc: string; tailleMo: number }> {
    if (!file.type.startsWith("video/")) {
        throw new Error("Format non supporté. Veuillez sélectionner une vidéo MP4 ou WebM.");
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
        const actualMb = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(
            `Fichier trop volumineux (${actualMb} Mo). La taille maximale autorisée est de ${MAX_VIDEO_SIZE_MB} Mo.`
        );
    }

    const db = getAdsMediaDb();
    if (!db) {
        throw new Error("Stockage navigateur indisponible.");
    }

    await db.videos.put({
        id: adId,
        blob: file,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        createdAt: new Date().toISOString(),
    });

    const tailleMo = Number((file.size / (1024 * 1024)).toFixed(1));
    return { videoSrc: `idb://${adId}`, tailleMo };
}

/** Supprime le Blob vidéo associé d'IndexedDB */
export async function deleteAdVideoFile(adId: string): Promise<void> {
    const db = getAdsMediaDb();
    if (!db) return;
    await db.videos.delete(adId);
}

/** Transforme une source idb://AD-... en URL lisible par <video> */
export async function resolveAdVideoUrl(videoSrc: string): Promise<string | null> {
    if (!videoSrc) return null;
    if (!videoSrc.startsWith("idb://")) return videoSrc;

    const db = getAdsMediaDb();
    if (!db) return null;

    const blobId = videoSrc.replace("idb://", "");
    const record = await db.videos.get(blobId);
    if (!record?.blob) return null;

    return URL.createObjectURL(record.blob);
}

// ─── Store Zustand des campagnes publicitaires ──────────────────────────────
interface AdsState {
    campaigns: SupplierVideoAd[];
    addCampaign: (campaign: SupplierVideoAd) => void;
    updateCampaign: (id: string, patch: Partial<SupplierVideoAd>) => void;
    toggleCampaignStatus: (id: string) => void;
    moveCampaign: (id: string, direction: "up" | "down") => void;
    deleteCampaign: (id: string) => Promise<void>;
    resetDemoCampaigns: () => Promise<void>;
}

export const useAdsStore = create<AdsState>()(
    persist(
        (set, get) => ({
            campaigns: SUPPLIER_VIDEO_ADS,

            addCampaign: (campaign) =>
                set((state) => ({
                    campaigns: [...state.campaigns, campaign],
                })),

            updateCampaign: (id, patch) =>
                set((state) => ({
                    campaigns: state.campaigns.map((c) =>
                        c.id === id ? { ...c, ...patch } : c
                    ),
                })),

            toggleCampaignStatus: (id) =>
                set((state) => ({
                    campaigns: state.campaigns.map((c) =>
                        c.id === id
                            ? { ...c, statut: c.statut === "actif" ? "pause" : "actif" }
                            : c
                    ),
                })),

            moveCampaign: (id, direction) =>
                set((state) => {
                    const list = [...state.campaigns];
                    const idx = list.findIndex((c) => c.id === id);
                    if (idx === -1) return state;
                    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
                    if (targetIdx < 0 || targetIdx >= list.length) return state;
                    [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
                    return { campaigns: list };
                }),

            deleteCampaign: async (id) => {
                const target = get().campaigns.find((c) => c.id === id);
                if (target?.videoSrc?.startsWith("idb://")) {
                    await deleteAdVideoFile(id);
                }
                set((state) => ({
                    campaigns: state.campaigns.filter((c) => c.id !== id),
                }));
            },

            resetDemoCampaigns: async () => {
                const db = getAdsMediaDb();
                if (db) {
                    await db.videos.clear();
                }
                set({ campaigns: SUPPLIER_VIDEO_ADS });
            },
        }),
        {
            name: "viflo-ads-campaigns-v1",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/**
 * Hook prêt à l'emploi pour le Splash Screen, Login, Client et Fournisseur :
 * filtre les spots actifs pour l'emplacement demandé et résout automatiquement les vidéos IndexedDB.
 */
export function useActiveVideoAds(placement?: AdPlacement): SupplierVideoAd[] {
    const campaigns = useAdsStore((s) => s.campaigns);
    const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

    const filtered = useMemo(() => {
        return (campaigns || []).filter((ad) => {
            if (ad.statut && ad.statut !== "actif") return false;
            if (placement && Array.isArray(ad.emplacements)) {
                return ad.emplacements.includes(placement);
            }
            return true;
        });
    }, [campaigns, placement]);

    useEffect(() => {
        let cancelled = false;
        const createdUrls: string[] = [];

        async function loadBlobs() {
            const map: Record<string, string> = {};
            for (const ad of filtered) {
                if (ad.videoSrc?.startsWith("idb://")) {
                    const url = await resolveAdVideoUrl(ad.videoSrc);
                    if (url) {
                        createdUrls.push(url);
                        map[ad.id] = url;
                    }
                }
            }
            if (!cancelled) {
                setBlobUrls(map);
            }
        }

        loadBlobs();

        return () => {
            cancelled = true;
            createdUrls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [filtered]);

    return useMemo(() => {
        return filtered
            .map((ad) => {
                if (ad.videoSrc?.startsWith("idb://")) {
                    const resolved = blobUrls[ad.id];
                    if (!resolved) return null;
                    return { ...ad, videoSrc: resolved };
                }
                return ad;
            })
            .filter(Boolean) as SupplierVideoAd[];
    }, [filtered, blobUrls]);
}