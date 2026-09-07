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
            {user?.role === "admin" && "Vue d'ensemble de la plateforme ViFlow"}
            {user?.role === "banque" && "Tableau de bord — Gestion des dossiers bancaires"}
            {user?.role === "fournisseur" && "Tableau de bord — Mes souscriptions et devis"}
            {user?.role === "souscripteur" && "Mes souscriptions et suivi de financement"}
          </p>
        </div>
      </div>

      {/* Composant dashboard selon le rôle */}
      {user?.role === "admin" && <DashboardAdmin />}
      {user?.role === "banque" && <DashboardBanque />}
      {user?.role === "fournisseur" && <DashboardFournisseur />}
      {user?.role === "souscripteur" && <DashboardSouscripteur />}
    </div>
  );
}
