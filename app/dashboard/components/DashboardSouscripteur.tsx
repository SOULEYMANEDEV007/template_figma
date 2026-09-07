"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockSouscriptions } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

// Explication du processus de financement
const ETAPES = [
  { num: "01", label: "Souscription créée",      color: "bg-cyan-400",    desc: "Votre fournisseur crée une souscription en votre nom" },
  { num: "02", label: "Devis envoyé",            color: "bg-blue-400",    desc: "Le fournisseur prépare un devis avec les articles" },
  { num: "03", label: "Banque valide",           color: "bg-emerald-400", desc: "La banque examine et valide votre dossier" },
  { num: "04", label: "Paiement effectué",       color: "bg-green-400",   desc: "La banque procède au paiement du fournisseur" },
  { num: "05", label: "Articles livrés ✓",      color: "bg-teal-400",    desc: "Vous récupérez vos articles en magasin" },
];

export default function DashboardSouscripteur() {
  const { user } = useLDFAuthStore();

  const mesSouscriptions = useMemo(() => {
    if (!user || user.role !== "souscripteur") return [];
    return mockSouscriptions.filter(s => s.souscripteurEmail === user.email);
  }, [user]);

  const stats = useMemo(() => ({
    total:     mesSouscriptions.length,
    enAttente: mesSouscriptions.filter(s => s.statut === "soumise" || s.statut === "en_attente").length,
    validees:  mesSouscriptions.filter(s => s.statut === "validee" || s.statut === "payee").length,
    servies:   mesSouscriptions.filter(s => s.statut === "servie").length,
  }), [mesSouscriptions]);

  return (
    <div className="space-y-5 fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",      value: stats.total,     border: "border-l-amber-400",   text: "text-amber-700" },
          { label: "En attente", value: stats.enAttente, border: "border-l-orange-400",  text: "text-orange-700" },
          { label: "Validées",   value: stats.validees,  border: "border-l-emerald-400", text: "text-emerald-700" },
          { label: "Servies",    value: stats.servies,   border: "border-l-teal-400",    text: "text-teal-700" },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${k.border}`}>
            <p className={`text-2xl font-bold ${k.text}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Processus */}
      <div className="section-card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">ℹ️ Comment fonctionne le financement ?</h2>
        <div className="flex flex-wrap gap-3">
          {ETAPES.map((e, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className={`w-6 h-6 rounded-full ${e.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{e.num}</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">{e.label}</p>
                <p className="text-[10px] text-gray-400">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mes souscriptions */}
      {mesSouscriptions.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium">Aucune souscription en cours</p>
          <p className="text-xs mt-1">Vous serez notifié dès qu&apos;une souscription sera créée pour vous.</p>
        </div>
      ) : (
        <div className="section-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Mes souscriptions</h2>
          </div>
          <div className="space-y-2">
            {mesSouscriptions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/souscriptions/${s.id}`}>
                    <p className="text-xs font-semibold text-amber-700 font-mono hover:underline">{s.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{s.fournisseurNom} — {s.duree} mois</p>
                  <p className="text-xs text-gray-400">{s.montantTotal > 0 ? fmtCFA(s.montantTotal) : "Montant à définir"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge statut={s.statut} size="sm" />
                  <Link href={`/dashboard/souscriptions/${s.id}`} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-cyan-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
