// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockDossiers } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { AlertCircle, CheckCircle2, ChevronRight, Eye, MessageSquare, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function BanqueDossiersPage() {
  const { user } = useLDFAuthStore();
  const [activeTab, setActiveTab] = useState<"en_attente" | "tous">("en_attente");

  const myDossiers = useMemo(() =>
    mockDossiers.filter(d =>
      user?.role === "banque" ? d.banqueId === user.organisationId : true
    ), [user]);

  const enAttente = myDossiers.filter(d =>
    d.statut === "recu" || d.statut === "en_cours_traitement"
  );
  const tous = myDossiers;
  const displayed = activeTab === "en_attente" ? enAttente : tous;

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers à traiter</h1>
          <p className="page-subtitle">{enAttente.length} dossier{enAttente.length > 1 ? "s" : ""} en attente de décision</p>
        </div>
      </div>

      {/* Alerte dossiers urgents */}
      {enAttente.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {enAttente.length} dossier{enAttente.length > 1 ? "s" : ""} en attente de votre décision
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Ces dossiers nécessitent une validation ou un rejet de votre part.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "en_attente", label: `En attente (${enAttente.length})` },
          { key: "tous",       label: `Tous (${tous.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grille de dossiers */}
      {displayed.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium">Aucun dossier en attente</p>
          <p className="text-xs mt-1">Tous les dossiers ont été traités.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayed.map(d => (
            <div key={d.id} className="section-card hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <Link href={`/dashboard/dossiers/${d.id}`}
                      className="font-mono text-sm font-bold text-amber-700 hover:underline">{d.reference}</Link>
                    <p className="text-xs text-gray-400 mt-0.5">Reçu le {new Date(d.dateReception).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <StatusBadge statut={d.statut} />
                </div>

                {/* Infos */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Souscripteur</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{d.souscripteurPrenom} {d.souscripteurNom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fournisseur</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{d.fournisseurNom}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Montant</p>
                    <p className="text-xl font-bold text-gray-900">{fmtCFA(d.montant)}</p>
                  </div>
                </div>

                {/* Commentaire si existant */}
                {d.commentaireBanque && (
                  <div className={`p-2.5 rounded-lg text-xs mb-4 ${
                    d.statut === "valide" ? "bg-emerald-50 text-emerald-700" :
                    d.statut === "rejete" ? "bg-red-50 text-red-700" :
                    "bg-gray-50 text-gray-600"}`}>
                    {d.commentaireBanque}
                  </div>
                )}

                {/* Actions */}
                {(d.statut === "recu" || d.statut === "en_cours_traitement") ? (
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/dossiers/${d.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Traiter
                    </Link>
                    <Link href={`/dashboard/dossiers/${d.id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4" /> Voir
                    </Link>
                  </div>
                ) : (
                  <Link href={`/dashboard/dossiers/${d.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" /> Voir le détail <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
