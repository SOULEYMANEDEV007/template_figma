"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockDossiers, mockSouscriptions } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { ChevronLeft, ChevronRight, Eye, Filter, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function BanqueSouscripteursPage() {
  const { user } = useLDFAuthStore();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // On prend les souscriptions liées à cette banque
  const allSubs = useMemo(() =>
    mockSouscriptions.filter(s =>
      user?.role === "banque" ? s.banqueId === user.organisationId : true
    ), [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allSubs.filter(s => {
      const matchSearch = !q ||
        `${s.souscripteurNom} ${s.souscripteurPrenom}`.toLowerCase().includes(q) ||
        s.reference.toLowerCase().includes(q) ||
        s.fournisseurNom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || s.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [allSubs, search, filterStatut]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut;

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Souscripteurs</h1>
          <p className="page-subtitle">{filtered.length} souscripteur{filtered.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",      value: allSubs.length,                                      color: "border-l-amber-400 text-amber-700" },
          { label: "En attente", value: allSubs.filter(s => s.statut === "en_attente").length, color: "border-l-orange-400 text-orange-700" },
          { label: "Validés",    value: allSubs.filter(s => s.statut === "validee" || s.statut === "payee" || s.statut === "servie").length, color: "border-l-emerald-400 text-emerald-700" },
          { label: "Rejetés",    value: allSubs.filter(s => s.statut === "rejetee").length, color: "border-l-red-400 text-red-700" },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${k.color.split(" ")[0]}`}>
            <p className={`text-2xl font-bold ${k.color.split(" ")[1]}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="px-5 py-3.5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Nom, référence, fournisseur..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
                ${showFilters || hasFilters ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              <Filter className="w-4 h-4" /> Filtres {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setFilterStatut(""); setPage(1); }}
                className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-100 flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-5 pb-4 border-t border-gray-50 pt-3">
            <label className="ldf-label text-xs">Statut</label>
            <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }} className="ldf-select text-sm py-2 max-w-xs">
              <option value="">Tous</option>
              {["soumise","en_attente","validee","rejetee","payee","servie"].map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Souscripteur</th>
                <th>Fournisseur</th>
                <th>Réf. souscription</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucun souscripteur trouvé</p>
                </td></tr>
              ) : paginated.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="font-medium text-gray-800">{s.souscripteurPrenom} {s.souscripteurNom}</div>
                    <div className="text-xs text-gray-400">{s.souscripteurTelephone}</div>
                  </td>
                  <td className="text-sm text-gray-600">{s.fournisseurNom}</td>
                  <td>
                    <Link href={`/dashboard/souscriptions/${s.id}`}
                      className="font-mono text-xs font-bold text-amber-700 hover:underline">{s.reference}</Link>
                  </td>
                  <td className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fmtCFA(s.montantTotal)}</td>
                  <td className="text-xs text-gray-400">{new Date(s.dateCreation).toLocaleDateString("fr-FR")}</td>
                  <td><StatusBadge statut={s.statut} /></td>
                  <td>
                    <Link href={`/dashboard/souscriptions/${s.id}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
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
