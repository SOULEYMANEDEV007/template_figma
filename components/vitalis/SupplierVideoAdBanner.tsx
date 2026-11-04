// @ts-nocheck
"use client";

import { OFFICIAL_FOURNISSEURS, SUPPLIER_VIDEO_ADS, type SupplierVideoAd } from "@/lib/constants";
import {
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    Volume2,
    VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface SupplierVideoAdBannerProps {
    /** "dark" pour la colonne bleue de /login, "light" pour les dashboards Client/Fournisseur */
    variant?: "dark" | "light";
    className?: string;
}

export default function SupplierVideoAdBanner({
    variant = "dark",
    className = "",
}: SupplierVideoAdBannerProps) {
    const ads = SUPPLIER_VIDEO_ADS;
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [hasVideoError, setHasVideoError] = useState(false);
    const [previewPartner, setPreviewPartner] = useState<(typeof OFFICIAL_FOURNISSEURS)[number] | null>(null);

    const currentAd: SupplierVideoAd | undefined = ads[activeIndex];
    const isDark = variant === "dark";

    // Relance proprement la lecture à chaque changement de spot
    useEffect(() => {
        setProgress(0);
        setHasVideoError(false);
        const video = videoRef.current;
        if (!video) return;

        video.muted = isMuted;
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }
    }, [activeIndex]);

    // Synchronise l'état muet avec le DOM
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Masque automatiquement la bulle d'aperçu d'un partenaire sans vidéo après 4s
    useEffect(() => {
        if (!previewPartner) return;
        const timer = setTimeout(() => setPreviewPartner(null), 4000);
        return () => clearTimeout(timer);
    }, [previewPartner]);

    if (!currentAd) return null;

    const goToSpot = (index: number) => {
        const nextIndex = (index + ads.length) % ads.length;
        setActiveIndex(nextIndex);
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().then(() => setIsPlaying(true)).catch(() => { });
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        setProgress((video.currentTime / video.duration) * 100);
    };

    const handlePartnerClick = (partner: (typeof OFFICIAL_FOURNISSEURS)[number]) => {
        const adIdx = ads.findIndex((ad) => ad.fournisseurId === partner.id);
        if (adIdx !== -1) {
            setPreviewPartner(null);
            setActiveIndex(adIdx);
        } else {
            setPreviewPartner(partner);
        }
    };

    // Duplication de la liste pour un défilement continu sans coupure
    const marqueePartners = [...OFFICIAL_FOURNISSEURS, ...OFFICIAL_FOURNISSEURS];

    return (
        <div
            className={`w-full max-w-xl rounded-2xl overflow-hidden border transition-all ${isDark
                ? "bg-white/[0.06] border-white/15 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                : "bg-white border-gray-200 shadow-lg"
                } ${className}`}
        >
            <style>{`
        @keyframes vifloPartnersMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .viflo-marquee-track {
          display: flex;
          width: max-content;
          animation: vifloPartnersMarquee 38s linear infinite;
        }
        .viflo-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

            {/* ── En-tête + Barres de progression Stories ── */}
            <div className="px-3.5 pt-3 pb-2 space-y-2">
                <div className="flex gap-1.5">
                    {ads.map((ad, idx) => {
                        const barWidth =
                            idx < activeIndex ? "100%" : idx === activeIndex ? `${progress}%` : "0%";
                        return (
                            <button
                                key={ad.id}
                                type="button"
                                onClick={() => goToSpot(idx)}
                                aria-label={`Voir le spot ${ad.nom}`}
                                className={`h-1 flex-1 rounded-full overflow-hidden cursor-pointer ${isDark ? "bg-white/20" : "bg-gray-200"
                                    }`}
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-[#FF7B2E] to-[#FF5E00] transition-[width] duration-200 ease-linear rounded-full"
                                    style={{ width: barWidth }}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7B2E] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5E00]" />
                        </span>
                        <span
                            className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-white/90" : "text-gray-700"
                                }`}
                        >
                            Vitrine Fournisseurs Agréés
                        </span>
                    </div>

                    <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isDark
                            ? "bg-white/10 text-white/80 border border-white/10"
                            : "bg-orange-50 text-orange-700 border border-orange-200"
                            }`}
                    >
                        Spot {activeIndex + 1}/{ads.length} · {OFFICIAL_FOURNISSEURS.length} partenaires
                    </span>
                </div>
            </div>

            {/* ── Cadre Vidéo Principal 16:9 ── */}
            <div className="px-3.5">
                <div className="relative aspect-video max-h-[250px] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10 group">
                    {!hasVideoError ? (
                        <video
                            ref={videoRef}
                            key={currentAd.videoSrc}
                            src={currentAd.videoSrc}
                            autoPlay
                            muted={isMuted}
                            loop={ads.length === 1}
                            playsInline
                            preload="metadata"
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => goToSpot(activeIndex + 1)}
                            onError={() => setHasVideoError(true)}
                            onClick={togglePlay}
                            className="w-full h-full object-cover cursor-pointer"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0f2d59] to-[#081933]">
                            <div className="w-14 h-14 rounded-xl bg-white p-2 shadow-md mb-3 flex items-center justify-center">
                                <Image
                                    src={currentAd.logo}
                                    alt={currentAd.nom}
                                    width={56}
                                    height={56}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <p className="text-white font-bold text-sm">{currentAd.nom}</p>
                            <p className="text-white/70 text-xs mt-1 max-w-xs">{currentAd.slogan}</p>
                        </div>
                    )}

                    {/* Contrôles flottants (Haut Droite) */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                        {ads.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => goToSpot(activeIndex - 1)}
                                    aria-label="Spot précédent"
                                    className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goToSpot(activeIndex + 1)}
                                    aria-label="Spot suivant"
                                    className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={togglePlay}
                            aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                            className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition"
                        >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsMuted((prev) => !prev)}
                            aria-label={isMuted ? "Activer le son" : "Couper le son"}
                            className={`h-7 px-2.5 rounded-full border backdrop-blur-md flex items-center gap-1 text-[11px] font-medium transition ${isMuted
                                ? "bg-black/50 hover:bg-black/75 text-white border-white/15"
                                : "bg-[#FF5E00] text-white border-orange-300/40 shadow-md"
                                }`}
                        >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isMuted ? "Son" : "Actif"}</span>
                        </button>
                    </div>

                    {/* Bulle d'aperçu si l'utilisateur clique sur un partenaire sans vidéo */}
                    {previewPartner && (
                        <div className="absolute top-2.5 left-2.5 z-20 max-w-[65%] flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-orange-400/40 backdrop-blur-md shadow-lg">
                            <div className="w-7 h-7 rounded-lg bg-white p-1 flex-shrink-0 flex items-center justify-center">
                                <Image
                                    src={previewPartner.logo}
                                    alt={previewPartner.nom}
                                    width={28}
                                    height={28}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-white truncate">{previewPartner.nom}</p>
                                <p className="text-[10px] text-orange-300 truncate">{previewPartner.secteurActivite}</p>
                            </div>
                        </div>
                    )}

                    {/* Bandeau bas en surimpression : Identité du fournisseur en cours */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-8 pb-2.5 px-3 flex items-end justify-between gap-3 pointer-events-none">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-white p-1 shadow-md flex-shrink-0 flex items-center justify-center">
                                <Image
                                    src={currentAd.logo}
                                    alt={currentAd.nom}
                                    width={36}
                                    height={36}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-white font-bold text-xs sm:text-sm truncate">{currentAd.nom}</p>
                                    <BadgeCheck className="w-3.5 h-3.5 text-[#FF7B2E] flex-shrink-0" />
                                </div>
                                <p className="text-white/75 text-[11px] truncate">{currentAd.secteur}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Ruban défilant de TOUS les fournisseurs agréés ViFlo ── */}
            <div className="py-2.5 mt-2 border-t border-white/10 overflow-hidden relative">
                <div className="viflo-marquee-track gap-2 px-3">
                    {marqueePartners.map((partner, idx) => {
                        const hasSpot = ads.some((ad) => ad.fournisseurId === partner.id);
                        const isActive = currentAd.fournisseurId === partner.id;

                        return (
                            <button
                                key={`${partner.id}-${idx}`}
                                type="button"
                                onClick={() => handlePartnerClick(partner)}
                                title={`${partner.nom} — ${partner.secteurActivite}`}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${isActive
                                    ? "bg-[#FF5E00]/25 border-[#FF7B2E] shadow-sm"
                                    : isDark
                                        ? "bg-white/[0.06] hover:bg-white/15 border-white/10"
                                        : "bg-gray-50 hover:bg-orange-50 border-gray-200"
                                    }`}
                            >
                                <div className="w-6 h-6 rounded-md bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <Image
                                        src={partner.logo}
                                        alt={partner.nom}
                                        width={24}
                                        height={24}
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                                <span
                                    className={`text-[11px] font-medium whitespace-nowrap ${isDark ? "text-white/90" : "text-gray-700"
                                        }`}
                                >
                                    {partner.nom}
                                </span>
                                {hasSpot && (
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#FF5E00] text-white flex items-center justify-center flex-shrink-0">
                                        <Play className="w-2 h-2 fill-current ml-0.5" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}