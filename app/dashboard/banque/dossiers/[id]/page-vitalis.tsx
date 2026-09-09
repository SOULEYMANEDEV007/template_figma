"use client";
import { AFG_BANK, getDevisBySOuscription, getFournisseursBySouscription, mockDossiersVitalis, mockFournisseursVitalis, mockSouscripteursMorales, mockSouscripteursPhysiques, mockSouscriptionsVitalis } from "@/lib/vitalisData";
import { ArrowLeft, Building2, CheckCircle, Clock, Download, Eye, FileText, Package, Printer, User, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ============================================================
// BADGE STATUT
// ============================================================
function StatutBadge({ statut }: { statut: string }) {
  const config = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
    en_cours_validation: { label: "En cours", color: "bg-blue-100 text-blue-700" },
    valide: { label: "Validé", color: "bg-emerald-100 text-emerald-700" },
    rejete: { label: "Rejeté", color: "bg-red-100 text-red-700" },
    finance: { label: "Financé", color: "bg-purple-100 text-purple-700" },
  }[statut] || { label: statut, color: "bg-gray-100 text-gray-600" };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function DossierDetailVitalisPage() {
  const params = useParams();
  const router = useRouter();
  const dossierId = params.id as string;

  const [showValidationModal, setShowValidationModal] = useState(false);

  // ─── Données ──────────────────────────────────────────────
  const dossier = useMemo(
    () => mockDossiersVitalis.find((d) => d.id === dossierId),
    [dossierId]
  );

  const souscription = useMemo(
    () => dossier ? mockSouscriptionsVitalis.find((s) => s.id === dossier.souscriptionId) : null,
    [dossier]
  );

  const souscripteur = useMemo(() => {
    if (!souscription) return null;
    return souscription.typeSouscripteur === "physique"
      ? mockSouscripteursPhysiques.find((s) => s.id === souscription.souscripteurId)
      : mockSouscripteursMorales.find((s) => s.id === souscription.souscripteurId);
  }, [souscription]);

  const devis = useMemo(() => {
    if (!dossier) return [];
    return dossier.devisIds
      .map((id) => getDevisBySOuscription(dossier.souscriptionId).find((d) => d.id === id))
      .filter(Boolean);
  }, [dossier]);

  const fournisseurs = useMemo(() => {
    if (!dossier) return [];
    return getFournisseursBySouscription(dossier.souscriptionId);
  }, [dossier]);

  const agence = useMemo(() => {
    if (!souscription) return null;
    return AFG_BANK.agences.find((a) => a.id === souscription.agenceBanqueId);
  }, [souscription]);

  // ─── Calculs ──────────────────────────────────────────────
  const montantTotal = useMemo(
    () => devis.reduce((sum, d) => sum + (d?.totalTTC || 0), 0),
    [devis]
  );

  const montantMensuel = useMemo(() => {
    if (!souscription) return 0;
    return montantTotal / souscription.duree;
  }, [montantTotal, souscription]);

  // ─── Handlers ─────────────────────────────────────────────
  const handleExportPDF = () => {
    toast.info("Génération PDF dossier complet...");
    // TODO: Implémenter export PDF multi-devis
  };

  if (!dossier || !souscription || !souscripteur) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Dossier introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
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
            <h1 className="page-title">{dossier.reference}</h1>
            <p className="page-subtitle">
              Dossier de financement Vitalis • AFG Bank
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-ldf-outline text-sm py-2 px-4">
            <Download className="w-4 h-4" /> Export PDF complet
          </button>
          {(dossier.statut === "en_attente" || dossier.statut === "en_cours_validation") && (
            <Link
              href={`/dashboard/banque/dossiers/${dossier.id}/validation`}
              className="btn-ldf-primary text-sm py-2 px-4"
            >
              <CheckCircle className="w-4 h-4" /> Valider / Rejeter
            </Link>
          )}
        </div>
      </div>

      {/* Statut et informations clés */}
      <div className="section-card">
        <div className="section-card-body">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              <StatutBadge statut={dossier.statut} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date création</p>
              <p className="font-semibold text-gray-900">
                {new Date(dossier.dateCreation).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fournisseurs</p>
              <p className="font-semibold text-gray-900">{fournisseurs.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Devis</p>
              <p className="font-semibold text-gray-900">{devis.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Montant total</p>
              <p className="font-bold text-amber-700 text-lg">
                {new Intl.NumberFormat("fr-FR").format(montantTotal)} F
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Souscription */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-800">Souscription Vitalis</h2>
              </div>
              <Link
                href={`/dashboard/souscriptions/${souscription.id}`}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                Voir détail →
              </Link>
            </div>
            <div className="section-card-body grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Référence</p>
                <p className="font-semibold text-gray-900">{souscription.reference}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Durée</p>
                <p className="font-semibold text-gray-900">{souscription.duree} mois</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mensualité</p>
                <p className="font-semibold text-amber-700">
                  {new Intl.NumberFormat("fr-FR").format(Math.round(montantMensuel))} F
                </p>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                {souscription.typeSouscripteur === "physique" ? (
                  <User className="w-4 h-4 text-blue-500" />
                ) : (
                  <Building2 className="w-4 h-4 text-purple-500" />
                )}
                <h2 className="text-sm font-semibold text-gray-800">
                  {souscription.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
                </h2>
              </div>
            </div>
            <div className="section-card-body">
              {souscription.typeSouscripteur === "physique" ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Nom complet</p>
                    <p className="font-medium text-gray-900">
                      {"nom" in souscripteur && "prenom" in souscripteur
                        ? `${souscripteur.nom} ${souscripteur.prenom}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CNI</p>
                    <p className="font-medium text-gray-900">
                      {"cni" in souscripteur ? souscripteur.cni : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-gray-800">{"telephone" in souscripteur ? souscripteur.telephone : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-800">{"email" in souscripteur ? souscripteur.email : "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Raison sociale</p>
                    <p className="font-bold text-gray-900">
                      {"raisonSociale" in souscripteur ? souscripteur.raisonSociale : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">RCCM</p>
                    <p className="font-medium text-gray-900">
                      {"rccm" in souscripteur ? souscripteur.rccm : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">N° Contribuable</p>
                    <p className="font-medium text-gray-900">
                      {"numeroContribuable" in souscripteur ? souscripteur.numeroContribuable : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Devis par fournisseur */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Devis par fournisseur ({devis.length})
                </h2>
              </div>
            </div>
            <div className="section-card-body space-y-4">
              {devis.map((d) => {
                if (!d) return null;
                const fournisseur = mockFournisseursVitalis.find((f) => f.id === d.fournisseurId);
                return (
                  <div key={d.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                          {fournisseur?.code.substring(0, 2) || "FN"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{fournisseur?.nom || "Fournisseur"}</p>
                          <p className="text-xs text-gray-500">{d.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total TTC</p>
                        <p className="font-bold text-amber-700">
                          {new Intl.NumberFormat("fr-FR").format(d.totalTTC)} F
                        </p>
                      </div>
                    </div>

                    {/* Articles */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Articles ({d.articles.length})
                      </p>
                      <div className="space-y-1.5">
                        {d.articles.slice(0, 3).map((art) => (
                          <div key={art.id} className="flex items-center justify-between text-xs">
                            <p className="text-gray-800 flex-1">{art.designation}</p>
                            <p className="text-gray-600 ml-2">
                              {art.quantite} × {new Intl.NumberFormat("fr-FR").format(art.prixUnitaire)} F
                            </p>
                          </div>
                        ))}
                        {d.articles.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            + {d.articles.length - 3} autre(s) article(s)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`/dashboard/devis/${d.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </Link>
                      <Link
                        href={`/dashboard/devis/${d.id}/pdf`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Printer className="w-3.5 h-3.5" /> PDF
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Récapitulatif financier */}
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="text-sm font-semibold text-gray-800">Récapitulatif</h2>
            </div>
            <div className="section-card-body space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Nb fournisseurs</span>
                <span className="font-semibold text-gray-900">{fournisseurs.length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Nb devis</span>
                <span className="font-semibold text-gray-900">{devis.length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Montant total</span>
                <span className="font-bold text-amber-700">
                  {new Intl.NumberFormat("fr-FR").format(montantTotal)} F
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Durée</span>
                <span className="font-semibold text-gray-900">{souscription.duree} mois</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-600 font-medium">Mensualité</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat("fr-FR").format(Math.round(montantMensuel))} F
                </span>
              </div>
            </div>
          </div>

          {/* Agence AFG */}
          {agence && (
            <div className="section-card">
              <div className="section-card-header">
                <h2 className="text-sm font-semibold text-gray-800">Agence AFG Bank</h2>
              </div>
              <div className="section-card-body">
                <p className="font-semibold text-gray-900 mb-2">{agence.nom}</p>
                <p className="text-xs text-gray-600">{agence.adresse}</p>
                <p className="text-xs text-gray-600 mt-1">{agence.telephone}</p>
                <p className="text-xs text-gray-600">{agence.email}</p>
              </div>
            </div>
          )}

          {/* Décision banque */}
          {(dossier.commentaireBanque || dossier.motifRejet) && (
            <div className="section-card">
              <div className="section-card-header">
                <h2 className="text-sm font-semibold text-gray-800">Décision AFG Bank</h2>
              </div>
              <div className="section-card-body space-y-3">
                {dossier.commentaireBanque && (
                  <div className={`p-3 rounded-lg text-sm ${
                    dossier.statut === "valide"
                      ? "bg-emerald-50 text-emerald-800"
                      : dossier.statut === "rejete"
                      ? "bg-red-50 text-red-800"
                      : "bg-blue-50 text-blue-800"
                  }`}>
                    {dossier.commentaireBanque}
                  </div>
                )}
                {dossier.motifRejet && (
                  <div className="p-3 rounded-lg bg-red-50 text-sm text-red-800">
                    <p className="font-semibold mb-1">Motif rejet :</p>
                    <p>{dossier.motifRejet}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info workflow */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Dossier consolidé multi-fournisseurs</p>
            <p className="text-xs">
              Ce dossier regroupe les {devis.length} devis de {fournisseurs.length} fournisseur(s) différents pour un montant total de{" "}
              <strong>{new Intl.NumberFormat("fr-FR").format(montantTotal)} FCFA</strong>. La validation ou le rejet s'applique à l'ensemble du dossier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
