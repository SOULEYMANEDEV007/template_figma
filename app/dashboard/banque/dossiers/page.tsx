// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { AlertCircle, CheckCircle2, ChevronRight, Eye, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

// Statuts pour lesquels la banque doit agir
const STATUTS_EN_ATTENTE = ["depose_banque", "en_analyse_bancaire"];

export default function BanqueDossiersPage() {
  const { user } = useLDFAuthStore();
  const { dossiers, updateDossier, updateSouscription, getSouscriptionById, addHistorique } = useVitalisDb();
  const [activeTab, setActiveTab] = useState<"en_attente" | "tous">("en_attente");

  const mesDossiers = useMemo(() =>
    dossiers.filter(d =>
      user?.role === "banque" && user.organisationId
        ? d.agenceId === user.organisationId
        : true
    ), [dossiers, user]);

  const enAttente = mesDossiers.filter(d => STATUTS_EN_ATTENTE.includes(d.statut));
  const tous = mesDossiers;
  const displayed = activeTab === "en_attente" ? enAttente : tous;

  const handleAccepter = (dossier: typeof dossiers[0]) => {
    updateDossier(dossier.id, {
      statut: "accepte",
      commentaireAFG: "Dossier conforme — Financement accordé par le comité.",
    });
    // Synchroniser le statut de la souscription liée
    const sous = getSouscriptionById(dossier.souscriptionId);
    if (sous) updateSouscription(sous.id, { statut: "accepte" });
    addHistorique({
      souscriptionId: dossier.souscriptionId,
      action: "dossier_accepte",
      description: `Dossier ${dossier.reference} — Décision bancaire : ACCEPTÉ`,
      date: new Date().toISOString(),
    });
    toast.success(`Dossier ${dossier.reference} accepté`);
  };

  const handleRefuser = (dossier: typeof dossiers[0]) => {
    updateDossier(dossier.id, {
      statut: "refuse",
      motifRejet: "Dossier non conforme aux conditions du programme VITALIS.",
    });
    const sous = getSouscriptionById(dossier.souscriptionId);
    if (sous) updateSouscription(sous.id, { statut: "refuse" });
    addHistorique({
      souscriptionId: dossier.souscriptionId,
      action: "dossier_refuse",
      description: `Dossier ${dossier.reference} — Décision bancaire : REFUSÉ`,
      date: new Date().toISOString(),
    });
    toast.error(`Dossier ${dossier.reference} refusé`);
  };

  const handleAnalyser = (dossier: typeof dossiers[0]) => {
    updateDossier(dossier.id, { statut: "en_analyse_bancaire" });
    const sous = getSouscriptionById(dossier.souscriptionId);
    if (sous) updateSouscription(sous.id, { statut: "en_analyse_bancaire" });
    toast.info(`Dossier ${dossier.reference} — Analyse démarrée`);
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers à traiter — AFG Bank</h1>
          <p className="page-subtitle">
            {enAttente.length} dossier{enAttente.length > 1 ? "s" : ""} en attente de décision
          </p>
        </div>
      </div>

      {/* Alerte dossiers urgents */}
      {enAttente.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {enAttente.length} dossier{enAttente.length > 1 ? "s" : ""} nécessite{enAttente.length === 1 ? "" : "nt"} votre décision
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Traitez chaque dossier en le marquant Accepté ou Refusé. ViFLO ne fait que tracer la décision.
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
                    <p className="text-xs text-gray-400 mt-0.5">
                      Reçu le {new Date(d.dateReception).toLocaleDateString("fr-FR")}
                    </p>
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
                    <p className="text-xs text-gray-400">Fournisseurs</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{d.fournisseursNoms}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Montant total du financement</p>
                    <p className="text-xl font-bold text-gray-900">{fmtCFA(d.montantTotal)}</p>
                  </div>
                </div>

                {/* Commentaire / Motif rejet */}
                {(d.commentaireAFG || d.motifRejet) && (
                  <div className={`p-2.5 rounded-lg text-xs mb-4 ${
                    d.statut === "accepte" ? "bg-emerald-50 text-emerald-700" :
                    d.statut === "refuse"  ? "bg-red-50 text-red-700" :
                    "bg-gray-50 text-gray-600"}`}>
                    {d.commentaireAFG || d.motifRejet}
                  </div>
                )}

                {/* Actions selon statut */}
                {d.statut === "depose_banque" ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAnalyser(d)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                      Démarrer l'analyse
                    </button>
                    <Link href={`/dashboard/dossiers/${d.id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4" /> Voir
                    </Link>
                  </div>
                ) : d.statut === "en_analyse_bancaire" ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAccepter(d)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Accepter
                    </button>
                    <button onClick={() => handleRefuser(d)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                      <XCircle className="w-4 h-4" /> Refuser
                    </button>
                    <Link href={`/dashboard/dossiers/${d.id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4" />
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
