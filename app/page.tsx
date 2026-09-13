// @ts-nocheck
"use client";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useLDFAuthStore();
  const { fournisseurs } = useVitalisDb();
  const router = useRouter();
  
  const [skip, setSkip] = useState(false);
  const [animating, setAnimating] = useState(true);

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
        
        {/* Cercles orbitaux de fond */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-white/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/5 border-dashed"></div>
      </div>
      
      {/* ─── Bouton Skip ─── */}
      <button 
        onClick={() => setSkip(true)}
        className="absolute top-6 right-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/80 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-2xl z-50 group hover:text-white"
      >
        Entrer <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* ─── Système Orbital ─── */}
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
        
        {/* Centre : Vitalis & FADES */}
        <div className="absolute z-20 w-44 h-44 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_0_40px_rgba(255,107,53,0.3)] flex flex-col items-center justify-center p-6 border border-white/20">
          <Image 
            src="/logos/logo-fades.PNG" 
            alt="FADES" 
            width={80} height={40} 
            className="object-contain mb-3 drop-shadow-md"
          />
          <Image 
            src="/logos/new_logo-viflo.JPG" 
            alt="Vitalis" 
            width={90} height={40} 
            className="object-contain drop-shadow-lg mix-blend-multiply"
          />
        </div>

        {/* Fournisseurs en orbite */}
        <div className="absolute inset-0 animate-[spin_25s_linear_infinite]">
          {fournisseurs.map((f, i) => {
            const angle = (i * 360) / fournisseurs.length;
            const radius = 200; // Distance depuis le centre
            const rad = angle * (Math.PI / 180);
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <div 
                key={f.id}
                className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white/50 p-3 flex items-center justify-center animate-[spin_25s_linear_infinite_reverse] transition-transform hover:scale-110 cursor-default"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                title={f.nom}
              >
                {f.logo ? (
                  <Image 
                    src={f.logo} 
                    alt={f.nom} 
                    width={48} height={48} 
                    className="object-contain max-w-full max-h-full"
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
            src="/logos/LOGO-AFG-Bank.jpg" 
            alt="AFG Bank" 
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
