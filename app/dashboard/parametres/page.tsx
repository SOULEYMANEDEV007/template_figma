// @ts-nocheck
"use client";
import { useLDFAuthStore, getRoleLabel } from "@/stores/ldfAuth";
import { RoleBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { Eye, EyeOff, Lock, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ParametresPage() {
  const { user, logout } = useLDFAuthStore();
  const [tab, setTab] = useState<"profil" | "securite">("profil");
  const [showLogout, setShowLogout] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
    phone:     user?.phone     ?? "",
  });

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  const handleSaveProfil = () => {
    toast.success("Profil mis à jour avec succès !");
  };

  const handleSavePwd = () => {
    if (!pwd.current || !pwd.next) { toast.error("Tous les champs sont requis"); return; }
    if (pwd.next !== pwd.confirm)  { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (pwd.next.length < 8)       { toast.error("Le mot de passe doit comporter au moins 8 caractères"); return; }
    toast.success("Mot de passe modifié avec succès !");
    setPwd({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-5 fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Gérez votre profil et votre sécurité</p>
      </div>

      {/* Profil card */}
      <div className="section-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-amber-900 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#f6c90e,#f0a500)" }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="mt-1"><RoleBadge role={user?.role ?? "admin"} /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: "profil", label: "Profil", icon: User }, { key: "securite", label: "Sécurité", icon: Lock }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Profil */}
      {tab === "profil" && (
        <div className="section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-amber-500" /><h3 className="text-sm font-semibold text-gray-800">Informations personnelles</h3></div>
          </div>
          <div className="section-card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ldf-label">Prénom</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="ldf-input" />
              </div>
              <div>
                <label className="ldf-label">Nom</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="ldf-input" />
              </div>
              <div>
                <label className="ldf-label">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="ldf-input" />
              </div>
              <div>
                <label className="ldf-label">Téléphone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+225 07 00 00 00 00" className="ldf-input" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSaveProfil} className="btn-ldf-primary text-sm py-2.5 px-5">
                <Save className="w-4 h-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sécurité */}
      {tab === "securite" && (
        <div className="section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-amber-500" /><h3 className="text-sm font-semibold text-gray-800">Modifier le mot de passe</h3></div>
          </div>
          <div className="section-card-body space-y-4">
            {[
              { key: "current", label: "Mot de passe actuel" },
              { key: "next",    label: "Nouveau mot de passe" },
              { key: "confirm", label: "Confirmer le nouveau" },
            ].map(f => (
              <div key={f.key}>
                <label className="ldf-label">{f.label}</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={(pwd as any)[f.key]}
                    onChange={e => setPwd(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="••••••••" className="ldf-input pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleSavePwd} className="btn-ldf-primary text-sm py-2.5 px-5">
              <Lock className="w-4 h-4" /> Mettre à jour
            </button>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="section-card border-red-100">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Se déconnecter</p>
            <p className="text-xs text-gray-500 mt-0.5">Terminer la session en cours</p>
          </div>
          <button onClick={() => setShowLogout(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            Déconnexion
          </button>
        </div>
      </div>

      <ConfirmModal open={showLogout} onClose={() => setShowLogout(false)}
        onConfirm={logout}
        title="Se déconnecter"
        message="Vous allez être redirigé vers la page de connexion."
        confirmLabel="Se déconnecter" variant="warning" />
    </div>
  );
}
