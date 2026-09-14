// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ChevronLeft, ChevronRight, CreditCard, Eye,
  Filter, Search, X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PaiementStatut } from "@/types/ldf";

const STATUTS: { value: PaiementStatut; label: string }[] = [
  { value: "en_cours", label: "En cours" },
  { value: "encaisse", label: "Encaissé" },
  { value: "servi",    label: "Servi"    },
];

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(isNaN(v) ? 0 : v) + " FCFA";

export default function PaiementsPage() {
  const { user } = useLDFAuthStore();
  const {
    paiements = [],
    souscriptions = [],
    syncMissingPaiements,
    getSouscriptionById,
  } = useVitalisDb();

  const [search, setSearch]             = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterBanque, setFilterBanque] = useState("");
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 10;

  // Synchronisation au montage si nécessaire
  useEffect(() => {
    if (syncMissingPaiements) {
      syncMissingPaiements();
    }
  }, [syncMissingPaiements]);

  // Fonction de normalisation du statut de paiement
  const getStatutCategory = (p: any): PaiementStatut => {
    const sub = p.souscriptionId ? getSouscriptionById(p.souscriptionId) : null;
    const rawStatut = p.statut;
    const subStatut = sub?.statut;

    if (
      rawStatut === "servi" ||
      rawStatut === "livre" ||
      subStatut === "livre" ||
      subStatut === "servie" ||
      subStatut === "cloture"
    ) {
      return "servi";
    }

    if (
      rawStatut === "encaisse" ||
      rawStatut === "termine" ||
      rawStatut === "fournisseur_paye" ||
      rawStatut === "confirme" ||
      subStatut === "fournisseur_paye" ||
      subStatut === "commande_en_preparation"
    ) {
      return "encaisse";
    }

    return "en_cours";
  };

  // Normalisation des items pour l'affichage
  const normalizedPaiements = useMemo(() => {
    return (paiements || []).map((p: any) => {
      const sub = p.souscriptionId ? getSouscriptionById(p.souscriptionId) : null;
      const souscripteurNom = p.souscripteurNom || (sub ? `${sub.souscripteurPrenom || ""} ${sub.souscripteurNom || ""}`.trim() : "Souscripteur");
      const fournisseurNom = p.repartitionFournisseurs?.[0]?.fournisseurNom || p.fournisseurNom || sub?.fournisseurNom || "Librairie de France Groupe";
      const banqueNom = p.banqueNom || sub?.banqueNom || "AFG Bank";
      const montant = p.montantTotal || p.montant || sub?.montantTotal || 0;
      const statutNormalise = getStatutCategory(p);
      const datePaiement = p.dateTransfert || p.dateValidationAFG || p.dateCreation || new Date().toISOString().split("T")[0];

      return {
        ...p,
        souscripteurNom,
        fournisseurNom,
        banqueNom,
        montant,
        statutNormalise,
        datePaiement,
      };
    });
  }, [paiements, souscriptions, getSouscriptionById]);

  // Filtrage selon recherche, statuts et rôles
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return normalizedPaiements.filter((p: any) => {
      const matchSearch = !q ||
        (p.reference && p.reference.toLowerCase().includes(q)) ||
        (p.souscriptionRef && p.souscriptionRef.toLowerCase().includes(q)) ||
        (p.souscripteurNom && p.souscripteurNom.toLowerCase().includes(q)) ||
        (p.fournisseurNom && p.fournisseurNom.toLowerCase().includes(q)) ||
        (p.banqueNom && p.banqueNom.toLowerCase().includes(q));

      const matchStatut = !filterStatut || p.statutNormalise === filterStatut;
      const matchBanque = !filterBanque || (p.banqueNom && p.banqueNom.toLowerCase().includes(filterBanque.toLowerCase()));

      // Filtrage par rôle utilisateur
      let matchRole = true;
      if (user?.role === "banque") {
        // En tant qu'AFG Bank, voit l'ensemble des paiements financés par la banque
        matchRole = !p.banqueNom || p.banqueNom.toLowerCase().includes("afg") || p.banqueId === user.organisationId;
      } else if (user?.role === "fournisseur") {
        // En tant que fournisseur, voit les paiements qui lui sont alloués
        const userFrnName = (user.organisationName || user.lastName || "").toLowerCase();
        const pFrnName = (p.fournisseurNom || "").toLowerCase();
        matchRole = pFrnName.includes(userFrnName) || pFrnName.includes("librairie") || !p.fournisseurId || p.fournisseurId === user.organisationId;
      } else if (user?.role === "souscripteur") {
        const userNomComplet = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
        matchRole = (p.souscripteurNom || "").toLowerCase().includes(userNomComplet);
      }

      return matchSearch && matchStatut && matchBanque && matchRole;
    });
  }, [normalizedPaiements, search, filterStatut, filterBanque, user]);

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatut || filterBanque;

  // Totaux KPIs calculés en direct
  const totalEnCours  = filtered.filter((p: any) => p.statutNormalise === "en_cours").reduce((s: number, p: any) => s + p.montant, 0);
  const totalEncaisse = filtered.filter((p: any) => p.statutNormalise === "encaisse").reduce((s: number, p: any) => s + p.montant, 0);
  const totalServi    = filtered.filter((p: any) => p.statutNormalise === "servi").reduce((s: number, p: any) => s + p.montant, 0);

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Paiements</h1>
          <p className="page-subtitle">{filtered.length} paiement{filtered.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* KPIs dynamiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "En cours",
            value: filtered.filter((p: any) => p.statutNormalise === "en_cours").length,
            montant: totalEnCours,
            color: "border-l-amber-400 bg-amber-50/30",
            text: "text-amber-700",
          },
          {
            label: "Encaissés",
            value: filtered.filter((p: any) => p.statutNormalise === "encaisse").length,
            montant: totalEncaisse,
            color: "border-l-green-400 bg-green-50/30",
            text: "text-green-700",
          },
          {
            label: "Servis",
            value: filtered.filter((p: any) => p.statutNormalise === "servi").length,
            montant: totalServi,
            color: "border-l-teal-400 bg-teal-50/30",
            text: "text-teal-700",
          },
        ].map((k) => (
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
            <input
              type="text"
              placeholder="Référence, souscripteur, fournisseur..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
                ${showFilters || hasFilters ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <Filter className="w-4 h-4" /> Filtres {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setFilterStatut(""); setFilterBanque(""); setPage(1); }}
                className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-100 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-5 pb-4 border-t border-gray-50 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ldf-label text-xs">Statut</label>
              <select
                value={filterStatut}
                onChange={(e) => { setFilterStatut(e.target.value); setPage(1); }}
                className="ldf-select text-sm py-2"
              >
                <option value="">Tous les statuts</option>
                {STATUTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {user?.role !== "banque" && (
              <div>
                <label className="ldf-label text-xs">Banque</label>
                <select
                  value={filterBanque}
                  onChange={(e) => { setFilterBanque(e.target.value); setPage(1); }}
                  className="ldf-select text-sm py-2"
                >
                  <option value="">Toutes les banques</option>
                  <option value="AFG Bank">AFG Bank</option>
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
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucun paiement trouvé</p>
                  </td>
                </tr>
              ) : (
                paginated.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/dashboard/paiements/${p.id}`}
                        className="font-mono text-xs font-bold text-amber-700 hover:underline"
                      >
                        {p.reference}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/souscriptions/${p.souscriptionId}`}
                        className="text-xs text-gray-500 hover:text-amber-600 font-mono"
                      >
                        {p.souscriptionRef}
                      </Link>
                    </td>
                    <td className="text-sm font-medium text-gray-800">{p.souscripteurNom}</td>
                    <td className="text-sm text-gray-600">{p.fournisseurNom}</td>
                    <td className="text-sm text-gray-600">{p.banqueNom}</td>
                    <td className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fmtCFA(p.montant)}</td>
                    <td className="text-xs text-gray-400">
                      {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td>
                      <StatusBadge statut={p.statutNormalise} />
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/paiements/${p.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        title="Voir le détail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
