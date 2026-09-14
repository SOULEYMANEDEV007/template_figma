// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore, emitInAppNotification } from "@/stores/ldfAuth";
import { ArrowLeft, Building2, CheckCircle2, CreditCard, FileText, Package } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { PaiementStatut } from "@/types/ldf";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(isNaN(v) ? 0 : v) + " FCFA";

export default function PaiementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const {
    getPaiementById,
    getSouscriptionById,
    getDevisById,
    getDossierById,
    updatePaiement,
    updateSouscription,
    updateDossier,
    addHistorique,
  } = useVitalisDb();

  const [statut, setStatut]               = useState<PaiementStatut | null>(null);
  const [showEncaisser, setShowEncaisser] = useState(false);
  const [showServir, setShowServir]       = useState(false);
  const [loading, setLoading]             = useState(false);

  const rawPaiement = getPaiementById(id);
  const sub = rawPaiement ? getSouscriptionById(rawPaiement.souscriptionId) : null;
  const devis = rawPaiement?.repartitionFournisseurs?.[0]?.devisId
    ? getDevisById(rawPaiement.repartitionFournisseurs[0].devisId)
    : null;

  if (!rawPaiement) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <CreditCard className="w-12 h-12 text-gray-200" />
        <p className="text-sm font-medium">Paiement introuvable</p>
        <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">
          ← Retour aux paiements
        </button>
      </div>
    );
  }

  // Normalisation du paiement
  const souscripteurNom = rawPaiement.souscripteurNom || (sub ? `${sub.souscripteurPrenom || ""} ${sub.souscripteurNom || ""}`.trim() : "Souscripteur");
  const fournisseurNom = rawPaiement.repartitionFournisseurs?.[0]?.fournisseurNom || rawPaiement.fournisseurNom || sub?.fournisseurNom || "Librairie de France Groupe";
  const banqueNom = rawPaiement.banqueNom || sub?.banqueNom || "AFG Bank";
  const montant = rawPaiement.montantTotal || rawPaiement.montant || sub?.montantTotal || 0;

  // Calcul du statut effectif
  const deriveStatut = (): PaiementStatut => {
    if (statut) return statut;
    if (rawPaiement.statut === "servi" || rawPaiement.statut === "livre" || sub?.statut === "livre" || sub?.statut === "servie" || sub?.statut === "cloture") {
      return "servi";
    }
    if (rawPaiement.statut === "encaisse" || rawPaiement.statut === "termine" || rawPaiement.statut === "fournisseur_paye" || sub?.statut === "fournisseur_paye" || sub?.statut === "commande_en_preparation") {
      return "encaisse";
    }
    return "en_cours";
  };

  const currentStatut = deriveStatut();

  const handleEncaisser = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatut("encaisse");
    updatePaiement(rawPaiement.id, {
      statut: "encaisse",
      dateTransfert: new Date().toISOString().split("T")[0],
    });

    if (sub) {
      updateSouscription(sub.id, { statut: "fournisseur_paye" });
      addHistorique({
        souscriptionId: sub.id,
        action: "paiement_encaisse",
        description: `Virement de ${fmtCFA(montant)} validé et encaissé par ${fournisseurNom}`,
        auteur: `${user?.firstName || "AFG Bank"} ${user?.lastName || ""}`,
        date: new Date().toISOString(),
      });
    }

    emitInAppNotification({
      titre: `Paiement encaissé : ${rawPaiement.reference}`,
      message: `Le virement de ${fmtCFA(montant)} est encaissé. La commande peut être préparée.`,
      categorie: "paiement",
      reference: rawPaiement.reference,
      lien: `/dashboard/paiements/${rawPaiement.id}`,
      roles: ["fournisseur", "banque", "admin", "souscripteur"],
    });

    setShowEncaisser(false);
    setLoading(false);
    toast.success(`Paiement ${rawPaiement.reference} encaissé avec succès !`);
  };

  const handleServir = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatut("servi");
    updatePaiement(rawPaiement.id, {
      statut: "servi",
      dateMiseAJour: new Date().toISOString().split("T")[0],
    });

    if (sub) {
      updateSouscription(sub.id, { statut: "livre" });
      addHistorique({
        souscriptionId: sub.id,
        action: "articles_livres",
        description: "Articles remis en main propre au souscripteur contre fiche d'émargement signée.",
        auteur: `${user?.firstName || "Fournisseur"} ${user?.lastName || ""}`,
        date: new Date().toISOString(),
      });
    }

    emitInAppNotification({
      titre: `Articles servis : ${rawPaiement.reference}`,
      message: `Tous les articles ont été remis au souscripteur. Dossier VITALIS clôturé.`,
      categorie: "paiement",
      reference: rawPaiement.reference,
      lien: `/dashboard/paiements/${rawPaiement.id}`,
      roles: ["fournisseur", "banque", "admin", "souscripteur"],
    });

    setShowServir(false);
    setLoading(false);
    toast.success(`Articles servis avec succès — Dossier clôturé ✓`);
  };

  // Timeline des étapes du paiement
  const steps = [
    {
      id: "init",
      label: "Ordre de virement émis (AFG Bank)",
      date: rawPaiement.dateCreation || rawPaiement.datePaiement,
      done: true,
    },
    {
      id: "encaisse",
      label: "Fonds reçus par le fournisseur (Encaissé)",
      date: rawPaiement.dateTransfert,
      done: currentStatut === "encaisse" || currentStatut === "servi",
    },
    {
      id: "servi",
      label: "Articles servis contre émargement",
      date: currentStatut === "servi" ? rawPaiement.dateMiseAJour : undefined,
      done: currentStatut === "servi",
    },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{rawPaiement.reference}</h1>
              <StatusBadge statut={currentStatut} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Souscription {rawPaiement.souscriptionRef} · Financé par {banqueNom}
            </p>
          </div>
        </div>

        {/* Actions selon le rôle */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentStatut === "en_cours" && (user?.role === "admin" || user?.role === "banque") && (
            <button
              onClick={() => setShowEncaisser(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Valider l'encaissement fournisseur
            </button>
          )}
          {currentStatut === "encaisse" && (user?.role === "admin" || user?.role === "fournisseur") && (
            <button
              onClick={() => setShowServir(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-sm"
            >
              <Package className="w-4 h-4" /> Marquer comme servi (Remise émargée)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Détails du paiement */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Détails de l'opération bancaire</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Souscripteur</p>
                <p className="text-sm font-semibold text-gray-800">{souscripteurNom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Fournisseur bénéficiaire</p>
                <p className="text-sm font-semibold text-gray-800">{fournisseurNom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Banque financeuse</p>
                <p className="text-sm font-semibold text-gray-800">{banqueNom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Devis associé</p>
                {devis ? (
                  <Link
                    href={`/dashboard/devis/${devis.id}`}
                    className="text-sm font-mono font-medium text-amber-700 hover:underline"
                  >
                    {devis.reference}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-600">—</p>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">Montant réglé au fournisseur</p>
                <p className="text-2xl font-bold text-gray-900">{fmtCFA(montant)}</p>
              </div>
            </div>
          </div>

          {/* Dates clés */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Traçabilité & Dates clés</h3>
            </div>
            <div className="section-card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Ordre de virement",
                  value: rawPaiement.dateCreation || rawPaiement.dateValidationAFG,
                  done: true,
                },
                {
                  label: "Fonds transférés",
                  value: currentStatut === "encaisse" || currentStatut === "servi" ? (rawPaiement.dateTransfert || "Effectué") : null,
                  done: currentStatut === "encaisse" || currentStatut === "servi",
                },
                {
                  label: "Remise matérielle",
                  value: currentStatut === "servi" ? (rawPaiement.dateMiseAJour || "Remis") : null,
                  done: currentStatut === "servi",
                },
              ].map((d) => (
                <div key={d.label} className={`p-3.5 rounded-xl border ${d.done ? "bg-emerald-50/60 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className="text-xs text-gray-500 mb-0.5">{d.label}</p>
                  <p className={`text-sm font-bold ${d.done ? "text-emerald-800" : "text-gray-400"}`}>
                    {d.value ? (typeof d.value === "string" && d.value.includes("-") ? new Date(d.value).toLocaleDateString("fr-FR") : d.value) : "En attente"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Souscription liée */}
          {sub && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Souscription d'origine</h3>
                </div>
                <Link href={`/dashboard/souscriptions/${sub.id}`} className="text-xs text-amber-600 hover:text-amber-700">
                  Voir la fiche souscription →
                </Link>
              </div>
              <div className="section-card-body grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Référence</p>
                  <p className="font-mono text-xs font-bold text-amber-700">{sub.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Statut souscription</p>
                  <StatusBadge statut={sub.statut} size="sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date création</p>
                  <p className="text-xs text-gray-700 font-medium">
                    {new Date(sub.dateCreation).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite — Timeline & Récap */}
        <div className="space-y-5">
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Progression du règlement</h3>
            </div>
            <div className="section-card-body">
              <div className="space-y-4">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-3 relative">
                    {i < steps.length - 1 && (
                      <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${s.done ? "bg-emerald-300" : "bg-gray-100"}`} />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        s.done ? "bg-emerald-500 text-white shadow-sm" : "bg-gray-100 border-2 border-gray-200"
                      }`}
                    >
                      {s.done ? (
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-semibold ${s.done ? "text-gray-800" : "text-gray-400"}`}>
                        {s.label}
                      </p>
                      {s.date ? (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(s.date).toLocaleDateString("fr-FR")}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-300 italic mt-0.5">En cours</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Synthèse financière */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Synthèse financière</h3>
            </div>
            <div className="section-card-body space-y-3">
              {[
                { label: "Montant virement", value: fmtCFA(montant), highlight: true },
                { label: "Banque émettrice", value: banqueNom },
                { label: "Fournisseur", value: fournisseurNom },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-gray-500">{r.label}</span>
                  <span className={`text-sm font-semibold ${r.highlight ? "text-amber-700" : "text-gray-800"}`}>
                    {r.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-gray-500">Statut actuel</span>
                <StatusBadge statut={currentStatut} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales d'actions */}
      <ConfirmModal
        open={showEncaisser}
        onClose={() => setShowEncaisser(false)}
        onConfirm={handleEncaisser}
        title="Confirmer l'encaissement fournisseur"
        message={`Vous confirmez que le virement bancaire pour ${rawPaiement.reference} d'un montant de ${fmtCFA(montant)} est bien reçu par le fournisseur ${fournisseurNom}.`}
        confirmLabel="Confirmer l'encaissement"
        variant="success"
        loading={loading}
      />

      <ConfirmModal
        open={showServir}
        onClose={() => setShowServir(false)}
        onConfirm={handleServir}
        title="Confirmer la remise des articles"
        message={`Vous confirmez que les articles de la souscription ${rawPaiement.souscriptionRef} ont été remis au client ${souscripteurNom} contre signature de la fiche d'émargement.`}
        confirmLabel="Confirmer la remise émargée"
        variant="success"
        loading={loading}
      />
    </div>
  );
}
