// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockPaiements, mockBanques } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ChevronLeft, ChevronRight, CreditCard, Eye,
  Filter, Search, X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PaiementStatut } from "@/types/ldf";

const STATUTS: { value: PaiementStatut; label: string }[] = [
  { value: "en_cours", label: "En cours"  },
  { value: "encaisse", label: "Encaissé"  },
  { value: "servi",    label: "Servi"     },
];
const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function PaiementsPage() {
  const { user } = useLDFAuthStore();
  const [search, setSearch]             = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterBanque, setFilterBanque] = useState("");
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockPaiements.filter(p => {
      const matchSearch = !q ||
        p.reference.toLowerCase().includes(q) ||
        `${p.souscripteurNom} ${p.souscripteurPrenom}`.toLowerCase().includes(q) ||
        p.fournisseurNom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || p.statut === filterStatut;
      const matchBanque = !filterBanque || p.banqueId === filterBanque;
      const matchRole   = user?.role !== "banque" || p.banqueId === user.organisationId;
      const matchFrn    = user?.role !== "fournisseur" || p.fournisseurId === user.organisationId;
      return matchSearch && matchStatut && matchBanque && matchRole && matchFrn;
    });
  }, [search, filterStatut, filterBanque, user]);

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut || filterBanque;

  // Totaux
  const totalEncaisse = filtered.filter(p => p.statut === "encaisse").reduce((s, p) => s + p.montant, 0);
  const totalEnCours  = filtered.filter(p => p.statut === "en_cours").reduce((s, p)  => s + p.montant, 0);
  const totalServi    = filtered.filter(p => p.statut === "servi").reduce((s, p)     => s + p.montant, 0);

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Paiements</h1>
          <p className="page-subtitle">{filtered.length} paiement{filtered.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "En cours",   value: filtered.filter(p => p.statut === "en_cours").length, montant: totalEnCours, color: "border-l-amber-400 bg-amber-50/30", text: "text-amber-700" },
          { label: "Encaissés",  value: filtered.filter(p => p.statut === "encaisse").length, montant: totalEncaisse, color: "border-l-green-400 bg-green-50/30",  text: "text-green-700" },
          { label: "Servis",     value: filtered.filter(p => p.statut === "servi").length,    montant: totalServi,    color: "border-l-teal-400 bg-teal-50/30",    text: "text-teal-700"  },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${k.color}`}>
            <p className={`text-2xl font-bold ${k.text}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{fmtCFA(k.montant)}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="section-card">
        {/* Toolbar */}
        <div className="px-5 py-3.5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Référence, souscripteur..."
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
              <button onClick={() => { setSearch(""); setFilterStatut(""); setFilterBanque(""); setPage(1); }}
                className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-100 flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-5 pb-4 border-t border-gray-50 pt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="ldf-label text-xs">Statut</label>
              <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                <option value="">Tous</option>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {user?.role !== "banque" && (
              <div>
                <label className="ldf-label text-xs">Banque</label>
                <select value={filterBanque} onChange={e => { setFilterBanque(e.target.value); setPage(1); }} className="ldf-select text-sm py-2">
                  <option value="">Toutes</option>
                  {mockBanques.map(b => <option key={b.id} value={b.id}>{b.sigle}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

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
                <th>Date paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center">
                  <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucun paiement trouvé</p>
                </td></tr>
              ) : paginated.map(p => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/paiements/${p.id}`}
                      className="font-mono text-xs font-bold text-amber-700 hover:underline">{p.reference}</Link>
                  </td>
                  <td>
                    <Link href={`/dashboard/souscriptions/${p.souscriptionId}`}
                      className="text-xs text-gray-500 hover:text-amber-600">{p.souscriptionRef}</Link>
                  </td>
                  <td className="text-sm font-medium text-gray-800">{p.souscripteurPrenom} {p.souscripteurNom}</td>
                  <td className="text-sm text-gray-600">{p.fournisseurNom}</td>
                  <td className="text-sm text-gray-600">{p.banqueNom}</td>
                  <td className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fmtCFA(p.montant)}</td>
                  <td className="text-xs text-gray-400">{new Date(p.datePaiement).toLocaleDateString("fr-FR")}</td>
                  <td><StatusBadge statut={p.statut} /></td>
                  <td>
                    <Link href={`/dashboard/paiements/${p.id}`}
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
