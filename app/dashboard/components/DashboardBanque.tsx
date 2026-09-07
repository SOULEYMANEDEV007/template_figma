"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockDashboardStatsBanque, mockDossiers, dossiersParStatut } from "@/lib/ldfData";
import { CheckCircle2, Clock, CreditCard, TrendingUp, XCircle } from "lucide-react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

const dossiersParMois = [
  { mois: "Jan", valides: 2, rejetes: 0, enCours: 1 },
  { mois: "Fév", valides: 3, rejetes: 1, enCours: 2 },
  { mois: "Mar", valides: 4, rejetes: 1, enCours: 2 },
  { mois: "Avr", valides: 2, rejetes: 1, enCours: 5 },
];

export default function DashboardBanque() {
  const stats = mockDashboardStatsBanque;
  const dossiersATraiter = mockDossiers
    .filter(d => d.statut === "recu" || d.statut === "en_cours_traitement")
    .slice(0, 6);

  return (
    <div className="space-y-6 fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Dossiers en attente" value={stats.dossiersEnAttente} icon={Clock}        variant="yellow" subtitle="À traiter en priorité" />
        <KPICard title="Dossiers validés"    value={stats.dossiersValides}   icon={CheckCircle2} variant="green"  subtitle="Ce semestre" />
        <KPICard title="Dossiers rejetés"    value={stats.dossiersRejetes}   icon={XCircle}      variant="red"    subtitle="3 ce trimestre" />
        <KPICard title="Paiements en cours"  value={stats.paiementsEnCours}  icon={CreditCard}   variant="blue"   subtitle={fmtCFA(stats.montantEnCours)} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card p-5 col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-500" /> Dossiers par mois
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dossiersParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="valides"  name="Validés"  fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejetes"  name="Rejetés"  fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="enCours"  name="En cours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Dossiers par statut</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dossiersParStatut} dataKey="valeur" nameKey="statut" cx="50%" cy="50%" outerRadius={70}>
                {dossiersParStatut.map((entry, i) => <Cell key={i} fill={entry.couleur} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dossiers à traiter */}
      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Dossiers à traiter</h2>
          <Link href="/dashboard/dossiers" className="text-xs text-cyan-600 hover:underline">Voir tout →</Link>
        </div>
        {dossiersATraiter.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun dossier en attente</p>
        ) : (
          <div className="space-y-2">
            {dossiersATraiter.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/dossiers/${d.id}`}>
                    <p className="text-xs font-semibold text-cyan-700 font-mono hover:underline">{d.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{d.souscripteurPrenom} {d.souscripteurNom} — {d.fournisseurNom}</p>
                  <p className="text-xs text-gray-400">{fmtCFA(d.montant)}</p>
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
