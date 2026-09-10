// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import { mockFournisseurs } from "@/lib/ldfData";
import type { Fournisseur } from "@/types/ldf";
import { Building2, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function AdminFournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState(mockFournisseurs);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Fournisseur | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", adresse: "", ville: "", responsable: "" });

  const filtered = useMemo(() =>
    fournisseurs.filter(f =>
      !search || f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.ville.toLowerCase().includes(search.toLowerCase())
    ), [fournisseurs, search]);

  const openAdd = () => { setForm({ nom: "", email: "", telephone: "", adresse: "", ville: "", responsable: "" }); setEditTarget(null); setShowForm(true); };
  const openEdit = (f: Fournisseur) => { setForm({ nom: f.nom, email: f.email, telephone: f.telephone, adresse: f.adresse, ville: f.ville, responsable: f.responsable }); setEditTarget(f); setShowForm(true); };

  const handleSave = () => {
    if (!form.nom || !form.email) { toast.error("Nom et email requis"); return; }
    if (editTarget) {
      setFournisseurs(prev => prev.map(f => f.id === editTarget.id ? { ...f, ...form } : f));
      toast.success(`Fournisseur ${form.nom} mis à jour`);
    } else {
      const newF: Fournisseur = {
        id: `FRN-${String(fournisseurs.length + 1).padStart(3, "0")}`,
        code: form.nom.substring(0, 6).toUpperCase(),
        ...form, nombreSouscriptions: 0, montantTotal: 0, statut: "actif",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setFournisseurs(prev => [...prev, newF]);
      toast.success(`Fournisseur ${form.nom} ajouté`);
    }
    setShowForm(false);
  };

  const handleDelete = (f: Fournisseur) => {
    setFournisseurs(prev => prev.map(p => p.id === f.id ? { ...p, statut: "inactif" } : p));
    setShowConfirmDelete(null);
    toast.info(`Fournisseur ${f.nom} désactivé`);
  };

  const setf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des fournisseurs</h1>
          <p className="page-subtitle">{filtered.length} fournisseur{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} className="btn-ldf-primary"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>

      {/* Recherche */}
      <div className="section-card">
        <div className="px-5 py-3.5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher un fournisseur..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Fournisseur</th>
                <th>Contact</th>
                <th>Ville</th>
                <th>Responsable</th>
                <th>Souscriptions</th>
                <th>Montant total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td>
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
                  <td>
                    <p className="text-sm text-gray-700">{f.email}</p>
                    <p className="text-xs text-gray-400">{f.telephone}</p>
                  </td>
                  <td className="text-sm text-gray-600">{f.ville}</td>
                  <td className="text-sm text-gray-600">{f.responsable}</td>
                  <td className="text-sm font-semibold text-gray-800">{f.nombreSouscriptions}</td>
                  <td className="text-sm text-gray-800 font-medium whitespace-nowrap">{fmtCFA(f.montantTotal)}</td>
                  <td><StatusBadge statut={f.statut} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(f)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setShowConfirmDelete(f)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
        title={editTarget ? "Modifier le fournisseur" : "Ajouter un fournisseur"} size="md">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "nom",         label: "Nom *",          placeholder: "Papeterie Centrale CI" },
            { key: "responsable", label: "Responsable *",  placeholder: "M. Bamba Seydou"      },
            { key: "email",       label: "Email *",        placeholder: "contact@papetci.ci"   },
            { key: "telephone",   label: "Téléphone",      placeholder: "+225 07 08 12 34 56"  },
            { key: "ville",       label: "Ville",          placeholder: "Abidjan"              },
            { key: "adresse",     label: "Adresse",        placeholder: "Zone Industrielle...", full: true },
          ].map((f: any) => (
            <div key={f.key} className={f.full ? "col-span-2" : ""}>
              <label className="ldf-label">{f.label}</label>
              <input type="text" value={(form as any)[f.key]}
                onChange={e => setf(f.key, e.target.value)}
                placeholder={f.placeholder} className="ldf-input" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setShowForm(false)} className="flex-1 btn-ldf-outline text-sm py-2.5">Annuler</button>
          <button onClick={handleSave} className="flex-1 btn-ldf-primary text-sm py-2.5">
            {editTarget ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </LDFModal>

      {/* Modal suppression */}
      <ConfirmModal open={!!showConfirmDelete} onClose={() => setShowConfirmDelete(null)}
        onConfirm={() => showConfirmDelete && handleDelete(showConfirmDelete)}
        title="Désactiver le fournisseur"
        message={`Voulez-vous désactiver ${showConfirmDelete?.nom} ? Cette action peut être annulée.`}
        confirmLabel="Désactiver" variant="warning" />
    </div>
  );
}
