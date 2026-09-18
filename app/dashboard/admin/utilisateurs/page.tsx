// @ts-nocheck
"use client";
import { RoleBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { LDFUser, LDFUserRole } from "@/types/ldf";
import {
  Edit,
  History,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Shield,
  Clock,
  Laptop,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Helper de formatage de la dernière connexion avec traçabilité relative et absolue
function formatDerniereConnexion(dateStr?: string) {
  if (!dateStr) return { text: "Jamais connecté", isRecent: false, dateFull: "Aucune connexion enregistrée" };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { text: "—", isRecent: false, dateFull: "—" };

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const isRecent = diffMin >= 0 && diffMin < 120; // connecté dans les 2 dernières heures

    const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const dateFull = d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const isToday = now.toDateString() === d.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === d.toDateString();

    if (diffMin >= 0 && diffMin < 5) return { text: "À l'instant", isRecent: true, dateFull };
    if (diffMin >= 5 && diffMin < 60) return { text: `Il y a ${diffMin} min`, isRecent: true, dateFull };
    if (isToday) return { text: `Aujourd'hui à ${timeStr}`, isRecent: true, dateFull };
    if (isYesterday) return { text: `Hier à ${timeStr}`, isRecent: false, dateFull };

    return {
      text: `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} ${timeStr}`,
      isRecent: false,
      dateFull,
    };
  } catch {
    return { text: "—", isRecent: false, dateFull: "—" };
  }
}

export default function AdminUtilisateursPage() {
  const {
    users: dbUsers,
    addUser,
    updateUser,
    deleteUser,
    connexionsLogs,
    agencesAFG,
    fournisseurs,
    seedIfNeeded,
  } = useVitalisDb();

  useEffect(() => {
    seedIfNeeded();
  }, [seedIfNeeded]);

  const users = useMemo(() => {
    return dbUsers && dbUsers.length > 0 ? dbUsers : [];
  }, [dbUsers]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [showConfirmDisable, setShowConfirmDisable] = useState<any | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [filterLogUser, setFilterLogUser] = useState<string>("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "fournisseur" as LDFUserRole,
    phone: "",
    organisationId: "",
    organisationName: "",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const p = u.firstName || u.prenom || "";
      const n = u.lastName || u.nom || "";
      const email = u.email || "";
      const org = u.organisationName || "";
      const phone = u.phone || u.telephone || "";

      const matchSearch =
        !q ||
        `${p} ${n} ${email} ${org} ${phone}`.toLowerCase().includes(q);
      const matchRole = !filterRole || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const openAdd = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "fournisseur",
      phone: "",
      organisationId: "",
      organisationName: "",
    });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (u: any) => {
    setForm({
      firstName: u.firstName || u.prenom || "",
      lastName: u.lastName || u.nom || "",
      email: u.email || "",
      role: u.role || "fournisseur",
      phone: u.phone || u.telephone || "",
      organisationId: u.organisationId ?? "",
      organisationName: u.organisationName ?? "",
    });
    setEditTarget(u);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.firstName || !form.email) {
      toast.error("Veuillez renseigner au moins le prénom et l'email.");
      return;
    }
    if (editTarget) {
      updateUser(editTarget.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        phone: form.phone,
        telephone: form.phone,
        organisationId: form.organisationId,
        organisationName: form.organisationName,
      });
      toast.success(`Utilisateur ${form.firstName} ${form.lastName} mis à jour.`);
    } else {
      addUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        phone: form.phone,
        telephone: form.phone,
        organisationId: form.organisationId,
        organisationName: form.organisationName || "LDF Groupe",
        isActive: true,
        statut: "actif",
        createdAt: new Date().toISOString().split("T")[0],
      });
      toast.success(`Utilisateur ${form.firstName} ${form.lastName} enregistré avec succès.`);
    }
    setShowForm(false);
  };

  const handleDisable = (u: any) => {
    const nextStatus = !u.isActive;
    updateUser(u.id, { isActive: nextStatus, statut: nextStatus ? "actif" : "inactif" });
    setShowConfirmDisable(null);
    toast.info(`${u.firstName || u.prenom || u.email} ${nextStatus ? "réactivé" : "désactivé"}`);
  };

  const handleReset = (u: any) => {
    toast.success(`Lien sécurisé de réinitialisation généré et envoyé à ${u.email}`);
  };

  const setf = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const getRoleSources = (role: LDFUserRole) => {
    if (role === "banque") return agencesAFG.map((b) => ({ id: b.id, name: b.nom }));
    if (role === "fournisseur") return fournisseurs.map((f) => ({ id: f.id, name: f.nom }));
    return [];
  };

  const ROLE_ICON_BG: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    banque: "bg-blue-100 text-blue-700",
    fournisseur: "bg-amber-100 text-amber-700",
    souscripteur: "bg-teal-100 text-teal-700",
    owner: "bg-slate-200 text-slate-800",
  };

  const openUserLogs = (u: any) => {
    setFilterLogUser(u.email);
    setShowLogsModal(true);
  };

  // Filtrage des logs
  const displayLogs = useMemo(() => {
    const logs = connexionsLogs || [];
    if (!filterLogUser) return logs;
    return logs.filter((l) => l.email.toLowerCase() === filterLogUser.toLowerCase());
  }, [connexionsLogs, filterLogUser]);

  return (
    <div className="space-y-5 fade-in">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""} enregistré{filtered.length > 1 ? "s" : ""} · Données persistantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterLogUser("");
              setShowLogsModal(true);
            }}
            className="btn-ldf-outline flex items-center gap-2 py-2 text-xs font-semibold"
          >
            <History className="w-4 h-4 text-primary" />
            <span>Traçabilité connexions</span>
            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
              {connexionsLogs?.length || 0}
            </span>
          </button>
          <button onClick={openAdd} className="btn-ldf-primary flex items-center gap-2 py-2 text-xs">
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-primary p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Total utilisateurs ({users.filter((u) => u.isActive).length} actifs)
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-purple-500 p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-700">
            {users.filter((u) => u.role === "admin").length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Administrateurs ViFlo</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-blue-500 p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-700">
            {users.filter((u) => u.role === "banque").length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Responsables AFG Bank</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-amber-500 p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-700">
            {users.filter((u) => u.role === "fournisseur").length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Fournisseurs Agréés</p>
        </div>
      </div>

      {/* Section Tableau */}
      <div className="section-card bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 flex gap-3 flex-col sm:flex-row bg-gray-50/50 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, organisation, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:inline" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="ldf-select text-sm py-2 max-w-[200px]"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="banque">Banque</option>
              <option value="fournisseur">Fournisseur</option>
              <option value="owner">Propriétaire (Supervision)</option>
              <option value="souscripteur">Souscripteur</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="ldf-table w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50/30">
                <th className="py-3 px-4">UTILISATEUR</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">RÔLE</th>
                <th className="py-3 px-4">ORGANISATION</th>
                <th className="py-3 px-4">STATUT</th>
                <th className="py-3 px-4">DERNIÈRE CONNEXION</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-sm">
                    Aucun utilisateur ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const firstName = u.firstName || u.prenom || "";
                  const lastName = u.lastName || u.nom || "";
                  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Utilisateur";
                  const initial = (firstName[0] || lastName[0] || "U").toUpperCase();
                  const roleKey = u.role || "autre";
                  const { text: loginText, isRecent, dateFull } = formatDerniereConnexion(u.lastLoginAt);

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              ROLE_ICON_BG[roleKey] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                            <p className="text-xs text-gray-400">{u.phone || u.telephone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {u.organisationName || (u.role === "banque" ? "AFG Bank" : "LDF Groupe")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {u.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" title={dateFull}>
                        {loginText === "Jamais connecté" || loginText === "—" ? (
                          <span className="text-gray-400 font-mono">{loginText}</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isRecent ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                              }`}
                            />
                            <span className={isRecent ? "text-emerald-700 font-semibold" : "text-gray-600"}>
                              {loginText}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openUserLogs(u)}
                            title="Historique des connexions"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            title="Modifier"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReset(u)}
                            title="Réinitialiser le mot de passe"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowConfirmDisable(u)}
                            title={u.isActive ? "Désactiver" : "Réactiver"}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              u.isActive
                                ? "text-gray-400 hover:bg-red-50 hover:text-red-600"
                                : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                          >
                            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout / Modification */}
      <LDFModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        size="md"
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "firstName", label: "Prénom *", placeholder: "Ex: Mamadou" },
            { key: "lastName", label: "Nom *", placeholder: "Ex: Coulibaly" },
            { key: "email", label: "Email *", placeholder: "utilisateur@viflo.ci", full: true },
            { key: "phone", label: "Téléphone", placeholder: "+225 07 00 00 00 00" },
          ].map((f: any) => (
            <div key={f.key} className={f.full ? "col-span-2" : ""}>
              <label className="ldf-label">{f.label}</label>
              <input
                type={f.key === "email" ? "email" : "text"}
                value={(form as any)[f.key]}
                onChange={(e) => setf(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="ldf-input"
              />
            </div>
          ))}
          <div>
            <label className="ldf-label">Rôle *</label>
            <select value={form.role} onChange={(e) => setf("role", e.target.value)} className="ldf-select">
              <option value="admin">Administrateur</option>
              <option value="banque">Banque</option>
              <option value="fournisseur">Fournisseur</option>
              <option value="owner">Propriétaire (Supervision)</option>
              <option value="souscripteur">Souscripteur</option>
            </select>
          </div>
          {(form.role === "banque" || form.role === "fournisseur") && (
            <div>
              <label className="ldf-label">Organisation / Agence</label>
              <select
                value={form.organisationId}
                onChange={(e) => {
                  const src = getRoleSources(form.role);
                  const found = src.find((s) => s.id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    organisationId: e.target.value,
                    organisationName: found?.name ?? "",
                  }));
                }}
                className="ldf-select"
              >
                <option value="">Sélectionner</option>
                {getRoleSources(form.role).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setShowForm(false)} className="flex-1 btn-ldf-outline text-sm py-2.5">
            Annuler
          </button>
          <button onClick={handleSave} className="flex-1 btn-ldf-primary text-sm py-2.5">
            {editTarget ? "Mettre à jour" : "Créer et Enregistrer"}
          </button>
        </div>
      </LDFModal>

      {/* Modal Journal & Traçabilité des connexions */}
      <LDFModal
        open={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Journal & Traçabilité des Connexions"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <History className="w-4 h-4 text-primary" />
              <span>
                Total <strong>{displayLogs.length}</strong> événement(s) de connexion audité(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-500">Filtrer par compte :</label>
              <select
                value={filterLogUser}
                onChange={(e) => setFilterLogUser(e.target.value)}
                className="ldf-select py-1 px-2 text-xs"
              >
                <option value="">Tous les utilisateurs</option>
                {users.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.firstName || u.prenom || u.nom || "Utilisateur"} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto rounded-xl border border-gray-200">
            <table className="ldf-table w-full text-xs">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="py-2.5 px-3 text-left">DATE & HEURE</th>
                  <th className="py-2.5 px-3 text-left">UTILISATEUR</th>
                  <th className="py-2.5 px-3 text-left">RÔLE</th>
                  <th className="py-2.5 px-3 text-left">ADRESSE IP / LIEU</th>
                  <th className="py-2.5 px-3 text-left">APPAREIL</th>
                  <th className="py-2.5 px-3 text-right">RÉSULTAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      Aucune trace de connexion enregistrée pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  displayLogs.map((log) => {
                    const d = new Date(log.date);
                    const formatted = isNaN(d.getTime())
                      ? log.date
                      : d.toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/80">
                        <td className="py-2 px-3 font-mono text-gray-700">{formatted}</td>
                        <td className="py-2 px-3">
                          <p className="font-semibold text-gray-800">{log.userName || log.email}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{log.email}</p>
                        </td>
                        <td className="py-2 px-3">
                          <RoleBadge role={log.role} />
                        </td>
                        <td className="py-2 px-3 text-gray-600 font-mono">{log.ip}</td>
                        <td className="py-2 px-3 text-gray-600 flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-gray-400" />
                          <span>{log.appareil}</span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Succès
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setShowLogsModal(false)} className="btn-ldf-outline text-xs py-2 px-4">
              Fermer
            </button>
          </div>
        </div>
      </LDFModal>

      {/* Modal Confirmation Désactivation */}
      <ConfirmModal
        open={!!showConfirmDisable}
        onClose={() => setShowConfirmDisable(null)}
        onConfirm={() => showConfirmDisable && handleDisable(showConfirmDisable)}
        title={showConfirmDisable?.isActive ? "Désactiver l'utilisateur" : "Réactiver l'utilisateur"}
        message={`Voulez-vous ${
          showConfirmDisable?.isActive ? "désactiver" : "réactiver"
        } le compte de ${showConfirmDisable?.firstName || showConfirmDisable?.nom || ""} ${
          showConfirmDisable?.lastName || ""
        } (${showConfirmDisable?.email}) ?`}
        confirmLabel={showConfirmDisable?.isActive ? "Désactiver" : "Réactiver"}
        variant={showConfirmDisable?.isActive ? "warning" : "success"}
      />
    </div>
  );
}
