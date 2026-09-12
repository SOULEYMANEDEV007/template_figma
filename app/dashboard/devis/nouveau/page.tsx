// @ts-nocheck
"use client";

/**
 * NOUVEAU DEVIS VITALIS
 * 
 * Fonctionnalités :
 * - Lier à une souscription existante
 * - Articles avec remises ligne par ligne
 * - Conditions de livraison (7j / 15j / 30j)
 * - Génération PDF réelle via @react-pdf/renderer
 * - Stockage PDF dans IndexedDB (fileStorage)
 * - Sauvegarde dans vitalisDbStore
 */

import { saveFile } from "@/lib/fileStorage";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { VArticleDevis } from "@/stores/vitalisDbStore";
import {
  ArrowLeft, Check, Download, FileText, Loader2,
  MapPin, Plus, Printer, Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── Constantes ──────────────────────────────────────────────────
const CONDITIONS = {
  DELAI_ABIDJAN: "7 jours ouvrés",
  DELAI_INTERIEUR: "15 jours ouvrés",
  VALIDITE: "30 jours ouvrés",
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

// ── Types ────────────────────────────────────────────────────────
interface ArticleRow extends VArticleDevis {
  _key: string;
}

function newArticle(): ArticleRow {
  return {
    _key: `a-${Date.now()}-${Math.random()}`,
    id: `ART-${Date.now()}`,
    designation: "", reference: "",
    quantite: 1, prixUnitaire: 0, remise: 0, montantHT: 0,
  };
}

// ── Aperçu devis (rendu HTML pour impression) ────────────────────
function DevisPreview({
  devisRef, fournisseurNom, agenceNom, souscripteurNom, souscripteurPrenom,
  articles, dateCreation, dateExpiration, conditions, totalHT, totalTTC, relaisNom,
}: any) {
  return (
    <div id="devis-preview" className="bg-white text-gray-900 text-sm font-sans p-8 rounded-xl border border-gray-200 shadow-sm">
      {/* En-tête */}
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

      {/* Infos client & fournisseur */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2">Client / Souscripteur</p>
          <p className="font-semibold text-gray-800">{souscripteurPrenom} {souscripteurNom}</p>
          <p className="text-xs text-gray-500">Banque : AFG Bank</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fournisseur</p>
          <p className="font-semibold text-gray-800">{fournisseurNom}</p>
          <p className="text-xs text-gray-500">Agréé Programme Vitalis</p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-4 mb-6 text-xs">
        <span className="text-gray-500">Date d'émission : <strong className="text-gray-700">{new Date(dateCreation).toLocaleDateString("fr-FR")}</strong></span>
        <span className="text-gray-500">Valable jusqu'au : <strong className="text-red-600">{new Date(dateExpiration).toLocaleDateString("fr-FR")}</strong></span>
      </div>

      {/* Tableau articles */}
      <table className="w-full border-collapse mb-6 text-xs">
        <thead>
          <tr className="bg-orange-500 text-white">
            <th className="text-left px-3 py-2 rounded-tl-lg">Désignation</th>
            <th className="text-right px-3 py-2">Référence</th>
            <th className="text-right px-3 py-2">Qté</th>
            <th className="text-right px-3 py-2">P.U. (FCFA)</th>
            <th className="text-right px-3 py-2">Remise</th>
            <th className="text-right px-3 py-2 rounded-tr-lg">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          {articles.filter((a: ArticleRow) => a.designation).map((a: ArticleRow, i: number) => (
            <tr key={a._key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-3 py-2 font-medium">{a.designation}</td>
              <td className="px-3 py-2 text-right text-gray-500 font-mono">{a.reference || "—"}</td>
              <td className="px-3 py-2 text-right">{a.quantite}</td>
              <td className="px-3 py-2 text-right">{fmtCFA(a.prixUnitaire)}</td>
              <td className="px-3 py-2 text-right">
                {a.remise > 0 ? (
                  <span className="text-green-600 font-semibold">{a.remise}%</span>
                ) : "—"}
              </td>
              <td className="px-3 py-2 text-right font-semibold">{fmtCFA(a.montantHT)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-orange-500">
            <td colSpan={4} />
            <td className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total HT</td>
            <td className="px-3 py-2 text-right font-bold text-gray-800">{fmtCFA(totalHT)}</td>
          </tr>
          <tr className="bg-orange-500 text-white rounded-b-lg">
            <td colSpan={4} />
            <td className="px-3 py-2 text-right text-sm font-bold">TOTAL TTC</td>
            <td className="px-3 py-2 text-right text-sm font-bold">{fmtCFA(totalTTC)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Conditions de livraison */}
      <div className="grid grid-cols-3 gap-3 mb-4">
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
    addDevis, updateSouscription,
  } = useVitalisDb();

  // Pré-sélection depuis l'URL (?souscriptionId=SOUS-001)
  const preSouscriptionId = params.get("souscriptionId") || "";

  const [souscriptionId, setSouscriptionId] = useState(preSouscriptionId);
  const [fournisseurId, setFournisseurId] = useState(
    user?.role === "fournisseur" ? (user.organisationId || "") : ""
  );
  const [articles, setArticles] = useState<ArticleRow[]>([newArticle()]);
  const [conditions, setConditions] = useState("Paiement à réception de la commande validée par AFG Bank. Livraison franco de port.");
  const [observationsFourn, setObservationsFourn] = useState("");
  const [dateCreation] = useState(today());
  const [dateExpiration] = useState(inDays(30 * 1.4)); // ~30 jours ouvrés
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Souscription sélectionnée
  const souscription = souscriptions.find(s => s.id === souscriptionId);

  // Fournisseurs disponibles pour cette souscription (ceux qui sont associés)
  const fournisseursDisponibles = useMemo(() => {
    if (!souscription) return fournisseurs.filter(f => f.agreVitalis && f.statut === "actif");
    const ids = souscription.fournisseurs.map(f => f.fournisseurId);
    return fournisseurs.filter(f => ids.includes(f.id));
  }, [souscription, fournisseurs]);

  const fournisseurSelectionne = fournisseurs.find(f => f.id === fournisseurId);

  // Pré-remplir le fournisseur si rôle fournisseur
  useEffect(() => {
    if (user?.role === "fournisseur" && user.organisationId) {
      setFournisseurId(user.organisationId);
    }
  }, [user]);

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
      toast.error("Veuillez sélectionner une souscription et un fournisseur");
      return;
    }
    if (articles.filter(a => a.designation).length === 0) {
      toast.error("Ajoutez au moins un article");
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

      // Mettre à jour le montant total de la souscription
      if (souscription) {
        updateSouscription(souscriptionId, {
          montantTotal: souscription.montantTotal + totalTTC,
        });
      }

      toast.success(
        asBrouillon ? `Devis ${ref} sauvegardé en brouillon` : `Devis ${ref} envoyé !`,
        { duration: 4000 }
      );
      router.push(`/dashboard/devis/${nouveauDevis.id}`);
    } catch (err) {
      toast.error("Erreur lors de la création du devis");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all";
  const sel = inp + " cursor-pointer";

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">Nouveau devis Vitalis</h1>
          <p className="page-subtitle">Articles + remises · Conditions de livraison · Génération PDF</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors
              ${showPreview ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
          >
            <FileText className="w-4 h-4" /> {showPreview ? "Masquer aperçu" : "Aperçu"}
          </button>
          {showPreview && (
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Printer className="w-4 h-4" /> Imprimer / PDF
            </button>
          )}
        </div>
      </div>

      {/* Aperçu devis */}
      {showPreview && (
        <div ref={previewRef}>
          <DevisPreview
            devisRef={`DEV-${new Date().getFullYear()}-XXXX`}
            fournisseurNom={fournisseurSelectionne?.nom || "—"}
            agenceNom=""
            souscripteurNom={souscription?.souscripteurNom || "—"}
            souscripteurPrenom={souscription?.souscripteurPrenom || ""}
            articles={articles}
            dateCreation={dateCreation}
            dateExpiration={dateExpiration}
            conditions={conditions}
            totalHT={totalHT}
            totalTTC={totalTTC}
            relaisNom=""
          />
        </div>
      )}

      {/* Formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne gauche — Info générale */}
        <div className="lg:col-span-1 space-y-4">
          {/* Souscription */}
          <div className="section-card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Souscription liée
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Souscription <span className="text-orange-500">*</span></label>
                <select className={sel} value={souscriptionId} onChange={e => { setSouscriptionId(e.target.value); }}>
                  <option value="">Sélectionner</option>
                  {souscriptions.filter(s => s.statut !== "terminee" && s.statut !== "rejetee").map(s => (
                    <option key={s.id} value={s.id}>
                      {s.reference} — {s.souscripteurPrenom} {s.souscripteurNom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fournisseur <span className="text-orange-500">*</span></label>
                <select
                  className={sel}
                  value={fournisseurId}
                  onChange={e => setFournisseurId(e.target.value)}
                  disabled={user?.role === "fournisseur"}
                >
                  <option value="null">Sélectionner</option>
                  {fournisseursDisponibles.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              {souscription && (
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-orange-700">{souscription.souscripteurPrenom} {souscription.souscripteurNom}</p>
                  <p className="text-[10px] text-orange-500">AFG Bank · {souscription.duree} mois</p>
                  <p className={`text-[10px] font-medium mt-1 ${souscription.typeSouscripteur === "physique" ? "text-blue-600" : "text-purple-600"}`}>
                    {souscription.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Conditions */}
          <div className="section-card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Conditions de livraison
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs p-2.5 bg-blue-50 rounded-xl">
                <span className="text-blue-600 font-medium">Grand Abidjan</span>
                <span className="font-bold text-blue-700">{CONDITIONS.DELAI_ABIDJAN}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-amber-50 rounded-xl">
                <span className="text-amber-600 font-medium">Hors Abidjan</span>
                <span className="font-bold text-amber-700">{CONDITIONS.DELAI_INTERIEUR}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-green-50 rounded-xl">
                <span className="text-green-600 font-medium">Validité devis</span>
                <span className="font-bold text-green-700">{CONDITIONS.VALIDITE}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Conditions générales</label>
              <textarea
                rows={3}
                value={conditions}
                onChange={e => setConditions(e.target.value)}
                className={inp + " resize-none text-xs"}
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observations fournisseur</label>
              <textarea
                rows={2}
                value={observationsFourn}
                onChange={e => setObservationsFourn(e.target.value)}
                placeholder="Remarques, précisions..."
                className={inp + " resize-none text-xs"}
              />
            </div>
          </div>

          {/* Récapitulatif montant */}
          <div className="section-card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Récapitulatif</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total HT</span>
                <span className="font-medium">{fmtCFA(totalHT)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">TVA (exonéré)</span>
                <span className="text-gray-400">0 FCFA</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2">
                <span className="text-orange-600">TOTAL TTC</span>
                <span className="text-orange-700">{fmtCFA(totalTTC)}</span>
              </div>
              <p className="text-[10px] text-gray-400">Programme Vitalis — Exonéré de TVA</p>
            </div>
          </div>
        </div>

        {/* Colonne droite — Articles */}
        <div className="lg:col-span-2">
          <div className="section-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-sm font-semibold text-gray-800">Articles & remises</h3>
              <button
                onClick={addArticle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background: "linear-gradient(135deg,#ff6b35,#ff8c42)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un article
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* En-têtes colonnes */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                <div className="col-span-4">Désignation *</div>
                <div className="col-span-2">Référence</div>
                <div className="col-span-1 text-center">Qté</div>
                <div className="col-span-2 text-right">P.U. (FCFA)</div>
                <div className="col-span-1 text-right">Remise %</div>
                <div className="col-span-1 text-right">Total HT</div>
                <div className="col-span-1" />
              </div>

              {articles.map((a, idx) => (
                <div key={a._key} className="grid grid-cols-12 gap-2 items-center bg-gray-50/40 rounded-xl p-2">
                  {/* Désignation */}
                  <div className="col-span-4">
                    <input
                      className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      placeholder="Cahiers 96 pages, Stylos..."
                      value={a.designation}
                      onChange={e => updateArticle(a._key, "designation", e.target.value)}
                    />
                  </div>
                  {/* Référence */}
                  <div className="col-span-2">
                    <input
                      className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 font-mono"
                      placeholder="REF-001"
                      value={a.reference || ""}
                      onChange={e => updateArticle(a._key, "reference", e.target.value)}
                    />
                  </div>
                  {/* Quantité */}
                  <div className="col-span-1">
                    <input
                      type="number" min={1}
                      className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 text-center"
                      value={a.quantite}
                      onChange={e => updateArticle(a._key, "quantite", Number(e.target.value))}
                    />
                  </div>
                  {/* Prix unitaire */}
                  <div className="col-span-2">
                    <input
                      type="number" min={0}
                      className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 text-right"
                      value={a.prixUnitaire}
                      onChange={e => updateArticle(a._key, "prixUnitaire", Number(e.target.value))}
                    />
                  </div>
                  {/* Remise */}
                  <div className="col-span-1">
                    <div className="relative">
                      <input
                        type="number" min={0} max={100}
                        className={`w-full px-2 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 text-right
                          ${a.remise > 0 ? "border-green-300 bg-green-50 text-green-700 font-bold" : "border-gray-200"}`}
                        value={a.remise || 0}
                        onChange={e => updateArticle(a._key, "remise", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {/* Montant HT */}
                  <div className="col-span-1 text-right">
                    <span className="text-xs font-bold text-gray-700">{fmtCFA(a.montantHT || 0)}</span>
                  </div>
                  {/* Supprimer */}
                  <div className="col-span-1 flex justify-center">
                    {articles.length > 1 && (
                      <button
                        onClick={() => removeArticle(a._key)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Note remises */}
              <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <p className="text-[10px] text-green-700">
                  Les remises s'appliquent ligne par ligne. Une remise de 0% = pas de remise.
                  Le montant HT est calculé automatiquement : Qté × P.U. × (1 − Remise%).
                </p>
              </div>
            </div>

            {/* Total bas de tableau */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/40">
              <div className="flex justify-end gap-8 text-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total HT</p>
                  <p className="font-semibold text-gray-700">{fmtCFA(totalHT)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">TVA</p>
                  <p className="font-semibold text-gray-400">Exonéré</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-orange-500 font-bold uppercase">Total TTC</p>
                  <p className="text-lg font-extrabold text-orange-600">{fmtCFA(totalTTC)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" /> Annuler
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange-300 text-orange-600 text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-4 h-4" /> Brouillon
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting || !souscriptionId || !fournisseurId}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg,#ff6b35,#ff8c42)" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
            ) : (
              <><Check className="w-4 h-4" /> Soumettre le devis</>
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
