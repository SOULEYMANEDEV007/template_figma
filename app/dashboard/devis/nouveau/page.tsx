"use client";
import { mockSouscriptions, mockFournisseurs, mockBanques, getDevisBySouscription } from "@/lib/ldfData";
import { ArrowLeft, Plus, Save, Send, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v);

function NouveauDevisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const souscriptionIdParam = searchParams.get("souscriptionId") ?? "";

  const [souscriptionId, setSouscriptionId] = useState(souscriptionIdParam);
  const [conditions, setConditions] = useState("Livraison sous 30 jours. Validité du devis : 60 jours.");
  const [articles, setArticles] = useState([
    { designation: "", reference: "", quantite: 1, prixUnitaire: 0, remise: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const sub = mockSouscriptions.find(s => s.id === souscriptionId);
  const totalHT = articles.reduce((sum, a) => sum + a.quantite * a.prixUnitaire * (1 - a.remise / 100), 0);
  const tva = Math.round(totalHT * 0.087);
  const totalTTC = totalHT + tva;

  const addArt = () => setArticles(a => [...a, { designation: "", reference: "", quantite: 1, prixUnitaire: 0, remise: 0 }]);
  const removeArt = (i: number) => setArticles(a => a.filter((_, idx) => idx !== i));
  const updateArt = (i: number, k: string, v: any) =>
    setArticles(a => a.map((art, idx) => idx === i ? { ...art, [k]: v } : art));

  const handleSubmit = async (send = false) => {
    if (!souscriptionId) { toast.error("Veuillez sélectionner une souscription"); return; }
    if (articles.some(a => !a.designation || a.prixUnitaire <= 0)) {
      toast.error("Veuillez compléter tous les articles"); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const ref = `DEV-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    toast.success(send ? `Devis ${ref} créé et envoyé à la banque` : `Devis ${ref} enregistré`);
    router.push("/dashboard/devis");
  };

  return (
    <div className="space-y-5 fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title">Nouveau devis</h1>
          <p className="page-subtitle">Créer un devis associé à une souscription</p>
        </div>
      </div>

      {/* Souscription */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="text-sm font-semibold text-gray-800">Souscription associée</h3>
        </div>
        <div className="section-card-body">
          <select value={souscriptionId} onChange={e => setSouscriptionId(e.target.value)} className="ldf-select max-w-md">
            <option value="">Sélectionner une souscription</option>
            {mockSouscriptions
              .filter(s => s.statut !== "brouillon" && !s.devisId)
              .map(s => <option key={s.id} value={s.id}>{s.reference} — {s.souscripteurPrenom} {s.souscripteurNom}</option>)}
          </select>
          {sub && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-amber-600">Souscripteur</p><p className="font-medium text-gray-800">{sub.souscripteurPrenom} {sub.souscripteurNom}</p></div>
              <div><p className="text-xs text-amber-600">Fournisseur</p><p className="font-medium text-gray-800">{sub.fournisseurNom}</p></div>
              <div><p className="text-xs text-amber-600">Banque</p><p className="font-medium text-gray-800">{sub.banqueNom}</p></div>
              <div><p className="text-xs text-amber-600">Montant estimé</p><p className="font-bold text-amber-700">{fmtCFA(sub.montantTotal)} FCFA</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="text-sm font-semibold text-gray-800">Articles</h3>
        </div>
        <div className="section-card-body space-y-3">
          {articles.map((a, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-xl">
              <div className="col-span-12 sm:col-span-4">
                <label className="ldf-label text-xs">Désignation *</label>
                <input value={a.designation} onChange={e => updateArt(i, "designation", e.target.value)}
                  placeholder="Manuel scolaire CE2" className="ldf-input text-sm py-2" />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <label className="ldf-label text-xs">Réf.</label>
                <input value={a.reference} onChange={e => updateArt(i, "reference", e.target.value)}
                  placeholder="REF-001" className="ldf-input text-sm py-2" />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="ldf-label text-xs">Qté</label>
                <input type="number" min={1} value={a.quantite}
                  onChange={e => updateArt(i, "quantite", parseInt(e.target.value) || 1)}
                  className="ldf-input text-sm py-2" />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <label className="ldf-label text-xs">Prix unitaire *</label>
                <input type="number" min={0} value={a.prixUnitaire}
                  onChange={e => updateArt(i, "prixUnitaire", parseFloat(e.target.value) || 0)}
                  className="ldf-input text-sm py-2" />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="ldf-label text-xs">Remise %</label>
                <input type="number" min={0} max={100} value={a.remise}
                  onChange={e => updateArt(i, "remise", parseInt(e.target.value) || 0)}
                  className="ldf-input text-sm py-2" />
              </div>
              <div className="col-span-6 sm:col-span-1">
                <p className="text-xs text-gray-400 mb-1">HT</p>
                <p className="text-sm font-semibold text-gray-800">{fmtCFA(Math.round(a.quantite * a.prixUnitaire * (1 - a.remise / 100)))}</p>
              </div>
              {articles.length > 1 && (
                <div className="col-span-6 sm:col-span-1 flex justify-end">
                  <button onClick={() => removeArt(i)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 mt-3">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          <button onClick={addArt} className="flex items-center gap-2 text-sm text-amber-600 font-medium hover:text-amber-700">
            <Plus className="w-4 h-4" /> Ajouter un article
          </button>

          {/* Totaux */}
          <div className="flex justify-end border-t border-gray-100 pt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total HT</span><span className="font-medium">{fmtCFA(Math.round(totalHT))} FCFA</span></div>
              <div className="flex justify-between"><span className="text-gray-500">TVA (8.7%)</span><span className="font-medium">{fmtCFA(tva)} FCFA</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total TTC</span><span className="text-amber-700">{fmtCFA(Math.round(totalTTC))} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="section-card">
        <div className="section-card-header"><h3 className="text-sm font-semibold text-gray-800">Conditions</h3></div>
        <div className="section-card-body">
          <textarea rows={3} value={conditions} onChange={e => setConditions(e.target.value)}
            className="ldf-input resize-none w-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2.5 px-5">
          <ArrowLeft className="w-4 h-4" /> Annuler
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-ldf-outline text-sm py-2.5 px-5 disabled:opacity-50">
            <Save className="w-4 h-4" /> Enregistrer
          </button>
          <button onClick={() => handleSubmit(true)} disabled={submitting} className="btn-ldf-secondary text-sm py-2.5 px-5 disabled:opacity-50">
            <Send className="w-4 h-4" /> {submitting ? "Envoi..." : "Envoyer à la banque"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NouveauDevisPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-xl" />}>
      <NouveauDevisForm />
    </Suspense>
  );
}
