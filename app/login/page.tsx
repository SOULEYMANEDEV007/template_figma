// @ts-nocheck
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAccounts } from "@/lib/ldfData";
import { getDashboardPath, useLDFAuthStore } from "@/stores/ldfAuth";
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, User, CheckCircle2, Folder, Activity, Wallet } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemo(idx);
  };

  const ROLE_ICONS = [ShieldCheck, Building2, TrendingUp, User];
  const ROLE_COLORS = [
    "border-purple-200 bg-purple-50 hover:border-purple-400 data-[active=true]:border-purple-500 data-[active=true]:bg-purple-50",
    "border-cyan-200 bg-cyan-50 hover:border-cyan-400 data-[active=true]:border-cyan-500 data-[active=true]:bg-cyan-50",
    "border-green-200 bg-green-50 hover:border-green-400 data-[active=true]:border-green-500 data-[active=true]:bg-green-50",
    "border-amber-200 bg-amber-50 hover:border-amber-400 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50",
  ];
  const ICON_COLORS = ["text-purple-600", "text-cyan-600", "text-green-600", "text-amber-600"];

  return (
    <div className="min-h-screen flex">
      {/* ── Colonne gauche — branding ViFlo ── */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col justify-between p-12 bg-[#FF5E00]">

        {/* Pattern Topographique Décoratif */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }} />
        
        {/* Cercles de lumière (pour le relief) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Logo ViFlo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-24 h-24 rounded-xl overflow-hidden flex items-center justify-center bg-white/10 p-2 backdrop-blur-sm border border-white/20">
            <Image src="/logos/viflo_logo.png" alt='ViFlo' width={200} height={200} className="object-contain" onError={() => { }} />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">
              Plateforme de gestion
            </p>
            <p className="text-white/80 text-sm mt-1">Financements Vitalis</p>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-medium">Simplifier le financement, fluidifier les achats.</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Un seul espace pour gérer<br />tous vos financements.
            </h2>
            <p className="text-white/80 text-sm mt-4 leading-relaxed max-w-md">
              Suivez chaque étape : souscription, devis, validation bancaire, paiement et service de vos articles.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: "01", label: "Validation du prêt par la banque" },
              { step: "02", label: "Paiement et Achat des articles" },
              { step: "03", label: "Dévis généré et envoyé" },
              { step: "04", label: "Articles servis par le fournisseur" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-sm w-max pr-6">
                <div className={`w-8 h-8 rounded-lg bg-white text-[#FF5E00] flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-xs font-bold">{s.step}</span>
                </div>
                <span className="text-white font-medium text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
          {[
            { label: "Souscriptions", value: "30+" },
            { label: "Fournisseurs agréés", value: "5" },
            { label: "Banque partenaire", value: "AFG Bank" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-white/70 text-xs mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Colonne droite — formulaire ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-gray-50">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo ViFlo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
              <Image src="/images/viflo_logo.png" alt="ViFlo" width={48} height={48} className="object-contain" onError={() => { }} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">ViFlo</p>
              <p className="text-xs text-gray-500">Financements Vitalis</p>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur ViFlo</h1>
            <p className="text-gray-500 text-sm mt-1.5">Simplifier le financement, fluidifier les achats.</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.ci"
                autoComplete="email"
                startIcon={<Mail className="w-5 h-5" />}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <button type="button" className="text-sm text-primary hover:text-primary-foreground font-medium transition-colors">
                  Oublié ?
                </button>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
              ) : "Se connecter"}
            </Button>
          </form>

          {/* Comptes de démo */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">Comptes de démonstration</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc, idx) => {
                const Icon = ROLE_ICONS[idx];
                return (
                  <button
                    key={acc.email}
                    type="button"
                    data-active={selectedDemo === idx}
                    onClick={() => fillDemo(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${ROLE_COLORS[idx]}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${ICON_COLORS[idx]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{acc.label}</p>
                      <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0">{acc.password}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            © {new Date().getFullYear()} ViFlo · Plateforme Vitalis · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
