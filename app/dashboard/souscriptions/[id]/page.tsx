// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { LDFTimeline, ProcessTimeline } from "@/components/ui/ldf-timeline";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ArrowLeft, Building2, CheckCircle2, CreditCard, Download,
  FileText, MapPin, Package, Phone, Plus, User, Printer, Send, Truck, Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { emitInAppNotification } from "@/stores/ldfAuth";

const fmtCFA = (v: any) => {
  const num = typeof v === "number" ? v : Number(v);
  return new Intl.NumberFormat("fr-FR").format(isNaN(num) ? 0 : num) + " FCFA";
};

export default function SouscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const {
    getSouscriptionById, getDevisBySouscription, getDossierBySouscription,
    getHistoriqueBySouscription, addDossier, updateDossier, updateSouscription,
    addPaiement, generateRef, addHistorique,
  } = useVitalisDb();

  const [showConfirm, setShowConfirm] = useState(false);
  const [submittingDossier, setSubmittingDossier] = useState(false);

  const sub = getSouscriptionById(id);
  const devis = sub ? getDevisBySouscription(sub.id)[0] : null;
  const dossier = sub ? getDossierBySouscription(sub.id) : null;
  const historique = sub ? getHistoriqueBySouscription(sub.id) : [];

  const handleTransmettreBanque = async () => {
    if (!sub) return;
    if (!devis) {
      toast.error("Veuillez d'abord créer au moins un devis fournisseur pour cette souscription.");
      return;
    }
    setSubmittingDossier(true);
    try {
      const refDos = generateRef("DOS");
      const montantFinal = sub.montantTotal > 0 ? sub.montantTotal : devis.totalTTC;
      addDossier({
        reference: refDos,
        souscriptionId: sub.id,
        souscriptionRef: sub.reference,
        souscripteurId: sub.souscripteurId,
        souscripteurNom: sub.souscripteurNom,
        souscripteurPrenom: sub.souscripteurPrenom,
        typeSouscripteur: sub.typeSouscripteur,
        fournisseursNoms: sub.fournisseurs.map(f => f.fournisseurNom).join(", "),
        devisIds: [devis.id],
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        agenceId: sub.agenceId || "AGE-AFG-001",
        montantTotal: montantFinal,
        statut: "depose_banque",
        dateCreation: new Date().toISOString().split("T")[0],
        dateReception: new Date().toISOString().split("T")[0],
        dateMiseAJour: new Date().toISOString().split("T")[0],
      });
      updateSouscription(sub.id, {
        statut: "depose_banque",
        montantTotal: montantFinal,
      });
      addHistorique({
        souscriptionId: sub.id,
        action: "depot_banque",
        description: `Dossier ${refDos} déposé et transmis à AFG Bank pour analyse`,
        auteur: `${user?.firstName || "Fournisseur"} ${user?.lastName || ""}`,
        date: new Date().toISOString(),
      });
      toast.success(`Dossier ${refDos} transmis à AFG Bank avec succès !`);
    } catch (e) {
      toast.error("Erreur lors de la transmission du dossier");
    } finally {
      setSubmittingDossier(false);
    }
  };

  if (!sub) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <FileText className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Souscription introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  // Statuts "positifs" successifs du workflow VITALIS
  const isApres = (statut: string, ref: string) => {
    const ordre = [
      "en_preparation",
      "pret_pour_depot",
      "depose_banque",
      "recu",
      "en_analyse_bancaire",
      "en_cours_traitement",
      "accepte",
      "valide",
      "finance",
      "fournisseur_paye",
      "commande_en_preparation",
      "livre",
      "servie",
      "cloture",
    ];
    const idxCandidat = ordre.indexOf(statut);
    const idxRef = ordre.indexOf(ref);
    return idxCandidat !== -1 && idxCandidat >= idxRef;
  };

  // Statut le plus avancé entre la souscription et son dossier
  const currentEffectifStatut = [sub.statut, dossier?.statut || ""].reduce((max, curr) => {
    return isApres(curr, max) ? curr : max;
  }, sub.statut);

  const processSteps = [
    { id: "sub", label: "Souscription créée", statut: "complete" as const, date: sub.dateCreation },
    { id: "devis", label: "Devis fournisseur(s)", statut: devis ? ("complete" as const) : ("pending" as const) },
    { id: "depot", label: "Dépôt AFG Bank", statut: isApres(currentEffectifStatut, "depose_banque") ? ("complete" as const) : currentEffectifStatut === "pret_pour_depot" ? ("current" as const) : ("pending" as const) },
    { id: "banque", label: "Analyse bancaire", statut: isApres(currentEffectifStatut, "accepte") ? ("complete" as const) : (currentEffectifStatut === "refuse" || currentEffectifStatut === "rejete") ? ("rejected" as const) : currentEffectifStatut === "en_analyse_bancaire" ? ("current" as const) : ("pending" as const) },
    { id: "paiement", label: "Financement & Paiement", statut: isApres(currentEffectifStatut, "fournisseur_paye") ? ("complete" as const) : (currentEffectifStatut === "accepte" || currentEffectifStatut === "valide" || currentEffectifStatut === "finance") ? ("current" as const) : ("pending" as const) },
    { id: "livraison", label: "Commande & Livraison", statut: (currentEffectifStatut === "cloture" || currentEffectifStatut === "livre" || currentEffectifStatut === "servie") ? ("complete" as const) : (currentEffectifStatut === "fournisseur_paye" || currentEffectifStatut === "commande_en_preparation") ? ("current" as const) : ("pending" as const) },
  ];

  const handleConfirmerPaiement = () => {
    const refPay = generateRef("PAY");
    const montantTotal = sub.montantTotal || devis?.totalTTC || 0;
    const newPay = addPaiement({
      reference: refPay,
      souscriptionId: sub.id,
      souscriptionRef: sub.reference,
      dossierId: dossier?.id || "",
      dossierRef: dossier?.reference || "",
      souscripteurNom: `${sub.souscripteurPrenom || ""} ${sub.souscripteurNom || ""}`.trim(),
      montantTotal,
      repartitionFournisseurs: [
        {
          fournisseurId: devis?.fournisseurId || "FOUR-LDF-001",
          fournisseurNom: devis?.fournisseurNom || sub.fournisseurNom || "Librairie de France Groupe",
          devisId: devis?.id || "",
          montant: montantTotal,
          statut: "confirme",
        },
      ],
      statut: "termine",
      dateCreation: new Date().toISOString().split("T")[0],
      dateValidationAFG: new Date().toISOString().split("T")[0],
      dateTransfert: new Date().toISOString().split("T")[0],
      dateMiseAJour: new Date().toISOString().split("T")[0],
    });

    updateSouscription(sub.id, { statut: "fournisseur_paye", paiementId: newPay.id });
    if (dossier) updateDossier(dossier.id, { statut: "fournisseur_paye" });
    addHistorique({
      souscriptionId: sub.id,
      action: "paiement_effectue",
      description: `Virement de ${fmtCFA(montantTotal)} confirmé au fournisseur — Réf ${refPay}`,
      auteur: `${user?.firstName || "AFG Bank"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });
    emitInAppNotification({
      titre: `Paiement fournisseur validé : ${refPay}`,
      message: `AFG Bank a validé le virement de ${fmtCFA(montantTotal)} pour ${sub.reference}. La commande peut être préparée.`,
      categorie: "paiement",
      reference: refPay,
      lien: `/dashboard/souscriptions/${sub.id}`,
      roles: ["fournisseur", "souscripteur", "banque", "admin"],
    });
    toast.success("Virement fournisseur validé ! Étape Paiement complétée ✓");
  };

  const handleDemarrerPreparation = () => {
    updateSouscription(sub.id, { statut: "commande_en_preparation" });
    if (dossier) updateDossier(dossier.id, { statut: "commande_en_preparation" });
    addHistorique({
      souscriptionId: sub.id,
      action: "commande_preparation",
      description: "Commande en cours de préparation par le fournisseur",
      auteur: `${user?.firstName || "Fournisseur"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });
    emitInAppNotification({
      titre: `Commande en préparation : ${sub.reference}`,
      message: `Le fournisseur ${sub.fournisseurNom} prépare actuellement votre commande.`,
      categorie: "dossier",
      reference: sub.reference,
      lien: `/dashboard/souscriptions/${sub.id}`,
      roles: ["souscripteur", "banque", "admin", "fournisseur"],
    });
    toast.success("Commande en cours de préparation 📦");
  };

  const handleConfirmerLivraison = () => {
    updateSouscription(sub.id, { statut: "livre" });
    if (dossier) updateDossier(dossier.id, { statut: "livre" });
    addHistorique({
      souscriptionId: sub.id,
      action: "articles_livres",
      description: "Articles remis au souscripteur contre émargement. Dossier clôturé.",
      auteur: `${user?.firstName || "Fournisseur"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });
    emitInAppNotification({
      titre: `Commande servie et livrée : ${sub.reference}`,
      message: `Tous les articles ont été remis avec succès au souscripteur. Dossier VITALIS clôturé.`,
      categorie: "dossier",
      reference: sub.reference,
      lien: `/dashboard/souscriptions/${sub.id}`,
      roles: ["souscripteur", "banque", "admin", "fournisseur"],
    });
    toast.success("Livraison confirmée ! Commande servie 🎉");
  };

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{sub.reference}</h1>
              <StatusBadge statut={sub.statut} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Créée le {new Date(sub.dateCreation).toLocaleDateString("fr-FR")} · Dernière MAJ le {new Date(sub.dateMiseAJour).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!devis && (user?.role === "fournisseur" || user?.role === "admin") && (
            <Link href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}`} className="btn-ldf-secondary text-sm py-2 px-4">
              <Plus className="w-3.5 h-3.5" /> Créer un devis
            </Link>
          )}
          {devis && (
            <Link href={`/dashboard/devis/${devis.id}`} className="btn-ldf-outline text-sm py-2 px-4">
              <FileText className="w-3.5 h-3.5" /> Voir le devis
            </Link>
          )}
          {devis && !dossier && (user?.role === "fournisseur" || user?.role === "admin") && (
            <button
              onClick={handleTransmettreBanque}
              disabled={submittingDossier}
              className="btn-ldf-primary text-sm py-2 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> {submittingDossier ? "Envoi..." : "Transmettre à AFG Bank"}
            </button>
          )}
          {dossier && (
            <Link href={`/dashboard/dossiers/${dossier.id}`} className="btn-ldf-outline text-sm py-2 px-4">
              <CheckCircle2 className="w-3.5 h-3.5" /> Voir le dossier
            </Link>
          )}
          <button
            onClick={() => {
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`
                <html><head><title>Fiche de Souscription Vitalis - ${sub.reference}</title>
                <style>
                  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1f2937; line-height: 1.6; }
                  .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px; }
                  .header-logos img { height: 40px; object-fit: contain; mix-blend-mode: multiply; }
                  h1 { color: #ea580c; border-bottom: 3px solid #ea580c; padding-bottom: 10px; text-align: center; }
                  h2 { color: #ea580c; margin-top: 24px; font-size: 16px; border-bottom: 1px solid #fed7aa; padding-bottom: 4px;}
                  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
                  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #f3f4f6; }
                  th { background: #fff7ed; color: #c2410c; width: 40%; }
                  .signature-box { margin-top: 50px; border: 2px dashed #d1d5db; padding: 20px; height: 120px; text-align: center; }
                  .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center; }
                  @media print { body { margin: 20px; } }
                </style>
                </head><body>
                <div class="header-logos">
                  <img src="${window.location.origin}/logos/logo-fades.PNG" alt="FADES" />
                  <img src="${window.location.origin}/logos/new_logo-viflo.JPG" alt="VIFLO" style="height: 50px;" />
                  <img src="${window.location.origin}/logos/logo-afg-bank_atlantic.png" alt="AFG Bank" />
                </div>
                <h1>Fiche de Souscription VITALIS</h1>
                
                <h2>1. Informations Générales</h2>
                <table>
                  <tr><th>Référence Dossier</th><td><strong>${sub.reference}</strong></td></tr>
                  <tr><th>Date de Souscription</th><td>${new Date(sub.dateCreation).toLocaleDateString('fr-FR')}</td></tr>
                  <tr><th>Banque Financeuse</th><td><strong>${sub.banqueNom}</strong></td></tr>
                </table>

                <h2>2. Identité du Souscripteur</h2>
                <table>
                  <tr><th>Nom / Prénom</th><td>${sub.souscripteurNom} ${sub.souscripteurPrenom || ''}</td></tr>
                  <tr><th>Type de Souscripteur</th><td>${sub.typeSouscripteur === 'physique' ? 'Personne Physique' : 'Personne Morale'}</td></tr>
                  ${sub.souscripteurEntreprise ? `<tr><th>Entreprise</th><td>${sub.souscripteurEntreprise}</td></tr>` : ''}
                  <tr><th>Téléphone</th><td>${sub.souscripteurTelephone || 'Non renseigné'}</td></tr>
                  <tr><th>Email</th><td>${sub.souscripteurEmail || 'Non renseigné'}</td></tr>
                </table>

                <h2>3. Fournisseurs Agréés</h2>
                <ul>
                  ${sub.fournisseurs.map(f => `<li><strong>${f.fournisseurNom}</strong></li>`).join('')}
                </ul>

                <h2>4. Engagement du Souscripteur</h2>
                <p style="font-size: 13px; text-align: justify;">
                  Je soussigné(e), <strong>${sub.souscripteurNom} ${sub.souscripteurPrenom || ''}</strong>, reconnais avoir pris connaissance des conditions générales du programme de financement VITALIS géré en partenariat avec AFG Bank. Je certifie l'exactitude des informations fournies et m'engage à fournir toutes les pièces justificatives complémentaires qui pourraient m'être demandées pour l'étude de ce dossier.
                </p>

                <div class="signature-box">
                  <p style="font-weight: bold; color: #4b5563; margin-top: 0;">Signature du Client</p>
                  <p style="font-size: 12px; color: #9ca3af;">(Précédée de la mention "Lu et approuvé")</p>
                </div>

                <div class="footer">
                  <p>Programme Vitalis — AFG Bank · Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                </div>
                </body></html>
              `);
              w.document.close();
              w.focus();
              setTimeout(() => w.print(), 500);
            }}
            className="btn-ldf-outline text-sm py-2 px-4"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer pour émargement
          </button>
        </div>
      </div>

      {/* ── Timeline processus ── */}
      <div className="section-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Progression du dossier</h3>
        <ProcessTimeline steps={processSteps} />
      </div>

      {/* ── Déclencheurs d'étapes post-validation bancaire ── */}
      {(sub.statut === "accepte" || sub.statut === "finance") && (
        <div className="p-4 rounded-xl border bg-amber-50/80 border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Étape 5 active : Accord AFG Bank accordé — Virement au fournisseur</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {user?.role === "banque" || user?.role === "admin"
                  ? "En tant qu'établissement bancaire, validez le virement direct des fonds sur le compte du fournisseur pour déclencher la préparation des articles."
                  : "Le dossier est validé par la banque. En attente de l'exécution du virement par AFG Bank sur votre compte fournisseur pour démarrer la préparation."}
              </p>
            </div>
          </div>
          {(user?.role === "banque" || user?.role === "admin") ? (
            <button
              onClick={handleConfirmerPaiement}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
            >
              <CreditCard className="w-3.5 h-3.5" /> Émettre le virement au fournisseur (AFG Bank) →
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 self-start sm:self-auto whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> En attente du virement AFG Bank
            </span>
          )}
        </div>
      )}

      {sub.statut === "fournisseur_paye" && (
        <div className="p-4 rounded-xl border bg-sky-50/80 border-sky-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Étape 6 active : Virement reçu — Préparation de la commande</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {user?.role === "fournisseur" || user?.role === "admin"
                  ? "Le virement a été reçu. Vous pouvez désormais rassembler les articles et démarrer la préparation du colis/kit scolaire."
                  : "Le virement bancaire a été versé au fournisseur. Ce dernier prépare actuellement le colis."}
              </p>
            </div>
          </div>
          {(user?.role === "fournisseur" || user?.role === "admin") ? (
            <button
              onClick={handleDemarrerPreparation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5" /> Démarrer la préparation de commande →
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300 self-start sm:self-auto whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> En attente de préparation (Fournisseur)
            </span>
          )}
        </div>
      )}

      {sub.statut === "commande_en_preparation" && (
        <div className="p-4 rounded-xl border bg-teal-50/80 border-teal-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Étape 6 active : Articles prêts — Remise et émargement</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {user?.role === "fournisseur" || user?.role === "admin"
                  ? "La commande est prête. Dès que le souscripteur se présente avec sa fiche pour le retrait et signe l'émargement, validez la livraison finale."
                  : "La commande est prête chez le fournisseur. Le souscripteur peut se présenter avec sa fiche de souscription pour récupérer ses articles."}
              </p>
            </div>
          </div>
          {(user?.role === "fournisseur" || user?.role === "admin") ? (
            <button
              onClick={handleConfirmerLivraison}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmer la livraison (Articles servis ✓)
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300 self-start sm:self-auto whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 text-teal-600" /> Prêt pour retrait / livraison
            </span>
          )}
        </div>
      )}

      {(sub.statut === "livre" || sub.statut === "servie" || sub.statut === "cloture") && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Cycle VITALIS 100% complété</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Tous les articles ont été remis au souscripteur contre émargement. Financement et commande finalisés avec succès.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Souscripteur */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Informations souscripteur</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              {[
                { label: "Nom complet", value: `${sub.souscripteurPrenom} ${sub.souscripteurNom}` },
                { label: "Téléphone", value: sub.souscripteurTelephone, icon: Phone },
                { label: "Email", value: sub.souscripteurEmail },
                { label: "Banque", value: sub.banqueNom },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fournisseur */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Fournisseur</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">Nom</p><p className="text-sm font-medium text-gray-800">{sub.fournisseurNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Banque partenaire</p><p className="text-sm font-medium text-gray-800">{sub.banqueNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Durée souscription</p><p className="text-sm font-medium text-gray-800">{sub.duree} mois</p></div>
              {sub.observations && (
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Observations</p><p className="text-sm text-gray-600">{sub.observations}</p></div>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Articles ({devis?.articles?.length || 0})</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="ldf-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Référence</th>
                    <th>Qté</th>
                    <th>Prix unitaire</th>
                    <th>Remise</th>
                    <th>Montant HT</th>
                  </tr>
                </thead>
                <tbody>
                  {(devis?.articles || []).map(a => (
                    <tr key={a.id}>
                      <td className="font-medium text-gray-800">{a.designation}</td>
                      <td className="font-mono text-xs text-gray-500">{a.reference}</td>
                      <td>{a.quantite}</td>
                      <td>{fmtCFA(a.prixUnitaire)}</td>
                      <td>{a.remise && a.remise > 0 ? `${a.remise}%` : "—"}</td>
                      <td className="font-semibold text-gray-800">{fmtCFA(a.montantHT)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50/50">
                    <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-700">{fmtCFA(sub.montantTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Décision banque */}
          {dossier && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Décision bancaire</h3>
                </div>
                <StatusBadge statut={dossier.statut} />
              </div>
              <div className="section-card-body space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{dossier.banqueNom}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Date réception</p><p className="text-sm font-medium text-gray-800">{new Date(dossier.dateReception).toLocaleDateString("fr-FR")}</p></div>
                </div>
                {dossier.commentaireBanque && (
                  <div className={`p-3 rounded-lg text-sm ${dossier.statut === "valide" ? "bg-emerald-50 text-emerald-800" : dossier.statut === "rejete" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
                    {dossier.commentaireBanque}
                  </div>
                )}
                {dossier.motifRejet && (
                  <div className="p-3 rounded-lg bg-red-50 text-sm text-red-800">
                    <strong>Motif du rejet :</strong> {dossier.motifRejet}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paiement */}
          {sub.paiementId && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Paiement</h3>
                </div>
                <Link href={`/dashboard/paiements/${sub.paiementId}`} className="text-xs text-amber-600 hover:text-amber-700">
                  Voir le détail →
                </Link>
              </div>
              <div className="section-card-body">
                <p className="text-sm text-gray-600">Référence : <span className="font-mono font-semibold text-amber-700">{sub.paiementId}</span></p>
                <p className="text-xl font-bold text-gray-900 mt-1">{fmtCFA(sub.montantTotal)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite — Timeline ── */}
        <div className="space-y-5">
          {/* Récapitulatif */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Récapitulatif</h3>
            </div>
            <div className="section-card-body space-y-3">
              {[
                { label: "Montant total", value: fmtCFA(sub.montantTotal), highlight: true },
                { label: "Durée", value: `${sub.duree} mois` },
                { label: "Banque", value: sub.banqueNom },
                { label: "Fournisseur", value: sub.fournisseurNom },
                { label: "Statut", value: null, badge: sub.statut },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-gray-500">{r.label}</span>
                  {r.badge ? <StatusBadge statut={r.badge} size="sm" /> :
                    <span className={`text-sm font-semibold ${r.highlight ? "text-amber-700" : "text-gray-800"}`}>{r.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Historique */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Historique</h3>
            </div>
            <div className="section-card-body">
              {historique.length > 0 ? (
                <LDFTimeline events={historique} />
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Aucun historique disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
