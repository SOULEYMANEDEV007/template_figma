"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAccounts } from "@/lib/ldfData";
import { getDashboardPath, useLDFAuthStore } from "@/stores/ldfAuth";
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, User } from "lucide-react";
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
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 gradient-hero">

        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-cyan-400 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-green-400 blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
        </div>

        {/* Logo ViFlo */}
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
            <Image src="/images/viflow_logo.png" alt="ViFlow" width={56} height={56} className="object-contain"
              onError={() => { }} />
          </div>
          <div>
            <p className="text-white font-bold text-2xl leading-none">
              Vi<span className="text-gradient-vf">Flow</span>
            </p>
            <p className="text-cyan-300/90 text-sm mt-1">Simplifier le financement</p>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300 text-xs font-medium">Plateforme de gestion et de suivi des financements Vitalis.</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Simplifier le financement,<br />
              fluidifier les achats
            </h2>
            <p className="text-cyan-100/70 text-sm mt-4 leading-relaxed max-w-md">
              Suivez chaque étape : souscription, devis, validation bancaire, paiement et service.
            </p>
          </div>

          {/* Steps */}
          {[
            { step: "01", label: "Validation du prêt", color: "bg-cyan-400" },
            { step: "02", label: "Paiement et Achat des articles", color: "bg-green-400" },
            { step: "03", label: "Dévis généré et envoyé", color: "bg-emerald-400" },
            { step: "04", label: "Articles servis", color: "bg-teal-400" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{s.step}</span>
              </div>
              <span className="text-cyan-100/80 text-sm">{s.label}</span>
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
              <p className="text-cyan-300/70 text-xs mt-0.5">{s.label}</p>
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
              <Image src="/images/viflow_logo.png" alt="ViFlo" width={48} height={48} className="object-contain" onError={() => { }} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">ViFlow</p>
              <p className="text-xs text-gray-500">Financements Vitalis</p>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur ViFlow</h1>
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
