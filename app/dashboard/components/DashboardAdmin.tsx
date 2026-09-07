"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import {
  mockDashboardStats, mockSouscriptions,
  souscriptionsParBanque, souscriptionsParMois,
} from "@/lib/ldfData";
import {
  BarChart3, Bell, BookOpen, CheckCircle2, Clock,
  CreditCard, FileText, Package, TrendingUp, Users, XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-gray-500">{p.name} :</span>
          <span className="font-medium text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const recentActivities = [
  { id: 1, icon: FileText,     color: "text-cyan-600 bg-cyan-50",      text: "Nouvelle souscription SUB-2026-00030 créée",         time: "Il y a 2h",  href: "/dashboard/souscriptions/SUB-030" },
  { id: 2, icon: BookOpen,     color: "text-blue-600 bg-blue-50",      text: "Devis DEV-2026-00022 envoyé à Coris Bank",           time: "Il y a 4h",  href: "/dashboard/devis/DEV-022" },
  { id: 3, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50",text: "Dossier DOS-2026-00021 validé par la BIAO",          time: "Il y a 6h",  href: "/dashboard/dossiers/DOS-021" },
  { id: 4, icon: CreditCard,   color: "text-green-600 bg-green-50",    text: "Paiement PAY-2026-00017 encaissé — 2 700 000 FCFA", time: "Il y a 1j",  href: "/dashboard/paiements/PAY-017" },
  { id: 5, icon: XCircle,      color: "text-red-600 bg-red-50",        text: "Dossier DOS-2026-00019 rejeté par Coris Bank",       time: "Il y a 1j",  href: "/dashboard/dossiers/DOS-019" },
];

export default function DashboardAdmin() {
  const stats = mockDashboardStats;
  const latestSubs = [...mockSouscriptions]
    .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
    .slice(0, 5);

  return (
    <div className="space-y-6 fade-in">
      {/* KPIs ligne 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total souscriptions"  value={stats.totalSouscriptions}  icon={FileText}     variant="yellow" trend={{ value: 12 }} subtitle={fmtCFA(stats.montantTotalSouscriptions)} />
        <KPICard title="Dossiers validés"     value={stats.dossiersValides}     icon={CheckCircle2} variant="green"  trend={{ value: 8 }}  subtitle="Sur 22 dossiers" />
        <KPICard title="Paiements encaissés"  value={stats.paiementsEncaisses}  icon={CreditCard}   variant="blue"   trend={{ value: 5 }}  subtitle="5 encaissements" />
        <KPICard title="Articles servis"      value={stats.articlesServis}      icon={Package}      variant="gray"   trend={{ value: 3 }}  subtitle="Livraisons confirmées" />
      </div>

      {/* KPIs ligne 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="En attente banque"   value={stats.souscriptionsEnAttente} icon={Clock}      variant="yellow" subtitle="Dossiers à traiter" />
        <KPICard title="Dossiers rejetés"    value={stats.dossiersRejetes}        icon={XCircle}    variant="red"    subtitle="3 rejets ce trimestre" />
        <KPICard title="Devis en attente"    value={stats.devisEnAttente}         icon={BookOpen}   variant="yellow" subtitle="En attente validation" />
        <KPICard title="Paiements en cours"  value={stats.paiementsEnCours}       icon={TrendingUp} variant="blue"   subtitle={fmtCFA(stats.montantTotalPaiements)} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Évolution souscriptions */}
        <div className="section-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" /> Évolution des souscriptions
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={souscriptionsParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="souscriptions" name="Souscriptions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par banque */}
        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" /> Répartition par banque
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={souscriptionsParBanque} dataKey="valeur" nameKey="banque" cx="50%" cy="50%" outerRadius={70} label={(props: any) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {souscriptionsParBanque.map((entry, i) => <Cell key={i} fill={entry.couleur} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dernières souscriptions + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Dernières souscriptions</h2>
            <Link href="/dashboard/souscriptions" className="text-xs text-cyan-600 hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-2">
            {latestSubs.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/souscriptions/${s.id}`}>
                    <p className="text-xs font-semibold text-amber-700 font-mono hover:underline">{s.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{s.souscripteurPrenom} {s.souscripteurNom} — {s.fournisseurNom}</p>
                </div>
                <StatusBadge statut={s.statut} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-500" /> Activité récente
          </h2>
          <div className="space-y-3">
            {recentActivities.map(a => {
              const Icon = a.icon;
              return (
                <Link key={a.id} href={a.href} className="flex items-start gap-2.5 group">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 group-hover:text-cyan-600 leading-snug truncate">{a.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
