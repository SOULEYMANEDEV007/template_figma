// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { VFournisseur } from "@/stores/vitalisDbStore";
import { Building2, CheckCircle, Edit, PauseCircle, Plus, Search, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

const STATUTS_FOURNISSEUR = [
  { value: "prospect",          label: "Prospect"          },
  { value: "en_cours_agrement", label: "Agrément en cours" },
  { value: "agree",             label: "Agréé"             },
  { value: "actif",             label: "Actif"             },
  { value: "suspendu",          label: "Suspendu"          },
  { value: "expire",            label: "Expiré"            },
];

const EMPTY_FORM = {
  nom: "", nomDirecteur: "", email: "", telephone: "",
  adresse: "", ville: "", region: "", rccm: "", compteContribuable: "",
  situationJuridique: "SARL", nombreEmployes: "1",
  dureePartenariatAFG: "12", numeroContratAFG: "",
  statut: "prospect" as VFournisseur["statut"],
};

export default function AdminFournisseursPage() {
  const { fournisseurs, updateFournisseur: _update } = useVitalisDb();
  const [localFourn, setLocalFourn] = useState<VFournisseur[]>(fournisseurs);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<VFournisseur | null>(null);
  const [showConfirmSuspend, setShowConfirmSuspend] = useState<VFournisseur | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() =>
    localFourn.filter(f => {
      const q = search.toLowerCase();
      const matchSearch = !q || f.nom.toLowerCase().includes(q) || f.ville.toLowerCase().includes(q);
      const matchStatut = !filterStatut || f.statut === filterStatut;
      return matchSearch && matchStatut;
    }), [localFourn, search, filterStatut]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (f: VFournisseur) => {
    setForm({
      nom: f.nom, nomDirecteur: f.nomDirecteur, email: f.email, telephone: f.telephone,
      adresse: f.adresse, ville: f.ville, region: f.region ?? "", rccm: f.rccm,
      compteContribuable: f.compteContribuable ?? "", situationJuridique: f.situationJuridique ?? "SARL",
      nombreEmployes: String(f.nombreEmployes ?? 1), dureePartenariatAFG: String(f.dureePartenariatAFG ?? 12),
      numeroContratAFG: f.numeroContratAFG ?? "", statut: f.statut,
    });
    setEditTarget(f);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nom || !form.email || !form.rccm) {
      toast.error("Nom, email et RCCM sont obligatoires");
      return;
    }
    if (editTarget) {
      setLocalFourn(prev => prev.map(f => f.id === editTarget.id ? {
        ...f,
        nom: form.nom, nomDirecteur: form.nomDirecteur, email: form.email, telephone: form.telephone,
        adresse: form.adresse, ville: form.ville, region: form.region, rccm: form.rccm,
        compteContribuable: form.compteContribuable, situationJuridique: form.situationJuridique,
        nombreEmployes: Number(form.nombreEmployes), dureePartenariatAFG: Number(form.dureePartenariatAFG),
        numeroContratAFG: form.numeroContratAFG, statut: form.statut,
      } : f));
      toast.success(`Fournisseur ${form.nom} mis à jour`);
    } else {
      const newF: VFournisseur = {
        id: `FOUR-${Date.now()}`,
        code: form.nom.substring(0, 6).toUpperCase().replace(/\s/g, ""),
        nom: form.nom, nomDirecteur: form.nomDirecteur, email: form.email, telephone: form.telephone,
        adresse: form.adresse, ville: form.ville, region: form.region, rccm: form.rccm,
        compteContribuable: form.compteContribuable, situationJuridique: form.situationJuridique,
        nombreEmployes: Number(form.nombreEmployes), dureePartenariatAFG: Number(form.dureePartenariatAFG),
        numeroContratAFG: form.numeroContratAFG, statut: "prospect",
        agreVitalis: false, nombreSouscriptions: 0, montantTotal: 0,
      };
      setLocalFourn(prev => [newF, ...prev]);
      toast.success(`Fournisseur ${form.nom} ajouté (statut : Prospect)`);
    }
    setShowForm(false);
  };

  const handleChangeStatut = (f: VFournisseur, newStatut: VFournisseur["statut"]) => {
    const labels: Record<string, string> = {
      agree: "Agréé", actif: "Actif", suspendu: "Suspendu",
      en_cours_agrement: "Agrément en cours", expire: "Expiré",
    };
    setLocalFourn(prev => prev.map(p => p.id === f.id ? {
      ...p, statut: newStatut,
      agreVitalis: newStatut === "actif" || newStatut === "agree",
      dateAgrement: (newStatut === "agree" || newStatut === "actif") ? new Date().toISOString().split("T")[0] : p.dateAgrement,
    } : p));
    toast.success(`${f.nom} → ${labels[newStatut] ?? newStatut}`);
    setShowConfirmSuspend(null);
  };

  const setf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Fournisseurs Agréés</h1>
          <p className="page-subtitle">
            {filtered.length} fournisseur{filtered.length > 1 ? "s" : ""} · Programme VITALIS
          </p>
        </div>
        <button onClick={openAdd} className="btn-ldf-primary">
          <Plus className="w-4 h-4" /> Ajouter un fournisseur
        </button>
      </div>

      {/* Recherche + filtres */}
      <div className="section-card p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher par nom, ville..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none" />
          </div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 outline-none">
            <option value="">Tous les statuts</option>
            {STATUTS_FOURNISSEUR.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Fournisseur</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Contact & Localisation</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Responsable / RCCM</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Souscriptions</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Statut Agrément</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Aucun fournisseur trouvé
                  </td>
                </tr>
              ) : filtered.map(f => (
                <tr key={f.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{f.nom}</p>
                        <p className="text-xs text-gray-400 font-mono">{f.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{f.email}</p>
                    <p className="text-xs text-gray-400">{f.telephone} · {f.ville}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-700">{f.nomDirecteur}</p>
                    <p className="text-xs text-gray-400 font-mono">{f.rccm}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm font-semibold text-gray-800">{f.nombreSouscriptions}</p>
                    <p className="text-xs text-gray-400">{fmtCFA(f.montantTotal)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={f.statut} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(f)} title="Modifier"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {/* Actions de workflow d'agrément */}
                      {f.statut === "prospect" && (
                        <button onClick={() => handleChangeStatut(f, "en_cours_agrement")} title="Lancer l'agrément"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.statut === "en_cours_agrement" && (
                        <button onClick={() => handleChangeStatut(f, "agree")} title="Accorder l'agrément"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.statut === "agree" && (
                        <button onClick={() => handleChangeStatut(f, "actif")} title="Activer"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.statut === "actif" && (
                        <button onClick={() => setShowConfirmSuspend(f)} title="Suspendre"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
                          <PauseCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.statut === "suspendu" && (
                        <button onClick={() => handleChangeStatut(f, "actif")} title="Réactiver"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.statut !== "expire" && (
                        <button onClick={() => handleChangeStatut(f, "expire")} title="Marquer comme expiré"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulaire */}
      <LDFModal open={showForm} onClose={() => setShowForm(false)}
        title={editTarget ? "Modifier le fournisseur" : "Ajouter un fournisseur"} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "nom",                label: "Raison sociale *",       placeholder: "Papeterie Centrale CI", full: false },
            { key: "nomDirecteur",        label: "Directeur / Gérant *",   placeholder: "M. Bamba Seydou",       full: false },
            { key: "email",               label: "Email *",                placeholder: "contact@papetci.ci",    full: false },
            { key: "telephone",           label: "Téléphone",              placeholder: "+225 07 08 12 34 56",   full: false },
            { key: "rccm",                label: "RCCM *",                 placeholder: "CI-ABJ-2021-B-12345",   full: false },
            { key: "compteContribuable",  label: "Compte contribuable",    placeholder: "0123456789",            full: false },
            { key: "situationJuridique",  label: "Forme juridique",        placeholder: "SARL, SA...",           full: false },
            { key: "nombreEmployes",      label: "Nb. employés",           placeholder: "10",                    full: false },
            { key: "ville",               label: "Ville",                  placeholder: "Abidjan",               full: false },
            { key: "region",              label: "Région",                 placeholder: "Abidjan Lagunes",       full: false },
            { key: "adresse",             label: "Adresse",                placeholder: "Zone Industrielle...",  full: true  },
            { key: "numeroContratAFG",    label: "N° Contrat AFG Bank",    placeholder: "AFG-2026-F-001",        full: true  },
          ].map((field: any) => (
            <div key={field.key} className={field.full ? "col-span-2" : ""}>
              <label className="ldf-label">{field.label}</label>
              <input type="text" value={(form as any)[field.key]}
                onChange={e => setf(field.key, e.target.value)}
                placeholder={field.placeholder} className="ldf-input" />
            </div>
          ))}
          {editTarget && (
            <div className="col-span-2">
              <label className="ldf-label">Statut d'agrément</label>
              <select value={form.statut} onChange={e => setf("statut", e.target.value)} className="ldf-input">
                {STATUTS_FOURNISSEUR.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setShowForm(false)} className="flex-1 btn-ldf-outline text-sm py-2.5">Annuler</button>
          <button onClick={handleSave} className="flex-1 btn-ldf-primary text-sm py-2.5">
            {editTarget ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </LDFModal>

      {/* Modal suspension */}
      <ConfirmModal
        open={!!showConfirmSuspend}
        onClose={() => setShowConfirmSuspend(null)}
        onConfirm={() => showConfirmSuspend && handleChangeStatut(showConfirmSuspend, "suspendu")}
        title="Suspendre le fournisseur"
        message={`Voulez-vous suspendre ${showConfirmSuspend?.nom} ? Il ne pourra plus créer de devis VITALIS. Cette action peut être annulée.`}
        confirmLabel="Suspendre" variant="warning" />
    </div>
  );
}
