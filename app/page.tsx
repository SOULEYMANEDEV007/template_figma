// @ts-nocheck
"use client";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { IMAGES, ICONS, OFFICIAL_FOURNISSEURS, getPartnerLogo } from "@/lib/constants";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useLDFAuthStore();
  const { fournisseurs } = useVitalisDb();
  const router = useRouter();

  const [skip, setSkip] = useState(false);
  const [animating, setAnimating] = useState(true);

  // Fournisseurs officiels de l'orbite (8 partenaires agréés Vitalis)
  const orbitFournisseurs = useMemo(() => {
    if (fournisseurs && fournisseurs.length >= 8) {
      return fournisseurs.filter(f => f.statut === "actif");
    }
    return OFFICIAL_FOURNISSEURS;
  }, [fournisseurs]);

  // Splash screen timeout: 25 seconds
  useEffect(() => {
    if (isLoading) return;
    if (skip) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
      return;
    }

    const timer = setTimeout(() => {
      setAnimating(false);
      setTimeout(() => {
        router.replace(isAuthenticated ? "/dashboard" : "/login");
      }, 800); // fade out duration
    }, 25000); // 25 secondes comme demandé

    return () => clearTimeout(timer);
  }, [isLoading, skip, isAuthenticated, router]);

  return (
    <div className={`min-h-screen bg-[#0B2447] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 relative ${animating ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>

      {/* ─── Arrière-plan Lumineux (Glow Effects) ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff6b35] opacity-20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#1e4a8a] opacity-40 blur-[100px] rounded-full mix-blend-screen"></div>

        {/* Cercles orbitaux de fond alignés avec le rayon des satellites (r=210 -> d=420) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-dashed border-orange-500/25 animate-[spin_60s_linear_infinite]"></div>
      </div>

      {/* ─── Bouton Skip ─── */}
      <button
        onClick={() => setSkip(true)}
        className="absolute top-6 right-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/80 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-2xl z-50 group hover:text-white"
      >
        Entrer <ICONS.chevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* ─── Système Orbital ─── */}
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">

        {/* Centre : Viflo */}
        <div className="absolute z-20 w-44 h-44 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_0_40px_rgba(255,107,53,0.3)] flex flex-col items-center justify-center p-6 border border-white/20">
          <Image
            src={IMAGES.logos.vifloText}
            alt="Viflo"
            width={100} height={100}
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Fournisseurs en orbite */}
        <div className="absolute inset-0 animate-[spin_25s_linear_infinite]">
          {orbitFournisseurs.map((f, i) => {
            const angle = (i * 360) / orbitFournisseurs.length;
            const radius = 210; // Distance depuis le centre
            const rad = angle * (Math.PI / 180);
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const logoSrc = f.logo || getPartnerLogo(f.nom, f.id);

            return (
              <div
                key={f.id || i}
                className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.18)] border-2 border-white/60 p-2.5 flex items-center justify-center animate-[spin_25s_linear_infinite_reverse] transition-transform hover:scale-115 cursor-default"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                title={`${f.nom} — Partenaire Agréé Vitalis`}
              >
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={f.nom}
                    width={56} height={56}
                    className="object-contain max-w-full max-h-full rounded-md"
                  />
                ) : (
                  <span className="text-[9px] font-bold text-center text-[#0B2447] leading-tight uppercase tracking-tighter">{f.nom.substring(0, 10)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Textes et Partenaire Financier ─── */}
      <div className="absolute bottom-12 text-center z-10 flex flex-col items-center">
        <h1 className="text-4xl font-black text-white tracking-[0.15em] uppercase mb-3 drop-shadow-lg">
          ViFlo
        </h1>
        <p className="text-orange-200/80 font-medium text-sm tracking-wide max-w-sm mx-auto mb-8">
          Simplifier le financement, fluidifier les achats
        </p>

        {/* Partenaire Bancaire */}
        <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Soutenu par</span>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <Image
            src={IMAGES.logos.afgBank}
            alt="AFG Bank"
            width={80} height={30}
            className="object-contain opacity-90 mix-blend-multiply"
          />
          <Image
            src={IMAGES.logos.vifloNew}
            alt="Vitalis Viflo"
            width={80} height={30}
            className="object-contain opacity-90 mix-blend-multiply"
          />
          <Image
            src={IMAGES.logos.fades}
            alt="Fades"
            width={80} height={30}
            className="object-contain opacity-90 mix-blend-multiply"
          />
        </div>

        {/* Indicateur de chargement stylisé */}
        <div className="mt-10 flex justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "200ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
