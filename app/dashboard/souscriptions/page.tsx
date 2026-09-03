"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockBanques, mockFournisseurs, mockSouscriptions } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ChevronLeft, ChevronRight, Download, Eye, FileText,
  Filter, Plus, Search, X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { SouscriptionStatut } from "@/types/ldf";

const STATUTS: SouscriptionStatut[] = ["brouillon","soumise","en_attente","validee","rejetee","payee","servie"];
const STATUT_LABELS: Record<SouscriptionStatut, string> = {
  brouillon:"Brouillon", soumise:"Soumise", en_attente:"En attente",
  validee:"Validée", rejetee:"Rejetée", payee:"Payée", servie:"Servie",
};
const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function SouscriptionsPage() {
  const { user } = useLDFAuthStore();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterBanque, setFilterBanque] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockSouscriptions.filter(s => {
      const matchSearch = !q ||
        s.reference.toLowerCase().includes(q) ||
        `${s.souscripteurNom} ${s.souscripteurPrenom}`.toLowerCase().includes(q) ||
        s.fournisseurNom.toLowerCase().includes(q) ||
        s.banqueNom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || s.statut === filterStatut;
      const matchBanque = !filterBanque || s.banqueId === filterBanque;
      const matchFrn    = !filterFournisseur || s.fournisseurId === filterFournisseur;
      return matchSearch && matchStatut && matchBanque && matchFrn;
    });
  }, [search, filterStatut, filterBanque, filterFournisseur]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch(""); setFilterStatut(""); setFilterBanque(""); setFilterFournisseur(""); setPage(1);
  };
  const hasFilters = search || filterStatut || filterBanque || filterFournisseur;

  return (
    <div className="space-y-5 fade-in">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Souscriptions</h1>
          <p className="page-subtitle">{filtered.length} souscription{filtered.length > 1 ? "s" : ""} {hasFilters ? "filtrée" : "au total"}{filtered.length > 1 ? "s" : ""}</p>
        </div>
        {(user?.role === "admin" || user?.role === "fournisseur") && (
          <Link href="/dashboard/souscriptions/creer" className="btn-ldf-primary">
            <Plus className="w-4 h-4" /> Nouvelle souscription
          </Link>
        )}
      </div>

      {/* ── Barre de recherche + filtres ── */}
      <div className="section-card">
        <div className="px-5 py-3.5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Référence, souscripteur, fournisseur..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${showFilters || hasFilters ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              <Filter className="w-4 h-4" />
              Filtres {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
                <X className="w-3.5 h-3.5" /> Effacer
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-5 pb-4 border-t border-gray-50 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="ldf-label text-xs">Statut</label>
              <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                <option value="">Tous les statuts</option>
                {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="ldf-label text-xs">Banque</label>
              <select value={filterBanque} onChange={e => { setFilterBanque(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                <option value="">Toutes les banques</option>
                {mockBanques.map(b => <option key={b.id} value={b.id}>{b.sigle}</option>)}
              </select>
            </div>
            <div>
              <label className="ldf-label text-xs">Fournisseur</label>
              <select value={filterFournisseur} onChange={e => { setFilterFournisseur(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                <option value="">Tous les fournisseurs</option>
                {mockFournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Tableau ── */}
        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Souscripteur</th>
                <th>Fournisseur</th>
                <th>Banque</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucune souscription trouvée</p>
                  </td>
                </tr>
              ) : paginated.map(s => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/dashboard/souscriptions/${s.id}`}
                      className="font-mono text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline">
                      {s.reference}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-gray-800 text-sm">{s.souscripteurPrenom} {s.souscripteurNom}</div>
                    <div className="text-xs text-gray-400">{s.souscripteurTelephone}</div>
                  </td>
                  <td className="text-sm text-gray-600">{s.fournisseurNom}</td>
                  <td className="text-sm text-gray-600">{s.banqueNom}</td>
                  <td className="font-semibold text-gray-800 text-sm whitespace-nowrap">{fmtCFA(s.montantTotal)}</td>
                  <td><StatusBadge statut={s.statut} /></td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(s.dateCreation).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/souscriptions/${s.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="Voir">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {s.devisId ? (
                        <Link href={`/dashboard/devis/${s.devisId.replace("DEV-", "DEV-")}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Voir le devis">
                          <FileText className="w-3.5 h-3.5" />
                        </Link>
                      ) : (user?.role === "fournisseur" || user?.role === "admin") && (
                        <Link href={`/dashboard/devis/nouveau?souscriptionId=${s.id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Créer un devis">
                          <Plus className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <button onClick={() => toast.info("Téléchargement simulé")}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Télécharger">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, pages - 4)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${pg === page ? "gradient-yellow text-amber-900 shadow-sm" : "hover:bg-gray-100"}`}>
                    {pg}
                  </button>
                );
              })}
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
