"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockDossiers, mockBanques, mockFournisseurs } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ChevronLeft, ChevronRight, Eye, Filter,
  ShieldCheck, Search, X, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DossierStatut } from "@/types/ldf";

const STATUTS: { value: DossierStatut; label: string }[] = [
  { value: "recu",                  label: "Reçu"             },
  { value: "en_cours_traitement",   label: "En traitement"    },
  { value: "valide",                label: "Validé"           },
  { value: "rejete",                label: "Rejeté"           },
  { value: "informations_demandees",label: "Infos demandées"  },
];

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function DossiersPage() {
  const { user } = useLDFAuthStore();
  const [search, setSearch]               = useState("");
  const [filterStatut, setFilterStatut]   = useState("");
  const [filterBanque, setFilterBanque]   = useState("");
  const [showFilters, setShowFilters]     = useState(false);
  const [page, setPage]                   = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockDossiers.filter(d => {
      const matchSearch = !q ||
        d.reference.toLowerCase().includes(q) ||
        `${d.souscripteurNom} ${d.souscripteurPrenom}`.toLowerCase().includes(q) ||
        d.banqueNom.toLowerCase().includes(q) ||
        d.fournisseurNom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || d.statut === filterStatut;
      const matchBanque = !filterBanque || d.banqueId === filterBanque;
      // banque voit uniquement ses dossiers
      const matchRole = user?.role !== "banque" || d.banqueId === user.organisationId;
      return matchSearch && matchStatut && matchBanque && matchRole;
    });
  }, [search, filterStatut, filterBanque, user]);

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut || filterBanque;

  // Compteurs par statut
  const counts = useMemo(() => {
    const all = user?.role === "banque"
      ? mockDossiers.filter(d => d.banqueId === user.organisationId)
      : mockDossiers;
    return {
      en_cours:   all.filter(d => d.statut === "en_cours_traitement").length,
      valides:    all.filter(d => d.statut === "valide").length,
      rejetes:    all.filter(d => d.statut === "rejete").length,
      infos:      all.filter(d => d.statut === "informations_demandees").length,
    };
  }, [user]);

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers</h1>
          <p className="page-subtitle">
            {filtered.length} dossier{filtered.length > 1 ? "s" : ""}
            {hasFilters ? " filtré" : ""}{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── KPIs rapides ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "En traitement",      value: counts.en_cours, color: "border-l-amber-400  bg-amber-50/30",  text: "text-amber-700"   },
          { label: "Validés",            value: counts.valides,  color: "border-l-emerald-400 bg-emerald-50/30",text: "text-emerald-700" },
          { label: "Rejetés",            value: counts.rejetes,  color: "border-l-red-400    bg-red-50/30",    text: "text-red-700"     },
          { label: "Infos demandées",    value: counts.infos,    color: "border-l-orange-400 bg-orange-50/30", text: "text-orange-700"  },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${k.color}`}>
            <p className={`text-2xl font-bold ${k.text}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Table + filtres ── */}
      <div className="section-card">
        {/* Toolbar */}
        <div className="px-5 py-3.5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text" placeholder="Référence, souscripteur, banque..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
                ${showFilters || hasFilters
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <Filter className="w-4 h-4" />
              Filtres {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setFilterStatut(""); setFilterBanque(""); setPage(1); }}
                className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-100 flex items-center gap-1"
              >
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
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {user?.role !== "banque" && (
              <div>
                <label className="ldf-label text-xs">Banque</label>
                <select value={filterBanque} onChange={e => { setFilterBanque(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                  <option value="">Toutes les banques</option>
                  {mockBanques.map(b => <option key={b.id} value={b.id}>{b.sigle}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Souscription</th>
                <th>Souscripteur</th>
                <th>Fournisseur</th>
                <th>Banque</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date réception</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <ShieldCheck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucun dossier trouvé</p>
                  </td>
                </tr>
              ) : paginated.map(d => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/dashboard/dossiers/${d.id}`}
                      className="font-mono text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline">
                      {d.reference}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/dashboard/souscriptions/${d.souscriptionId}`}
                      className="text-xs text-gray-500 hover:text-amber-600">
                      {d.souscriptionRef}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-gray-800 text-sm">
                      {d.souscripteurPrenom} {d.souscripteurNom}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{d.fournisseurNom}</td>
                  <td className="text-sm text-gray-600">{d.banqueNom}</td>
                  <td className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {fmtCFA(d.montant)}
                  </td>
                  <td><StatusBadge statut={d.statut} /></td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(d.dateReception).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/dossiers/${d.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        title="Voir le dossier">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {(d.statut === "en_cours_traitement" || d.statut === "recu") &&
                       (user?.role === "banque" || user?.role === "admin") && (
                        <Link href={`/dashboard/dossiers/${d.id}`}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                          <AlertCircle className="w-3 h-3" /> Traiter
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                      ${pg === page ? "gradient-yellow text-amber-900 shadow-sm" : "hover:bg-gray-100"}`}>
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
