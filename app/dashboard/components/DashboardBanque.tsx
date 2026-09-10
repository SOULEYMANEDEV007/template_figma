// @ts-nocheck
"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { CheckCircle2, Clock, CreditCard, FileText, TrendingUp, XCircle } from "lucide-react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

const dossiersParMoisFictifs = [
  { mois: "Jan", valides: 2, rejetes: 0, enCours: 1 },
  { mois: "Fév", valides: 3, rejetes: 1, enCours: 2 },
  { mois: "Mar", valides: 4, rejetes: 1, enCours: 2 },
  { mois: "Avr", valides: 2, rejetes: 1, enCours: 5 },
  { mois: "Mai", valides: 5, rejetes: 0, enCours: 3 },
  { mois: "Jun", valides: 6, rejetes: 1, enCours: 4 },
];

export default function DashboardBanque() {
  const { dossiers, getStatsBanque } = useVitalisDb();
  const stats = getStatsBanque();

  const dossiersATraiter = dossiers
    .filter(d => d.statut === "recu" || d.statut === "en_analyse" || d.statut === "informations_demandees")
    .slice(0, 6);

  // PieChart par statut
  const dossiersParStatutData = [
    { statut: "Validés",       valeur: stats.dossiersValides,     couleur: "#22c55e" },
    { statut: "En traitement", valeur: stats.dossiersEnTraitement, couleur: "#ff8c42" },
    { statut: "Rejetés",       valeur: stats.dossiersRejetes,     couleur: "#ef4444" },
  ].filter(d => d.valeur > 0);

  return (
    <div className="space-y-6 fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Dossiers reçus"        value={stats.dossiersRecus}        icon={FileText}     variant="yellow" subtitle="Total programme Vitalis" />
        <KPICard title="En cours d'analyse"    value={stats.dossiersEnTraitement} icon={Clock}        variant="yellow" subtitle="À traiter en priorité" />
        <KPICard title="Dossiers validés"      value={stats.dossiersValides}      icon={CheckCircle2} variant="green"  subtitle={fmtCFA(stats.montantTotal)} />
        <KPICard title="Taux d'approbation"    value={`${stats.tauxApprobation}%`} icon={TrendingUp}  variant="blue"   subtitle="Depuis lancement" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card p-5 col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" /> Dossiers traités par mois
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dossiersParMoisFictifs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="valides"  name="Validés"  fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejetes"  name="Rejetés"  fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="enCours"  name="En cours" fill="#ff8c42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Dossiers par statut</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={dossiersParStatutData.length > 0 ? dossiersParStatutData : [{ statut: 'Aucun', valeur: 1, couleur: '#e5e7eb' }]}
                dataKey="valeur" nameKey="statut" cx="50%" cy="50%" outerRadius={70}
              >
                {dossiersParStatutData.map((entry, i) => <Cell key={i} fill={entry.couleur} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Badge AFG Bank */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-bold text-orange-600">AFG Bank — Banque financeuse unique</span>
          </div>
        </div>
      </div>

      {/* Dossiers à traiter */}
      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Dossiers à traiter
            {dossiersATraiter.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                {dossiersATraiter.length} urgent{dossiersATraiter.length > 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <Link href="/dashboard/dossiers" className="text-xs text-orange-600 hover:underline">Voir tout →</Link>
        </div>
        {dossiersATraiter.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">✅ Aucun dossier en attente</p>
        ) : (
          <div className="space-y-2">
            {dossiersATraiter.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/dossiers/${d.id}`}>
                    <p className="text-xs font-bold text-[#ff6b35] font-mono hover:underline">{d.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">
                    {d.souscripteurPrenom} {d.souscripteurNom} — {d.fournisseursNoms}
                  </p>
                  <p className="text-xs text-gray-400">{fmtCFA(d.montantTotal)}</p>
                </div>
                <StatusBadge statut={d.statut} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
