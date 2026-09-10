// @ts-nocheck
"use client";

import { StatusBadge } from "@/components/ui/ldf-badge";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import {
  Building2, ChevronLeft, ChevronRight, Eye,
  FileText, Filter, Plus, Search, User, X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

const STATUTS_LABELS: Record<string, string> = {
  brouillon: "Brouillon", soumise: "Soumise", en_traitement: "En traitement",
  en_attente: "En attente", validee: "Validée", rejetee: "Rejetée",
  financee: "Financée", payee: "Payée", livree: "Livrée", terminee: "Terminée",
};

const PAGE_SIZE = 10;

export default function SouscriptionsPage() {
  const { user } = useLDFAuthStore();
  const { souscriptions, fournisseurs } = useVitalisDb();

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [filterType, setFilterType] = useState<"" | "physique" | "morale">("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Filtrer selon le rôle
  const roleFiltered = useMemo(() => {
    if (user?.role === "fournisseur" && user.organisationId) {
      return souscriptions.filter(s =>
        s.fournisseurs.some(f => f.fournisseurId === user.organisationId)
      );
    }
    return souscriptions;
  }, [souscriptions, user]);

  // Appliquer les filtres
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roleFiltered.filter(s => {
      const matchSearch = !q ||
        s.reference.toLowerCase().includes(q) ||
        s.souscripteurNom.toLowerCase().includes(q) ||
        (s.souscripteurPrenom?.toLowerCase().includes(q)) ||
        (s.souscripteurEntreprise?.toLowerCase().includes(q)) ||
        s.fournisseurs.some(f => f.fournisseurNom.toLowerCase().includes(q));
      const matchStatut = !filterStatut || s.statut === filterStatut;
      const matchFourn = !filterFournisseur || s.fournisseurs.some(f => f.fournisseurId === filterFournisseur);
      const matchType = !filterType || s.typeSouscripteur === filterType;
      return matchSearch && matchStatut && matchFourn && matchType;
    }).sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  }, [roleFiltered, search, filterStatut, filterFournisseur, filterType]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut || filterFournisseur || filterType;

  const clearFilters = () => {
    setSearch(""); setFilterStatut(""); setFilterFournisseur(""); setFilterType("");
    setPage(1);
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Souscriptions Vitalis</h1>
          <p className="page-subtitle">
            {filtered.length} souscription{filtered.length > 1 ? "s" : ""}{hasFilters ? " filtrées" : " au total"} · Banque : <strong>AFG Bank</strong>
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "fournisseur") && (
          <Link href="/dashboard/souscriptions/creer" className="btn-ldf-primary">
            <Plus className="w-4 h-4" /> Nouvelle souscription
          </Link>
        )}
      </div>

      {/* Barre de recherche + filtres */}
      <div className="section-card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par référence, nom, fournisseur..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
              ${showFilters ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
          >
            <Filter className="w-4 h-4" /> Filtres
            {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-300" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <select
              value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUTS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            {user?.role !== "fournisseur" && (
              <select
                value={filterFournisseur} onChange={e => { setFilterFournisseur(e.target.value); setPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none"
              >
                <option value="">Tous les fournisseurs</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            )}

            <select
              value={filterType} onChange={e => { setFilterType(e.target.value as any); setPage(1); }}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none"
            >
              <option value="">Tous les types</option>
              <option value="physique">Personne Physique</option>
              <option value="morale">Personne Morale</option>
            </select>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="section-card overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Aucune souscription trouvée</p>
            {(user?.role === "admin" || user?.role === "fournisseur") && (
              <Link href="/dashboard/souscriptions/creer" className="mt-3 text-xs text-orange-500 hover:underline">
                Créer la première →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Référence</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Souscripteur</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Fournisseur(s)</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Montant</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/souscriptions/${s.id}`} className="font-mono text-xs font-bold text-[#ff6b35] hover:underline">
                        {s.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 
                          ${s.typeSouscripteur === "physique" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                          {s.typeSouscripteur === "physique" ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {s.souscripteurPrenom} {s.souscripteurNom}
                          </p>
                          {s.souscripteurEntreprise && (
                            <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{s.souscripteurEntreprise}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 items-center">
                        {s.fournisseurs
                          .filter(f => (user?.role === "fournisseur" && user.organisationId) ? f.fournisseurId === user.organisationId : true)
                          .slice(0, 3).map(f => {
                            const detailFourn = fournisseurs.find(xf => xf.id === f.fournisseurId);
                            return (
                              <div key={f.fournisseurId} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                                {detailFourn?.logo ? (
                                  <img src={detailFourn.logo} alt={f.fournisseurNom} className="w-5 h-5 object-contain" />
                                ) : (
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-[10px] font-medium text-gray-700 truncate max-w-[80px]">
                                  {f.fournisseurNom.split(" ")[0]}
                                </span>
                              </div>
                            );
                        })}
                        {user?.role !== "fournisseur" && s.fournisseurs.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{s.fournisseurs.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-semibold text-gray-700">
                        {s.montantTotal > 0 ? fmtCFA(s.montantTotal) : <span className="text-gray-300 italic text-[10px]">À définir</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">
                        {new Date(s.dateCreation).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge statut={s.statut} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/souscriptions/${s.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`gap-${p}`} className="text-gray-300 text-xs">…</span>}
                    <button
                      key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                        ${p === page ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:bg-white"}`}
                    >
                      {p}
                    </button>
                  </>
                ))
              }
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
