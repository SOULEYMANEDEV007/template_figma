// @ts-nocheck
"use client";

import { StatusBadge } from "@/components/ui/ldf-badge";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import {
  BookOpen, ChevronLeft, ChevronRight,
  Download, Eye, Filter, Plus, Search, X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

const STATUTS_LABELS: Record<string, string> = {
  brouillon: "Brouillon", envoye: "Envoyé",
  en_attente_validation: "En attente", valide: "Validé",
  refuse: "Refusé", expire: "Expiré",
};

const PAGE_SIZE = 10;

export default function DevisPage() {
  const { user } = useLDFAuthStore();
  const { devis, fournisseurs } = useVitalisDb();

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Filtrer selon le rôle fournisseur
  const roleFiltered = useMemo(() => {
    if (user?.role === "fournisseur" && user.organisationId) {
      return devis.filter(d => d.fournisseurId === user.organisationId);
    }
    return devis;
  }, [devis, user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roleFiltered.filter(d => {
      const matchSearch = !q ||
        d.reference.toLowerCase().includes(q) ||
        d.souscripteurNom.toLowerCase().includes(q) ||
        (d.souscripteurPrenom?.toLowerCase().includes(q)) ||
        d.fournisseurNom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || d.statut === filterStatut;
      const matchFourn = !filterFournisseur || d.fournisseurId === filterFournisseur;
      return matchSearch && matchStatut && matchFourn;
    }).sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  }, [roleFiltered, search, filterStatut, filterFournisseur]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut || filterFournisseur;

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Devis</h1>
          <p className="page-subtitle">
            {filtered.length} devis{hasFilters ? " filtrés" : ""} · <span className="font-medium text-orange-600">AFG Bank</span>
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "fournisseur") && (
          <Link href="/dashboard/devis/nouveau" className="btn-ldf-primary">
            <Plus className="w-4 h-4" /> Nouveau devis
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="section-card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Référence, souscripteur, fournisseur..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
              ${showFilters ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
          >
            <Filter className="w-4 h-4" /> Filtres
            {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-300" />}
          </button>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterStatut(""); setFilterFournisseur(""); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none">
              <option value="">Tous les statuts</option>
              {Object.entries(STATUTS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {user?.role !== "fournisseur" && (
              <select value={filterFournisseur} onChange={e => { setFilterFournisseur(e.target.value); setPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none">
                <option value="">Tous les fournisseurs</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="section-card overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Aucun devis trouvé</p>
            {(user?.role === "admin" || user?.role === "fournisseur") && (
              <Link href="/dashboard/devis/nouveau" className="mt-3 text-xs text-orange-500 hover:underline">
                Créer le premier devis →
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
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Fournisseur</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Articles</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Montant TTC</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(d => (
                  <tr key={d.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/devis/${d.id}`} className="font-mono text-xs font-bold text-[#ff6b35] hover:underline">
                        {d.reference}
                      </Link>
                      <p className="text-[10px] text-gray-400">{new Date(d.dateCreation).toLocaleDateString("fr-FR")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800">{d.souscripteurPrenom} {d.souscripteurNom}</p>
                      <p className="text-[10px] text-orange-500">AFG Bank</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                        {d.fournisseurNom}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{d.articles.length} article{d.articles.length > 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right">
                      <span className="text-xs font-bold text-gray-800">{fmtCFA(d.totalTTC)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge statut={d.statut} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/devis/${d.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors font-medium">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </Link>
                      </div>
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
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                    ${p === page ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:bg-white"}`}>
                  {p}
                </button>
              ))}
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
