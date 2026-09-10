// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockFeedbacks } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const ICON_MAP: Record<string, { icon: typeof CheckCircle2; bg: string; color: string }> = {
  valide:                  { icon: CheckCircle2,  bg: "bg-emerald-50", color: "text-emerald-600" },
  rejete:                  { icon: XCircle,       bg: "bg-red-50",     color: "text-red-600"     },
  informations_demandees:  { icon: MessageSquare, bg: "bg-amber-50",   color: "text-amber-600"   },
};

export default function FeedbacksPage() {
  const { user } = useLDFAuthStore();

  const feedbacks = useMemo(() =>
    mockFeedbacks.filter(f =>
      user?.role === "fournisseur" ? f.fournisseurId === user.organisationId : true
    ), [user]);

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedbacks bancaires</h1>
          <p className="page-subtitle">Retours des banques sur vos dossiers</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Validés",         value: feedbacks.filter(f => f.statut === "valide").length,                color: "border-l-emerald-400 text-emerald-700" },
          { label: "Rejetés",         value: feedbacks.filter(f => f.statut === "rejete").length,                color: "border-l-red-400 text-red-700"         },
          { label: "Infos demandées", value: feedbacks.filter(f => f.statut === "informations_demandees").length, color: "border-l-amber-400 text-amber-700"     },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${k.color.split(" ")[0]}`}>
            <p className={`text-2xl font-bold ${k.color.split(" ")[1]}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Liste feedbacks */}
      {feedbacks.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm">Aucun feedback disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(f => {
            const cfg = ICON_MAP[f.statut] ?? ICON_MAP["valide"];
            const Icon = cfg.icon;
            return (
              <div key={f.id} className="section-card hover:shadow-md transition-shadow">
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/dashboard/dossiers/${f.dossierId}`}
                          className="font-mono text-sm font-bold text-amber-700 hover:underline">{f.dossierRef}</Link>
                        <StatusBadge statut={f.statut} size="sm" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{f.banqueNom}</p>
                        <p className="text-xs text-gray-400">{new Date(f.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">{f.souscripteurNom}</p>
                    <div className={`p-3 rounded-lg text-sm leading-relaxed ${
                      f.statut === "valide" ? "bg-emerald-50 text-emerald-800" :
                      f.statut === "rejete" ? "bg-red-50 text-red-800" :
                      "bg-amber-50 text-amber-800"}`}>
                      {f.commentaire}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Link href={`/dashboard/dossiers/${f.dossierId}`}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                        Voir le dossier →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
