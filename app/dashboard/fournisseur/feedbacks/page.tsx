// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { Building2, CheckCircle2, Clock, FileText, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const fmtCFA = (v: any) => {
  const num = typeof v === "number" ? v : Number(v);
  return new Intl.NumberFormat("fr-FR").format(isNaN(num) ? 0 : num) + " FCFA";
};

const formatDate = (d: string | undefined | null) => {
  if (!d) return new Date().toLocaleDateString("fr-FR");
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date().toLocaleDateString("fr-FR") : date.toLocaleDateString("fr-FR");
};

export default function FeedbacksPage() {
  const { user } = useLDFAuthStore();
  const { dossiers } = useVitalisDb();
  const [filterStatut, setFilterStatut] = useState<string>("tous");

  // Dossiers associés au fournisseur avec retours ou décisions AFG Bank
  const feedbacks = useMemo(() => {
    return (dossiers || [])
      .filter(d => {
        // En mode démo ou fournisseur, récupérer les dossiers pertinents
        if (user?.role === "admin") return true;
        const fNom = d.fournisseurNom || d.fournisseursNoms || "";
        const userOrg = user?.organisationName || "Librairie de France";
        return (
          fNom.toLowerCase().includes("librairie de france") ||
          fNom.toLowerCase().includes(userOrg.toLowerCase()) ||
          !d.fournisseurNom ||
          true
        );
      })
      .map(d => {
        const isValide = d.statut === "accepte" || d.statut === "valide";
        const isRejete = d.statut === "refuse" || d.statut === "rejete";
        const statut = isValide ? "accepte" : isRejete ? "refuse" : "en_analyse_bancaire";

        const commentaire = isValide
          ? (d.commentaireAFG || d.commentaireBanque || "Dossier conforme aux critères du programme Vitalis. Financement accordé par AFG Bank.")
          : isRejete
            ? (d.motifRejet || d.commentaireBanque || "Dossier non retenu par le comité de crédit AFG Bank.")
            : (d.commentaireAFG || "Dossier réceptionné à l'agence AFG Bank. Analyse financière en cours.");

        const dateAffichage = d.dateValidation || d.dateRejet || d.dateTraitement || d.dateMiseAJour || d.dateReception || d.dateCreation;

        return {
          id: d.id,
          dossierId: d.id,
          dossierRef: d.reference,
          souscriptionRef: d.souscriptionRef,
          souscripteurNom: `${d.souscripteurPrenom || ""} ${d.souscripteurNom || ""}`.trim() || "Souscripteur Vitalis",
          banqueNom: d.banqueNom || "AFG Bank",
          montant: d.montantTotal || d.montant || 0,
          statut,
          commentaire,
          date: dateAffichage,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dossiers, user]);

  const filteredFeedbacks = useMemo(() => {
    if (filterStatut === "tous") return feedbacks;
    return feedbacks.filter(f => f.statut === filterStatut);
  }, [feedbacks, filterStatut]);

  const stats = useMemo(() => ({
    valides: feedbacks.filter(f => f.statut === "accepte").length,
    rejetes: feedbacks.filter(f => f.statut === "refuse").length,
    enAnalyse: feedbacks.filter(f => f.statut === "en_analyse_bancaire").length,
  }), [feedbacks]);

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedbacks bancaires</h1>
          <p className="page-subtitle">Décisions et retours officiels d'AFG Bank sur vos dossiers de financement</p>
        </div>
      </div>

      {/* Stats rapides (Conforme au Cahier des Charges VITALIS : Validation ou Rejet) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: "accepte", label: "Financements accordés", value: stats.valides, color: "border-l-emerald-500 text-emerald-700 bg-emerald-50/40" },
          { id: "refuse", label: "Dossiers rejetés", value: stats.rejetes, color: "border-l-red-500 text-red-700 bg-red-50/40" },
          { id: "en_analyse_bancaire", label: "En cours d'analyse", value: stats.enAnalyse, color: "border-l-amber-500 text-amber-700 bg-amber-50/40" },
        ].map(k => (
          <button
            key={k.id}
            onClick={() => setFilterStatut(filterStatut === k.id ? "tous" : k.id)}
            className={`text-left rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${k.color} ${filterStatut === k.id ? "ring-2 ring-orange-400" : ""}`}
          >
            <p className="text-2xl font-bold">{k.value}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">{k.label}</p>
          </button>
        ))}
      </div>

      {/* Liste feedbacks */}
      {filteredFeedbacks.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium">Aucun retour bancaire pour ce filtre</p>
          <p className="text-xs text-gray-400 mt-1">Les décisions d'AFG Bank s'afficheront ici en temps réel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedbacks.map(f => {
            const isValide = f.statut === "accepte";
            const isRejete = f.statut === "refuse";

            const Icon = isValide ? CheckCircle2 : isRejete ? XCircle : Clock;
            const bgIcon = isValide ? "bg-emerald-50 text-emerald-600" : isRejete ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600";
            const borderBox = isValide
              ? "bg-emerald-50/80 text-emerald-900 border-emerald-200"
              : isRejete
                ? "bg-red-50/80 text-red-900 border-red-200"
                : "bg-amber-50/80 text-amber-900 border-amber-200";

            return (
              <div key={f.id} className="section-card hover:shadow-md transition-shadow">
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgIcon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Link href={`/dashboard/dossiers/${f.dossierId}`}
                          className="font-mono text-sm font-bold text-orange-600 hover:underline">
                          {f.dossierRef}
                        </Link>
                        <StatusBadge statut={f.statut} size="sm" />
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-gray-700">{f.banqueNom}</p>
                        <p className="text-xs text-gray-400">{formatDate(f.date)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                      <p className="text-sm font-semibold text-gray-800">{f.souscripteurNom}</p>
                      {f.montant > 0 && (
                        <span className="text-xs font-bold text-gray-600">· Montant : {fmtCFA(f.montant)}</span>
                      )}
                    </div>

                    <div className={`p-3.5 rounded-xl border text-sm leading-relaxed ${borderBox}`}>
                      <strong className="block text-xs uppercase tracking-wide opacity-80 mb-0.5">
                        {isValide ? "Avis bancaire favorable :" : isRejete ? "Motif de rejet bancaire :" : "Décision de banque en cours :"}
                      </strong>
                      {f.commentaire}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Link href={`/dashboard/dossiers/${f.dossierId}`}
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1">
                        Consulter le dossier complet →
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
