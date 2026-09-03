"use client";
import { mockDashboardStats, paiementsParMois, souscriptionsParBanque, souscriptionsParFournisseur, souscriptionsParMois } from "@/lib/ldfData";
import { BarChart3, Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function RapportsPage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rapports & Statistiques</h1>
          <p className="page-subtitle">Vue d'ensemble de l'activité LDF Groupe — 2026</p>
        </div>
        <button onClick={() => toast.info("Export PDF simulé")} className="btn-ldf-outline">
          <Download className="w-4 h-4" /> Exporter
        </button>
      </div>

      {/* KPIs résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total souscriptions", value: stats.totalSouscriptions,    color: "text-amber-700",  bg: "bg-amber-50" },
          { label: "Dossiers validés",    value: stats.dossiersValides,        color: "text-emerald-700",bg: "bg-emerald-50"},
          { label: "Paiements encaissés", value: stats.paiementsEncaisses,     color: "text-green-700",  bg: "bg-green-50"  },
          { label: "Articles servis",     value: stats.articlesServis,         color: "text-teal-700",   bg: "bg-teal-50"   },
        ].map(k => (
          <div key={k.label} className="section-card p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${k.bg}`}>
              <TrendingUp className={`w-5 h-5 ${k.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="section-card">
          <div className="section-card-header"><h3 className="text-sm font-semibold text-gray-800">Évolution des souscriptions 2026</h3></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={souscriptionsParMois} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f6c90e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f6c90e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="souscriptions" name="Souscriptions" stroke="#f6c90e" strokeWidth={2.5} fill="url(#g1)" dot={{ fill: "#f6c90e", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header"><h3 className="text-sm font-semibold text-gray-800">Paiements par mois</h3></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paiementsParMois} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="encaisses" name="Encaissés" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="enCours"   name="En cours"  fill="#f6c90e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header"><h3 className="text-sm font-semibold text-gray-800">Par fournisseur</h3></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={souscriptionsParFournisseur} layout="vertical" margin={{ left: 10, right: 10 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="fournisseur" type="category" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip />
                <Bar dataKey="valeur" name="Souscriptions" fill="#f6c90e" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header"><h3 className="text-sm font-semibold text-gray-800">Répartition par banque</h3></div>
          <div className="p-5 flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={souscriptionsParBanque} cx="50%" cy="50%" outerRadius={80} dataKey="valeur" paddingAngle={3}>
                  {souscriptionsParBanque.map((e, i) => <Cell key={i} fill={e.couleur} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} souscriptions`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 w-full">
              {souscriptionsParBanque.map(b => (
                <div key={b.banque} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.couleur }} />
                  <span className="text-gray-600">{b.banque}</span>
                  <span className="ml-auto font-semibold text-gray-800">{b.valeur}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
