"use client";
import { getDevisBySOuscription, getFournisseursBySouscription, mockSouscriptionsVitalis } from "@/lib/vitalisData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { Building2, Eye, FileText, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

// ============================================================
// BADGE STATUT
// ============================================================
function StatutBadge({ statut }: { statut: string }) {
  const config = {
    brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
    soumise: { label: "Soumise", color: "bg-blue-100 text-blue-700" },
    en_traitement: { label: "En traitement", color: "bg-amber-100 text-amber-700" },
    validee: { label: "Validée", color: "bg-emerald-100 text-emerald-700" },
    rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
    financee: { label: "Financée", color: "bg-purple-100 text-purple-700" },
    en_preparation: { label: "En préparation", color: "bg-indigo-100 text-indigo-700" },
    livree: { label: "Livrée", color: "bg-emerald-100 text-emerald-700" },
    terminee: { label: "Terminée", color: "bg-gray-100 text-gray-500" },
  }[statut] || { label: statut, color: "bg-gray-100 text-gray-600" };

  return (
    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function SouscriptionsVitalisPage() {
  const { user } = useLDFAuthStore();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  // ─── Filtrage ─────────────────────────────────────────────
  const souscriptions = useMemo(() => {
    let filtered = [...mockSouscriptionsVitalis];

    // Filtrer par recherche
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.reference.toLowerCase().includes(s) ||
          sub.souscripteurId.toLowerCase().includes(s)
      );
    }

    // Filtrer par statut
    if (filterStatut) {
      filtered = filtered.filter((sub) => sub.statut === filterStatut);
    }

    // Trier par date (plus récent d'abord)
    filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());

    return filtered;
  }, [search, filterStatut]);

  // ─── Enrichir avec stats devis ───────────────────────────
  const souscriptionsAvecStats = useMemo(() => {
    return souscriptions.map((sub) => {
      const fournisseurs = getFournisseursBySouscription(sub.id);
      const devis = getDevisBySOuscription(sub.id);
      return {
        ...sub,
        nombreFournisseurs: fournisseurs.length,
        nombreDevis: devis.length,
        nombreDevisValides: devis.filter((d) => d.statut === "valide").length,
      };
    });
  }, [souscriptions]);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Souscriptions Vitalis</h1>
          <p className="page-subtitle">
            {souscriptionsAvecStats.length} souscription(s) — Workflow multi-fournisseurs
          </p>
        </div>
        <Link href="/dashboard/souscriptions/creer" className="btn-ldf-primary">
          <Plus className="w-4 h-4" /> Nouvelle souscription
        </Link>
      </div>

      {/* Filtres */}
      <div className="section-card">
        <div className="section-card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="ldf-label text-xs">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Référence, client..."
                  className="ldf-input pl-10 text-sm py-2"
                />
              </div>
            </div>
            <div>
              <label className="ldf-label text-xs">Statut</label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="ldf-select text-sm py-2"
              >
                <option value="">Tous les statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="soumise">Soumise</option>
                <option value="en_traitement">En traitement</option>
                <option value="validee">Validée</option>
                <option value="rejetee">Rejetée</option>
                <option value="financee">Financée</option>
                <option value="livree">Livrée</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 gap-4">
        {souscriptionsAvecStats.length === 0 ? (
          <div className="section-card">
            <div className="section-card-body text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aucune souscription trouvée</p>
              <Link href="/dashboard/souscriptions/creer" className="btn-ldf-primary text-sm">
                <Plus className="w-4 h-4" /> Créer une souscription
              </Link>
            </div>
          </div>
        ) : (
          souscriptionsAvecStats.map((sub) => (
            <div key={sub.id} className="section-card hover:shadow-md transition-shadow">
              <div className="section-card-body">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      {sub.typeSouscripteur === "physique" ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Building2 className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/souscriptions/${sub.id}`}
                        className="font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                      >
                        {sub.reference}
                      </Link>
                      <p className="text-xs text-gray-500">
                        Client {sub.souscripteurId} •{" "}
                        {sub.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
                      </p>
                    </div>
                  </div>
                  <StatutBadge statut={sub.statut} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Fournisseurs</p>
                    <p className="font-semibold text-gray-900">{sub.nombreFournisseurs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Devis créés</p>
                    <p className="font-semibold text-gray-900">
                      {sub.nombreDevis} / {sub.nombreFournisseurs}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Devis validés</p>
                    <p className="font-semibold text-emerald-600">{sub.nombreDevisValides}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Durée</p>
                    <p className="font-semibold text-gray-900">{sub.duree} mois</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Montant total</p>
                    <p className="font-bold text-amber-700">
                      {new Intl.NumberFormat("fr-FR").format(sub.montantTotal)} F
                    </p>
                  </div>
                </div>

                {/* Progress bar devis */}
                {sub.nombreFournisseurs > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Progression des devis</span>
                      <span className="font-medium text-gray-900">
                        {Math.round((sub.nombreDevis / sub.nombreFournisseurs) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                        style={{
                          width: `${(sub.nombreDevis / sub.nombreFournisseurs) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/souscriptions/${sub.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Voir la souscription
                  </Link>
                  <Link
                    href={`/dashboard/souscriptions/${sub.id}/devis`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{
                      background: "linear-gradient(135deg, #f6c90e, #f0a500)",
                    }}
                  >
                    <FileText className="w-4 h-4" /> Gérer les devis ({sub.nombreDevis})
                  </Link>
                </div>

                {sub.observations && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Note :</span> {sub.observations}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
