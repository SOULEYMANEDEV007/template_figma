// @ts-nocheck
"use client";

import { StatusBadge } from "@/components/ui/ldf-badge";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Eye,
  Filter, Search, ShieldCheck, X, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

const STATUTS_LABELS: Record<string, string> = {
  recu: "Reçu", en_analyse: "En analyse",
  informations_demandees: "Infos demandées",
  valide: "Validé", rejete: "Rejeté",
};

const PAGE_SIZE = 10;

export default function DossiersPage() {
  const { user } = useLDFAuthStore();
  const { dossiers, updateDossier, updateSouscription } = useVitalisDb();

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [actionTarget, setActionTarget] = useState<string | null>(null); // ID du dossier en cours d'action

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dossiers.filter(d => {
      const matchSearch = !q ||
        d.reference.toLowerCase().includes(q) ||
        d.souscripteurNom.toLowerCase().includes(q) ||
        (d.souscripteurPrenom?.toLowerCase().includes(q));
      const matchStatut = !filterStatut || d.statut === filterStatut;
      return matchSearch && matchStatut;
    }).sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  }, [dossiers, search, filterStatut]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Actions banque ──────────────────────────────────────────────
  const handleValider = (dossier: typeof dossiers[0]) => {
    setActionTarget(dossier.id);
    setTimeout(() => {
      updateDossier(dossier.id, {
        statut: "valide",
        dateValidation: new Date().toISOString().split("T")[0],
        commentaireAFG: "Dossier conforme aux conditions du programme Vitalis. Financement accordé.",
      });
      updateSouscription(dossier.souscriptionId, { statut: "validee" });
      toast.success(`Dossier ${dossier.reference} validé — Financement AFG accordé ✓`);
      setActionTarget(null);
    }, 800);
  };

  const handleRejeter = (dossier: typeof dossiers[0]) => {
    setActionTarget(dossier.id);
    setTimeout(() => {
      updateDossier(dossier.id, {
        statut: "rejete",
        motifRejet: "Dossier incomplet — pièces justificatives manquantes.",
      });
      updateSouscription(dossier.souscriptionId, { statut: "rejetee" });
      toast.error(`Dossier ${dossier.reference} rejeté`);
      setActionTarget(null);
    }, 800);
  };

  const canAct = user?.role === "banque" || user?.role === "admin";

  const statsBar = {
    total: dossiers.length,
    enAttente: dossiers.filter(d => d.statut === "recu" || d.statut === "en_analyse").length,
    valides: dossiers.filter(d => d.statut === "valide").length,
    rejetes: dossiers.filter(d => d.statut === "rejete").length,
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers AFG Bank</h1>
          <p className="page-subtitle">
            {filtered.length} dossier{filtered.length > 1 ? "s" : ""} · <span className="font-bold text-orange-600">AFG Bank — Programme Vitalis</span>
          </p>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total dossiers", value: statsBar.total, color: "bg-gray-50 text-gray-700" },
          { label: "En attente", value: statsBar.enAttente, color: "bg-orange-50 text-orange-700" },
          { label: "Validés", value: statsBar.valides, color: "bg-green-50 text-green-700" },
          { label: "Rejetés", value: statsBar.rejetes, color: "bg-red-50 text-red-700" },
        ].map(k => (
          <div key={k.label} className={`rounded-xl p-3 ${k.color}`}>
            <p className="text-2xl font-extrabold">{k.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="section-card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par référence ou souscripteur..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
              ${showFilters ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600"}`}
          >
            <Filter className="w-4 h-4" /> Filtres
          </button>
          {(search || filterStatut) && (
            <button onClick={() => { setSearch(""); setFilterStatut(""); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {showFilters && (
          <div className="pt-2 border-t border-gray-100">
            <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none">
              <option value="">Tous les statuts</option>
              {Object.entries(STATUTS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table dossiers */}
      <div className="section-card overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShieldCheck className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Référence</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Souscripteur</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Fournisseur(s)</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Montant</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Statut</th>
                  {canAct && <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Actions banque</th>}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(d => {
                  const isActing = actionTarget === d.id;
                  const canValidate = canAct && (d.statut === "recu" || d.statut === "en_analyse" || d.statut === "informations_demandees");
                  return (
                    <tr key={d.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/dossiers/${d.id}`} className="font-mono text-xs font-bold text-[#ff6b35] hover:underline">
                          {d.reference}
                        </Link>
                        <p className="text-[10px] text-gray-400">{new Date(d.dateCreation).toLocaleDateString("fr-FR")}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-800">{d.souscripteurPrenom} {d.souscripteurNom}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{d.typeSouscripteur}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-600 truncate max-w-[150px]">{d.fournisseursNoms}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-right">
                        <span className="text-xs font-bold text-gray-800">{fmtCFA(d.montantTotal)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge statut={d.statut} size="sm" />
                      </td>
                      {canAct && (
                        <td className="px-4 py-3">
                          {canValidate ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleValider(d)}
                                disabled={isActing}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {isActing ? "..." : "Valider"}
                              </button>
                              <button
                                onClick={() => handleRejeter(d)}
                                disabled={isActing}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" />
                                {isActing ? "..." : "Rejeter"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-300 text-center block">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/dossiers/${d.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors font-medium w-fit">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${p === page ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
