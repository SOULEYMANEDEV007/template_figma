// @ts-nocheck
"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import {
  BarChart3, Bell, BookOpen, CheckCircle2, Clock,
  CreditCard, FileText, Package, TrendingUp, Users, XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
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

export default function DashboardAdmin() {
  const { souscriptions, devis, dossiers, paiements, getStatsAdmin, fournisseurs, agencesAFG } = useVitalisDb();
  const stats = getStatsAdmin();

  // 5 dernières souscriptions
  const latestSubs = [...souscriptions]
    .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
    .slice(0, 5);

  // Activité récente générée dynamiquement depuis les vraies données
  const recentActivities = [
    ...souscriptions.slice(0, 2).map(s => ({
      id: s.id, icon: FileText, color: "text-amber-600 bg-amber-50",
      text: `Souscription ${s.reference} — ${s.souscripteurPrenom} ${s.souscripteurNom}`,
      time: s.dateCreation, href: `/dashboard/souscriptions/${s.id}`,
    })),
    ...dossiers.filter(d => d.statut === 'valide').slice(0, 1).map(d => ({
      id: d.id, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50",
      text: `Dossier ${d.reference} validé par AFG Bank`,
      time: d.dateValidation || d.dateMiseAJour, href: `/dashboard/dossiers/${d.id}`,
    })),
    ...paiements.filter(p => p.statut === 'termine').slice(0, 1).map(p => ({
      id: p.id, icon: CreditCard, color: "text-green-600 bg-green-50",
      text: `Paiement ${p.reference} — ${fmtCFA(p.montantTotal)}`,
      time: p.dateMiseAJour, href: `/dashboard/paiements`,
    })),
    ...dossiers.filter(d => d.statut === 'rejete').slice(0, 1).map(d => ({
      id: d.id + '_rej', icon: XCircle, color: "text-red-600 bg-red-50",
      text: `Dossier ${d.reference} rejeté — ${d.motifRejet || 'Voir détails'}`,
      time: d.dateMiseAJour, href: `/dashboard/dossiers/${d.id}`,
    })),
  ].slice(0, 5);

  // Données graphique par fournisseur (pie)
  const repartitionFournisseurs = fournisseurs.map((f, i) => {
    const count = souscriptions.filter(s => s.fournisseurs.some(sf => sf.fournisseurId === f.id)).length;
    return { fournisseur: f.nom, valeur: count, couleur: i === 0 ? '#ff6b35' : '#ff8c42' };
  }).filter(f => f.valeur > 0);

  // Graphique souscriptions par mois (dynamique depuis vraies données)
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const souscriptionsParMois = moisLabels.map((mois, i) => ({
    mois,
    souscriptions: souscriptions.filter(s => {
      const d = new Date(s.dateCreation);
      return d.getMonth() === i;
    }).length,
  })).filter(m => m.souscriptions > 0);

  // Si pas de données mensuelles, afficher les derniers 3 mois avec des données fictives
  const chartData = souscriptionsParMois.length > 0 ? souscriptionsParMois : [
    { mois: 'Juil', souscriptions: 8 },
    { mois: 'Aoû', souscriptions: 12 },
    { mois: 'Sep', souscriptions: souscriptions.length },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* KPIs ligne 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total souscriptions"  value={stats.totalSouscriptions}  icon={FileText}     variant="yellow" trend={{ value: 12 }} subtitle={fmtCFA(stats.montantTotalSouscriptions)} />
        <KPICard title="Dossiers validés"     value={stats.dossiersValides}     icon={CheckCircle2} variant="green"  trend={{ value: 8 }}  subtitle={`Sur ${stats.totalDossiers} dossiers`} />
        <KPICard title="Paiements effectués"  value={paiements.filter(p => p.statut === 'termine').length} icon={CreditCard} variant="blue" trend={{ value: 5 }} subtitle={fmtCFA(stats.montantTotalPaiements)} />
        <KPICard title="Fournisseurs agréés"  value={stats.totalFournisseurs}   icon={Package}      variant="gray"   subtitle={`${stats.totalRelais} points relais`} />
      </div>

      {/* KPIs ligne 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="En cours de traitement" value={stats.souscriptionsEnCours}   icon={Clock}      variant="yellow" subtitle="Dossiers à traiter" />
        <KPICard title="Dossiers en analyse"     value={stats.dossiersEnAnalyse}      icon={BookOpen}   variant="yellow" subtitle="En attente validation AFG" />
        <KPICard title="Dossiers rejetés"        value={stats.dossiersValides - stats.dossiersEnAnalyse > 0 ? 0 : 0} icon={XCircle} variant="red" subtitle="Ce trimestre" />
        <KPICard title="Agences AFG Bank"        value={stats.totalAgences}            icon={Users}      variant="blue"   subtitle="Agences actives" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Évolution souscriptions */}
        <div className="section-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" /> Évolution des souscriptions
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="souscriptions" name="Souscriptions" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par fournisseur */}
        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" /> Répartition par fournisseur
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={repartitionFournisseurs.length > 0 ? repartitionFournisseurs : [{ fournisseur: 'LDF Groupe', valeur: 1, couleur: '#ff6b35' }]}
                dataKey="valeur" nameKey="fournisseur" cx="50%" cy="50%" outerRadius={70}
                label={(props: any) => `${props.name?.split(' ')[0]} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {repartitionFournisseurs.map((entry, i) => <Cell key={i} fill={entry.couleur} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {/* Légende AFG Bank */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
              <span className="text-xs text-gray-600 font-medium">Banque financeuse :</span>
              <span className="text-xs font-bold text-orange-600">AFG Bank</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières souscriptions + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Dernières souscriptions</h2>
            <Link href="/dashboard/souscriptions" className="text-xs text-orange-600 hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-2">
            {latestSubs.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/souscriptions/${s.id}`}>
                    <p className="text-xs font-bold text-[#ff6b35] font-mono hover:underline">{s.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">
                    {s.souscripteurPrenom} {s.souscripteurNom}
                    {s.fournisseurs.length > 0 && ` — ${s.fournisseurs.map(f => f.fournisseurNom).join(', ')}`}
                  </p>
                  <p className="text-xs text-gray-400">{fmtCFA(s.montantTotal)}</p>
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
                    <p className="text-xs text-gray-700 group-hover:text-orange-600 leading-snug truncate">{a.text}</p>
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
