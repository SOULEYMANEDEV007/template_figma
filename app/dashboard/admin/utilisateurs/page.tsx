// @ts-nocheck
"use client";
import { RoleBadge, StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import { mockUsers, mockBanques, mockFournisseurs } from "@/lib/ldfData";
import type { LDFUser, LDFUserRole } from "@/types/ldf";
import { Edit, Plus, RefreshCw, Search, Trash2, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<LDFUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<LDFUser | null>(null);
  const [showConfirmDisable, setShowConfirmDisable] = useState<LDFUser | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "fournisseur" as LDFUserRole, phone: "", organisationId: "", organisationName: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
      const matchRole   = !filterRole || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const openAdd = () => {
    setForm({ firstName: "", lastName: "", email: "", role: "fournisseur", phone: "", organisationId: "", organisationName: "" });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (u: LDFUser) => {
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, phone: u.phone ?? "", organisationId: u.organisationId ?? "", organisationName: u.organisationName ?? "" });
    setEditTarget(u);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.firstName || !form.email) { toast.error("Prénom et email requis"); return; }
    if (editTarget) {
      setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...form } : u));
      toast.success(`Utilisateur ${form.firstName} ${form.lastName} mis à jour`);
    } else {
      setUsers(prev => [...prev, {
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        ...form, isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      }]);
      toast.success(`Utilisateur ${form.firstName} ${form.lastName} créé`);
    }
    setShowForm(false);
  };

  const handleDisable = (u: LDFUser) => {
    setUsers(prev => prev.map(p => p.id === u.id ? { ...p, isActive: !p.isActive } : p));
    setShowConfirmDisable(null);
    toast.info(`${u.firstName} ${u.lastName} ${u.isActive ? "désactivé" : "réactivé"}`);
  };

  const handleReset = (u: LDFUser) => {
    toast.success(`Lien de réinitialisation envoyé à ${u.email}`);
  };

  const setf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const getRoleSources = (role: LDFUserRole) => {
    if (role === "banque")      return mockBanques.map(b => ({ id: b.id, name: b.nom }));
    if (role === "fournisseur") return mockFournisseurs.map(f => ({ id: f.id, name: f.nom }));
    return [];
  };

  const ROLE_ICON_BG: Record<LDFUserRole, string> = {
    admin: "bg-purple-100 text-purple-700",
    banque: "bg-blue-100 text-blue-700",
    fournisseur: "bg-amber-100 text-amber-700",
    souscripteur: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} className="btn-ldf-primary"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {([["admin","Admins"],["banque","Banques"],["fournisseur","Fournisseurs"]] as [LDFUserRole,string][]).map(([role,label]) => (
          <div key={role} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${role==="admin"?"border-l-purple-400":role==="banque"?"border-l-blue-400":"border-l-amber-400"}`}>
            <p className={`text-2xl font-bold ${role==="admin"?"text-purple-700":role==="banque"?"text-blue-700":"text-amber-700"}`}>
              {users.filter(u => u.role === role).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="px-5 py-3.5 flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Nom, email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="ldf-select text-sm py-2.5 max-w-[180px]">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="banque">Banque</option>
            <option value="fournisseur">Fournisseur</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Organisation</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ROLE_ICON_BG[u.role]}`}>
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400">{u.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="text-sm text-gray-600">{u.organisationName ?? "LDF Groupe"}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {u.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("fr-FR") : "—"}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} title="Modifier"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleReset(u)} title="Réinitialiser"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setShowConfirmDisable(u)} title={u.isActive ? "Désactiver" : "Réactiver"}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <UserX className="w-3.5 h-3.5" />
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
        title={editTarget ? "Modifier l'utilisateur" : "Nouvel utilisateur"} size="md">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "firstName", label: "Prénom *",    placeholder: "Mamadou"            },
            { key: "lastName",  label: "Nom *",       placeholder: "Coulibaly"           },
            { key: "email",     label: "Email *",     placeholder: "m@ldfgroupe.ci", full: true },
            { key: "phone",     label: "Téléphone",   placeholder: "+225 07 00 00 00 00" },
          ].map((f: any) => (
            <div key={f.key} className={f.full ? "col-span-2" : ""}>
              <label className="ldf-label">{f.label}</label>
              <input type={f.key === "email" ? "email" : "text"} value={(form as any)[f.key]}
                onChange={e => setf(f.key, e.target.value)} placeholder={f.placeholder} className="ldf-input" />
            </div>
          ))}
          <div>
            <label className="ldf-label">Rôle *</label>
            <select value={form.role} onChange={e => setf("role", e.target.value)} className="ldf-select">
              <option value="admin">Administrateur</option>
              <option value="banque">Banque</option>
              <option value="fournisseur">Fournisseur</option>
            </select>
          </div>
          {(form.role === "banque" || form.role === "fournisseur") && (
            <div>
              <label className="ldf-label">Organisation</label>
              <select value={form.organisationId}
                onChange={e => {
                  const src = getRoleSources(form.role);
                  const found = src.find(s => s.id === e.target.value);
                  setForm(f => ({ ...f, organisationId: e.target.value, organisationName: found?.name ?? "" }));
                }}
                className="ldf-select">
                <option value="">Sélectionner</option>
                {getRoleSources(form.role).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setShowForm(false)} className="flex-1 btn-ldf-outline text-sm py-2.5">Annuler</button>
          <button onClick={handleSave} className="flex-1 btn-ldf-primary text-sm py-2.5">
            {editTarget ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </LDFModal>

      <ConfirmModal open={!!showConfirmDisable} onClose={() => setShowConfirmDisable(null)}
        onConfirm={() => showConfirmDisable && handleDisable(showConfirmDisable)}
        title={showConfirmDisable?.isActive ? "Désactiver l'utilisateur" : "Réactiver l'utilisateur"}
        message={`Voulez-vous ${showConfirmDisable?.isActive ? "désactiver" : "réactiver"} ${showConfirmDisable?.firstName} ${showConfirmDisable?.lastName} ?`}
        confirmLabel={showConfirmDisable?.isActive ? "Désactiver" : "Réactiver"}
        variant={showConfirmDisable?.isActive ? "warning" : "success"} />
    </div>
  );
}
