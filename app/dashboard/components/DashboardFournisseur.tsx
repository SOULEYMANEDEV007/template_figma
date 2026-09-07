"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockDashboardStatsFournisseur, mockSouscriptions, souscriptionsParBanque } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { BookOpen, CheckCircle2, CreditCard, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from "recharts";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

export default function DashboardFournisseur() {
  const { user } = useLDFAuthStore();
  const stats = mockDashboardStatsFournisseur;

  // Filtrer les souscriptions du fournisseur connecté
  const mesSouscriptions = useMemo(() => {
    if (!user?.organisationId) return mockSouscriptions.slice(0, 8);
    return mockSouscriptions
      .filter(s => s.fournisseurId === user.organisationId)
      .slice(0, 8);
  }, [user]);

  return (
    <div className="space-y-6 fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Mes souscriptions"    value={stats.mesSouscriptions}   icon={FileText}     variant="yellow" subtitle={fmtCFA(stats.montantTotalMesSouscriptions)} />
        <KPICard title="Mes devis"            value={stats.mesDevis}           icon={BookOpen}     variant="blue"   subtitle="Devis créés" />
        <KPICard title="Dossiers validés"     value={stats.mesDossiersValides} icon={CheckCircle2} variant="green"  subtitle="Financements accordés" />
        <KPICard title="Paiements reçus"      value={stats.mesPaiements}       icon={CreditCard}   variant="gray"   subtitle={fmtCFA(stats.montantTotalMesPaiements)} />
      </div>

      {/* Action rapide */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-5 text-white flex items-center justify-between">
        <div>
          <p className="font-semibold text-base">Créer une nouvelle souscription</p>
          <p className="text-amber-100 text-xs mt-0.5">Remplissez les informations de votre client et soumettez</p>
        </div>
        <Link href="/dashboard/souscriptions/nouveau" className="flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Nouvelle souscription
        </Link>
      </div>

      {/* Graphique + Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Répartition par banque</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={souscriptionsParBanque} dataKey="valeur" nameKey="banque" cx="50%" cy="50%" outerRadius={70}>
                {souscriptionsParBanque.map((entry, i) => <Cell key={i} fill={entry.couleur} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Mes dernières souscriptions</h2>
            <Link href="/dashboard/souscriptions" className="text-xs text-cyan-600 hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-2">
            {mesSouscriptions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/souscriptions/${s.id}`}>
                    <p className="text-xs font-semibold text-amber-700 font-mono hover:underline">{s.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{s.souscripteurPrenom} {s.souscripteurNom} — {s.banqueNom}</p>
                  <p className="text-xs text-gray-400">{new Date(s.dateCreation).toLocaleDateString("fr-FR")}</p>
                </div>
                <StatusBadge statut={s.statut} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
