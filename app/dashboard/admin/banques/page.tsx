// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import { mockBanques } from "@/lib/ldfData";
import type { Banque } from "@/types/ldf";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function AdminBanquesPage() {
  const [banques, setBanques] = useState(mockBanques);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Banque | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<Banque | null>(null);
  const [form, setForm] = useState({ nom: "", sigle: "", email: "", telephone: "", adresse: "", ville: "", directeur: "" });

  const filtered = useMemo(() =>
    banques.filter(b => !search || b.nom.toLowerCase().includes(search.toLowerCase()) || b.sigle.toLowerCase().includes(search.toLowerCase())),
    [banques, search]);

  const openAdd = () => { setForm({ nom: "", sigle: "", email: "", telephone: "", adresse: "", ville: "", directeur: "" }); setEditTarget(null); setShowForm(true); };
  const openEdit = (b: Banque) => { setForm({ nom: b.nom, sigle: b.sigle, email: b.email, telephone: b.telephone, adresse: b.adresse, ville: b.ville, directeur: b.directeur }); setEditTarget(b); setShowForm(true); };

  const handleSave = () => {
    if (!form.nom || !form.sigle) { toast.error("Nom et sigle requis"); return; }
    if (editTarget) {
      setBanques(prev => prev.map(b => b.id === editTarget.id ? { ...b, ...form } : b));
      toast.success(`Banque ${form.nom} mise à jour`);
    } else {
      const newB: Banque = {
        id: `BNQ-${String(banques.length + 1).padStart(3, "0")}`,
        code: form.sigle, ...form, nombreDossiers: 0, montantFinance: 0, statut: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setBanques(prev => [...prev, newB]);
      toast.success(`Banque ${form.nom} ajoutée`);
    }
    setShowForm(false);
  };

  const setf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des banques</h1>
          <p className="page-subtitle">{filtered.length} banque{filtered.length > 1 ? "s" : ""} partenaire{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} className="btn-ldf-primary"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>

      {/* Grille banques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-5">
        {filtered.map(b => (
          <div key={b.id} className="section-card hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-blue-700 text-sm">
                    {b.sigle.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{b.sigle}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{b.nom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge statut={b.statut} size="sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div><p className="text-xs text-gray-400">Responsable</p><p className="text-xs font-medium text-gray-700 truncate">{b.responsable || "—"}</p></div>
                <div><p className="text-xs text-gray-400">Ville</p><p className="text-xs font-medium text-gray-700">{b.ville}</p></div>
                <div><p className="text-xs text-gray-400">Dossiers</p><p className="text-lg font-bold text-gray-900">{0}</p></div>
                <div><p className="text-xs text-gray-400">Montant financé</p><p className="text-xs font-bold text-amber-700">{fmtCFA(0)}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(b as any)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Modifier
                </button>
                <button onClick={() => setShowConfirmDelete(b as any)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <LDFModal open={showForm} onClose={() => setShowForm(false)}
        title={editTarget ? "Modifier la banque" : "Ajouter une banque partenaire"} size="md">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "nom",       label: "Nom complet *",   placeholder: "Société Générale CI",       full: true },
            { key: "sigle",     label: "Sigle *",         placeholder: "SGCI"                                 },
            { key: "directeur", label: "Directeur",       placeholder: "M. Koffi Amenan"                     },
            { key: "email",     label: "Email",           placeholder: "contact@sgci.ci"                     },
            { key: "telephone", label: "Téléphone",       placeholder: "+225 27 20 20 12 34"                  },
            { key: "ville",     label: "Ville",           placeholder: "Abidjan"                             },
            { key: "adresse",   label: "Adresse",         placeholder: "Avenue Noguès, Plateau",   full: true },
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

      <ConfirmModal open={!!showConfirmDelete} onClose={() => setShowConfirmDelete(null)}
        onConfirm={() => { if (showConfirmDelete) { setBanques(prev => prev.map(b => b.id === showConfirmDelete.id ? { ...b, statut: "inactive" } : b)); toast.info("Banque désactivée"); setShowConfirmDelete(null); } }}
        title="Désactiver la banque"
        message={`Voulez-vous désactiver ${showConfirmDelete?.nom} ? Elle n'apparaîtra plus dans les nouvelles souscriptions.`}
        confirmLabel="Désactiver" variant="warning" />
    </div>
  );
}
