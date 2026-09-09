"use client";
import { getDevisBySOuscription, getFournisseursBySouscription, mockDossiersVitalis, mockFournisseursVitalis, mockSouscriptionsVitalis } from "@/lib/vitalisData";
import { CheckCircle, Clock, Eye, FileText, Search, TrendingUp, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

// ============================================================
// BADGE STATUT DOSSIER
// ============================================================
function StatutDossierBadge({ statut }: { statut: string }) {
  const config = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    en_cours_validation: { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    valide: { label: "Validé", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    rejete: { label: "Rejeté", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    finance: { label: "Financé", color: "bg-purple-100 text-purple-700 border-purple-200", icon: TrendingUp },
  }[statut] || { label: statut, color: "bg-gray-100 text-gray-600 border-gray-200", icon: FileText };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function DossiersVitalisAFGBankPage() {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  // ─── Filtrage ─────────────────────────────────────────────
  const dossiers = useMemo(() => {
    let filtered = [...mockDossiersVitalis];

    // Filtrer par recherche
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (dossier) =>
          dossier.reference.toLowerCase().includes(s) ||
          dossier.souscriptionId.toLowerCase().includes(s)
      );
    }

    // Filtrer par statut
    if (filterStatut) {
      filtered = filtered.filter((d) => d.statut === filterStatut);
    }

    // Trier par date (plus récent d'abord)
    filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());

    return filtered;
  }, [search, filterStatut]);

  // ─── Enrichir avec données complètes ──────────────────────
  const dossiersEnrichis = useMemo(() => {
    return dossiers.map((dossier) => {
      const souscription = mockSouscriptionsVitalis.find((s) => s.id === dossier.souscriptionId);
      const devis = dossier.devisIds.map((id) => 
        getDevisBySOuscription(dossier.souscriptionId).find((d) => d.id === id)
      ).filter(Boolean);
      
      const fournisseurs = getFournisseursBySouscription(dossier.souscriptionId);
      
      const montantTotal = devis.reduce((sum, d) => sum + (d?.totalTTC || 0), 0);
      const nombreDevis = devis.length;
      const nombreFournisseurs = fournisseurs.length;

      return {
        ...dossier,
        souscription,
        devis,
        fournisseurs,
        montantTotal,
        nombreDevis,
        nombreFournisseurs,
      };
    });
  }, [dossiers]);

  // ─── Statistiques globales ────────────────────────────────
  const stats = useMemo(() => {
    const total = dossiersEnrichis.length;
    const enAttente = dossiersEnrichis.filter((d) => d.statut === "en_attente" || d.statut === "en_cours_validation").length;
    const valides = dossiersEnrichis.filter((d) => d.statut === "valide").length;
    const rejetes = dossiersEnrichis.filter((d) => d.statut === "rejete").length;
    const montantTotalValide = dossiersEnrichis
      .filter((d) => d.statut === "valide" || d.statut === "finance")
      .reduce((sum, d) => sum + d.montantTotal, 0);

    return { total, enAttente, valides, rejetes, montantTotalValide };
  }, [dossiersEnrichis]);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers Vitalis - AFG Bank</h1>
          <p className="page-subtitle">
            {stats.total} dossier(s) • {stats.enAttente} en attente de validation
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="section-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-blue-700">Total dossiers</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-amber-700">En attente</p>
                <p className="text-2xl font-bold text-amber-900">{stats.enAttente}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-emerald-700">Validés</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.valides}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-purple-700">Montant validé</p>
                <p className="text-lg font-bold text-purple-900">
                  {new Intl.NumberFormat("fr-FR", { notation: "compact", compactDisplay: "short" }).format(stats.montantTotalValide)} F
                </p>
              </div>
            </div>
          </div>
        </div>
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
                  placeholder="Référence dossier, souscription..."
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
                <option value="en_attente">En attente</option>
                <option value="en_cours_validation">En cours validation</option>
                <option value="valide">Validé</option>
                <option value="rejete">Rejeté</option>
                <option value="finance">Financé</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des dossiers */}
      <div className="grid grid-cols-1 gap-4">
        {dossiersEnrichis.length === 0 ? (
          <div className="section-card">
            <div className="section-card-body text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucun dossier trouvé</p>
            </div>
          </div>
        ) : (
          dossiersEnrichis.map((dossier) => (
            <div key={dossier.id} className="section-card hover:shadow-md transition-shadow">
              <div className="section-card-body">
                {/* En-tête */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/banque/dossiers/${dossier.id}`}
                        className="font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                      >
                        {dossier.reference}
                      </Link>
                      <p className="text-xs text-gray-500">
                        Souscription {dossier.souscription?.reference || dossier.souscriptionId}
                      </p>
                    </div>
                  </div>
                  <StatutDossierBadge statut={dossier.statut} />
                </div>

                {/* Informations clés */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Fournisseurs</p>
                    <p className="font-semibold text-gray-900">{dossier.nombreFournisseurs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Devis inclus</p>
                    <p className="font-semibold text-gray-900">{dossier.nombreDevis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Montant total</p>
                    <p className="font-bold text-amber-700">
                      {new Intl.NumberFormat("fr-FR").format(dossier.montantTotal)} F
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date création</p>
                    <p className="text-sm text-gray-800">
                      {new Date(dossier.dateCreation).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Durée</p>
                    <p className="text-sm text-gray-800">
                      {dossier.souscription?.duree || 36} mois
                    </p>
                  </div>
                </div>

                {/* Liste des devis par fournisseur */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Détail par fournisseur ({dossier.nombreDevis})
                  </p>
                  <div className="space-y-2">
                    {dossier.devis.slice(0, 3).map((devis) => {
                      if (!devis) return null;
                      const fournisseur = mockFournisseursVitalis.find((f) => f.id === devis.fournisseurId);
                      return (
                        <div
                          key={devis.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                              {fournisseur?.code.substring(0, 2) || "FN"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{fournisseur?.nom || "Fournisseur"}</p>
                              <p className="text-xs text-gray-500">
                                {devis.reference} • {devis.articles.length} article(s)
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-amber-700">
                            {new Intl.NumberFormat("fr-FR").format(devis.totalTTC)} F
                          </p>
                        </div>
                      );
                    })}
                    {dossier.nombreDevis > 3 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        + {dossier.nombreDevis - 3} autre(s) devis
                      </p>
                    )}
                  </div>
                </div>

                {/* Commentaire banque si présent */}
                {dossier.commentaireBanque && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${
                    dossier.statut === "valide"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : dossier.statut === "rejete"
                      ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-blue-50 border border-blue-200 text-blue-800"
                  }`}>
                    <p className="font-semibold mb-1">Commentaire AFG Bank :</p>
                    <p>{dossier.commentaireBanque}</p>
                  </div>
                )}

                {/* Motif rejet si présent */}
                {dossier.motifRejet && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 mb-4">
                    <p className="font-semibold mb-1">Motif du rejet :</p>
                    <p>{dossier.motifRejet}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/banque/dossiers/${dossier.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Examiner le dossier
                  </Link>
                  {(dossier.statut === "en_attente" || dossier.statut === "en_cours_validation") && (
                    <Link
                      href={`/dashboard/banque/dossiers/${dossier.id}/validation`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors"
                      style={{ background: "linear-gradient(135deg, #f6c90e, #f0a500)" }}
                    >
                      <CheckCircle className="w-4 h-4" /> Valider / Rejeter
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info workflow Vitalis */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Workflow de validation AFG Bank</p>
            <ul className="space-y-1 text-xs">
              <li>• Un <strong>dossier</strong> regroupe TOUS les devis de TOUS les fournisseurs d'une même souscription</li>
              <li>• Vous validez ou rejetez le dossier <strong>dans sa globalité</strong></li>
              <li>• Si validé, le paiement est réparti automatiquement vers chaque fournisseur</li>
              <li>• Le montant total financé = somme de tous les devis du dossier</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
