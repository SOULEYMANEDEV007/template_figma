// @ts-nocheck
"use client";

import { StatusBadge } from "@/components/ui/ldf-badge";
import { LDFTimeline, ProcessTimeline } from "@/components/ui/ldf-timeline";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore, emitInAppNotification } from "@/stores/ldfAuth";
import {
  ArrowLeft, Building2, CheckCircle2, CreditCard, Download,
  FileText, MapPin, Package, Phone, Plus, User, Printer, Send, Truck, Clock,
  BookOpen, ShieldCheck, Sparkles, Mail, Eye, AlertCircle, Check, X,
  ExternalLink, Layers
} from "lucide-react";
import { IMAGES, getPartnerLogo } from "@/lib/constants";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

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
    addPaiement, generateRef, addHistorique, fournisseurs: allStoreFournisseurs,
  } = useVitalisDb();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [submittingDossier, setSubmittingDossier] = useState(false);
  const [dateDisponibilite, setDateDisponibilite] = useState(new Date().toISOString().split("T")[0]);
  const [heureDisponibilite, setHeureDisponibilite] = useState("08:00");
  const [selectedDevisTab, setSelectedDevisTab] = useState<string>("all"); // 'all' ou devis.id

  const sub = getSouscriptionById(id);

  // ── RÈGLE D'ISOLATION STRICTE DES FOURNISSEURS ──────────────────────────────
  const isFournisseur = user?.role === "fournisseur";
  const monFournisseurId = isFournisseur ? (user?.organisationId || user?.fournisseurId || "FOUR-LDF-001") : null;

  // Vérifier si le fournisseur connecté est concerné par cette souscription
  const estAssigneFournisseur = useMemo(() => {
    if (!isFournisseur || !sub) return true;
    if (!monFournisseurId) return false;
    return (sub.fournisseurs || []).some(f => f.fournisseurId === monFournisseurId);
  }, [isFournisseur, sub, monFournisseurId]);

  // Récupération de tous les devis rattachés à cette souscription
  const tousLesDevis = useMemo(() => {
    if (!sub) return [];
    return getDevisBySouscription(sub.id);
  }, [sub, getDevisBySouscription]);

  // Fournisseurs visibles selon le rôle
  // FOURNISSEUR : voit STRICTEMENT son enseigne, JAMAIS les concurrents
  // CLIENT / ADMIN / BANQUE / OWNER : voient l'ensemble des fournisseurs
  const fournisseursAffiches = useMemo(() => {
    if (!sub?.fournisseurs) return [];
    if (isFournisseur && monFournisseurId) {
      return sub.fournisseurs.filter(f => f.fournisseurId === monFournisseurId);
    }
    return sub.fournisseurs;
  }, [sub?.fournisseurs, isFournisseur, monFournisseurId]);

  // Devis visibles selon le rôle
  const devisAffiches = useMemo(() => {
    if (isFournisseur && monFournisseurId) {
      return tousLesDevis.filter(d => d.fournisseurId === monFournisseurId);
    }
    return tousLesDevis;
  }, [tousLesDevis, isFournisseur, monFournisseurId]);

  // Devis du fournisseur connecté (si rôle fournisseur)
  const monDevisFournisseur = useMemo(() => {
    if (!isFournisseur || !monFournisseurId) return devisAffiches[0] || null;
    return devisAffiches.find(d => d.fournisseurId === monFournisseurId) || null;
  }, [isFournisseur, monFournisseurId, devisAffiches]);

  // Devis actif pour consultation
  const devisActif = useMemo(() => {
    if (isFournisseur) return monDevisFournisseur;
    if (selectedDevisTab === "all") return devisAffiches[0] || null;
    return devisAffiches.find(d => d.id === selectedDevisTab) || devisAffiches[0] || null;
  }, [isFournisseur, monDevisFournisseur, selectedDevisTab, devisAffiches]);

  // Montant effectif affiché
  // Pour le fournisseur : UNIQUEMENT le montant de son propre devis
  // Pour les superviseurs et le client : somme consolidée des devis
  const montantEffectif = useMemo(() => {
    if (isFournisseur) {
      return monDevisFournisseur ? (Number(monDevisFournisseur.totalTTC) || 0) : 0;
    }
    const totalDesDevis = devisAffiches.reduce((acc, d) => acc + (Number(d.totalTTC) || 0), 0);
    return totalDesDevis > 0 ? totalDesDevis : (sub?.montantTotal || 0);
  }, [isFournisseur, monDevisFournisseur, devisAffiches, sub?.montantTotal]);

  const dossier = sub ? getDossierBySouscription(sub.id) : null;
  const historique = sub ? getHistoriqueBySouscription(sub.id) : [];

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
      destinataireNom: destMatch ? destMatch[1].trim() : `${sub?.souscripteurPrenom || ""} ${sub?.souscripteurNom || ""}`.trim(),
      destinataireTelephone: destMatch && destMatch[2] ? destMatch[2].trim() : (sub?.souscripteurTelephone || ""),
      zone: zoneMatch ? zoneMatch[1].trim() : "",
    };
  }, [sub]);

  // Alerte In-App automatique au client dès qu'un devis est disponible
  useEffect(() => {
    if (devisAffiches.length > 0 && sub && (sub.statut === "en_preparation" || sub.statut === "pret_pour_depot")) {
      emitInAppNotification({
        titre: `Constitution du dossier physique : ${sub.reference}`,
        message: `Vos devis chiffrés sont prêts ! Veuillez imprimer votre dossier (fiche d'adhésion VITALIS + devis) et déposer vos pièces justificatives à votre agence AFG Bank (${sub.agenceNom || "Agence Centrale"}).`,
        categorie: "dossier",
        reference: sub.reference,
        lien: `/dashboard/souscriptions/${sub.id}`,
        roles: ["souscripteur"],
      });
    }
  }, [devisAffiches.length, sub?.id]);

  if (!sub) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <FileText className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Souscription introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  // Blocage de sécurité si un fournisseur essaie d'accéder à un dossier qui ne le concerne pas
  if (isFournisseur && !estAssigneFournisseur) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Accès confidentiel restreint</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          En application de la règle de stricte étanchéité commerciale ViFlo FADES, chaque fournisseur agréé ne peut consulter que les dossiers pour lesquels des articles lui ont été demandés.
        </p>
        <button
          onClick={() => router.push("/dashboard/souscriptions")}
          className="btn-ldf-primary py-2.5 px-6 text-xs rounded-xl"
        >
          Retour à mes souscriptions
        </button>
      </div>
    );
  }

  const handleConfirmerDepotPhysique = () => {
    if (!sub) return;
    updateSouscription(sub.id, { statut: "depose_banque" });
    if (dossier) {
      updateDossier(dossier.id, { statut: "depose_banque" });
    } else {
      addDossier({
        reference: generateRef("DOS"),
        souscriptionId: sub.id,
        souscriptionRef: sub.reference,
        souscripteurId: sub.souscripteurId,
        souscripteurNom: sub.souscripteurNom,
        souscripteurPrenom: sub.souscripteurPrenom,
        typeSouscripteur: sub.typeSouscripteur,
        fournisseursNoms: sub.fournisseurs.map(f => f.fournisseurNom).join(", ") || "Librairie de France Groupe",
        devisIds: devisAffiches.map(d => d.id),
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        agenceId: sub.agenceId || "AGE-AFG-001",
        montantTotal: montantEffectif,
        montant: montantEffectif,
        statut: "depose_banque",
        dateCreation: new Date().toISOString().split("T")[0],
        dateReception: new Date().toISOString().split("T")[0],
        dateMiseAJour: new Date().toISOString().split("T")[0],
      });
    }
    addHistorique({
      souscriptionId: sub.id,
      action: "dossier_depose",
      description: `Dossier physique déposé par le client à l'agence AFG Bank (${sub.agenceNom || "Agence Centrale"})`,
      auteur: `${sub.souscripteurPrenom} ${sub.souscripteurNom}`,
      date: new Date().toISOString(),
    });
    emitInAppNotification({
      titre: `Dossier physique déposé : ${sub.reference}`,
      message: `${sub.souscripteurPrenom} ${sub.souscripteurNom} a déposé son dossier physique à l'agence AFG Bank. Analyse de solvabilité requise.`,
      categorie: "dossier",
      reference: sub.reference,
      lien: `/dashboard/souscriptions/${sub.id}`,
      roles: ["banque", "admin"],
    });
    toast.success("Dépôt physique enregistré ! Votre dossier est entre les mains d'AFG Bank.");
  };

  const handlePrintDossier = () => {
    if (!sub) return;
    const w = window.open('', '_blank');
    if (!w) return;

    // Si rôle fournisseur, n'imprimer que son devis
    // Sinon imprimer la totalité des devis
    const devisAImprimer = isFournisseur && monDevisFournisseur ? [monDevisFournisseur] : devisAffiches;

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
        <tr><th>Fournisseur(s) concerné(s)</th><td><strong>${fournisseursAffiches.map(f => f.fournisseurNom).join(", ")}</strong></td></tr>
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
      <p style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 12px; margin: 8px 0; white-space: pre-line;">
        ${sub.observations}
      </p>` : ''}

      ${devisAImprimer.length > 0 ? devisAImprimer.map((d, dIdx) => `
      <h2>4.${dIdx + 1}. Devis Chiffré Joint — ${d.fournisseurNom} (Réf : ${d.reference})</h2>
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
          ${(d.articles || []).map(a => `
            <tr>
              <td><strong>${a.designation}</strong></td>
              <td style="font-family: monospace; font-size: 11px; color: #64748b;">${a.reference || a.ref || a.code || a.id || '—'}</td>
              <td style="text-align: center;">${a.quantite}</td>
              <td style="text-align: right;">${fmtCFA(a.prixUnitaire)}</td>
              <td style="text-align: right; font-weight: bold;">${fmtCFA(a.montantHT)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right; font-weight: bold;">Montant Total HT</td>
            <td style="text-align: right; font-weight: bold;">${fmtCFA(d.totalHT || d.totalTTC)}</td>
          </tr>
          <tr style="background: #fff7ed; color: #ea580c; font-size: 13px;">
            <td colspan="4" style="text-align: right; font-weight: bold;">MONTANT TOTAL DU DEVIS (TTC)</td>
            <td style="text-align: right; font-weight: bold;">${fmtCFA(d.totalTTC)}</td>
          </tr>
        </tfoot>
      </table>
      `).join('') : ''}

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

  // Timeline des statuts
  const currentEffectifStatut = dossier?.statut || sub.statut;
  const isApres = (statutActuel: string, etapeCible: string) => {
    const ordre = [
      "en_attente", "en_preparation", "pret_pour_depot", "depose_banque",
      "en_analyse_bancaire", "accepte", "valide", "finance", "fournisseur_paye",
      "commande_en_preparation", "livre", "servie", "cloture"
    ];
    const idxActuel = ordre.indexOf(statutActuel);
    const idxCible = ordre.indexOf(etapeCible);
    if (idxActuel === -1 || idxCible === -1) return false;
    return idxActuel >= idxCible;
  };

  const processSteps = [
    {
      id: "souscription",
      label: "1. Souscription client",
      statut: "complete" as const,
    },
    {
      id: "devis",
      label: "2. Chiffrage devis",
      statut: devisAffiches.length > 0 ? ("complete" as const) : ("current" as const),
    },
    {
      id: "depot",
      label: "3. Dépôt agence AFG",
      statut: isApres(currentEffectifStatut, "depose_banque")
        ? ("complete" as const)
        : devisAffiches.length > 0 ? ("current" as const) : ("pending" as const),
    },
    {
      id: "banque",
      label: "4. Accord de crédit",
      statut: isApres(currentEffectifStatut, "accepte") || isApres(currentEffectifStatut, "valide") || isApres(currentEffectifStatut, "finance")
        ? ("complete" as const)
        : isApres(currentEffectifStatut, "depose_banque") ? ("current" as const) : ("pending" as const),
    },
    {
      id: "paiement",
      label: "5. Virement fournisseur",
      statut: isApres(currentEffectifStatut, "fournisseur_paye")
        ? ("complete" as const)
        : (currentEffectifStatut === "accepte" || currentEffectifStatut === "valide" || currentEffectifStatut === "finance")
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      id: "livraison",
      label: "6. Retrait des articles",
      statut: (currentEffectifStatut === "cloture" || currentEffectifStatut === "livre" || currentEffectifStatut === "servie")
        ? ("complete" as const)
        : (currentEffectifStatut === "fournisseur_paye" || currentEffectifStatut === "commande_en_preparation")
          ? ("current" as const)
          : ("pending" as const),
    },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{sub.reference}</h1>
              <StatusBadge statut={sub.statut} size="md" />
              {isFournisseur && (
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-500" /> Espace Fournisseur Isolé
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Créée le {new Date(sub.dateCreation).toLocaleDateString("fr-FR")} · Agence : <strong>{sub.agenceNom || "AFG Bank"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bouton créer devis si fournisseur connecté n'a pas encore son devis */}
          {isFournisseur && !monDevisFournisseur && (
            <Link href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}`} className="btn-ldf-primary text-xs py-2 px-3.5 shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Établir votre devis
            </Link>
          )}

          {/* Bouton voir le devis du fournisseur */}
          {isFournisseur && monDevisFournisseur && (
            <Link href={`/dashboard/devis/${monDevisFournisseur.id}`} className="btn-ldf-outline text-xs py-2 px-3.5">
              <FileText className="w-3.5 h-3.5" /> Voir mon devis
            </Link>
          )}

          {/* Actions superviseurs / client */}
          {!isFournisseur && (
            <>
              {dossier && (
                <Link href={`/dashboard/dossiers/${dossier.id}`} className="btn-ldf-outline text-xs py-2 px-3.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Voir le dossier
                </Link>
              )}
              {devisAffiches.length > 0 && (
                <button
                  onClick={handlePrintDossier}
                  className="btn-ldf-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Imprimer le dossier complet (Fiche d'adhésion VITALIS + Devis joints) pour dépôt physique en agence AFG Bank"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer le dossier complet ({devisAffiches.length} devis)
                </button>
              )}
            </>
          )}

          {isFournisseur && monDevisFournisseur && (
            <button
              onClick={handlePrintDossier}
              className="btn-ldf-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimer ma fiche & devis
            </button>
          )}
        </div>
      </div>

      {/* ── Timeline processus ── */}
      <div className="section-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Progression du cycle VITALIS</h3>
        <ProcessTimeline steps={processSteps} />
      </div>

      {/* ── Encadré spécifique fournisseur : Rappel d'isolation ── */}
      {isFournisseur && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Espace sécurisé & confidentiel :</strong> Vous visualisez exclusivement les besoins, articles et montants relatifs à votre enseigne. Conformément à la règle de discrétion commerciale de ViFlo, aucun autre fournisseur partenaire n'est visible sur votre interface.
          </p>
        </div>
      )}

      {/* ── Étape active 2 : Attente de chiffrage devis ── */}
      {isFournisseur && !monDevisFournisseur && (
        <div className="p-4 rounded-xl border bg-orange-50/90 border-orange-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Action requise : Établir votre devis chiffré</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Le souscripteur a exprimé un besoin dans votre domaine d'activité. Veuillez chiffrer votre devis pour lui permettre de déposer son dossier à la banque.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Établir le devis chiffré →
          </Link>
        </div>
      )}

      {/* ── Étape active 3 : Constitution du dossier physique & Dépôt agence AFG (Client) ── */}
      {!isFournisseur && devisAffiches.length > 0 && !isApres(currentEffectifStatut, "depose_banque") && (
        <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-900">Étape active : Dépôt du dossier physique à l'agence AFG Bank</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    Action client requise
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  Vos devis ont été chiffrés pour un total de <strong>{fmtCFA(montantEffectif)}</strong>. Veuillez déposer votre dossier physique (fiche de souscription signée + copies de vos devis + justificatifs) auprès de votre agence <strong>AFG Bank ({sub.agenceNom || "Agence Centrale"})</strong> pour analyse de crédit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-orange-500" /> Avis de constitution
              </button>
              <button
                type="button"
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimer le dossier
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-orange-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-orange-950 flex items-center gap-1.5">
              <span>📌</span> Avez-vous déjà déposé vos pièces physiques au guichet de votre agence AFG Bank ?
            </p>
            <button
              onClick={handleConfirmerDepotPhysique}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Check className="w-3.5 h-3.5" /> J'ai déposé mon dossier physique à l'agence
            </button>
          </div>
        </div>
      )}

      {/* ── Structure 2 colonnes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Colonne principale (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* 1. SECTION FOURNISSEURS ASSOCIÉS */}
          <div className="section-card">
            <div className="section-card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-800">
                  {isFournisseur ? "Votre Enseigne Agréée" : `Fournisseurs agréés associés (${fournisseursAffiches.length})`}
                </h3>
              </div>
              {!isFournisseur && fournisseursAffiches.length > 1 && (
                <span className="text-[11px] font-semibold bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Multi-fournisseurs consolidé
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fournisseursAffiches.map(f => {
                  const detailFourn = (allStoreFournisseurs || []).find(xf => xf.id === f.fournisseurId);
                  const devisAssocie = tousLesDevis.find(d => d.fournisseurId === f.fournisseurId);
                  const logoUrl = detailFourn?.logo || getPartnerLogo(f.fournisseurNom, f.fournisseurId);

                  return (
                    <div
                      key={f.fournisseurId}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-orange-300 transition-all shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1.5 flex items-center justify-center flex-shrink-0">
                          {logoUrl ? (
                            <img src={logoUrl} alt={f.fournisseurNom} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{f.fournisseurNom}</p>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {detailFourn?.secteurActivite || "Fournisseur Agréé Vitalis"}
                          </p>
                          <div className="mt-1.5">
                            {devisAssocie ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3" /> Devis établi : {fmtCFA(devisAssocie.totalTTC)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3" /> En attente de chiffrage
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-gray-100 gap-2">
                        {devisAssocie ? (
                          <Link
                            href={`/dashboard/devis/${devisAssocie.id}`}
                            className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                          >
                            Consulter le devis <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          (user?.role === "admin" || (isFournisseur && f.fournisseurId === monFournisseurId)) && (
                            <Link
                              href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}&fournisseurId=${f.fournisseurId}`}
                              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                            >
                              Établir ce devis →
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isFournisseur && (
                <p className="text-[11px] text-gray-400 italic">
                  💡 Chaque fournisseur n'a accès qu'à son propre devis et n'a aucune visibilité sur les autres enseignes.
                </p>
              )}
            </div>
          </div>

          {/* 2. ARTICLES CHIFFRÉS DANS LE(S) DEVIS */}
          <div className="section-card">
            <div className="section-card-header flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Articles chiffrés {devisAffiches.length > 0 ? `(${devisAffiches.reduce((sum, d) => sum + (d.articles?.length || 0), 0)} articles)` : ""}
                </h3>
              </div>

              {/* Onglets devis si vue superviseur/client avec plusieurs devis */}
              {!isFournisseur && devisAffiches.length > 1 && (
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedDevisTab("all")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${selectedDevisTab === "all" ? "bg-white text-orange-600 shadow-xs font-bold" : "text-gray-600"}`}
                  >
                    Vue consolidée
                  </button>
                  {devisAffiches.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDevisTab(d.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${selectedDevisTab === d.id ? "bg-white text-orange-600 shadow-xs font-bold" : "text-gray-600"}`}
                    >
                      {d.fournisseurNom.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {devisAffiches.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs space-y-2">
                <Package className="w-8 h-8 mx-auto text-gray-300" />
                <p>Aucun devis n'a encore été finalisé pour cette souscription.</p>
                {isFournisseur && !monDevisFournisseur && (
                  <Link href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}`} className="inline-block text-orange-600 font-bold hover:underline">
                    Chiffrer votre devis dès maintenant →
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="ldf-table">
                  <thead>
                    <tr>
                      <th>Désignation</th>
                      <th>Référence</th>
                      <th>Fournisseur</th>
                      <th className="text-center">Qté</th>
                      <th className="text-right">Prix Unitaire</th>
                      <th className="text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedDevisTab === "all" ? devisAffiches : devisAffiches.filter(d => d.id === selectedDevisTab))
                      .flatMap(d => (d.articles || []).map(a => ({ ...a, fournisseurNom: d.fournisseurNom })))
                      .map((art, aIdx) => (
                        <tr key={art.id || aIdx}>
                          <td className="font-medium text-gray-800">{art.designation}</td>
                          <td className="font-mono text-xs text-gray-500">{art.reference || art.ref || art.code || art.id || "—"}</td>
                          <td>
                            <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                              {art.fournisseurNom}
                            </span>
                          </td>
                          <td className="text-center">{art.quantite}</td>
                          <td className="text-right">{fmtCFA(art.prixUnitaire)}</td>
                          <td className="text-right font-semibold text-gray-800">{fmtCFA(art.montantHT)}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-orange-50/50">
                      <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-gray-700">
                        {isFournisseur ? "Total de votre devis (TTC)" : "Total consolidé (TTC)"}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">
                        {fmtCFA(montantEffectif)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* 3. EXPRESSION DU BESOIN CLIENT */}
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

          {/* 4. MODALITÉS & DESTINATION DE LA LIVRAISON */}
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
                  {deliveryInfo.destinataireNom || `${sub.souscripteurPrenom} ${sub.souscripteurNom}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Téléphone direct du destinataire</p>
                <p className="text-sm font-semibold text-gray-800 text-blue-700">
                  {deliveryInfo.destinataireTelephone || sub.souscripteurTelephone || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>

          {/* 5. INFORMATIONS SOUSCRIPTEUR */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-800">Informations souscripteur</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              {[
                { label: "Nom complet", value: `${sub.souscripteurPrenom || ""} ${sub.souscripteurNom}`.trim() },
                { label: "Type de personne", value: sub.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale" },
                { label: "Téléphone", value: sub.souscripteurTelephone || "Non spécifié" },
                { label: "Email", value: sub.souscripteurEmail || "Non spécifié" },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Colonne latérale droite (1/3) ── */}
        <div className="space-y-5">

          {/* Synthèse financière */}
          <div className="section-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Récapitulatif Financier</h3>

            <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-1">
              <p className="text-xs text-gray-500">
                {isFournisseur ? "Montant de votre devis" : "Montant total financé"}
              </p>
              <p className="text-xl font-black text-orange-700">
                {montantEffectif > 0 ? fmtCFA(montantEffectif) : "En attente de chiffrage"}
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Durée du crédit :</span>
                <span className="font-semibold text-gray-800">{sub.duree} mois</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Banque financeuse :</span>
                <span className="font-semibold text-gray-800">{sub.banqueNom}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Agence de dépôt :</span>
                <span className="font-semibold text-gray-800 truncate max-w-[130px]">{sub.agenceNom || "Agence Centrale"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Fournisseur(s) :</span>
                <span className="font-semibold text-gray-800">
                  {fournisseursAffiches.length} {isFournisseur ? "enseigne" : "partenaire(s)"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Statut actuel :</span>
                <StatusBadge statut={sub.statut} size="sm" />
              </div>
            </div>
          </div>

          {/* Décision bancaire */}
          {dossier && (
            <div className="section-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Décision AFG Bank</h3>
                <StatusBadge statut={dossier.statut} size="sm" />
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Agence :</strong> {dossier.banqueNom}</p>
                <p><strong>Date réception :</strong> {new Date(dossier.dateReception).toLocaleDateString("fr-FR")}</p>
                {dossier.commentaireBanque && (
                  <p className="mt-2 p-2.5 bg-gray-50 rounded-lg text-gray-700 italic border border-gray-100">
                    "{dossier.commentaireBanque}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Historique */}
          <div className="section-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Historique des actions</h3>
            {historique.length > 0 ? (
              <LDFTimeline events={historique} />
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">Aucun historique disponible</p>
            )}
          </div>

        </div>

      </div>

      {/* ── Modale Avis de constitution pour le client ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#0B2447] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-bold">Avis de constitution de dossier physique</h3>
                  <p className="text-[11px] text-blue-200">Email officiel transmis au client : {sub.souscripteurEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                <p><strong>De :</strong> ViFlo Vitalis &lt;notifications@viflo.ci&gt;</p>
                <p><strong>À :</strong> {sub.souscripteurPrenom} {sub.souscripteurNom} &lt;{sub.souscripteurEmail}&gt;</p>
                <p><strong>Objet :</strong> [VITALIS FADES] Constitution et dépôt de votre dossier physique en agence AFG Bank — Réf : {sub.reference}</p>
              </div>

              <div className="space-y-3">
                <p>Bonjour <strong>{sub.souscripteurPrenom} {sub.souscripteurNom}</strong>,</p>
                <p className="leading-relaxed">
                  Vos devis ont été chiffrés pour un montant total de <strong>{fmtCFA(montantEffectif)}</strong>.
                </p>
                <p className="leading-relaxed">
                  Afin de permettre au comité de crédit d'<strong>AFG Bank</strong> de procéder à l'analyse et à la validation de votre financement, vous êtes prié(e) de déposer votre dossier physique complet auprès de votre agence de rattachement :
                </p>

                <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="font-bold text-orange-950 text-xs">Agence de dépôt AFG Bank :</p>
                  <p className="text-sm font-semibold text-orange-900 mt-0.5">{sub.agenceNom || "AFG Bank Atlantic — Agence Centrale Plateau"}</p>
                  <p className="text-xs text-orange-700 mt-0.5">Délai recommandé : sous 15 jours ouvrés</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-gray-900 text-xs uppercase tracking-wider">Pièces physiques exigées au guichet :</p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <li>1x Fiche d'adhésion VITALIS imprimée et signée (mention "Lu et approuvé")</li>
                    <li>1x Copie du/des devis fournisseur(s) chiffré(s) (validité 60 jours)</li>
                    <li>1x Photocopie de la pièce d'identité en cours de validité (CNI ou Passeport)</li>
                    <li>1x Attestation de travail originale datant de moins de 3 mois</li>
                    <li>3x Derniers bulletins de salaire</li>
                    <li>1x Justificatif de domicile récent (Facture CIE ou SODECI)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-orange-600" /> Imprimer le dossier complet
              </button>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="btn-ldf-primary py-2 px-5 text-xs font-bold rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
