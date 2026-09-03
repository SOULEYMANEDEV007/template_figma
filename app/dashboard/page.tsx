"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import {
  dossiersParStatut, mockDashboardStats, mockNotifications,
  mockSouscriptions, paiementsParMois, souscriptionsParBanque,
  souscriptionsParFournisseur, souscriptionsParMois,
} from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  BarChart3, Bell, BookOpen, Building2, CheckCircle2,
  Clock, CreditCard, FileText, Package, TrendingUp, Users, XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

// ─── Formatage monnaie ────────────────────────────────────────────────────────
const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " FCFA";

// ─── Activités récentes ───────────────────────────────────────────────────────
const recentActivities = [
  { id: 1, icon: FileText,     color: "text-amber-600  bg-amber-50",   text: "Nouvelle souscription SUB-2026-00030 créée",              time: "Il y a 2h",   href: "/dashboard/souscriptions/SUB-030"  },
  { id: 2, icon: BookOpen,     color: "text-blue-600   bg-blue-50",    text: "Devis DEV-2026-00022 envoyé à Coris Bank",               time: "Il y a 4h",   href: "/dashboard/devis/DEV-022"          },
  { id: 3, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50",text: "Dossier DOS-2026-00021 validé par la BIAO",              time: "Il y a 6h",   href: "/dashboard/dossiers/DOS-021"       },
  { id: 4, icon: CreditCard,   color: "text-green-600  bg-green-50",   text: "Paiement PAY-2026-00017 encaissé — 2 700 000 FCFA",      time: "Il y a 1j",   href: "/dashboard/paiements/PAY-017"      },
  { id: 5, icon: XCircle,      color: "text-red-600    bg-red-50",     text: "Dossier DOS-2026-00019 rejeté par Coris Bank",           time: "Il y a 1j",   href: "/dashboard/dossiers/DOS-019"       },
  { id: 6, icon: Package,      color: "text-teal-600   bg-teal-50",    text: "Articles servis — souscription SUB-2026-00023",          time: "Il y a 2j",   href: "/dashboard/souscriptions/SUB-023"  },
  { id: 7, icon: Bell,         color: "text-purple-600 bg-purple-50",  text: "Nouveau compte fournisseur : Kalahari Fournitures",      time: "Il y a 3j",   href: "/dashboard/admin/fournisseurs"     },
];

// ─── Tooltip custom ───────────────────────────────────────────────────────────
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useLDFAuthStore();
  const stats = mockDashboardStats;

  // Dernières souscriptions
  const latestSubs = [...mockSouscriptions]
    .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
    .slice(0, 5);

  // Notifications non lues
  const unread = mockNotifications.filter((n) => !n.estLue).slice(0, 4);

  return (
    <div className="space-y-6 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Voici un aperçu de l&apos;activité de la plateforme LDF Groupe.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          Mis à jour : {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* ── KPIs row 1 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total souscriptions"  value={stats.totalSouscriptions}  icon={FileText}  variant="yellow" trend={{ value: 12 }} subtitle={`${fmtCFA(stats.montantTotalSouscriptions)}`} />
        <KPICard title="Dossiers validés"     value={stats.dossiersValides}     icon={CheckCircle2} variant="green" trend={{ value: 8 }}  subtitle="Sur 22 dossiers" />
        <KPICard title="Paiements encaissés"  value={stats.paiementsEncaisses}  icon={CreditCard}   variant="blue"  trend={{ value: 5 }}  subtitle="5 encaissements" />
        <KPICard title="Articles servis"      value={stats.articlesServis}      icon={Package}      variant="gray"  trend={{ value: 3 }}  subtitle="Livraisons confirmées" />
      </div>

      {/* ── KPIs row 2 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="En attente banque"    value={stats.souscriptionsEnAttente} icon={Clock}     variant="yellow" subtitle="Dossiers à traiter" />
        <KPICard title="Dossiers rejetés"     value={stats.dossiersRejetes}        icon={XCircle}   variant="red"    subtitle="3 rejets ce trimestre" />
        <KPICard title="Devis en attente"     value={stats.devisEnAttente}         icon={BookOpen}  variant="yellow" subtitle="En attente validation" />
        <KPICard title="Paiements en cours"   value={stats.paiementsEnCours}       icon={TrendingUp} variant="blue"  subtitle={fmtCFA(stats.montantTotalPaiements)} />
      </div>

      {/* ── Graphiques ligne 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Évolution souscriptions */}
        <div className="section-card lg:col-span-2">
          <div className="section-card-header">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Évolution des souscriptions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Nombre et montants par mois — 2026</p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">2026</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={souscriptionsParMois} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradYellow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f6c90e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f6c90e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="souscriptions" name="Souscriptions" stroke="#f6c90e" strokeWidth={2.5} fill="url(#gradYellow)" dot={{ fill: "#f6c90e", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="text-sm font-semibold text-gray-800">Dossiers par statut</h3>
          </div>
          <div className="p-5 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={dossiersParStatut} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="valeur" paddingAngle={3}>
                  {dossiersParStatut.map((entry, i) => (
                    <Cell key={i} fill={entry.couleur} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} dossiers`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 mt-2">
              {dossiersParStatut.map((d) => (
                <div key={d.statut} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.couleur }} />
                    <span className="text-gray-600">{d.statut}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{d.valeur}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Graphiques ligne 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Paiements par mois */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="text-sm font-semibold text-gray-800">Paiements par mois</h3>
            <p className="text-xs text-gray-400">Encaissés vs En cours</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paiementsParMois} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="encaisses" name="Encaissés"  fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="enCours"   name="En cours"   fill="#f6c90e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Souscriptions par fournisseur */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="text-sm font-semibold text-gray-800">Souscriptions par fournisseur</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={souscriptionsParFournisseur} layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="fournisseur" type="category" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valeur" name="Souscriptions" fill="#f6c90e" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Souscriptions par banque ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="text-sm font-semibold text-gray-800">Répartition par banque</h3>
          </div>
          <div className="p-5 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={souscriptionsParBanque} cx="50%" cy="50%" outerRadius={70}
                  dataKey="valeur" paddingAngle={2}>
                  {souscriptionsParBanque.map((entry, i) => (
                    <Cell key={i} fill={entry.couleur} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} souscriptions`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 mt-1">
              {souscriptionsParBanque.map((b) => (
                <div key={b.banque} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.couleur }} />
                    <span className="text-gray-600">{b.banque}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{b.valeur}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="section-card lg:col-span-2">
          <div className="section-card-header">
            <h3 className="text-sm font-semibold text-gray-800">Activités récentes</h3>
            <Link href="/dashboard/notifications" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivities.map((a) => (
              <Link key={a.id} href={a.href}
                className="flex items-start gap-3 px-5 py-3 hover:bg-amber-50/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${a.color}`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dernières souscriptions ── */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Dernières souscriptions</h3>
            <p className="text-xs text-gray-400 mt-0.5">{mockSouscriptions.length} souscriptions au total</p>
          </div>
          <Link href="/dashboard/souscriptions" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Souscripteur</th>
                <th>Fournisseur</th>
                <th>Banque</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestSubs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/dashboard/souscriptions/${s.id}`}
                      className="font-mono text-xs font-semibold text-amber-700 hover:text-amber-800">
                      {s.reference}
                    </Link>
                  </td>
                  <td className="font-medium text-gray-800">{s.souscripteurPrenom} {s.souscripteurNom}</td>
                  <td className="text-gray-600 text-xs">{s.fournisseurNom}</td>
                  <td className="text-gray-600 text-xs">{s.banqueNom}</td>
                  <td className="font-semibold text-gray-800 text-xs">{fmtCFA(s.montantTotal)}</td>
                  <td><StatusBadge statut={s.statut} /></td>
                  <td className="text-gray-400 text-xs">{new Date(s.dateCreation).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Stats rapides admin ── */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Fournisseurs actifs", value: 7, icon: Building2, href: "/dashboard/admin/fournisseurs", color: "text-amber-600 bg-amber-50" },
            { label: "Banques partenaires", value: 4, icon: Building2, href: "/dashboard/admin/banques",      color: "text-blue-600 bg-blue-50"   },
            { label: "Utilisateurs",        value: 8, icon: Users,     href: "/dashboard/admin/utilisateurs", color: "text-purple-600 bg-purple-50"},
            { label: "Total devis",         value: 22, icon: BookOpen, href: "/dashboard/devis",              color: "text-emerald-600 bg-emerald-50"},
          ].map((s) => (
            <Link key={s.label} href={s.href}
              className="section-card flex items-center gap-3 p-4 hover:border-amber-200 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
