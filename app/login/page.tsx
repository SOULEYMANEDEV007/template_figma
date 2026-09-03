"use client";
import { demoAccounts } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
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
      toast.success("Connexion réussie !");
      router.replace("/dashboard");
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

  const ROLE_ICONS = [ShieldCheck, Building2, TrendingUp];
  const ROLE_COLORS = [
    "border-purple-200 bg-purple-50 hover:border-purple-400 data-[active=true]:border-purple-500 data-[active=true]:bg-purple-50",
    "border-blue-200 bg-blue-50 hover:border-blue-400 data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50",
    "border-amber-200 bg-amber-50 hover:border-amber-400 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50",
  ];
  const ICON_COLORS = ["text-purple-600", "text-blue-600", "text-amber-600"];

  return (
    <div className="min-h-screen flex">
      {/* ── Colonne gauche — branding ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)" }}>

        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-400 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-400 blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
            <Image src="/images/ldfgroupe-icon-app.webp" alt="LDF" width={48} height={48} className="object-contain"
              onError={() => {}} />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">LDF Groupe</p>
            <p className="text-slate-400 text-sm mt-0.5">Librairie de France</p>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">Plateforme de souscriptions</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Gérez tout le cycle<br />de vos souscriptions<br />
              <span style={{ background: "linear-gradient(90deg,#f6c90e,#22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                en un seul endroit.
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-sm">
              Suivez chaque étape du processus : souscription, devis, validation bancaire, paiement et service des articles.
            </p>
          </div>

          {/* Steps */}
          {[
            { step: "01", label: "Souscription créée", color: "bg-amber-400" },
            { step: "02", label: "Devis envoyé à la banque", color: "bg-emerald-400" },
            { step: "03", label: "Validation & Paiement", color: "bg-blue-400" },
            { step: "04", label: "Articles servis", color: "bg-teal-400" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{s.step}</span>
              </div>
              <span className="text-slate-300 text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: "Souscriptions", value: "30+" },
            { label: "Fournisseurs", value: "8" },
            { label: "Banques", value: "4" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Colonne droite — formulaire ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-gray-50">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <Image src="/images/ldfgroupe-icon-app.webp" alt="LDF" width={40} height={40} className="object-contain" onError={() => {}} />
            </div>
            <div>
              <p className="font-bold text-gray-900">LDF Groupe</p>
              <p className="text-xs text-gray-500">Plateforme souscriptions</p>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur votre espace</h1>
            <p className="text-gray-500 text-sm mt-1.5">Connectez-vous pour accéder à votre tableau de bord.</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="ldf-label">Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.ci"
                  className="ldf-input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="ldf-label mb-0">Mot de passe</label>
                <button type="button" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ldf-input pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 text-sm font-semibold rounded-lg transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#f6c90e,#f0a500)", color: "#1a1005" }}
            >
              {submitting || isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : "Se connecter"}
            </button>
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
            © {new Date().getFullYear()} Librairie de France Groupe · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
