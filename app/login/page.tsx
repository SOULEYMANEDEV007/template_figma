// @ts-nocheck
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAccounts } from "@/lib/ldfData";
import { getDashboardPath, useLDFAuthStore, IS_OWNER_PROFILE_ENABLED } from "@/stores/ldfAuth";
import { IMAGES } from "@/lib/constants";
import {
  Eye, EyeOff, Lock, Mail, Sparkles, ShieldCheck,
  Building2,
  TrendingUp,
  User,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
//import { IMAGES } from "@/lib/constants";
import { SupplierVideoAdBanner } from "@/components/vitalis";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useLDFAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Veuillez remplir tous les champs."); return; }
    setSubmitting(true);
    try {
      await login(email, password);
      // Récupérer l'utilisateur depuis le store pour rediriger selon son rôle
      const { user } = useLDFAuthStore.getState();
      toast.success("Connexion réussie !");
      router.replace(user ? getDashboardPath(user.role) : "/dashboard");
    } catch {
      // error handled via store
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (idx: number) => {
    const acc = demoAccounts[idx];
    if (acc.disabled || (acc.role === "owner" && !IS_OWNER_PROFILE_ENABLED)) {
      toast.warning("Profil en attente de validation", {
        description: "Le profil Propriétaire ViFlo est actuellement désactivé en attente de validation par la direction.",
      });
      return;
    }
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemo(idx);
  };

  const ROLE_ICONS = [ShieldCheck, Building2, TrendingUp, User, Crown];
  const ROLE_COLORS = [
    "border-purple-200 bg-purple-50 hover:border-purple-400 data-[active=true]:border-purple-500 data-[active=true]:bg-purple-50",
    "border-cyan-200 bg-cyan-50 hover:border-cyan-400 data-[active=true]:border-cyan-500 data-[active=true]:bg-cyan-50",
    "border-green-200 bg-green-50 hover:border-green-400 data-[active=true]:border-green-500 data-[active=true]:bg-green-50",
    "border-amber-200 bg-amber-50 hover:border-amber-400 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50",
    "border-slate-300 bg-slate-100/70 hover:border-slate-400 data-[active=true]:border-slate-500 data-[active=true]:bg-slate-100",
  ];
  const ICON_COLORS = ["text-purple-600", "text-cyan-600", "text-green-600", "text-amber-600", "text-slate-600"];

  return (
    <div className="min-h-screen flex">
      {/* ── Colonne gauche — branding ViFlo (Palette Blanche lumineuse) ── */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col justify-between p-12 bg-white border-r border-slate-200/80">

        {/* Pattern Topographique Décoratif subtil sur fond blanc */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%230B2447' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px",
          }}
        />

        {/* Halos lumineux doux pour mettre en valeur le logo */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0B2447]/[0.06] rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />
        {/* Logo ViFlo mis en lumière sur fond blanc */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-44 h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-white p-2 shadow-md shadow-slate-200/80 border border-slate-100">
            <Image
              src={IMAGES.logos.vifloText}
              alt="ViFlo"
              width={260}
              height={120}
              unoptimized
              className="object-contain w-full h-full scale-110"
            />
          </div>
        </div>

        {/* Contenu central + Encart publicitaire vidéo */}
        <div className="relative z-10 space-y-8 -mt-6">
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 my-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B2447]/[0.06] border border-[#0B2447]/15 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" />
                <span className="text-[#0B2447] text-xs font-semibold">
                  Digitalisation des financements structurés.
                </span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-extrabold text-[#0B2447] leading-tight tracking-tight">
                Donnons vie à vos projets.
              </h2>
              <p className="text-slate-600 text-sm mt-2.5 leading-relaxed max-w-lg">
                Une plateforme centralisée pour les souscripteurs, fournisseurs agréés et la banque partenaire AFG BANK CI.
              </p>
            </div>

            {/* Encart Vidéo Fournisseurs Agréés (Thème clair) */}
            <SupplierVideoAdBanner variant="light" className="max-w-[460px]" />
          </div>
        </div>

        {/* Footer Stats — Dégradé Orange ViFlo */}
        <footer className="relative z-10 -mx-12 -mb-12 px-12 py-7 bg-gradient-to-r from-[#FF7B2E] via-[#FF6B1A] to-[#FF5E00] border-t border-orange-300/40 shadow-[0_-10px_30px_rgba(255,94,0,0.15)]">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Souscriptions", value: "30000+" },
              { label: "Fournisseurs agréés", value: "12" },
              { label: "Banques partenaires", value: "1" },
              { label: "Assurances partenaires", value: "1" },
            ].map((s) => (
              <div key={s.label}>
                {s.isLogo ? (
                  <div className="h-10 flex items-center mb-0.5">
                    <div className="bg-white/15 p-1 rounded-lg border border-white/25 inline-flex items-center justify-center h-full overflow-hidden">
                      <Image
                        src={IMAGES.logos.afgBank}
                        alt="AFG BANK CI"
                        width={80}
                        height={32}
                        className="object-contain w-full h-full rounded bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-3xl font-black text-white tracking-tight h-10 flex items-end drop-shadow-xs">
                    {s.value}
                  </p>
                )}
                <p className="text-white/90 text-[11px] mt-1 uppercase tracking-wider font-semibold">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </footer>
      </div>

      {/* ── Colonne droite — formulaire (Palette Bleu ViFlo #0B2447) ── */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[#0B2447]">

        {/* Pattern Topographique Décoratif */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23FF7B2E' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px",
          }}
        />

        {/* Cercles de lumière */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF5E00]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md mx-auto">

          {/* Mobile logo ViFlo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-white/20 p-1.5 shadow-md">
              <Image
                src={IMAGES.logos.vifloText}
                alt="ViFlo"
                width={56}
                height={56}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p className="font-bold text-white text-lg">
                ViFlo <span className="text-[#FF7B2E]">FADES</span>
              </p>
              <p className="text-xs text-white/75">Plateforme Vitalis FADES</p>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Bienvenue sur Vitalis FADES</h1>
            <p className="text-white/75 text-sm mt-1.5">
              Connectez-vous pour accéder à votre espace de gestion.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/90">Adresse e-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.ci"
                autoComplete="email"
                className="bg-white text-gray-900 border-white/20"
                startIcon={<Mail className="w-5 h-5" />}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white/90">Mot de passe</label>
                <button
                  type="button"
                  className="text-sm text-[#FF7B2E] hover:text-orange-300 font-medium transition-colors"
                >
                  Oublié ?
                </button>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-white text-gray-900 border-white/20"
                startIcon={<Lock className="w-5 h-5" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-gray-900 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full mt-4"
            >
              {submitting || isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-white/80">
                Vous n'avez pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="text-[#FF7B2E] hover:text-orange-300 font-semibold transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>

          {/* Comptes de démo */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-xs text-white/70 font-medium px-2">
                Comptes de démonstration
              </span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc, idx) => {
                const Icon = ROLE_ICONS[idx] || User;
                const isOwnerDisabled =
                  (acc.role === "owner" && !IS_OWNER_PROFILE_ENABLED) || acc.disabled;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    data-active={selectedDemo === idx}
                    onClick={() => fillDemo(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${ROLE_COLORS[idx] || "border-gray-200 bg-gray-50"
                      } ${isOwnerDisabled ? "opacity-60 cursor-not-allowed border-dashed" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${ICON_COLORS[idx] || "text-gray-600"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {acc.label}
                        </p>
                        {isOwnerDisabled && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300 flex-shrink-0">
                            En attente de validation
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                      {acc.password}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-center text-white/60 mt-6">
            © {new Date().getFullYear()} ViFlo · Plateforme Vitalis · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

