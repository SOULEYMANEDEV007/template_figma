"use client";
import { mockBanques, mockFournisseurs } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { ArrowLeft, ArrowRight, Check, Package, Plus, Save, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const STEPS = ["Souscripteur", "Souscription", "Confirmation"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < current ? "bg-emerald-500 text-white" : i === current ? "text-amber-900 shadow-md" : "bg-gray-100 text-gray-400"}`}
              style={i === current ? { background: "linear-gradient(135deg,#f6c90e,#f0a500)" } : {}}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? "text-amber-700" : i < current ? "text-emerald-600" : "text-gray-400"}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 transition-all ${i < current ? "bg-emerald-300" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreerSouscriptionPage() {
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nom: "", prenom: "", telephone: "", email: "", adresse: "",
    numeroCNI: "",
    banqueId: "", numeroCompte: "",
    typeSouscription: "",
    fournisseurId: user?.role === "fournisseur" ? user.organisationId ?? "" : "",
    dateDebut: "",
    duree: "12",
    frequencePaiement: "Mensuel",
    observations: "",
    envoyerIdentifiants: true,
  });
  const [articles, setArticles] = useState([
    { designation: "", reference: "", quantite: 1, prixUnitaire: 0, remise: 0 },
  ]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addArticle = () => setArticles(a => [...a, { designation: "", reference: "", quantite: 1, prixUnitaire: 0, remise: 0 }]);
  const removeArticle = (i: number) => setArticles(a => a.filter((_, idx) => idx !== i));
  const updateArticle = (i: number, k: string, v: string | number) =>
    setArticles(a => a.map((art, idx) => idx === i ? { ...art, [k]: v } : art));

  const totalHT = articles.reduce((sum, a) => sum + a.quantite * a.prixUnitaire * (1 - a.remise / 100), 0);

  const genRef = () => {
    const n = String(Math.floor(Math.random() * 90000) + 10000);
    return `SUB-2026-${n}`;
  };

  const handleSubmit = async (asBrouillon = false) => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    const ref = genRef();
    toast.success(asBrouillon
      ? `Brouillon enregistré — ${ref}`
      : `Souscription ${ref} soumise avec succès !`, { duration: 4000 });
    router.push("/dashboard/souscriptions");
  };

  const canNext = () => {
    if (step === 0) return form.nom && form.prenom && form.telephone && form.banqueId && form.numeroCNI;
    if (step === 1) return form.typeSouscription && form.fournisseurId && form.dateDebut && form.duree;
    return true;
  };

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title">Nouvelle souscription</h1>
          <p className="page-subtitle">Remplissez les informations en {STEPS.length} étapes</p>
        </div>
      </div>

      {/* Steps */}
      <div className="section-card p-5">
        <StepIndicator current={step} />
      </div>

      {/* Form */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            {step === 0 && <User className="w-4 h-4 text-amber-500" />}
            {step === 1 && <Package className="w-4 h-4 text-amber-500" />}
            {step === 2 && <Check className="w-4 h-4 text-emerald-500" />}
            <h2 className="text-sm font-semibold text-gray-800">{STEPS[step]}</h2>
          </div>
          <span className="text-xs text-gray-400">Étape {step + 1}/{STEPS.length}</span>
        </div>

        <div className="section-card-body space-y-4">
          {/* ÉTAPE 0 — Souscripteur */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "numeroCNI", label: "N° CNI *", placeholder: "CNI002026..." },
                { key: "nom", label: "Nom *", placeholder: "Cisse" },
                { key: "prenom", label: "Prénom *", placeholder: "Souleymane" },
                { key: "telephone", label: "Téléphone *", placeholder: "+225 07 00 00 00 00" },
                { key: "email", label: "Email", placeholder: "nom@email.ci", type: "email" },
                { key: "adresse", label: "Adresse", placeholder: "Quartier, rue..." },
                { key: "numeroCompte", label: "N° de compte bancaire", placeholder: "CI93CI..." },
              ].map(f => (
                <div key={f.key} className={f.key === "adresse" ? "sm:col-span-2" : ""}>
                  <label className="ldf-label">{f.label}</label>
                  <input type={f.type ?? "text"} value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder} className="ldf-input" />
                </div>
              ))}
              <div>
                <label className="ldf-label">Banque *</label>
                <select value={form.banqueId} onChange={e => set("banqueId", e.target.value)} className="ldf-select">
                  <option value="">Sélectionner une banque</option>
                  {mockBanques.map(b => <option key={b.id} value={b.id}>{b.nom} ({b.sigle})</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ÉTAPE 1 — Souscription */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="ldf-label">Type de souscription *</label>
                <select value={form.typeSouscription} onChange={e => set("typeSouscription", e.target.value)} className="ldf-select">
                  <option value="">Sélectionner le type</option>
                  <option value="Individuelle">Individuelle</option>
                  <option value="Groupe">Groupe</option>
                  <option value="Entreprise">Entreprise</option>
                </select>
              </div>
              <div>
                <label className="ldf-label">Fournisseur *</label>
                <select value={form.fournisseurId} onChange={e => set("fournisseurId", e.target.value)}
                  className="ldf-select" disabled={user?.role === "fournisseur"}>
                  <option value="">Sélectionner un fournisseur</option>
                  {mockFournisseurs.filter(f => f.statut === "actif").map(f =>
                    <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="ldf-label">Date de début souhaitée *</label>
                <input type="date" value={form.dateDebut} onChange={e => set("dateDebut", e.target.value)} className="ldf-input" />
              </div>
              <div>
                <label className="ldf-label">Durée (mois) *</label>
                <select value={form.duree} onChange={e => set("duree", e.target.value)} className="ldf-select">
                  {[6, 12, 18, 24, 36].map(d => <option key={d} value={d}>{d} mois</option>)}
                </select>
              </div>
              <div>
                <label className="ldf-label">Fréquence de paiement</label>
                <select value={form.frequencePaiement} onChange={e => set("frequencePaiement", e.target.value)} className="ldf-select">
                  <option value="Mensuel">Mensuel</option>
                  <option value="Trimestriel">Trimestriel</option>
                  <option value="Semestriel">Semestriel</option>
                  <option value="Annuel">Annuel</option>
                </select>
              </div>
              <div>
                <label className="ldf-label">Montant total estimé</label>
                <input type="text" value="0 FCFA" disabled className="ldf-input bg-gray-50 text-gray-500 font-medium cursor-not-allowed" />
                <p className="text-[10px] text-gray-400 mt-1">Sera calculé automatiquement dans le devis</p>
              </div>
              <div className="sm:col-span-2">
                <label className="ldf-label">Observations</label>
                <textarea rows={3} value={form.observations}
                  onChange={e => set("observations", e.target.value)}
                  placeholder="Informations complémentaires, demandes spécifiques..."
                  className="ldf-input resize-none" />
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Confirmation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">Récapitulatif de la souscription</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-amber-600">Souscripteur</p><p className="font-medium text-gray-800">{form.prenom} {form.nom}</p></div>
                  <div><p className="text-xs text-amber-600">N° CNI</p><p className="font-medium text-gray-800">{form.numeroCNI || "—"}</p></div>
                  <div><p className="text-xs text-amber-600">Type de souscription</p><p className="font-medium text-gray-800">{form.typeSouscription || "—"}</p></div>
                  <div><p className="text-xs text-amber-600">Banque</p><p className="font-medium text-gray-800">{mockBanques.find(b => b.id === form.banqueId)?.nom ?? "—"}</p></div>
                  <div><p className="text-xs text-amber-600">Fournisseur</p><p className="font-medium text-gray-800">{mockFournisseurs.find(f => f.id === form.fournisseurId)?.nom ?? "—"}</p></div>
                  <div><p className="text-xs text-amber-600">Date de début</p><p className="font-medium text-gray-800">{form.dateDebut ? new Date(form.dateDebut).toLocaleDateString("fr-FR") : "—"}</p></div>
                  <div><p className="text-xs text-amber-600">Durée</p><p className="font-medium text-gray-800">{form.duree} mois</p></div>
                  <div><p className="text-xs text-amber-600">Fréquence de paiement</p><p className="font-medium text-gray-800">{form.frequencePaiement}</p></div>
                  <div><p className="text-xs text-amber-600">Articles</p><p className="font-medium text-gray-800 italic text-gray-400 text-xs">À ajouter dans le devis</p></div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Vérifiez les informations ci-dessus avant de soumettre la souscription.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="btn-ldf-outline text-sm py-2.5 px-5">
          <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Annuler" : "Précédent"}
        </button>
        <div className="flex items-center gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button onClick={() => handleSubmit(true)} disabled={submitting}
                className="btn-ldf-outline text-sm py-2.5 px-5 disabled:opacity-50">
                <Save className="w-4 h-4" /> Brouillon
              </button>
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                className="btn-ldf-primary text-sm py-2.5 px-6 disabled:opacity-50">
                {submitting ? "Envoi..." : <><Check className="w-4 h-4" /> Soumettre</>}
              </button>
            </>
          ) : (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="btn-ldf-primary text-sm py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
