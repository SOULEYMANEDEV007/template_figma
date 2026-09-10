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

  // Splash screen timeout: 15 seconds
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
      }, 500); // fade out duration
    }, 15000);

    return () => clearTimeout(timer);
  }, [isLoading, skip, isAuthenticated, router]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 relative ${animating ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Bouton Skip */}
      <button 
        onClick={() => setSkip(true)}
        className="absolute top-6 right-6 px-4 py-2 bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-600 rounded-full text-sm font-semibold hover:bg-orange-50 transition flex items-center gap-1 shadow-sm z-50"
      >
        Passer l'animation <ChevronRight className="w-4 h-4" />
      </button>

      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
        {/* AFG Bank au centre */}
        <div className="absolute z-20 w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center p-4 border-4 border-orange-100 animate-pulse">
          <Image 
            src="/logos/LOGO-AFG-Bank.jpg" 
            alt="AFG Bank" 
            width={120} height={120} 
            className="object-contain"
          />
        </div>

        {/* Fournisseurs en rotation */}
        <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
          {fournisseurs.map((f, i) => {
            const angle = (i * 360) / fournisseurs.length;
            const radius = 180; // Distance du centre
            const rad = angle * (Math.PI / 180);
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <div 
                key={f.id}
                className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 bg-white rounded-full shadow-lg border border-gray-100 p-3 flex items-center justify-center animate-[spin_20s_linear_infinite_reverse]"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {f.logo ? (
                  <Image 
                    src={f.logo} 
                    alt={f.nom} 
                    width={60} height={60} 
                    className="object-contain max-w-full max-h-full"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-center text-gray-500">{f.nom}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-12 text-center z-10">
        <h1 className="text-3xl font-bold text-orange-900 mb-2">Programme Vitalis</h1>
        <p className="text-orange-700 font-medium max-w-md mx-auto">
          La plateforme de financement intégrée avec nos fournisseurs agréés
        </p>
        <div className="mt-8 flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
