// @ts-nocheck
"use client";
import { getDevisBySOuscription, getFournisseursBySouscription, mockDevisVitalis, mockFournisseursVitalis, mockSouscriptionsVitalis } from "@/lib/vitalisData";
import { VITALIS_CONFIG } from "@/types/vitalis";
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Eye, FileText, Package, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

// ============================================================
// BADGE STATUT DEVIS
// ============================================================
function DevisStatutBadge({ statut }: { statut: string }) {
  const config = {
    brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-700 border-gray-200" },
    envoye: { label: "Envoyé", color: "bg-blue-100 text-blue-700 border-blue-200" },
    en_attente_validation: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" },
    valide: { label: "Validé", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    refuse: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200" },
    expire: { label: "Expiré", color: "bg-gray-100 text-gray-500 border-gray-200" },
  }[statut] || { label: statut, color: "bg-gray-100 text-gray-600" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function DevisMultiplesSouscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const souscriptionId = params.id as string;

  // ─── Données ──────────────────────────────────────────────
  const souscription = useMemo(
    () => mockSouscriptionsVitalis.find((s) => s.id === souscriptionId),
    [souscriptionId]
  );

  const associations = useMemo(
    () => getFournisseursBySouscription(souscriptionId),
    [souscriptionId]
  );

  const devis = useMemo(
    () => getDevisBySOuscription(souscriptionId),
    [souscriptionId]
  );

  // ─── Calculs ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = devis.reduce((sum, d) => sum + d.totalTTC, 0);
    const valides = devis.filter((d) => d.statut === "valide").length;
    const enAttente = devis.filter((d) => d.statut === "en_attente_validation").length;

    return { total, valides, enAttente, totalDevis: devis.length };
  }, [devis]);

  // ─── Handlers ─────────────────────────────────────────────
  const handleCreerDevis = (fournisseurId: string) => {
    toast.info(`Redirection vers création devis pour fournisseur ${fournisseurId}`);
    // TODO: Router vers formulaire création devis
  };

  const handleImprimerTous = () => {
    toast.info("Génération du PDF avec tous les devis...");
    // TODO: Implémenter génération PDF multiple
  };

  if (!souscription) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Souscription introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">Devis multiples</h1>
            <p className="page-subtitle">
              Souscription {souscription.reference} — {associations.length} fournisseur(s)
            </p>
          </div>
        </div>

        <button
          onClick={handleImprimerTous}
          className="btn-ldf-outline text-sm py-2 px-4"
          disabled={devis.length === 0}
        >
          <Printer className="w-4 h-4" /> Imprimer tous les devis
        </button>
      </div>

      {/* Info souscription */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-800">Informations de la souscription</h2>
          </div>
        </div>
        <div className="section-card-body">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Référence</p>
              <p className="font-medium text-gray-900">{souscription.reference}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type client</p>
              <p className="font-medium text-gray-900">
                {souscription.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Durée</p>
              <p className="font-medium text-gray-900">{souscription.duree} mois</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              <DevisStatutBadge statut={souscription.statut} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="section-card">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total devis</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalDevis}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Validés</p>
                <p className="text-xl font-bold text-gray-900">{stats.valides}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">En attente</p>
                <p className="text-xl font-bold text-gray-900">{stats.enAttente}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="section-card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-amber-700">Montant total</p>
                <p className="text-lg font-bold text-amber-900">
                  {new Intl.NumberFormat("fr-FR").format(Math.round(stats.total))} F
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des fournisseurs et leurs devis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Devis par fournisseur</h2>
          <span className="text-sm text-gray-500">{associations.length} fournisseur(s) associé(s)</span>
        </div>

        {associations.length === 0 ? (
          <div className="section-card">
            <div className="section-card-body text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aucun fournisseur associé à cette souscription</p>
              <Link href={`/dashboard/souscriptions/${souscriptionId}/edit`} className="btn-ldf-primary text-sm">
                Ajouter des fournisseurs
              </Link>
            </div>
          </div>
        ) : (
          associations.map((association) => {
            const fournisseur = mockFournisseursVitalis.find((f) => f.id === association.fournisseurId);
            const devisFournisseur = devis.find((d) => d.fournisseurId === association.fournisseurId);

            if (!fournisseur) return null;

            return (
              <div key={association.id} className="section-card hover:shadow-md transition-shadow">
                <div className="section-card-header">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {fournisseur.code.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{fournisseur.nom}</p>
                        <p className="text-xs text-gray-500">{fournisseur.ville}</p>
                      </div>
                    </div>

                    {devisFournisseur && <DevisStatutBadge statut={devisFournisseur.statut} />}
                  </div>
                </div>

                <div className="section-card-body">
                  {devisFournisseur ? (
                    <div className="space-y-4">
                      {/* Infos devis */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Référence</p>
                          <p className="font-medium text-gray-900">{devisFournisseur.reference}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Articles</p>
                          <p className="font-medium text-gray-900">{devisFournisseur.articles.length} article(s)</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Montant HT</p>
                          <p className="font-medium text-gray-900">
                            {new Intl.NumberFormat("fr-FR").format(devisFournisseur.totalHT)} F
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Montant TTC</p>
                          <p className="font-bold text-amber-700">
                            {new Intl.NumberFormat("fr-FR").format(devisFournisseur.totalTTC)} F
                          </p>
                        </div>
                      </div>

                      {/* Articles */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Articles du devis</p>
                        <div className="space-y-2">
                          {devisFournisseur.articles.slice(0, 3).map((article) => (
                            <div
                              key={article.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{article.designation}</p>
                                <p className="text-xs text-gray-500">
                                  {article.quantite} × {new Intl.NumberFormat("fr-FR").format(article.prixUnitaire)} F
                                  {article.remise > 0 && (
                                    <span className="text-emerald-600 ml-2">(-{article.remise}%)</span>
                                  )}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {new Intl.NumberFormat("fr-FR").format(article.montantHT)} F
                              </p>
                            </div>
                          ))}
                          {devisFournisseur.articles.length > 3 && (
                            <p className="text-xs text-gray-500 text-center py-1">
                              + {devisFournisseur.articles.length - 3} autre(s) article(s)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Conditions livraison */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Conditions de livraison</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                          <div>
                            <span className="text-blue-600">Grand Abidjan :</span>{" "}
                            <span className="font-medium">{VITALIS_CONFIG.DELAI_LIVRAISON_ABIDJAN}</span>
                          </div>
                          <div>
                            <span className="text-blue-600">Intérieur :</span>{" "}
                            <span className="font-medium">{VITALIS_CONFIG.DELAI_LIVRAISON_INTERIEUR}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-blue-600">Validité :</span>{" "}
                            <span className="font-medium">{VITALIS_CONFIG.VALIDITE_DEVIS}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/devis/${devisFournisseur.id}`}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Voir le détail
                        </Link>
                        <button
                          onClick={() => toast.info("Impression du devis...")}
                          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                          title="Imprimer le devis"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4 text-sm">Aucun devis créé pour ce fournisseur</p>
                      <button
                        onClick={() => handleCreerDevis(fournisseur.id)}
                        className="btn-ldf-primary text-sm"
                      >
                        <Plus className="w-4 h-4" /> Créer le devis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info importante */}
      {associations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Workflow multi-fournisseurs Vitalis</p>
              <ul className="space-y-1 text-xs">
                <li>• Chaque fournisseur doit créer son propre devis avec ses articles</li>
                <li>• AFG Bank validera le dossier global contenant tous les devis</li>
                <li>
                  • Le montant total de la souscription est la somme de tous les devis :{" "}
                  <strong>{new Intl.NumberFormat("fr-FR").format(Math.round(stats.total))} FCFA</strong>
                </li>
                <li>• Chaque fournisseur sera payé individuellement après validation AFG Bank</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
