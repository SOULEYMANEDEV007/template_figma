// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Building2, Edit, Plus, Search, Trash2, MapPin, Phone, Mail,
  User, ShieldCheck, CheckCircle2, TrendingUp, X, FileText, CreditCard
} from "lucide-react";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { VAgenceAFG } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import { IMAGES } from "@/lib/constants/images";
import { toast } from "sonner";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(isNaN(v) ? 0 : v) + " FCFA";

const EMPTY_FORM: Omit<VAgenceAFG, "id"> = {
  code: "",
  nom: "",
  ville: "Abidjan",
  adresse: "",
  telephone: "",
  email: "",
  responsable: "",
  statut: "actif",
};

export default function AdminBanquesPage() {
  const { user } = useLDFAuthStore();
  const isOwner = user?.role === "owner";
  const {
    agencesAFG = [],
    dossiers = [],
    addAgenceAFG,
    updateAgenceAFG,
    deleteAgenceAFG,
  } = useVitalisDb();

  const [search, setSearch] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<VAgenceAFG | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<VAgenceAFG | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Villes uniques
  const villesDisponibles = useMemo(() => {
    const list = Array.from(new Set(agencesAFG.map(a => a.ville).filter(Boolean)));
    return list.sort();
  }, [agencesAFG]);

  // Filtrage
  const filtered = useMemo(() => {
    return agencesAFG.filter(a => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.nom.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.ville.toLowerCase().includes(q) ||
        a.responsable?.toLowerCase().includes(q) ||
        a.adresse?.toLowerCase().includes(q);

      const matchVille = !filterVille || a.ville === filterVille;
      const matchStatut = !filterStatut || a.statut === filterStatut;

      return matchSearch && matchVille && matchStatut;
    });
  }, [agencesAFG, search, filterVille, filterStatut]);

  // Métriques globales du réseau AFG Bank
  const totalAgences = agencesAFG.length;
  const agencesActives = agencesAFG.filter(a => a.statut === "actif").length;
  const agencesAbidjan = agencesAFG.filter(a => a.ville.toLowerCase().includes("abidjan")).length;
  const agencesInterieur = agencesAFG.filter(a => !a.ville.toLowerCase().includes("abidjan")).length;

  const totalDossiersReseau = dossiers.length;
  const montantTotalFinanceReseau = dossiers
    .filter(d => ["valide", "accepte", "finance", "fournisseur_paye", "livre", "servie"].includes(d.statut))
    .reduce((sum, d) => sum + (d.montantFinance || d.montantAccorde || d.montantTotal || 0), 0);

  // Ouvrir formulaire d'ajout
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowForm(true);
  };

  // Ouvrir formulaire d'édition
  const openEdit = (a: VAgenceAFG) => {
    setForm({
      code: a.code,
      nom: a.nom,
      ville: a.ville,
      adresse: a.adresse,
      telephone: a.telephone,
      email: a.email,
      responsable: a.responsable,
      statut: a.statut,
    });
    setEditTarget(a);
    setShowForm(true);
  };

  // Sauvegarder
  const handleSave = () => {
    if (!form.nom || !form.ville) {
      toast.error("Le nom de l'agence et la ville sont obligatoires");
      return;
    }

    if (editTarget) {
      updateAgenceAFG(editTarget.id, form);
      toast.success(`${form.nom} mise à jour avec succès`);
    } else {
      const created = addAgenceAFG(form);
      toast.success(`${created.nom} ajoutée au réseau AFG Bank`);
    }

    setShowForm(false);
  };

  // Supprimer / Désactiver
  const handleDelete = () => {
    if (!showConfirmDelete) return;
    deleteAgenceAFG(showConfirmDelete.id);
    toast.success(`Agence ${showConfirmDelete.nom} supprimée du réseau`);
    setShowConfirmDelete(null);
  };

  const setf = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 fade-in">
      {/* ── En-tête de page ── */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 p-1.5 shadow-xs flex items-center justify-center flex-shrink-0">
            <Image
              src={IMAGES.logos.afgBank}
              alt="AFG Bank"
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <h1 className="page-title flex items-center gap-2">
              Agences AFG Bank CI
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Banque Financeuse Unique
              </span>
            </h1>
            <p className="page-subtitle">
              Réseau d'instruction et de validation de crédit du Programme Vitalis FADES · {agencesActives} agences actives
            </p>
          </div>
        </div>

        {isOwner ? (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Mode Supervision (Lecture seule)
          </div>
        ) : (
          <button onClick={openAdd} className="btn-ldf-primary">
            <Plus className="w-4 h-4" /> Ajouter une agence
          </button>
        )}
      </div>

      {/* ── 4 Cartes KPIs Synthèse Réseau ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-blue-600 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Réseau AFG Bank</p>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalAgences}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{agencesActives} agences opérationnelles</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Grand Abidjan</p>
            <MapPin className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-teal-700 mt-1">{agencesAbidjan}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Plateau, Cocody, Marcory, Yopougon</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-amber-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Intérieur du Pays</p>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{agencesInterieur}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Bouaké, Yamoussoukro, San-Pedro...</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-emerald-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Dossiers Instruits</p>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{totalDossiersReseau}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{fmtCFA(montantTotalFinanceReseau)} financés</p>
        </div>
      </div>

      {/* ── Barre de Filtres et Recherche ── */}
      <div className="section-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une agence, une ville, un responsable, une adresse..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filtre Ville */}
            <select
              value={filterVille}
              onChange={e => setFilterVille(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
            >
              <option value="">Toutes les villes</option>
              {villesDisponibles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {/* Filtre Statut */}
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Grille des Agences AFG Bank ── */}
      {filtered.length === 0 ? (
        <div className="section-card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Aucune agence trouvée</p>
          <p className="text-xs text-gray-400 mt-1">Modifiez vos critères de recherche ou de filtrage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(agence => {
            // Dossiers instruits rattachés à cette agence
            const agenceDossiers = dossiers.filter(d => d.agenceId === agence.id);
            const dossiersCount = agenceDossiers.length;
            const montantFinance = agenceDossiers
              .filter(d => ["valide", "accepte", "finance", "fournisseur_paye", "livre", "servie"].includes(d.statut))
              .reduce((sum, d) => sum + (d.montantFinance || d.montantAccorde || d.montantTotal || 0), 0);

            return (
              <div
                key={agence.id}
                className="section-card border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* En-tête agence */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                        {agence.code?.replace("AFG-", "") || "AFG"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-gray-900 truncate">{agence.nom}</p>
                        </div>
                        <p className="text-xs text-blue-600 font-mono font-medium">{agence.code}</p>
                      </div>
                    </div>
                    <StatusBadge statut={agence.statut} size="sm" />
                  </div>

                  {/* Coordonnées & Responsable */}
                  <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
                    <div className="flex items-start gap-2 text-gray-600">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate">
                        <strong className="text-gray-800 font-medium">Responsable :</strong> {agence.responsable || "Non renseigné"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate" title={agence.adresse}>
                        <strong className="text-gray-800 font-medium">{agence.ville} :</strong> {agence.adresse || agence.ville}
                      </span>
                    </div>

                    {agence.telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-[11px]">{agence.telephone}</span>
                      </div>
                    )}

                    {agence.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] truncate text-gray-500">{agence.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Métriques d'activité financière */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-gray-50/80 border border-gray-100/60">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Dossiers</p>
                      <p className="text-sm font-bold text-gray-800">
                        {dossiersCount} <span className="text-[10px] font-normal text-gray-500">dossier{dossiersCount > 1 ? "s" : ""}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Montant accordé</p>
                      <p className="text-xs font-bold text-blue-700 truncate" title={fmtCFA(montantFinance)}>
                        {fmtCFA(montantFinance)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action (masqués pour le rôle owner) */}
                {!isOwner && (
                  <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(agence)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-500" /> Modifier
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(agence)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                      title="Supprimer l'agence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modale Ajout / Modification ── */}
      <LDFModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? `Modifier ${editTarget.nom}` : "Ajouter une agence AFG Bank"}
        size="md"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="ldf-label">Nom de l'agence *</label>
            <input
              type="text"
              value={form.nom}
              onChange={e => setf("nom", e.target.value)}
              placeholder="ex. Agence Plateau"
              className="ldf-input"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="ldf-label">Code Agence *</label>
            <input
              type="text"
              value={form.code}
              onChange={e => setf("code", e.target.value.toUpperCase())}
              placeholder="ex. AFG-PLT"
              className="ldf-input font-mono"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="ldf-label">Ville *</label>
            <input
              type="text"
              value={form.ville}
              onChange={e => setf("ville", e.target.value)}
              placeholder="ex. Abidjan"
              className="ldf-input"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="ldf-label">Responsable d'agence</label>
            <input
              type="text"
              value={form.responsable}
              onChange={e => setf("responsable", e.target.value)}
              placeholder="ex. M. Kouadio KOFFI"
              className="ldf-input"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="ldf-label">Adresse complète</label>
            <input
              type="text"
              value={form.adresse}
              onChange={e => setf("adresse", e.target.value)}
              placeholder="ex. Avenue Chardy, Immeuble SCIAM, Plateau"
              className="ldf-input"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="ldf-label">Téléphone direct</label>
            <input
              type="text"
              value={form.telephone}
              onChange={e => setf("telephone", e.target.value)}
              placeholder="ex. +225 27 20 31 58 00"
              className="ldf-input font-mono"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="ldf-label">Email de l'agence</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setf("email", e.target.value)}
              placeholder="ex. plateau@afgbank.ci"
              className="ldf-input"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="ldf-label">Statut opérationnel</label>
            <select
              value={form.statut}
              onChange={e => setf("statut", e.target.value)}
              className="ldf-input"
            >
              <option value="actif">Actif (Opérationnelle)</option>
              <option value="inactif">Inactif (Fermée / En travaux)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setShowForm(false)} className="flex-1 btn-ldf-outline text-sm py-2.5">
            Annuler
          </button>
          <button onClick={handleSave} className="flex-1 btn-ldf-primary text-sm py-2.5">
            {editTarget ? "Mettre à jour l'agence" : "Enregistrer l'agence"}
          </button>
        </div>
      </LDFModal>

      {/* ── Modale Confirmation de Suppression ── */}
      <ConfirmModal
        open={!!showConfirmDelete}
        onClose={() => setShowConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer l'agence AFG Bank"
        message={`Voulez-vous supprimer ${showConfirmDelete?.nom} (${showConfirmDelete?.ville}) du réseau AFG Bank CI ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
