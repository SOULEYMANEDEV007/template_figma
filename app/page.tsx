// @ts-nocheck
"use client";
import {
  ICONS,
  IMAGES,
  OFFICIAL_FOURNISSEURS,
  SUPPLIER_VIDEO_ADS,
  getPartnerLogo,
} from "@/lib/constants";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useActiveVideoAds } from "@/stores/adsStore";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Durée d'aperçu automatique par fournisseur (en secondes) avant de passer au suivant */
const AUTO_PREVIEW_SECONDS = 15;

function formatDuration(sec: number): string {
  if (!sec || !Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function RootPage() {
  const { isAuthenticated, isLoading } = useLDFAuthStore();
  const { fournisseurs } = useVitalisDb();
  const router = useRouter();

  const [animating, setAnimating] = useState(true);

  // État du lecteur Cinéma
  //const ads = SUPPLIER_VIDEO_ADS;
  const ads = useActiveVideoAds("splash");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const switchingSpotRef = useRef(false);
  const exitingRef = useRef(false);

  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Passe à true dès que le visiteur active le son ou choisit un spot (lecture intégrale sans coupure à 15s)
  const [isFullWatchMode, setIsFullWatchMode] = useState(false);

  const currentAd = ads[activeAdIndex] || ads[0];

  // Fournisseurs officiels de l'orbite
  const orbitFournisseurs = useMemo(() => {
    if (fournisseurs && fournisseurs.length >= 10) {
      return fournisseurs.filter((f) => f.statut === "actif");
    }
    return OFFICIAL_FOURNISSEURS;
  }, [fournisseurs]);

  // Sortie fluide vers /login ou /dashboard
  const triggerExit = useCallback(
    (immediate = false) => {
      if (isLoading || exitingRef.current) return;
      exitingRef.current = true;
      const target = isAuthenticated ? "/dashboard" : "/login";

      if (immediate) {
        router.replace(target);
        return;
      }

      setAnimating(false);
      setTimeout(() => {
        router.replace(target);
      }, 800);
    },
    [isLoading, isAuthenticated, router]
  );

  // Sécurité : si le navigateur bloque totalement l'autoplay vidéo (mode économie d'énergie)
  useEffect(() => {
    if (isLoading || isFullWatchMode || isPlaying) return;
    const fallbackMs = (ads.length * AUTO_PREVIEW_SECONDS + 5) * 1000;
    const timer = setTimeout(() => triggerExit(false), fallbackMs);
    return () => clearTimeout(timer);
  }, [isLoading, isFullWatchMode, isPlaying, ads.length, triggerExit]);

  // Relance propre de la vidéo à chaque changement de spot
  useEffect(() => {
    switchingSpotRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.currentTime = 0;
    const p = video.play();
    if (p !== undefined) {
      p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeAdIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Passage automatique au spot suivant (ou sortie à la fin du tour complet en mode Zapping)
  const advanceSpot = useCallback(() => {
    if (switchingSpotRef.current) return;
    switchingSpotRef.current = true;

    if (!isFullWatchMode && activeAdIndex >= ads.length - 1) {
      // Tous les fournisseurs ont été diffusés -> direction /login !
      triggerExit(false);
      return;
    }

    setActiveAdIndex((prev) => (prev + 1) % ads.length);
  }, [isFullWatchMode, activeAdIndex, ads.length, triggerExit]);

  const goToAd = (idx: number, manual = false) => {
    if (!ads.length) return;
    if (manual) setIsFullWatchMode(true);
    switchingSpotRef.current = true;
    setActiveAdIndex((idx + ads.length) % ads.length);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const t = e.currentTarget.currentTime;
    setCurrentTime(t);

    // En mode Zapping auto, on enchaîne après AUTO_PREVIEW_SECONDS (15s)
    if (!isFullWatchMode && t >= AUTO_PREVIEW_SECONDS) {
      advanceSpot();
    }
  };

  const togglePlay = () => {
    setIsFullWatchMode(true);
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => { });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsFullWatchMode(true);
    setIsMuted((prev) => !prev);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setIsFullWatchMode(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * video.duration;
    setCurrentTime(video.currentTime);
  };

  const handleFullscreen = () => {
    setIsFullWatchMode(true);
    const el = playerContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };

  // En mode Zapping (15s), la barre progresse sur 15s ; en mode complet, sur la durée totale du film
  const effectiveDuration = isFullWatchMode
    ? duration
    : duration > 0
      ? Math.min(duration, AUTO_PREVIEW_SECONDS)
      : AUTO_PREVIEW_SECONDS;

  const progressPercent =
    effectiveDuration > 0
      ? Math.min((currentTime / effectiveDuration) * 100, 100)
      : 0;

  return (
    <div
      className={`min-h-screen bg-[#0B2447] flex flex-col justify-between overflow-hidden transition-all duration-700 relative px-6 py-6 lg:px-12 xl:px-16 ${animating ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
    >
      {/* ─── Arrière-plan Lumineux (Glow Effects) ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-[28%] -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-[#ff6b35] opacity-25 blur-[130px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[500px] h-[500px] bg-[#1e4a8a] opacity-45 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* ─── Barre supérieure : Indicateur Zapping + Bouton Entrer ─── */}
      <div className="relative z-40 flex items-center justify-end gap-3">
        {!isFullWatchMode && (
          <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF5E00] animate-ping" />
            Aperçu partenaires · Spot {activeAdIndex + 1}/{ads.length}
          </span>
        )}
        <button
          onClick={() => triggerExit(true)}
          className="px-6 py-2.5 bg-white hover:bg-orange-50 text-[#0B2447] rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 shadow-[0_8px_30px_rgba(255,255,255,0.22)] cursor-pointer group"
        >
          Entrer
          <ICONS.arrowRight className="w-4 h-4 text-[#FF5E00] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ─── SCÈNE DOUBLE : Orbite ViFlo (Gauche) + Écran Cinéma Pub (Droite) ─── */}
      <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 my-auto py-2">
        {/* ── 1. GAUCHE : Système Orbital ViFlo ── */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-[440px] h-[440px] flex items-center justify-center scale-[0.72] sm:scale-90 xl:scale-100">
            {/* Anneaux orbitaux dorés/orange */}
            <div className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full border border-orange-400/35 shadow-[0_0_40px_rgba(255,107,53,0.2)] pointer-events-none" />
            <div className="absolute inset-0 m-auto w-[410px] h-[410px] rounded-full border border-dashed border-orange-400/25 animate-[spin_60s_linear_infinite] pointer-events-none" />

            {/* Halo vibrant autour du cœur ViFlo */}
            <div className="absolute z-10 w-48 h-48 rounded-full bg-gradient-to-tr from-[#FF5E00] to-[#FFB300] opacity-45 blur-xl animate-pulse pointer-events-none" />

            {/* Centre : ViFlo */}
            <div className="absolute z-20 w-40 h-40 bg-white rounded-full shadow-[0_0_50px_rgba(255,107,53,0.65)] ring-4 ring-orange-400/60 flex flex-col items-center justify-center p-5">
              <Image
                src={IMAGES.logos.vifloText}
                alt="ViFlo"
                width={105}
                height={105}
                className="object-contain drop-shadow-md"
              />
            </div>

            {/* Fournisseurs en orbite */}
            <div className="absolute inset-0 animate-[spin_28s_linear_infinite] pointer-events-none">
              {orbitFournisseurs.map((f, i) => {
                const angle = (i * 360) / orbitFournisseurs.length;
                const radius = 190;
                const rad = angle * (Math.PI / 180);
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;
                const logoSrc =
                  f.logo && !f.logo.includes(".jfif")
                    ? f.logo
                    : getPartnerLogo(f.nom, f.id);

                const adMatchIdx = ads.findIndex((ad) => ad.fournisseurId === f.id);
                const hasVideo = adMatchIdx !== -1;
                const isCurrentAd = currentAd?.fournisseurId === f.id;

                return (
                  <div
                    key={f.id || i}
                    className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 pointer-events-auto"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <button
                      type="button"
                      onClick={() => hasVideo && goToAd(adMatchIdx, true)}
                      title={
                        hasVideo
                          ? `${f.nom} — Cliquer pour voir le spot intégral`
                          : `${f.nom} — Partenaire Agréé Vitalis`
                      }
                      className={`w-full h-full rounded-full bg-white p-2 flex items-center justify-center animate-[spin_28s_linear_infinite_reverse] transition-all ${isCurrentAd
                        ? "ring-4 ring-[#FF5E00] shadow-[0_0_28px_rgba(255,94,0,0.95)] scale-115 z-30"
                        : hasVideo
                          ? "border-2 border-orange-300 shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:scale-110 cursor-pointer"
                          : "border-2 border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.2)] cursor-default"
                        }`}
                    >
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={f.nom}
                          width={46}
                          height={46}
                          className="object-contain max-w-full max-h-full rounded-md"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-center text-[#0B2447] leading-tight uppercase">
                          {f.nom.substring(0, 10)}
                        </span>
                      )}

                      {hasVideo && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF5E00] text-white flex items-center justify-center shadow">
                          <Play className="w-2 h-2 fill-current ml-0.5" />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2. DROITE : Écran Cinéma Publicitaire 16:9 ── */}
        {currentAd && (
          <div className="lg:col-span-7 flex flex-col items-center w-full">
            <div
              ref={playerContainerRef}
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.55)] group"
            >
              <video
                ref={videoRef}
                key={currentAd.videoSrc}
                src={currentAd.videoSrc}
                autoPlay
                muted={isMuted}
                loop={ads.length === 1 && isFullWatchMode}
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={handleTimeUpdate}
                onEnded={advanceSpot}
                onError={advanceSpot}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Contrôles Haut Droite : Précédent / Suivant + Bouton Son */}
              <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
                {ads.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => goToAd(activeAdIndex - 1, true)}
                      aria-label="Spot précédent"
                      className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToAd(activeAdIndex + 1, true)}
                      aria-label="Spot suivant"
                      className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleMute}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer ${isMuted
                    ? "bg-black/60 hover:bg-black/80 text-white border-white/20"
                    : "bg-[#FF5E00] text-white border-orange-300/50 shadow-lg"
                    }`}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isMuted ? "Son" : "Son actif"}</span>
                </button>
              </div>

              {/* Barre de contrôle Cinéma en bas du cadre vidéo */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-10 pb-3 px-4 space-y-2">
                {/* Jauge de lecture */}
                <div
                  onClick={handleSeek}
                  className="w-full h-1.5 bg-white/25 hover:h-2 transition-all rounded-full overflow-hidden cursor-pointer"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#FF7B2E] to-[#FF5E00] rounded-full transition-[width] duration-150 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause" : "Lecture"}
                      className="hover:text-orange-400 transition cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <span className="text-xs font-mono text-white/90 tabular-nums">
                      {formatDuration(currentTime)} / {formatDuration(effectiveDuration)}
                    </span>
                    <span className="hidden sm:inline-block text-white/30">|</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-white/90 truncate">
                      {currentAd.nom}
                      <BadgeCheck className="w-3.5 h-3.5 text-[#FF7B2E] flex-shrink-0" />
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    aria-label="Plein écran"
                    className="hover:text-orange-400 transition cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sélecteur visuel de tous les spots fournisseurs sous l'écran */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {ads.map((ad, idx) => {
                const isActive = idx === activeAdIndex;
                return (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => goToAd(idx, true)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all cursor-pointer ${isActive
                      ? "bg-[#FF5E00]/25 border-[#FF7B2E] text-white shadow-[0_0_20px_rgba(255,94,0,0.35)] scale-105"
                      : "bg-white/8 hover:bg-white/15 border-white/15 text-white/75 hover:text-white"
                      }`}
                  >
                    <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={ad.logo}
                        alt={ad.nom}
                        width={18}
                        height={18}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <span>{ad.nom}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Pied de page : Soutenu par FADES | Vitalis ─── */}
      <div className="relative z-20 flex flex-col items-center pt-2">
        <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
            Soutenu par
          </span>
          <div className="h-6 w-[1px] bg-gray-200" />
          <Image
            src={IMAGES.logos.fades}
            alt="Fades"
            width={76}
            height={28}
            className="object-contain opacity-90 mix-blend-multiply"
          />
          <Image
            src={IMAGES.logos.vitalisLogo}
            alt="Vitalis ViFlo"
            width={76}
            height={28}
            className="object-contain opacity-90 mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}