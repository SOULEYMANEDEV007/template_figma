// @ts-nocheck
"use client";
/**
 * TABLEAU DE BORD FOURNISSEUR — Espace principal
 * Vue synthétique : KPIs, devis récents, commandes en cours
 */

import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ArrowRight, Box, CheckCircle2, FileText, Package, Plus, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function FournisseurDashboardPage() {
  const { user } = useLDFAuthStore();
  const { souscriptions, devis, dossiers } = useVitalisDb();

  const fournisseurId = user?.organisationId;

  const mesDevis = useMemo(() =>
    devis.filter(d => !fournisseurId || d.fournisseurId === fournisseurId)
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
      .slice(0, 5),
    [devis, fournisseurId]);

  const mesSouscriptions = useMemo(() =>
    souscriptions.filter(s =>
      !fournisseurId || s.fournisseurs.some(f => f.fournisseurId === fournisseurId)
    ), [souscriptions, fournisseurId]);

  const mesCommandes = mesSouscriptions.filter(s =>
    ["fournisseur_paye", "commande_en_preparation"].includes(s.statut)
  );

  const stats = {
    devisTotal:    devis.filter(d => !fournisseurId || d.fournisseurId === fournisseurId).length,
    devisValides:  devis.filter(d => (!fournisseurId || d.fournisseurId === fournisseurId) && d.statut === "valide").length,
    commandesEnCours: mesCommandes.length,
    livraisonsOk:  mesSouscriptions.filter(s => s.statut === "livre").length,
    montantTotal:  devis.filter(d => (!fournisseurId || d.fournisseurId === fournisseurId) && d.statut === "valide").reduce((a, d) => a + d.totalTTC, 0),
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord Fournisseur</h1>
          <p className="page-subtitle">Programme VITALIS · AFG Bank</p>
        </div>
        <Link href="/dashboard/devis/nouveau" className="btn-ldf-primary">
          <Plus className="w-4 h-4" /> Nouveau devis
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Devis émis",           value: stats.devisTotal,        icon: FileText,     color: "text-blue-600   bg-blue-50"   },
          { label: "Devis validés",         value: stats.devisValides,      icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50"},
          { label: "Commandes en cours",    value: stats.commandesEnCours,  icon: Package,      color: "text-amber-600  bg-amber-50"  },
          { label: "CA validé",             value: fmtCFA(stats.montantTotal), icon: TrendingUp, color: "text-orange-600  bg-orange-50", isStr: true },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="section-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className={`font-bold text-gray-900 ${k.isStr ? "text-sm" : "text-xl"}`}>{k.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Commandes en cours */}
        <div className="section-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-800">Commandes en cours</h2>
            </div>
            <Link href="/dashboard/fournisseur/commandes"
              className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {mesCommandes.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Aucune commande en cours
              </div>
            ) : mesCommandes.slice(0, 4).map(s => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-orange-50/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800 font-mono">{s.reference}</p>
                  <p className="text-xs text-gray-400">{s.souscripteurPrenom} {s.souscripteurNom}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge statut={s.statut} size="sm" />
                  <Link href="/dashboard/fournisseur/commandes"
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devis récents */}
        <div className="section-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-800">Devis récents</h2>
            </div>
            <Link href="/dashboard/devis"
              className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {mesDevis.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Aucun devis émis
              </div>
            ) : mesDevis.map(d => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-orange-50/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800 font-mono">{d.reference}</p>
                  <p className="text-xs text-gray-400">{d.souscripteurPrenom} {d.souscripteurNom} · {fmtCFA(d.totalTTC)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge statut={d.statut} size="sm" />
                  <Link href={`/dashboard/devis/${d.id}`}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="section-card p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Accès rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: "/dashboard/devis/nouveau",           label: "Créer un devis",         icon: Plus,        color: "bg-orange-500 text-white hover:bg-orange-600" },
            { href: "/dashboard/fournisseur/commandes",   label: "Gérer mes commandes",    icon: Package,     color: "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300" },
            { href: "/dashboard/devis",                   label: "Mes devis",              icon: FileText,    color: "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300" },
          ].map(r => {
            const Icon = r.icon;
            return (
              <Link key={r.href} href={r.href}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${r.color}`}>
                <Icon className="w-4 h-4" /> {r.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
