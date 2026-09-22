// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { LDFTimeline, ProcessTimeline } from "@/components/ui/ldf-timeline";
import { ConfirmModal, MotifsRejetModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore, emitInAppNotification } from "@/stores/ldfAuth";
import {
  ArrowLeft, BookOpen, Building2, CheckCircle2, CreditCard,
  FileText, Package, User, XCircle, Truck, MapPin, Phone,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import type { DossierStatut } from "@/types/ldf";

const fmtCFA = (v: any) => {
  const num = typeof v === "number" ? v : Number(v);
  return new Intl.NumberFormat("fr-FR").format(isNaN(num) ? 0 : num) + " FCFA";
};

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const {
    getDossierById, getDevisById, getSouscriptionById, getHistoriqueBySouscription,
    getDevisBySouscription, updateDossier, updateSouscription, addHistorique,
    addPaiement, generateRef,
  } = useVitalisDb();

  const [statut, setStatut] = useState<DossierStatut | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [showValider, setShowValider] = useState(false);
  const [showRejeter, setShowRejeter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateValidationDossier, setDateValidationDossier] = useState(new Date().toISOString().split("T")[0]);
  const [dateValidationPaiement, setDateValidationPaiement] = useState(new Date().toISOString().split("T")[0]);

  const dossier = getDossierById(id);
  const devis = (dossier && Array.isArray(dossier.devisIds) && dossier.devisIds.length > 0
    ? getDevisById(dossier.devisIds[0])
    : null) || (dossier ? getDevisBySouscription(dossier.souscriptionId)[0] : null);
  const sub = dossier ? getSouscriptionById(dossier.souscriptionId) : null;
  const historique = dossier ? getHistoriqueBySouscription(dossier.souscriptionId) : [];

  // Détails de livraison structurés
  const deliveryInfo = useMemo(() => {
    if (sub?.detailsLivraison) return sub.detailsLivraison;
    const obs = sub?.observations || "";
    const isDomicile = obs.toLowerCase().includes("domicile");
    const destMatch = obs.match(/Destinataire:\s*([^(|\n]+)(?:\(([^)]+)\))?/);
    const relaisMatch = obs.match(/(?:Point Relais|Relais):\s*([^\]|\n]+)/);
    const zoneMatch = obs.match(/Zone:\s*([^|\n]+)/);
    return {
      mode: isDomicile ? "domicile" : "point_relais",
      adresse: obs.includes("Domicile:") ? (obs.match(/Domicile:\s*([^\]|\n]+)/)?.[1] || "") : "",
      pointRelaisNom: relaisMatch ? relaisMatch[1].replace(/^[^(]*\(([^)]*)\).*/, "$1").trim() : "",
      destinataireNom: destMatch ? destMatch[1].trim() : `${sub?.souscripteurPrenom || dossier?.souscripteurPrenom || ""} ${sub?.souscripteurNom || dossier?.souscripteurNom || ""}`.trim(),
      destinataireTelephone: destMatch && destMatch[2] ? destMatch[2].trim() : (sub?.souscripteurTelephone || ""),
      zone: zoneMatch ? zoneMatch[1].trim() : "",
    };
  }, [sub, dossier]);

  if (!dossier) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <FileText className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Dossier introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  // Ordre chronologique des étapes du workflow VITALIS
  const isPasse = (statutCandidat: string, statutSeuil: string) => {
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
    const idxCandidat = ordre.indexOf(statutCandidat);
    const idxSeuil = ordre.indexOf(statutSeuil);
    return idxCandidat !== -1 && idxSeuil !== -1 && idxCandidat >= idxSeuil;
  };

  const brutStatut = statut ?? dossier.statut;
  // Le statut le plus avancé entre le dossier et sa souscription liée
  const effectifStatut = [brutStatut, sub?.statut || ""].reduce((max, curr) => {
    return isPasse(curr, max) ? curr : max;
  }, brutStatut);

  const isDossierRejete = brutStatut === "rejete" || brutStatut === "refuse" || sub?.statut === "refuse" || sub?.statut === "rejetee";

  // Une fois qu'une décision a été prise ou que les étapes sont terminées, aucun bouton d'action banque ne doit rester visible
  const isDecideOuTermine = isDossierRejete ||
    isPasse(effectifStatut, "accepte") ||
    ["accepte", "valide", "refuse", "rejete", "finance", "fournisseur_paye", "commande_en_preparation", "livre", "servie", "cloture"].includes(effectifStatut);

  const canAct = (user?.role === "banque" || user?.role === "admin") &&
    !isDecideOuTermine &&
    ["depose_banque", "en_analyse_bancaire", "recu", "en_cours_traitement"].includes(effectifStatut);

  const currentStatut = isDossierRejete ? "refuse" : effectifStatut;

  const linkedDevis = dossier
    ? (Array.isArray(dossier.devisIds) && dossier.devisIds.length > 0
        ? dossier.devisIds.map((dId: string) => getDevisById(dId)).filter(Boolean)
        : getDevisBySouscription(dossier.souscriptionId))
    : [];
  const sumDevisTTC = linkedDevis.reduce((sum: number, d: any) => sum + (Number(d?.totalTTC) || 0), 0);
  const dossierMontant = sumDevisTTC > 0 ? sumDevisTTC : (dossier?.montantTotal || dossier?.montant || devis?.totalTTC || sub?.montantTotal || 0);

  useEffect(() => {
    if (dossier && sumDevisTTC > 0 && (dossier.montantTotal !== sumDevisTTC || dossier.montant !== sumDevisTTC)) {
      updateDossier(dossier.id, { montantTotal: sumDevisTTC, montant: sumDevisTTC });
    }
  }, [dossier?.id, sumDevisTTC]);

  // Synchronisation automatique du statut du dossier s'il était resté bloqué en arrière
  useEffect(() => {
    if (dossier && effectifStatut && effectifStatut !== dossier.statut && !isDossierRejete) {
      updateDossier(dossier.id, { statut: effectifStatut as any });
    }
  }, [dossier?.id, effectifStatut, isDossierRejete]);

  const fournisseurAffiche =
    dossier?.fournisseurNom ||
    dossier?.fournisseursNoms ||
    devis?.fournisseurNom ||
    sub?.fournisseurNom ||
    (sub?.fournisseurs && sub.fournisseurs.length > 0
      ? sub.fournisseurs.map((f: any) => f.fournisseurNom).join(", ")
      : "") ||
    "Librairie de France Groupe";

  // Process steps (VITALIS Workflow: 1. Demande & Besoin -> 2. Devis fournisseur -> 3. Dépôt dossier physique -> 4. Décision AFG Bank -> 5. Virement fournisseur -> 6. Retrait des articles)
  const processSteps = [
    { id: "s1", label: "1. Demande & Besoin", statut: "complete" as const, date: sub?.dateCreation || dossier.dateCreation },
    { id: "s2", label: "2. Devis fournisseur", statut: devis ? ("complete" as const) : ("pending" as const) },
    {
      id: "s3",
      label: "3. Dépôt dossier physique",
      statut: (isPasse(effectifStatut, "depose_banque") || isPasse(effectifStatut, "en_analyse_bancaire") || isPasse(effectifStatut, "accepte"))
        ? ("complete" as const)
        : devis
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      id: "s4",
      label: "4. Décision AFG Bank",
      statut: isDossierRejete
        ? ("rejected" as const)
        : isPasse(effectifStatut, "accepte")
          ? ("complete" as const)
          : ["en_cours_traitement", "en_analyse_bancaire", "depose_banque", "recu"].includes(currentStatut)
            ? ("current" as const)
            : ("pending" as const),
    },
    {
      id: "s5",
      label: "5. Virement fournisseur",
      statut: isPasse(effectifStatut, "fournisseur_paye")
        ? ("complete" as const)
        : (effectifStatut === "accepte" || effectifStatut === "valide" || effectifStatut === "finance")
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      id: "s6",
      label: "6. Retrait des articles",
      statut: (isPasse(effectifStatut, "livre") || effectifStatut === "servie" || effectifStatut === "cloture")
        ? ("complete" as const)
        : (effectifStatut === "fournisseur_paye" || effectifStatut === "commande_en_preparation")
          ? ("current" as const)
          : ("pending" as const),
    },
  ];

  const handleValider = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    updateDossier(dossier.id, {
      statut: "accepte",
      dateValidation: dateValidationDossier,
      commentaireAFG: "Dossier conforme aux conditions du programme Vitalis.",
    });
    updateSouscription(dossier.souscriptionId, { statut: "accepte" });
    addHistorique({
      souscriptionId: dossier.souscriptionId,
      action: "dossier_accepte",
      description: `Dossier ${dossier.reference} validé — Financement accordé par AFG Bank`,
      auteur: `${user?.firstName || "AFG Bank"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });

    // ── NOTIFIER LE FOURNISSEUR ET LE CLIENT (SOUSCRIPTEUR) ──
    emitInAppNotification({
      titre: `Accord de financement AFG Bank : ${dossier.reference}`,
      message: `Bonne nouvelle ! Le financement pour ${dossier.souscripteurPrenom} ${dossier.souscripteurNom} (${fmtCFA(dossierMontant)}) a été accordé par AFG Bank. La commande peut être préparée et servie.`,
      categorie: "dossier",
      reference: dossier.reference,
      lien: `/dashboard/dossiers/${dossier.id}`,
      roles: ["fournisseur", "souscripteur", "admin", "banque"],
    });

    setStatut("accepte");
    setShowValider(false);
    setLoading(false);
    toast.success(`Dossier ${dossier.reference} validé avec succès !`);
  };

  const handleRejeter = async (motif: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    updateDossier(dossier.id, {
      statut: "refuse",
      motifRejet: motif,
    });
    updateSouscription(dossier.souscriptionId, { statut: "refuse" });
    addHistorique({
      souscriptionId: dossier.souscriptionId,
      action: "dossier_refuse",
      description: `Dossier ${dossier.reference} rejeté par AFG Bank : ${motif}`,
      auteur: `${user?.firstName || "AFG Bank"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });

    // ── NOTIFIER LE FOURNISSEUR ET LE CLIENT (SOUSCRIPTEUR) ──
    emitInAppNotification({
      titre: `Décision AFG Bank : Dossier ${dossier.reference} refusé`,
      message: `Le dossier de ${dossier.souscripteurPrenom} ${dossier.souscripteurNom} a été refusé par AFG Bank. Motif : ${motif}`,
      categorie: "dossier",
      reference: dossier.reference,
      lien: `/dashboard/dossiers/${dossier.id}`,
      roles: ["fournisseur", "souscripteur", "admin", "banque"],
    });

    setStatut("refuse");
    setCommentaire(motif);
    setShowRejeter(false);
    setLoading(false);
    toast.error(`Dossier ${dossier.reference} rejeté.`);
  };

  const handleConfirmerPaiement = () => {
    if (!dossier || !sub) return;
    const refPay = generateRef("PAY");
    const montantTotal = dossierMontant;
    const newPay = addPaiement({
      reference: refPay,
      souscriptionId: sub.id,
      souscriptionRef: sub.reference,
      dossierId: dossier.id,
      dossierRef: dossier.reference,
      souscripteurNom: `${dossier.souscripteurPrenom || ""} ${dossier.souscripteurNom || ""}`.trim(),
      montantTotal,
      repartitionFournisseurs: [
        {
          fournisseurId: devis?.fournisseurId || "FOUR-LDF-001",
          fournisseurNom: fournisseurAffiche,
          devisId: devis?.id || "",
          montant: montantTotal,
          statut: "confirme",
        },
      ],
      statut: "termine",
      dateCreation: new Date().toISOString().split("T")[0],
      dateValidationAFG: dateValidationPaiement,
      dateTransfert: dateValidationPaiement,
      dateMiseAJour: new Date().toISOString().split("T")[0],
    });

    updateSouscription(sub.id, { statut: "fournisseur_paye", paiementId: newPay.id });
    updateDossier(dossier.id, { statut: "fournisseur_paye" });
    setStatut("fournisseur_paye");

    addHistorique({
      souscriptionId: sub.id,
      action: "paiement_effectue",
      description: `Virement AFG Bank de ${fmtCFA(montantTotal)} effectué au fournisseur ${fournisseurAffiche} — Réf ${refPay}`,
      auteur: `${user?.firstName || "AFG Bank"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });

    emitInAppNotification({
      titre: `Virement AFG Bank émis : ${refPay}`,
      message: `AFG Bank a validé le virement de ${fmtCFA(montantTotal)} pour le dossier ${dossier.reference}. Le fournisseur peut préparer la commande.`,
      categorie: "paiement",
      reference: refPay,
      lien: `/dashboard/dossiers/${dossier.id}`,
      roles: ["fournisseur", "souscripteur", "banque", "admin"],
    });

    toast.success("Virement fournisseur validé avec succès par AFG Bank !");
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
              Reçu le {new Date(dossier.dateReception).toLocaleDateString("fr-FR")} · {dossier.banqueNom || "AFG Bank"}
            </p>
          </div>
        </div>

        {/* Boutons d'action banque — Strictement conforme au Cahier des Charges VITALIS : Validation ou Rejet */}
        {canAct && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowValider(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Valider le dossier
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
      {(isDossierRejete || isPasse(effectifStatut, "accepte")) && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${isDossierRejete
          ? "bg-red-50 border-red-200"
          : "bg-emerald-50 border-emerald-200"
          }`}>
          {isDossierRejete ? (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {isDossierRejete ? "Dossier rejeté" : "Dossier validé — financement accordé"}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {commentaire || dossier.motifRejet || dossier.commentaireBanque || dossier.commentaireAFG || (!isDossierRejete ? "Financement accordé par AFG Bank." : "")}
            </p>
          </div>
        </div>
      )}

      {/* ── Action Virement Bancaire AFG Bank (Étape 5) ── */}
      {!isDossierRejete && !isPasse(effectifStatut, "fournisseur_paye") && isPasse(effectifStatut, "accepte") && (
        <div className="p-4 rounded-xl border bg-amber-50/80 border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Étape 5 : Virement au fournisseur requis</p>
              <p className="text-xs text-gray-600 mt-0.5">
                AFG Bank se prépare à Valider le virement direct de {fmtCFA(dossierMontant)} sur le compte du fournisseur.
              </p>
            </div>
          </div>
          {(user?.role === "banque" || user?.role === "admin") && (
            <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto mt-3 sm:mt-0">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto text-left">
                <label className="text-xs font-bold text-amber-900">Date du virement *</label>
                <input
                  type="date"
                  value={dateValidationPaiement}
                  onChange={e => setDateValidationPaiement(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 font-medium"
                />
              </div>
              <button
                onClick={handleConfirmerPaiement}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm self-stretch sm:self-auto justify-center whitespace-nowrap"
              >
                <CreditCard className="w-4 h-4" /> Valider le virement →
              </button>
            </div>
          )}
        </div>
      )}

      {isPasse(effectifStatut, "fournisseur_paye") && (
        <div className="p-4 rounded-xl border bg-sky-50 border-sky-200 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-sky-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-sky-900">Virement bancaire AFG Bank exécuté ✓</p>
            <p className="text-xs text-sky-700 mt-0.5">
              Fonds transférés au fournisseur {fournisseurAffiche} ({fmtCFA(dossierMontant)}). {isPasse(effectifStatut, "livre") ? "Articles retirés contre fiche d'émargement signée — Dossier clôturé ✓" : "Commande en cours de préparation / retrait chez le fournisseur."}
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
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Nom complet</p>
                <p className="text-sm font-medium text-gray-800">
                  {dossier.souscripteurPrenom || sub?.souscripteurPrenom || ""} {dossier.souscripteurNom || sub?.souscripteurNom || ""}
                </p>
              </div>
              {sub && <>
                <div><p className="text-xs text-gray-400 mb-0.5">Téléphone</p><p className="text-sm font-medium text-gray-800">{sub.souscripteurTelephone}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-sm font-medium text-gray-800">{sub.souscripteurEmail}</p></div>
              </>}
              <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{dossier.banqueNom || "AFG Bank"}</p></div>
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
                <div><p className="text-xs text-gray-400 mb-0.5">Fournisseur</p><p className="text-sm font-medium text-gray-800">{fournisseurAffiche}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Durée</p><p className="text-sm font-medium text-gray-800">{sub.duree} mois</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Articles</p><p className="text-sm font-medium text-gray-800">{devis?.articles?.length || 0} article{(devis?.articles?.length || 0) > 1 ? "s" : ""}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Montant total</p><p className="text-sm font-bold text-amber-700">{fmtCFA(sub.montantTotal || dossierMontant)}</p></div>
              </div>
            </div>
          )}

          {/* Section Détails et Destination de livraison client */}
          <div className="section-card border-l-4 border-l-blue-500">
            <div className="section-card-header bg-blue-50/40">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Modalités & Destination de la livraison (Détails client)</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {deliveryInfo.mode === "point_relais" ? "Point Relais Vitalis" : "Livraison à domicile"}
              </span>
            </div>
            <div className="section-card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Mode de livraison</p>
                <p className="text-sm font-semibold text-gray-800">
                  {deliveryInfo.mode === "point_relais" ? "Retrait en Point Relais Partenaire" : "Livraison directe à domicile / site"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Lieu / Adresse</p>
                <p className="text-sm font-medium text-gray-800">
                  {deliveryInfo.mode === "point_relais"
                    ? (deliveryInfo.pointRelaisNom ? `Point Relais : ${deliveryInfo.pointRelaisNom}` : (deliveryInfo.zone || "Point Relais désigné"))
                    : (deliveryInfo.adresse || deliveryInfo.zone || "Adresse indiquée par le client")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Destinataire désigné</p>
                <p className="text-sm font-medium text-gray-800">
                  {deliveryInfo.destinataireNom || `${dossier.souscripteurPrenom || ""} ${dossier.souscripteurNom || ""}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Téléphone direct du destinataire</p>
                <p className="text-sm font-semibold text-gray-800 text-blue-700">
                  {deliveryInfo.destinataireTelephone || sub?.souscripteurTelephone || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>

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
                      {devis.articles.slice(0, 3).map((a: any, i: number) => (
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
                <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{dossier.banqueNom || "AFG Bank"}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Date réception</p><p className="text-sm font-medium text-gray-800">{new Date(dossier.dateReception).toLocaleDateString("fr-FR")}</p></div>
                {dossier.dateTraitement && (
                  <div><p className="text-xs text-gray-400 mb-0.5">Date traitement</p><p className="text-sm font-medium text-gray-800">{new Date(dossier.dateTraitement).toLocaleDateString("fr-FR")}</p></div>
                )}
              </div>
              {(commentaire || dossier.commentaireBanque || dossier.commentaireAFG) && (
                <div className={`p-3 rounded-lg text-sm leading-relaxed ${(currentStatut === "valide" || currentStatut === "accepte")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-red-50 text-red-800 border border-red-100"
                  }`}>
                  {commentaire || dossier.commentaireBanque || dossier.commentaireAFG}
                </div>
              )}
              {dossier.motifRejet && (currentStatut === "rejete" || currentStatut === "refuse") && (
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
          {(sub?.statut === "servie" || sub?.statut === "livre") && (
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
                { label: "Montant", value: fmtCFA(dossierMontant), highlight: true },
                { label: "Fournisseur", value: fournisseurAffiche },
                { label: "Banque", value: dossier.banqueNom || "AFG Bank" },
                { label: "Statut", value: null, badge: currentStatut },
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

      {/* ── Modales banque (Valider / Rejeter uniquement) ── */}
      <ConfirmModal
        open={showValider}
        onClose={() => setShowValider(false)}
        onConfirm={handleValider}
        title="Valider le dossier"
        message={`Êtes-vous sûr de vouloir valider le dossier ${dossier.reference} et accorder le financement de ${fmtCFA(dossierMontant)} ?`}
        confirmLabel="Valider"
        variant="success"
        loading={loading}
      >
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-bold text-gray-700">Date de validation du financement *</label>
          <input
            type="date"
            value={dateValidationDossier}
            onChange={e => setDateValidationDossier(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
          />
        </div>
      </ConfirmModal>

      <MotifsRejetModal
        open={showRejeter}
        onClose={() => setShowRejeter(false)}
        onSubmit={handleRejeter}
        loading={loading}
      />
    </div>
  );
}
