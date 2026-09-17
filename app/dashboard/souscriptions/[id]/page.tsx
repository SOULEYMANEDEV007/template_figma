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
  BookOpen, ShieldCheck, Sparkles,
} from "lucide-react";
import { IMAGES } from "@/lib/constants";
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
  const [dateDisponibilite, setDateDisponibilite] = useState(new Date().toISOString().split("T")[0]);
  const [heureDisponibilite, setHeureDisponibilite] = useState("08:00");

  const sub = getSouscriptionById(id);
  const devis = sub ? getDevisBySouscription(sub.id)[0] : null;
  const dossier = sub ? getDossierBySouscription(sub.id) : null;
  const historique = sub ? getHistoriqueBySouscription(sub.id) : [];

  const handlePrintDossier = () => {
    if (!sub) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Dossier de Souscription VITALIS - ${sub.reference}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 850px; margin: 25px auto; color: #1f2937; line-height: 1.5; font-size: 13px; }
        .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px; }
        .header-logos img { height: 42px; object-fit: contain; mix-blend-mode: multiply; }
        h1 { color: #ea580c; border-bottom: 3px solid #ea580c; padding-bottom: 8px; text-align: center; font-size: 20px; margin-bottom: 15px; }
        h2 { color: #c2410c; margin-top: 18px; font-size: 13px; border-bottom: 1px solid #fed7aa; padding: 5px 10px; background: #fff7ed; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
        th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; color: #4b5563; font-weight: 600; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; }
        .sig-box { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 12px; min-height: 100px; text-align: center; }
        .footer { margin-top: 25px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; text-align: center; }
        @media print { body { margin: 15px; } .page-break { page-break-before: always; } }
      </style>
      </head><body>
      <div class="header-logos">
        <img src="${window.location.origin}${IMAGES.logos.fades}" alt="FADES" />
        <img src="${window.location.origin}${IMAGES.logos.vifloNew}" alt="VIFLO" style="height: 48px;" />
        <img src="${window.location.origin}${IMAGES.logos.afgBank}" alt="AFG Bank" />
      </div>

      <h1>DOSSIER DE SOUSCRIPTION VITALIS — DÉPÔT PHYSIQUE AFG BANK</h1>
      <p style="text-align: center; margin-top: -10px; color: #64748b; font-size: 12px;">
        Programme de Financement Vitalis · Banque Financeuse Unique : <strong>AFG Bank</strong>
      </p>

      <h2>1. Fiche d'Adhésion — Informations Générales</h2>
      <table>
        <tr><th style="width: 35%;">Référence Souscription</th><td><strong style="font-family: monospace; font-size: 14px; color: #ea580c;">${sub.reference}</strong></td></tr>
        <tr><th>Date d'initiation</th><td>${new Date(sub.dateCreation).toLocaleDateString('fr-FR')}</td></tr>
        <tr><th>Banque Financeuse</th><td><strong>${sub.banqueNom}</strong></td></tr>
        <tr><th>Agence AFG Bank de Dépôt</th><td><strong>${sub.agenceNom || "Agence Centrale Plateau"}</strong></td></tr>
        <tr><th>Durée de remboursement demandée</th><td><strong>${sub.duree} mois</strong> (Taux bonifié Vitalis)</td></tr>
      </table>

      <h2>2. Identité du Souscripteur (Bénéficiaire)</h2>
      <table>
        <tr><th style="width: 35%;">Nom & Prénom</th><td><strong>${sub.souscripteurNom} ${sub.souscripteurPrenom || ''}</strong></td></tr>
        <tr><th>Type de personne</th><td>${sub.typeSouscripteur === 'physique' ? 'Personne Physique (Salarié / Fonctionnaire)' : 'Personne Morale (Entreprise / PME)'}</td></tr>
        ${sub.souscripteurEntreprise ? `<tr><th>Raison sociale entreprise</th><td>${sub.souscripteurEntreprise}</td></tr>` : ''}
        <tr><th>Téléphone</th><td>${sub.souscripteurTelephone || 'Non renseigné'}</td></tr>
        <tr><th>Email</th><td>${sub.souscripteurEmail || 'Non renseigné'}</td></tr>
      </table>

      ${sub.observations ? `
      <h2>3. Expression du Besoin Client</h2>
      <p style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 12px; margin: 8px 0;">
        ${sub.observations}
      </p>` : ''}

      ${devis ? `
      <h2>4. Devis Chiffré Joint — ${devis.fournisseurNom} (Réf : ${devis.reference})</h2>
      <table>
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Réf.</th>
            <th style="text-align: center;">Qté</th>
            <th style="text-align: right;">Prix Unitaire</th>
            <th style="text-align: right;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${(devis.articles || []).map(a => `
            <tr>
              <td><strong>${a.designation}</strong></td>
              <td style="font-family: monospace; font-size: 11px; color: #64748b;">${a.reference || '—'}</td>
              <td style="text-align: center;">${a.quantite}</td>
              <td style="text-align: right;">${fmtCFA(a.prixUnitaire)}</td>
              <td style="text-align: right; font-weight: bold;">${fmtCFA(a.montantHT)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right; font-weight: bold;">Montant Total HT</td>
            <td style="text-align: right; font-weight: bold;">${fmtCFA(devis.totalHT || devis.totalTTC)}</td>
          </tr>
          <tr style="background: #fff7ed; color: #ea580c; font-size: 13px;">
            <td colspan="4" style="text-align: right; font-weight: bold;">MONTANT TOTAL DU FINANCEMENT (TTC)</td>
            <td style="text-align: right; font-weight: bold;">${fmtCFA(devis.totalTTC)}</td>
          </tr>
        </tfoot>
      </table>
      ` : ''}

      <h2>5. Engagements & Signatures</h2>
      <p style="font-size: 11px; text-align: justify; color: #475569;">
        Le souscripteur certifie l'exactitude des informations fournies, s'engage à respecter les échéances du prêt consenti par AFG Bank et autorise le versement direct au(x) fournisseur(s) agréé(s).
      </p>

      <div class="signature-grid">
        <div class="sig-box">
          <p style="font-weight: bold; margin: 0; color: #1e293b; font-size: 12px;">Cadre 1 : Signature du Souscripteur</p>
          <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 35px 0;">(Mention manuscrite "Lu et approuvé")</p>
          <p style="font-size: 11px; color: #64748b;">Fait le : ___/___/2026</p>
        </div>
        <div class="sig-box" style="border-color: #f97316; background: #fffaf5;">
          <p style="font-weight: bold; margin: 0; color: #c2410c; font-size: 12px;">Cadre 2 : Réservé à l'Agence AFG Bank</p>
          <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 35px 0;">(Réception physique du dossier complet au guichet)</p>
          <p style="font-size: 11px; color: #64748b;">Date réception : ___/___/2026 · Cachet & Visa</p>
        </div>
      </div>

      <div class="footer">
        <p>Programme VITALIS — Convention de partenariat AFG Bank, FADES & Plateforme Viflo · Document officiel pour dépôt en agence bancaire</p>
      </div>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
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
    { id: "sub", label: "1. Demande & Besoin", statut: "complete" as const, date: sub.dateCreation },
    { id: "devis", label: "2. Devis fournisseur", statut: devis ? ("complete" as const) : ("pending" as const) },
    /*{ id: "depot", label: "3. Dépôt dossier en agence", statut: isApres(currentEffectifStatut, "depose_banque") ? ("complete" as const) : currentEffectifStatut === "pret_pour_depot" ? ("current" as const) : ("pending" as const) },*/
    { id: "banque", label: "3. Décision AFG Bank", statut: isApres(currentEffectifStatut, "accepte") ? ("complete" as const) : (currentEffectifStatut === "refuse" || currentEffectifStatut === "rejete") ? ("rejected" as const) : currentEffectifStatut === "en_analyse_bancaire" ? ("current" as const) : ("pending" as const) },
    { id: "paiement", label: "4. Virement fournisseur", statut: isApres(currentEffectifStatut, "fournisseur_paye") ? ("complete" as const) : (currentEffectifStatut === "accepte" || currentEffectifStatut === "valide" || currentEffectifStatut === "finance") ? ("current" as const) : ("pending" as const) },
    { id: "livraison", label: "5. Retrait des articles", statut: (currentEffectifStatut === "cloture" || currentEffectifStatut === "livre" || currentEffectifStatut === "servie") ? ("complete" as const) : (currentEffectifStatut === "fournisseur_paye" || currentEffectifStatut === "commande_en_preparation") ? ("current" as const) : ("pending" as const) },
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
    const pointRelaisMatch = sub?.observations?.match(/Relais:\s*([^|\n]+)/);
    const pointRelaisName = pointRelaisMatch ? pointRelaisMatch[1].trim() : "votre point relais";

    updateSouscription(sub.id, { statut: "commande_en_preparation" });
    if (dossier) updateDossier(dossier.id, { statut: "commande_en_preparation" });

    addHistorique({
      souscriptionId: sub.id,
      action: "commande_preparation",
      description: `Commande prête. Disponible au point relais : ${pointRelaisName} le ${new Date(dateDisponibilite).toLocaleDateString("fr-FR")} à partir de ${heureDisponibilite}.`,
      auteur: `${user?.firstName || "Fournisseur"} ${user?.lastName || ""}`,
      date: new Date().toISOString(),
    });

    emitInAppNotification({
      titre: `Votre commande est prête !`,
      message: `La commande sera disponible au point relais : ${pointRelaisName} le ${new Date(dateDisponibilite).toLocaleDateString("fr-FR")} à partir de ${heureDisponibilite}.`,
      categorie: "dossier",
      reference: sub.reference,
      lien: `/dashboard/souscriptions/${sub.id}`,
      roles: ["souscripteur", "banque", "admin", "fournisseur"],
    });

    toast.success("Client alerté de la disponibilité 📦");
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

          {dossier && (
            <Link href={`/dashboard/dossiers/${dossier.id}`} className="btn-ldf-outline text-sm py-2 px-4">
              <CheckCircle2 className="w-3.5 h-3.5" /> Voir le dossier
            </Link>
          )}
          {devis && (
            <button
              onClick={handlePrintDossier}
              className="btn-ldf-primary text-sm py-2 px-4 flex items-center gap-1.5 shadow-sm"
              title="Imprimer le dossier complet (Fiche d'adhésion VITALIS + Devis joint) pour dépôt physique en agence AFG Bank"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimer le dossier complet (Fiche + Devis)
            </button>
          )}
        </div>
      </div>

      {/* ── Timeline processus ── */}
      <div className="section-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Progression du dossier</h3>
        <ProcessTimeline steps={processSteps} />
      </div>

      {/* ── Déclencheurs d'étapes dynamiques ── */}
      {!devis && (
        <div className="p-4 rounded-xl border bg-orange-50/90 border-orange-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Étape 2 active : En attente d'établissement du devis chiffré</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {user?.role === "fournisseur" || user?.role === "admin"
                  ? "Le bénéficiaire a exprimé son besoin. En tant que fournisseur agréé, établissez le devis chiffré avec les articles correspondants."
                  : "Votre demande de financement a été transmise aux fournisseurs sélectionnés. Ils préparent actuellement votre devis chiffré."}
              </p>
            </div>
          </div>
          {(user?.role === "fournisseur" || user?.role === "admin") && (
            <Link
              href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Établir le devis chiffré →
            </Link>
          )}
        </div>
      )}

      {devis && !dossier && (
        <div className="p-4 rounded-xl border bg-amber-50/90 border-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">En attente de devis complémentaires ou traitement</p>
              <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                Le dossier numérique sera automatiquement transmis à la banque dès que tous les fournisseurs sollicités auront émis leur devis.
                N'oubliez pas d'imprimer l'ensemble et de vous présenter physiquement en agence AFG Bank.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={handlePrintDossier}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimer le dossier
            </button>
          </div>
        </div>
      )}

      {dossier && (dossier.statut === "depose_banque" || dossier.statut === "recu" || dossier.statut === "en_analyse_bancaire" || dossier.statut === "en_cours_traitement") && (
        <div className="p-4 rounded-xl border bg-purple-50/90 border-purple-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Étape 4 active : Décision du dossier par AFG Bank</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {user?.role === "banque" || user?.role === "admin"
                  ? "Le dossier complet est soumis à l'agence bancaire. Procédez à l'analyse de solvabilité et au comité de crédit."
                  : "Le dossier complet est en cours de décision par les analystes d'AFG Bank."}
              </p>
            </div>
          </div>
          {(user?.role === "banque" || user?.role === "admin") && (
            <Link
              href={`/dashboard/dossiers/${dossier.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Instruire le dossier →
            </Link>
          )}
        </div>
      )}

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
              <CreditCard className="w-3.5 h-3.5" /> Valider le virement au fournisseur (AFG Bank) →
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
            <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto mt-3 sm:mt-0">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto text-left">
                <label className="text-xs font-bold text-sky-900">Date disponibilité *</label>
                <input
                  type="date"
                  value={dateDisponibilite}
                  onChange={e => setDateDisponibilite(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sky-900 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5 w-full sm:w-auto text-left">
                <label className="text-xs font-bold text-sky-900">Heure *</label>
                <input
                  type="time"
                  value={heureDisponibilite}
                  onChange={e => setHeureDisponibilite(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sky-900 font-medium"
                />
              </div>
              <button
                onClick={handleDemarrerPreparation}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition-colors shadow-sm self-stretch sm:self-auto justify-center whitespace-nowrap"
              >
                <Package className="w-4 h-4" /> Alerter le client (Prêt) →
              </button>
            </div>
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

          {/* Expression du besoin initiée par le souscripteur (Cahier des charges) */}
          {sub.observations && (
            <div className="section-card border-l-4 border-l-orange-500">
              <div className="section-card-header bg-orange-50/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Expression du besoin (Initié par le bénéficiaire)</h3>
                </div>
              </div>
              <div className="section-card-body">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-medium bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                  {sub.observations}
                </p>
              </div>
            </div>
          )}

          {/* Fournisseur */}
          {/*div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Fournisseur & Banque</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">Fournisseur(s)</p><p className="text-sm font-medium text-gray-800">{sub.fournisseurNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Banque financeuse</p><p className="text-sm font-medium text-gray-800">{sub.banqueNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Agence de rattachement</p><p className="text-sm font-medium text-gray-800">{sub.agenceNom || "Agence Plateau"}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Durée souscription</p><p className="text-sm font-medium text-gray-800">{sub.duree} mois</p></div>
            </div>
          </div>
          */}

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
