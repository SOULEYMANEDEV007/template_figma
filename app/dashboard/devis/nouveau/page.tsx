// @ts-nocheck
"use client";

/**
 * NOUVEAU DEVIS VITALIS
 * 
 * Fonctionnalités :
 * - Layout spacieux adapté aux écrans d'ordinateur (pleine largeur desktop)
 * - Extraction & affichage clair de l'expression du besoin et du devis estimatif du client
 * - Pré-remplissage automatique des articles à partir de la demande client
 * - Champs de saisie aérés, bien visibles et contrastés
 * - Conditions officielles Vitalis (Abidjan 7j, Hors Abidjan 15j, Validité 60j)
 * - Génération & impression PDF officielle avec logos des partenaires
 */

import { saveFile } from "@/lib/fileStorage";
import { emitInAppNotification, useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { VArticleDevis } from "@/stores/vitalisDbStore";
import {
  ArrowLeft, Check, Download, FileText, Loader2,
  MapPin, Plus, Printer, Trash2, Sparkles, PackageCheck,
  User, Building2, Clock, Info, ShieldCheck, Wallet, RefreshCw
} from "lucide-react";
import { IMAGES, getPartnerLogo } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── Constantes ──────────────────────────────────────────────────
const CONDITIONS = {
  DELAI_ABIDJAN: "7 jours ouvrés",
  DELAI_INTERIEUR: "15 jours ouvrés",
  VALIDITE: "60 jours",
};

const TVA_TAUX = 0; // Programme Vitalis : exonéré TVA

// ── Helpers ──────────────────────────────────────────────────────
const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(Math.round(v)) + " FCFA";
const today = () => new Date().toISOString().split("T")[0];
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

// Helper d'extraction du besoin exprimé et devis estimatif du client
function extractBesoinClient(souscription?: any) {
  if (!souscription) return null;

  let produit = souscription.produitRecherche || "";
  let nature = souscription.natureBesoin || "";
  let categorie = souscription.categorie || "";
  let budget = souscription.montantTotal || souscription.budgetEstimatif || 0;
  let notes = souscription.observations || "";
  let livraison = souscription.detailsLivraison || null;

  // Analyser si les données sont dans la chaîne observations
  if (notes) {
    if (!produit) {
      const m = notes.match(/Produit:\s*([^|\n\r]+)/i);
      if (m) produit = m[1].trim();
    }
    if (!nature) {
      const m = notes.match(/Besoin:\s*([^|\n\r]+)/i);
      if (m) nature = m[1].trim();
    }
    if (!categorie) {
      const m = notes.match(/Catégorie:\s*([^|\n\r]+)/i);
      if (m) categorie = m[1].trim();
    }
    if (!budget) {
      const m = notes.match(/Budget\s*(?:indicatif)?:\s*([0-9\s]+)/i);
      if (m) {
        const parsed = parseInt(m[1].replace(/\s/g, ""), 10);
        if (!isNaN(parsed)) budget = parsed;
      }
    }
  }

  if (!produit) {
    if (nature) produit = nature;
    else if (notes && !notes.includes("|")) produit = notes;
    else produit = "Équipements et fournitures selon demande du client";
  }

  return {
    produit,
    nature: nature || "Financement d'équipements",
    categorie: categorie || "Matériel & Équipements",
    budget: budget || 0,
    notes,
    livraison,
  };
}

// ── Types ────────────────────────────────────────────────────────
interface ArticleRow extends VArticleDevis {
  _key: string;
}

function newArticle(designation = "", reference = "", prixUnitaire = 0): ArticleRow {
  return {
    _key: `a-${Date.now()}-${Math.random()}`,
    id: `ART-${Date.now()}`,
    designation,
    reference,
    quantite: 1,
    prixUnitaire,
    remise: 0,
    montantHT: prixUnitaire,
  };
}

// ── Aperçu devis (rendu HTML pour impression) ────────────────────
function DevisPreview({
  devisRef, fournisseurNom, agenceNom, souscripteurNom, souscripteurPrenom,
  articles, dateCreation, dateExpiration, conditions, totalHT, totalTTC, relaisNom,
}: any) {
  const fournisseurLogo = getPartnerLogo(fournisseurNom);

  return (
    <div id="devis-preview" className="bg-white text-gray-900 text-sm font-sans p-8 rounded-xl border border-gray-200 shadow-sm mb-6">
      {/* En-tête Logos Officiels */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-[#0B2447]/10 bg-white gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl border border-gray-200 p-1.5 flex items-center justify-center bg-white shadow-sm overflow-hidden flex-shrink-0">
            <img
              src={fournisseurLogo}
              alt={fournisseurNom}
              className="h-full w-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.15em] uppercase">Fournisseur Émetteur</p>
            <p className="text-xs font-bold text-gray-900">{fournisseurNom}</p>
          </div>
        </div>

        <div className="flex flex-col items-center border-l border-r border-gray-200 px-4">
          <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.2em] uppercase mb-1">Programme</p>
          <img src={IMAGES.logos.vifloNew} alt="Vitalis" className="h-11 object-contain mix-blend-multiply rounded-xl" crossOrigin="anonymous" />
        </div>

        <div className="flex items-center">
          <img src={IMAGES.logos.fades} alt="FADES" className="h-14 object-contain" crossOrigin="anonymous" />
        </div>

        <div className="flex flex-col items-end pl-2">
          <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.2em] uppercase mb-1 mr-1">Financement</p>
          <div className="h-12 px-3 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm">
            <img src={IMAGES.logos.afgBank} alt="AFG Bank" className="h-8 object-contain" crossOrigin="anonymous" />
          </div>
        </div>
      </div>

      {/* En-tête Texte */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-2xl font-extrabold text-orange-600 mb-1">DEVIS VITALIS</div>
          <div className="text-xs text-gray-400 font-mono">{devisRef}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-800">AFG Bank — Programme Vitalis</div>
          <div className="text-xs text-gray-500">{fournisseurNom}</div>
          {agenceNom && <div className="text-xs text-gray-400">Agence : {agenceNom}</div>}
        </div>
      </div>

      {/* Infos Souscripteur et Dates */}
      <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl mb-6 text-xs">
        <div>
          <p className="font-bold text-gray-700 uppercase tracking-wider mb-1">Souscripteur (Bénéficiaire)</p>
          <p className="font-semibold text-gray-900 text-sm">{souscripteurPrenom} {souscripteurNom}</p>
          <p className="text-gray-500 mt-1">Programme d'acquisition financé par AFG Bank</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-700 uppercase tracking-wider mb-1">Détails du Devis</p>
          <p className="text-gray-600">Date d'émission : <strong>{dateCreation}</strong></p>
          <p className="text-gray-600">Date d'expiration : <strong>{dateExpiration}</strong> (Validité {CONDITIONS.VALIDITE})</p>
        </div>
      </div>

      {/* Tableau Articles */}
      <table className="w-full mb-6 border-collapse text-xs">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="py-2.5 px-3 text-left font-bold text-gray-700">Désignation</th>
            <th className="py-2.5 px-3 text-left font-bold text-gray-700">Réf.</th>
            <th className="py-2.5 px-3 text-center font-bold text-gray-700">Qté</th>
            <th className="py-2.5 px-3 text-right font-bold text-gray-700">P.U. HT</th>
            <th className="py-2.5 px-3 text-right font-bold text-gray-700">Remise</th>
            <th className="py-2.5 px-3 text-right font-bold text-gray-700">Total HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {articles.map((a: any, idx: number) => (
            <tr key={idx}>
              <td className="py-2.5 px-3 font-medium text-gray-800">{a.designation || "—"}</td>
              <td className="py-2.5 px-3 text-gray-500 font-mono">{a.reference || "—"}</td>
              <td className="py-2.5 px-3 text-center">{a.quantite}</td>
              <td className="py-2.5 px-3 text-right">{fmtCFA(a.prixUnitaire)}</td>
              <td className="py-2.5 px-3 text-right text-green-700 font-semibold">{a.remise ? `${a.remise}%` : "0%"}</td>
              <td className="py-2.5 px-3 text-right font-bold text-gray-900">{fmtCFA(a.montantHT || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totaux */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1.5 text-xs">
          <div className="flex justify-between py-1 text-gray-600">
            <span>Total HT :</span>
            <span className="font-semibold">{fmtCFA(totalHT)}</span>
          </div>
          <div className="flex justify-between py-1 text-gray-500">
            <span>TVA (Programme Vitalis exonéré) :</span>
            <span>0 FCFA</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-orange-500 text-sm font-bold text-orange-600">
            <span>TOTAL TTC :</span>
            <span className="text-base text-orange-700">{fmtCFA(totalTTC)}</span>
          </div>
        </div>
      </div>

      {/* Conditions de livraison */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-blue-500 font-bold uppercase">Grand Abidjan</p>
          <p className="text-xs font-bold text-blue-700 mt-1">{CONDITIONS.DELAI_ABIDJAN}</p>
        </div>
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-amber-500 font-bold uppercase">Hors Abidjan</p>
          <p className="text-xs font-bold text-amber-700 mt-1">{CONDITIONS.DELAI_INTERIEUR}</p>
        </div>
        <div className="border border-green-200 bg-green-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-green-500 font-bold uppercase">Validité</p>
          <p className="text-xs font-bold text-green-700 mt-1">{CONDITIONS.VALIDITE}</p>
        </div>
      </div>

      {/* Point relais */}
      {relaisNom && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl mb-4">
          <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <p className="text-xs text-purple-700"><strong>Point de retrait :</strong> {relaisNom}</p>
        </div>
      )}

      {/* Conditions générales */}
      <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-3">
        <p><strong>Conditions :</strong> {conditions}</p>
        <p className="mt-1">Ce devis est établi dans le cadre du Programme Vitalis financé par AFG Bank. Exonéré de TVA. Tout paiement sera effectué directement par AFG Bank.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
function NouveauDevisContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useLDFAuthStore();
  const {
    souscriptions, fournisseurs, pointsRelais, agencesAFG,
    addDevis, updateSouscription, updateDossier, getDossierBySouscription,
  } = useVitalisDb();

  // Pré-sélection depuis l'URL (?souscriptionId=SOUS-001)
  const preSouscriptionId = params.get("souscriptionId") || "";

  const [souscriptionId, setSouscriptionId] = useState(preSouscriptionId);
  const [fournisseurId, setFournisseurId] = useState(
    user?.role === "fournisseur" ? (user.organisationId || "") : ""
  );
  const [articles, setArticles] = useState<ArticleRow[]>([newArticle()]);
  const [conditions, setConditions] = useState("Paiement à réception de la commande validée par AFG Bank. Livraison franco de port selon convention.");
  const [observationsFourn, setObservationsFourn] = useState("");
  const [dateCreation] = useState(today());
  const [dateExpiration] = useState(inDays(60)); // 60 jours de validité selon consigne cliente
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Souscription sélectionnée
  const souscription = souscriptions.find(s => s.id === souscriptionId);

  // Extraction du besoin et budget client
  const besoinClient = useMemo(() => {
    return extractBesoinClient(souscription);
  }, [souscription]);

  // Fournisseurs disponibles pour cette souscription
  const fournisseursDisponibles = useMemo(() => {
    if (!souscription) return fournisseurs.filter(f => f.agreVitalis && f.statut === "actif");
    const ids = (souscription.fournisseurs || []).map(f => f.fournisseurId);
    if (!ids || ids.length === 0) return fournisseurs.filter(f => f.agreVitalis && f.statut === "actif");
    return fournisseurs.filter(f => ids.includes(f.id));
  }, [souscription, fournisseurs]);

  const fournisseurSelectionne = fournisseurs.find(f => f.id === fournisseurId);

  // Pré-remplir le fournisseur si rôle fournisseur
  useEffect(() => {
    if (user?.role === "fournisseur" && user.organisationId) {
      setFournisseurId(user.organisationId);
    }
  }, [user]);

  // Pré-remplissage automatique des articles à la sélection d'une souscription
  useEffect(() => {
    if (souscription && besoinClient) {
      // Si la liste ne contient qu'un article vide par défaut
      setArticles(current => {
        if (
          current.length === 1 &&
          (!current[0].designation || current[0].designation.trim() === "") &&
          current[0].prixUnitaire === 0
        ) {
          return [
            newArticle(
              besoinClient.produit,
              `REF-${souscription.reference.replace('VF-', '')}`,
              besoinClient.budget > 0 ? besoinClient.budget : 0
            )
          ];
        }
        return current;
      });
    }
  }, [souscriptionId, besoinClient]);

  // Injection manuelle de la demande client dans les articles
  const handleApplyClientNeed = () => {
    if (!besoinClient || !souscription) return;
    setArticles([
      newArticle(
        besoinClient.produit,
        `REF-${souscription.reference.replace('VF-', '')}`,
        besoinClient.budget > 0 ? besoinClient.budget : 0
      )
    ]);
    toast.success("La demande du client a été injectée dans le tableau des articles !");
  };

  // Calcul des montants
  const recalcArticles = (rows: ArticleRow[]): ArticleRow[] =>
    rows.map(a => ({
      ...a,
      montantHT: a.quantite * a.prixUnitaire * (1 - (a.remise || 0) / 100),
    }));

  const totalHT = articles.reduce((s, a) => s + (a.montantHT || 0), 0);
  const tva = totalHT * TVA_TAUX;
  const totalTTC = totalHT + tva;

  // Gestion des articles
  const addArticle = () => setArticles(a => [...a, newArticle()]);
  const removeArticle = (key: string) => setArticles(a => a.filter(x => x._key !== key));
  const updateArticle = (key: string, field: keyof ArticleRow, value: any) => {
    setArticles(prev => recalcArticles(prev.map(a =>
      a._key === key ? { ...a, [field]: value } : a
    )));
  };

  // Génération PDF via impression navigateur
  const handlePrint = () => {
    const el = document.getElementById("devis-preview");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Devis Vitalis</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #ff6b35; color: white; padding: 8px 12px; text-align: right; }
        th:first-child { text-align: left; }
        td { padding: 6px 12px; border-bottom: 1px solid #f3f4f6; }
        .orange { color: #ff6b35; } .bold { font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>
      ${el.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  // Soumission
  const handleSubmit = async (asBrouillon = false) => {
    if (!souscriptionId || !fournisseurId) {
      toast.error("Veuillez sélectionner une souscription et un fournisseur.");
      return;
    }
    if (articles.filter(a => a.designation).length === 0) {
      toast.error("Veuillez renseigner au moins un article chiffré.");
      return;
    }
    setSubmitting(true);
    try {
      const year = new Date().getFullYear();
      const seq = String(Date.now()).slice(-4);
      const ref = `DEV-${year}-${seq}`;

      const articlesValides = articles
        .filter(a => a.designation)
        .map(a => ({ ...a, id: `ART-${Date.now()}-${Math.random()}` }));

      const nouveauDevis = addDevis({
        reference: ref,
        souscriptionId,
        souscriptionRef: souscription?.reference || "",
        souscripteurNom: souscription?.souscripteurNom || "",
        souscripteurPrenom: souscription?.souscripteurPrenom,
        fournisseurId,
        fournisseurNom: fournisseurSelectionne?.nom || "",
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        articles: articlesValides,
        totalHT, tva, totalTTC,
        conditions,
        delaiLivraisonAbidjan: CONDITIONS.DELAI_ABIDJAN,
        delaiLivraisonInterieur: CONDITIONS.DELAI_INTERIEUR,
        validiteDevis: CONDITIONS.VALIDITE,
        statut: asBrouillon ? "brouillon" : "envoye",
        dateCreation, dateExpiration,
        dateMiseAJour: today(),
        observationsFournisseur: observationsFourn,
      });

      // Mettre à jour le montant total + faire avancer la souscription vers 'pret_pour_depot'
      if (souscription) {
        const updatedFournisseurs = (souscription.fournisseurs || []).map(f =>
          f.fournisseurId === fournisseurId ? { ...f, devisId: nouveauDevis.id, statut: "devis_cree" as const } : f
        );
        const montantFinal = totalTTC > 0 ? totalTTC : souscription.montantTotal;
        updateSouscription(souscriptionId, {
          montantTotal: montantFinal,
          fournisseurs: updatedFournisseurs,
          statut: "pret_pour_depot",
        });

        // Synchroniser le montant du dossier associé s'il existe déjà
        const dossierLie = getDossierBySouscription(souscriptionId);
        if (dossierLie) {
          updateDossier(dossierLie.id, {
            montantTotal: montantFinal,
            montant: montantFinal,
          });
        }

        emitInAppNotification({
          titre: `Devis chiffré prêt : ${ref}`,
          message: `Le devis pour la souscription ${souscription.reference} (${fmtCFA(totalTTC)}) est prêt. Le souscripteur peut imprimer son dossier et se déplacer à son agence AFG Bank pour le dépôt.`,
          categorie: "devis",
          reference: ref,
          lien: `/dashboard/souscriptions/${souscriptionId}`,
          roles: ["souscripteur", "banque", "admin"],
        });
      }

      toast.success(
        asBrouillon ? `Devis ${ref} sauvegardé en brouillon` : `Devis ${ref} émis avec succès !`,
        { duration: 4000 }
      );
      router.push(`/dashboard/devis/${nouveauDevis.id}`);
    } catch (err) {
      toast.error("Erreur lors de la création du devis.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full px-3.5 py-2.5 text-sm font-medium border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all shadow-xs";
  const sel = inp + " cursor-pointer";

  return (
    <div className="space-y-6 fade-in w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* ── En-tête de la page ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-xs"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Établissement du Devis Vitalis</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Chiffrage des articles demandés par le souscripteur · Application des remises · Éligibilité financement AFG Bank
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-xs
              ${showPreview ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-700 bg-white hover:border-orange-300 hover:text-orange-600"}`}
          >
            <FileText className="w-4 h-4" />
            <span>{showPreview ? "Masquer aperçu" : "Aperçu du Devis"}</span>
          </button>
          {showPreview && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Télécharger PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Aperçu du devis ── */}
      {showPreview && (
        <div ref={previewRef} className="slide-down">
          <DevisPreview
            devisRef={`DEV-${new Date().getFullYear()}-XXXX`}
            fournisseurNom={fournisseurSelectionne?.nom || "—"}
            agenceNom={souscription?.agenceNom || ""}
            souscripteurNom={souscription?.souscripteurNom || "—"}
            souscripteurPrenom={souscription?.souscripteurPrenom || ""}
            articles={articles}
            dateCreation={dateCreation}
            dateExpiration={dateExpiration}
            conditions={conditions}
            totalHT={totalHT}
            totalTTC={totalTTC}
            relaisNom={souscription?.detailsLivraison?.pointRelaisNom || ""}
          />
        </div>
      )}

      {/* ── SECTION 1 : SOUSCRIPTION LIÉE & DEMANDE CLIENT (Pleine largeur) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Colonne 1 : Sélection Souscription & Fournisseur */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <span>Souscription & Fournisseur</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
              Étape 1
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Dossier de souscription client <span className="text-orange-500">*</span>
              </label>
              <select
                className={sel}
                value={souscriptionId}
                onChange={e => setSouscriptionId(e.target.value)}
              >
                <option value="">Sélectionner une souscription active</option>
                {souscriptions
                  .filter(s => s.statut !== "cloture" && s.statut !== "refuse")
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.reference} — {s.souscripteurPrenom} {s.souscripteurNom} ({fmtCFA(s.montantTotal)})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Fournisseur Agréé émetteur <span className="text-orange-500">*</span>
              </label>
              <select
                className={sel}
                value={fournisseurId}
                onChange={e => setFournisseurId(e.target.value)}
                disabled={user?.role === "fournisseur"}
              >
                <option value="">Sélectionner un fournisseur agréé</option>
                {fournisseursDisponibles.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>

            {souscription && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-gray-900 text-sm">
                      {souscription.souscripteurPrenom} {souscription.souscripteurNom}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    souscription.typeSouscripteur === "physique" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>
                    {souscription.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-600 pt-1 border-t border-slate-200">
                  <p>Tél : <span className="font-semibold text-gray-800">{souscription.souscripteurTelephone || "—"}</span></p>
                  <p>Banque : <span className="font-semibold text-gray-800">AFG Bank ({souscription.duree} mois)</span></p>
                  <p className="col-span-2">Email : <span className="font-semibold text-gray-800 font-mono text-[11px]">{souscription.souscripteurEmail || "—"}</span></p>
                  {souscription.agenceNom && (
                    <p className="col-span-2 text-blue-700 font-medium">Agence AFG : {souscription.agenceNom}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne 2 : Expression du besoin & Devis estimatif du client */}
        <div className="lg:col-span-7 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50 rounded-2xl border-2 border-orange-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B2447]">Demande & Expression du besoin client</h3>
                <p className="text-xs text-orange-700/80 font-medium">Informations et devis estimatif renseignés lors de la souscription</p>
              </div>
            </div>

            {besoinClient && (
              <button
                type="button"
                onClick={handleApplyClientNeed}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                title="Pré-remplir la liste des articles avec le besoin du client"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Injecter dans le devis</span>
              </button>
            )}
          </div>

          {souscription ? (
            <div className="space-y-4">
              {/* Produit / Équipement recherché */}
              <div className="p-3.5 bg-white rounded-xl border border-orange-200/70 shadow-2xs">
                <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  Équipements / Articles souhaités par le client :
                </p>
                <p className="text-sm font-extrabold text-gray-900 leading-snug">
                  {besoinClient?.produit || "Aucune spécification précise renseignée."}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium text-gray-700">
                    Catégorie : <strong>{besoinClient?.categorie}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium text-gray-700">
                    Nature : <strong>{besoinClient?.nature}</strong>
                  </span>
                </div>
              </div>

              {/* Budget estimatif & Modalités de livraison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500 font-medium mb-0.5">Budget estimatif client :</p>
                  <p className="text-base font-extrabold text-orange-600">
                    {besoinClient?.budget ? fmtCFA(besoinClient.budget) : "Non renseigné"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Règlement direct par AFG Bank après accord
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500 font-medium mb-0.5">Lieu de livraison / Retrait :</p>
                  {besoinClient?.livraison ? (
                    <div>
                      <p className="font-bold text-gray-800">
                        {besoinClient.livraison.mode === "point_relais"
                          ? `📍 Point Relais : ${besoinClient.livraison.pointRelaisNom || "Point relais sélectionné"}`
                          : `🏠 Domicile : ${besoinClient.livraison.adresse || ""}`}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {besoinClient.livraison.commune ? `${besoinClient.livraison.commune}, ` : ""}
                        {besoinClient.livraison.ville || ""} ({besoinClient.livraison.region || "Côte d'Ivoire"})
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-700">À convenir avec le client</p>
                  )}
                </div>
              </div>

              {/* Action mobile ou de rappel */}
              <div className="sm:hidden pt-2">
                <button
                  type="button"
                  onClick={handleApplyClientNeed}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Injecter le besoin client dans le devis</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Info className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              Sélectionnez une souscription à gauche pour visualiser les articles et le devis estimatif du client.
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2 : ARTICLES & REMISES (Pleine largeur desktop) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Articles & Chiffrage du Devis</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Détaillez chaque article, sa référence catalogue, son prix unitaire HT et la remise commerciale accordée
            </p>
          </div>
          <button
            type="button"
            onClick={addArticle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-95"
            style={{ background: "linear-gradient(135deg,#ff6b35,#ff8c42)" }}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une ligne d'article</span>
          </button>
        </div>

        {/* Tableau spacieux avec inputs bien dimensionnés */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-3 text-left w-2/5">DÉSIGNATION DE L'ARTICLE *</th>
                  <th className="py-3 px-3 text-left w-1/6">RÉFÉRENCE</th>
                  <th className="py-3 px-3 text-center w-24">QTÉ</th>
                  <th className="py-3 px-3 text-right w-36">PRIX UNITAIRE HT</th>
                  <th className="py-3 px-3 text-right w-24">REMISE (%)</th>
                  <th className="py-3 px-3 text-right w-36">TOTAL HT</th>
                  <th className="py-3 px-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {articles.map((a, idx) => (
                  <tr key={a._key} className="hover:bg-orange-50/30 transition-colors">
                    {/* Désignation */}
                    <td className="py-3 px-3">
                      <input
                        className="w-full px-3.5 py-2.5 text-sm font-medium border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 shadow-2xs"
                        placeholder="Ex: Ordinateur portable HP 15, Rames de papier A4, Cahiers 96p..."
                        value={a.designation}
                        onChange={e => updateArticle(a._key, "designation", e.target.value)}
                      />
                    </td>

                    {/* Référence */}
                    <td className="py-3 px-3">
                      <input
                        className="w-full px-3 py-2.5 text-sm font-mono border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 shadow-2xs"
                        placeholder="REF-001"
                        value={a.reference || ""}
                        onChange={e => updateArticle(a._key, "reference", e.target.value)}
                      />
                    </td>

                    {/* Quantité */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min={1}
                        className="w-full px-2 py-2.5 text-sm font-bold text-center border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-2xs"
                        value={a.quantite}
                        onChange={e => updateArticle(a._key, "quantite", Math.max(1, Number(e.target.value)))}
                      />
                    </td>

                    {/* Prix unitaire */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          className="w-full px-3 py-2.5 text-sm font-bold text-right border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-2xs"
                          placeholder="0"
                          value={a.prixUnitaire}
                          onChange={e => updateArticle(a._key, "prixUnitaire", Number(e.target.value))}
                        />
                      </div>
                    </td>

                    {/* Remise */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={`w-full px-2 py-2.5 text-sm font-bold text-right border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-2xs ${
                            a.remise > 0 ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 text-gray-700"
                          }`}
                          value={a.remise || 0}
                          onChange={e => updateArticle(a._key, "remise", Number(e.target.value))}
                        />
                      </div>
                    </td>

                    {/* Total HT */}
                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-extrabold text-gray-900">
                        {fmtCFA(a.montantHT || 0)}
                      </span>
                    </td>

                    {/* Supprimer */}
                    <td className="py-3 px-2 text-center">
                      {articles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArticle(a._key)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer cet article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bandeau explicatif TVA & Remises */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-4 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p>
              <strong>Programme VITALIS FADES :</strong> Exonération totale de TVA (0%). Les remises s'appliquent directement ligne par ligne. Le montant Total TTC sera décaissé par AFG Bank.
            </p>
          </div>

          {/* Récapitulatif du tableau */}
          <div className="border-t-2 border-gray-200 mt-6 pt-4 flex flex-col sm:flex-row items-end justify-between gap-4">
            <div className="text-xs text-gray-400">
              {articles.length} article(s) chiffré(s)
            </div>
            <div className="flex items-center gap-8 text-right">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Net HT</p>
                <p className="text-lg font-bold text-gray-800">{fmtCFA(totalHT)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">TVA (Exonéré)</p>
                <p className="text-lg font-bold text-gray-400">0 FCFA</p>
              </div>
              <div className="pl-6 border-l-2 border-gray-200">
                <p className="text-xs text-orange-600 uppercase tracking-wider font-extrabold">TOTAL TTC DEVIS</p>
                <p className="text-2xl font-black text-orange-600">{fmtCFA(totalTTC)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 : CONDITIONS DE LIVRAISON & RÉCAPITULATIF FINANCIER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Colonne gauche : Conditions de livraison & Délais Vitalis */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span>Conditions de Livraison & Délais Officiels</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Grand Abidjan</p>
              <p className="text-xs font-bold text-blue-900 mt-1">{CONDITIONS.DELAI_ABIDJAN}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-[10px] font-bold text-amber-600 uppercase">Hors Abidjan</p>
              <p className="text-xs font-bold text-amber-900 mt-1">{CONDITIONS.DELAI_INTERIEUR}</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-[10px] font-bold text-green-600 uppercase">Validité Devis</p>
              <p className="text-xs font-bold text-green-900 mt-1">{CONDITIONS.VALIDITE}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Conditions générales de livraison
            </label>
            <textarea
              rows={2}
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              className={inp + " resize-none text-xs"}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Observations & Précisions du fournisseur
            </label>
            <textarea
              rows={2}
              value={observationsFourn}
              onChange={e => setObservationsFourn(e.target.value)}
              placeholder="Spécifications techniques, délais particuliers, garanties..."
              className={inp + " resize-none text-xs"}
            />
          </div>
        </div>

        {/* Colonne droite : Décompte & Engagement Bancaire AFG */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-500" />
              <span>Engagement Financier & Décaissement AFG Bank</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Modalités de règlement par AFG Bank pour le compte du souscripteur
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white rounded-2xl border border-orange-200/80 space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>Montant Total Net HT :</span>
              <span className="font-bold">{fmtCFA(totalHT)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>TVA (Exonération VITALIS) :</span>
              <span className="font-semibold text-emerald-600">0 FCFA (0%)</span>
            </div>
            <div className="pt-3 border-t border-orange-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-orange-800">Montant Total TTC Décaissé :</span>
              <span className="text-2xl font-black text-orange-600">{fmtCFA(totalTTC)}</span>
            </div>
            {souscription && souscription.duree && totalTTC > 0 && (
              <div className="p-2.5 bg-white rounded-xl border border-orange-200/60 text-xs text-gray-700 flex justify-between items-center">
                <span>Mensualité indicative pour le client ({souscription.duree} mois) :</span>
                <span className="font-bold text-gray-900">{fmtCFA(totalTTC / souscription.duree)} / mois</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 leading-relaxed">
            🛡️ <strong>Règlement Garanti :</strong> Une fois le devis soumis et le dossier validé par l'agence AFG Bank, le décaissement financier est émis directement par AFG Bank vers le compte du fournisseur agréé.
          </div>
        </div>
      </div>

      {/* ── BARRE D'ACTIONS INFÉRIEURE ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Annuler et Retourner</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-orange-300 text-orange-600 text-sm font-bold hover:bg-orange-50 disabled:opacity-50 transition-all shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Enregistrer en Brouillon</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitting || !souscriptionId || !fournisseurId}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white text-sm font-extrabold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg,#ff6b35,#ff8c42)" }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Valider et Soumettre le Devis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NouveauDevisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>}>
      <NouveauDevisContent />
    </Suspense>
  );
}
