"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { LDFTimeline, ProcessTimeline } from "@/components/ui/ldf-timeline";
import { ConfirmModal, LDFModal, MotifsRejetModal } from "@/components/ui/ldf-modal";
import {
  getDossierById, getDevisById, getSouscriptionById,
  getHistoriqueBySouscription,
} from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ArrowLeft, BookOpen, Building2, CheckCircle2, CreditCard,
  FileText, MessageSquare, Package, User, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { DossierStatut } from "@/types/ldf";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();

  const [statut, setStatut]               = useState<DossierStatut | null>(null);
  const [commentaire, setCommentaire]     = useState("");
  const [showValider, setShowValider]     = useState(false);
  const [showRejeter, setShowRejeter]     = useState(false);
  const [showInfos, setShowInfos]         = useState(false);
  const [infoMessage, setInfoMessage]     = useState("");
  const [loading, setLoading]             = useState(false);

  const dossier   = getDossierById(id);
  const devis     = dossier ? getDevisById(dossier.devisId) : null;
  const sub       = dossier ? getSouscriptionById(dossier.souscriptionId) : null;
  const historique = dossier ? getHistoriqueBySouscription(dossier.souscriptionId) : [];

  if (!dossier) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <FileText className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Dossier introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  const currentStatut = statut ?? dossier.statut;
  const canAct = (user?.role === "banque" || user?.role === "admin") &&
    (currentStatut === "recu" || currentStatut === "en_cours_traitement");

  // Process steps
  const processSteps = [
    { id: "s1", label: "Souscription",   statut: "complete"  as const },
    { id: "s2", label: "Devis envoyé",   statut: "complete"  as const },
    { id: "s3", label: "Dossier reçu",   statut: "complete"  as const },
    {
      id: "s4", label: "En traitement",
      statut: currentStatut === "en_cours_traitement" ? "current"  as const :
              currentStatut === "valide" || currentStatut === "rejete" ? "complete" as const : "pending" as const,
    },
    {
      id: "s5", label: "Décision",
      statut: currentStatut === "valide"  ? "complete"  as const :
              currentStatut === "rejete"  ? "rejected"  as const :
              currentStatut === "informations_demandees" ? "current" as const : "pending" as const,
    },
    {
      id: "s6", label: "Paiement",
      statut: currentStatut === "valide" && sub?.statut === "payee" ? "complete" as const :
              currentStatut === "valide" && sub?.statut === "servie" ? "complete" as const : "pending" as const,
    },
    {
      id: "s7", label: "Servi",
      statut: sub?.statut === "servie" ? "complete" as const : "pending" as const,
    },
  ];

  const handleValider = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStatut("valide");
    setShowValider(false);
    setLoading(false);
    toast.success(`Dossier ${dossier.reference} validé avec succès !`);
  };

  const handleRejeter = async (motif: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStatut("rejete");
    setCommentaire(motif);
    setShowRejeter(false);
    setLoading(false);
    toast.error(`Dossier ${dossier.reference} rejeté.`);
  };

  const handleDemanderInfos = async () => {
    if (!infoMessage.trim()) { toast.error("Veuillez saisir votre message"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStatut("informations_demandees");
    setCommentaire(infoMessage);
    setShowInfos(false);
    setLoading(false);
    toast.info("Demande d'informations envoyée au fournisseur.");
  };

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{dossier.reference}</h1>
              <StatusBadge statut={currentStatut} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Reçu le {new Date(dossier.dateReception).toLocaleDateString("fr-FR")} · {dossier.banqueNom}
            </p>
          </div>
        </div>

        {/* Boutons d'action banque */}
        {canAct && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowValider(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Valider le dossier
            </button>
            <button onClick={() => setShowInfos(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all">
              <MessageSquare className="w-4 h-4" /> Demander des infos
            </button>
            <button onClick={() => setShowRejeter(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm">
              <XCircle className="w-4 h-4" /> Rejeter
            </button>
          </div>
        )}
      </div>

      {/* ── Timeline processus ── */}
      <div className="section-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Progression du dossier</h3>
        <ProcessTimeline steps={processSteps} />
      </div>

      {/* Décision affichée si déjà traitée */}
      {(currentStatut === "valide" || currentStatut === "rejete" || currentStatut === "informations_demandees") && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          currentStatut === "valide"  ? "bg-emerald-50 border-emerald-200" :
          currentStatut === "rejete" ? "bg-red-50 border-red-200" :
          "bg-amber-50 border-amber-200"}`}>
          {currentStatut === "valide"  && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
          {currentStatut === "rejete" && <XCircle       className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"      />}
          {currentStatut === "informations_demandees" && <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {currentStatut === "valide"  && "Dossier validé — financement accordé"}
              {currentStatut === "rejete" && "Dossier rejeté"}
              {currentStatut === "informations_demandees" && "Informations complémentaires demandées"}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {commentaire || dossier.commentaireBanque || (currentStatut === "valide" ? "Financement accordé par la banque." : "")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1 — Souscripteur */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Informations souscripteur</h3>
              </div>
              {sub && (
                <Link href={`/dashboard/souscriptions/${sub.id}`} className="text-xs text-amber-600 hover:text-amber-700">
                  Voir la souscription →
                </Link>
              )}
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">Nom complet</p><p className="text-sm font-medium text-gray-800">{dossier.souscripteurPrenom} {dossier.souscripteurNom}</p></div>
              {sub && <>
                <div><p className="text-xs text-gray-400 mb-0.5">Téléphone</p><p className="text-sm font-medium text-gray-800">{sub.souscripteurTelephone}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-sm font-medium text-gray-800">{sub.souscripteurEmail}</p></div>
              </>}
              <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{dossier.banqueNom}</p></div>
            </div>
          </div>

          {/* Section 2 — Souscription */}
          {sub && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Souscription</h3>
                </div>
                <span className="font-mono text-xs text-amber-700 font-semibold">{sub.reference}</span>
              </div>
              <div className="section-card-body grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400 mb-0.5">Fournisseur</p><p className="text-sm font-medium text-gray-800">{sub.fournisseurNom}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Durée</p><p className="text-sm font-medium text-gray-800">{sub.duree} mois</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Articles</p><p className="text-sm font-medium text-gray-800">{sub.articles.length} article{sub.articles.length > 1 ? "s" : ""}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Montant total</p><p className="text-sm font-bold text-amber-700">{fmtCFA(sub.montantTotal)}</p></div>
              </div>
            </div>
          )}

          {/* Section 3 — Devis */}
          {devis && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Devis</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge statut={devis.statut} size="sm" />
                  <Link href={`/dashboard/devis/${devis.id}`} className="text-xs text-amber-600 hover:text-amber-700">
                    Voir →
                  </Link>
                </div>
              </div>
              <div className="section-card-body">
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-400 mb-0.5">Référence</p><p className="font-mono text-xs font-bold text-amber-700">{devis.reference}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Total HT</p><p className="text-sm font-medium text-gray-800">{fmtCFA(devis.totalHT)}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Total TTC</p><p className="text-sm font-bold text-gray-900">{fmtCFA(devis.totalTTC)}</p></div>
                </div>
                {/* Aperçu articles */}
                <div className="mt-4 overflow-x-auto">
                  <table className="ldf-table">
                    <thead><tr><th>Désignation</th><th>Qté</th><th>Prix U.</th><th>Montant HT</th></tr></thead>
                    <tbody>
                      {devis.articles.slice(0, 3).map((a, i) => (
                        <tr key={i}>
                          <td className="text-sm text-gray-800">{a.designation}</td>
                          <td>{a.quantite}</td>
                          <td className="text-sm">{fmtCFA(a.prixUnitaire)}</td>
                          <td className="text-sm font-semibold">{fmtCFA(a.montantHT)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {devis.articles.length > 3 && (
                    <p className="text-xs text-gray-400 px-4 py-2">+ {devis.articles.length - 3} article(s) supplémentaire(s)</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 4 — Décision banque */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Décision bancaire</h3>
              </div>
              <StatusBadge statut={currentStatut} />
            </div>
            <div className="section-card-body space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{dossier.banqueNom}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Date réception</p><p className="text-sm font-medium text-gray-800">{new Date(dossier.dateReception).toLocaleDateString("fr-FR")}</p></div>
                {dossier.dateTraitement && (
                  <div><p className="text-xs text-gray-400 mb-0.5">Date traitement</p><p className="text-sm font-medium text-gray-800">{new Date(dossier.dateTraitement).toLocaleDateString("fr-FR")}</p></div>
                )}
              </div>
              {(commentaire || dossier.commentaireBanque) && (
                <div className={`p-3 rounded-lg text-sm leading-relaxed ${
                  currentStatut === "valide"  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                  currentStatut === "rejete" ? "bg-red-50 text-red-800 border border-red-100" :
                  "bg-amber-50 text-amber-800 border border-amber-100"}`}>
                  {commentaire || dossier.commentaireBanque}
                </div>
              )}
              {(dossier.motifRejet) && currentStatut === "rejete" && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800">
                  <strong>Motif du rejet : </strong>{dossier.motifRejet}
                </div>
              )}
            </div>
          </div>

          {/* Section 5 — Paiement */}
          {sub?.paiementId && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Paiement</h3>
                </div>
                <Link href={`/dashboard/paiements/${sub.paiementId}`} className="text-xs text-amber-600 hover:text-amber-700">Voir →</Link>
              </div>
              <div className="section-card-body">
                <p className="text-xs text-gray-400 mb-0.5">Référence paiement</p>
                <p className="font-mono text-sm font-bold text-amber-700">{sub.paiementId}</p>
              </div>
            </div>
          )}

          {/* Section 6 — Articles servis */}
          {sub?.statut === "servie" && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Articles servis</h3>
                </div>
                <StatusBadge statut="servie" />
              </div>
              <div className="section-card-body">
                <p className="text-sm text-gray-600">Tous les articles ont été livrés au souscripteur.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite ── */}
        <div className="space-y-5">
          {/* Récap financier */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Récapitulatif</h3>
            </div>
            <div className="section-card-body space-y-3">
              {[
                { label: "Montant",     value: fmtCFA(dossier.montant), highlight: true },
                { label: "Fournisseur", value: dossier.fournisseurNom },
                { label: "Banque",      value: dossier.banqueNom },
                { label: "Statut",      value: null, badge: currentStatut },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-gray-500">{r.label}</span>
                  {r.badge
                    ? <StatusBadge statut={r.badge} size="sm" />
                    : <span className={`text-sm font-semibold ${r.highlight ? "text-amber-700" : "text-gray-800"}`}>{r.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Historique complet */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Historique complet</h3>
            </div>
            <div className="section-card-body">
              {historique.length > 0
                ? <LDFTimeline events={historique} />
                : <p className="text-xs text-gray-400 text-center py-4">Aucun historique</p>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
      <ConfirmModal
        open={showValider}
        onClose={() => setShowValider(false)}
        onConfirm={handleValider}
        title="Valider le dossier"
        message={`Vous allez valider le dossier ${dossier.reference} et accorder le financement de ${fmtCFA(dossier.montant)}.`}
        confirmLabel="Valider"
        variant="success"
        loading={loading}
      />

      <MotifsRejetModal
        open={showRejeter}
        onClose={() => setShowRejeter(false)}
        onSubmit={handleRejeter}
        loading={loading}
      />

      <LDFModal
        open={showInfos}
        onClose={() => setShowInfos(false)}
        title="Demander des informations complémentaires"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Précisez les informations manquantes au fournisseur.</p>
          <textarea
            rows={4}
            placeholder="Ex : Merci de fournir les 3 derniers relevés bancaires..."
            value={infoMessage}
            onChange={e => setInfoMessage(e.target.value)}
            className="ldf-input resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowInfos(false)} className="flex-1 btn-ldf-outline text-sm py-2.5">Annuler</button>
            <button
              onClick={handleDemanderInfos}
              disabled={!infoMessage.trim() || loading}
              className="flex-1 btn-ldf-primary text-sm py-2.5 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </div>
      </LDFModal>
    </div>
  );
}
