// @ts-nocheck
"use client";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardBanque from "./components/DashboardBanque";
import DashboardFournisseur from "./components/DashboardFournisseur";
import DashboardSouscripteur from "./components/DashboardSouscripteur";

// ─── Dashboard principal — routeur par rôle ───────────────────────────────────
export default function DashboardPage() {
  const { user } = useLDFAuthStore();

  return (
    <div className="space-y-4 fade-in">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === "admin" && "Vue d'ensemble de la plateforme ViFlo"}
            {user?.role === "owner" && "Espace Propriétaire — Supervision & Observabilité globale"}
            {user?.role === "banque" && "Tableau de bord — Gestion des dossiers bancaires"}
            {user?.role === "fournisseur" && "Tableau de bord — Mes souscriptions et devis"}
            {user?.role === "souscripteur" && "Mes souscriptions et suivi de financement"}
          </p>
        </div>
      </div>

      {/* Composant dashboard selon le rôle */}
      {user?.role === "admin" && <DashboardAdmin />}
      {user?.role === "owner" && (
        <div className="space-y-4">
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-semibold">Mode Supervision Active</span>
              <span className="text-blue-600">— Vous consultez les données consolidées en lecture seule.</span>
            </div>
            <span className="text-[11px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
              Observabilité globale
            </span>
          </div>
          <DashboardAdmin />
        </div>
      )}
      {user?.role === "banque" && <DashboardBanque />}
      {user?.role === "fournisseur" && <DashboardFournisseur />}
      {user?.role === "souscripteur" && <DashboardSouscripteur />}
    </div>
  );
}
