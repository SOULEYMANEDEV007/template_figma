"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockDevis, mockBanques, mockFournisseurs } from "@/lib/ldfData";
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Filter, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { DevisStatut } from "@/types/ldf";
import { useLDFAuthStore } from "@/stores/ldfAuth";

const STATUTS: DevisStatut[] = ["brouillon", "envoye", "en_attente_validation", "valide", "refuse", "expire"];
const LABELS: Record<DevisStatut, string> = {
  brouillon: "Brouillon", envoye: "Envoyé", en_attente_validation: "En attente",
  valide: "Validé", refuse: "Refusé", expire: "Expiré",
};
const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function DevisPage() {
  const { user } = useLDFAuthStore();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterBanque, setFilterBanque] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockDevis.filter(d => {
      const matchSearch = !q || d.reference.toLowerCase().includes(q) || d.souscripteurNom.toLowerCase().includes(q) || d.fournisseurNom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || d.statut === filterStatut;
      const matchBanque = !filterBanque || d.banqueId === filterBanque;
      return matchSearch && matchStatut && matchBanque;
    });
  }, [search, filterStatut, filterBanque]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut || filterBanque;

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Devis</h1>
          <p className="page-subtitle">{filtered.length} devis{hasFilters ? " filtrés" : " au total"}</p>
        </div>
        {(user?.role === "admin" || user?.role === "fournisseur") && (
          <Link href="/dashboard/devis/nouveau" className="btn-ldf-primary">
            <Plus className="w-4 h-4" /> Nouveau devis
          </Link>
        )}
      </div>

      <div className="section-card">
        <div className="px-5 py-3.5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Référence, souscripteur..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${showFilters || hasFilters ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              <Filter className="w-4 h-4" /> Filtres {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setFilterStatut(""); setFilterBanque(""); setPage(1); }}
                className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-100">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-5 pb-4 border-t border-gray-50 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="ldf-label text-xs">Statut</label>
              <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                <option value="">Tous</option>
                {STATUTS.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="ldf-label text-xs">Banque</label>
              <select value={filterBanque} onChange={e => { setFilterBanque(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                <option value="">Toutes</option>
                {mockBanques.map(b => <option key={b.id} value={b.id}>{b.sigle}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Souscription</th>
                <th>Souscripteur</th>
                <th>Montant TTC</th>
                <th>Date</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />Aucun devis trouvé</td></tr>
              ) : paginated.map(d => {
                const isExpiringSoon = d.statut === "en_attente_validation" &&
                  new Date(d.dateExpiration) < new Date(Date.now() + 7 * 86400000);
                return (
                  <tr key={d.id}>
                    <td>
                      <Link href={`/dashboard/devis/${d.id}`}
                        className="font-mono text-xs font-bold text-amber-700 hover:underline">{d.reference}</Link>
                    </td>
                    <td>
                      <Link href={`/dashboard/souscriptions/${d.souscriptionId}`}
                        className="text-xs text-gray-500 hover:text-amber-600">{d.souscriptionRef}</Link>
                    </td>
                    <td className="text-sm text-gray-800 font-medium">{d.souscripteurNom}</td>
                    <td className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fmtCFA(d.totalTTC)}</td>
                    <td className="text-xs text-gray-400">{new Date(d.dateCreation).toLocaleDateString("fr-FR")}</td>
                    <td className={`text-xs ${isExpiringSoon ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
                      {new Date(d.dateExpiration).toLocaleDateString("fr-FR")}
                      {isExpiringSoon && " ⚠️"}
                    </td>
                    <td><StatusBadge statut={d.statut} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/devis/${d.id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => toast.info("PDF simulé")}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
