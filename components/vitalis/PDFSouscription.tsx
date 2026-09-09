"use client";
import { downloadPDFFromHTML } from "@/lib/pdf/generator";
import { AFG_BANK } from "@/lib/vitalisData";
import type { Souscription, SouscripteurMorale, SouscripteurPhysique } from "@/types/vitalis";
import { Building2, Calendar, CheckCircle, FileText, Printer, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================
// PROPS
// ============================================================
interface PDFSouscriptionProps {
  souscription: Souscription;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function PDFSouscription({ souscription }: PDFSouscriptionProps) {
  // ─── États ────────────────────────────────────────────────
  const [souscripteur, setSouscripteur] = useState<SouscripteurPhysique | SouscripteurMorale | null>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [agence, setAgence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ─── Chargement données ───────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const { 
          souscripteursPhysiquesOps, 
          souscripteursMoralesOps,
          souscriptionsFournisseursOps,
          devisOps,
          agencesAFGOps 
        } = await import("@/lib/database/operations");
        
        // Charger souscripteur
        if (souscription.typeSouscripteur === "physique") {
          const s = await souscripteursPhysiquesOps.getById(souscription.souscripteurId);
          setSouscripteur(s || null);
        } else {
          const s = await souscripteursMoralesOps.getById(souscription.souscripteurId);
          setSouscripteur(s || null);
        }

        // Charger associations fournisseurs
        const assocs = await souscriptionsFournisseursOps.getFournisseursBySouscription(souscription.id);
        setAssociations(assocs);

        // Charger devis
        const devList = await devisOps.getBySouscription(souscription.id);
        setDevis(devList);

        // Charger agence
        const agenceData = await agencesAFGOps.getById(souscription.agenceBanqueId);
        setAgence(agenceData);
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement données PDF:", error);
        toast.error("Erreur lors du chargement des données");
        setLoading(false);
      }
    }
    
    loadData();
  }, [souscription]);

  // ─── Handler impression avec PDF réel ─────────────────────
  const handleImprimer = async () => {
    try {
      toast.loading("Génération du PDF...");
      
      await downloadPDFFromHTML(
        "pdf-souscription",
        `Souscription_${souscription.reference}.pdf`
      );
      
      toast.dismiss();
      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.dismiss();
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  // ─── Chargement ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  if (!souscripteur) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Souscripteur introuvable</p>
      </div>
    );
  }

  return (
    <>
      {/* Bouton impression (masqué à l'impression) */}
      <div className="no-print mb-6 flex justify-end">
        <button onClick={handleImprimer} className="btn-ldf-primary">
          <Printer className="w-4 h-4" /> Télécharger PDF
        </button>
      </div>

      {/* Document PDF */}
      <div id="pdf-souscription" className="pdf-document bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="pdf-header mb-8 pb-6 border-b-2 border-amber-500">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Souscription Vitalis</h1>
                  <p className="text-sm text-amber-600 font-medium">Programme AFG Bank</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Référence</p>
              <p className="text-xl font-bold text-gray-900">{souscription.reference}</p>
              <p className="text-xs text-gray-500 mt-1">
                Date : {new Date(souscription.dateCreation).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        {/* Informations banque */}
        <section className="pdf-section mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">Banque financeuse</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-amber-700 font-semibold mb-1">Banque</p>
                <p className="font-bold text-amber-900">{AFG_BANK.nom}</p>
                <p className="text-sm text-amber-800 mt-1">{AFG_BANK.email}</p>
                <p className="text-sm text-amber-800">{AFG_BANK.telephone}</p>
              </div>
              {agence && (
                <div>
                  <p className="text-xs text-amber-700 font-semibold mb-1">Agence</p>
                  <p className="font-bold text-amber-900">{agence.nom}</p>
                  <p className="text-sm text-amber-800 mt-1">{agence.adresse}</p>
                  <p className="text-sm text-amber-800">{agence.telephone}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Informations souscripteur */}
        <section className="pdf-section mb-8">
          <div className="flex items-center gap-2 mb-4">
            {souscription.typeSouscripteur === "physique" ? (
              <User className="w-5 h-5 text-blue-600" />
            ) : (
              <Building2 className="w-5 h-5 text-purple-600" />
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {souscription.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
            </h2>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            {souscription.typeSouscripteur === "physique" ? (
              // Personne Physique
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Nom et Prénom(s)</p>
                  <p className="font-semibold text-gray-900">
                    {"nom" in souscripteur && "prenom" in souscripteur
                      ? `${souscripteur.nom} ${souscripteur.prenom}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de naissance</p>
                  <p className="font-semibold text-gray-900">
                    {"dateNaissance" in souscripteur
                      ? new Date(souscripteur.dateNaissance).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pièce d'identité</p>
                  <p className="font-semibold text-gray-900">
                    {"cni" in souscripteur ? souscripteur.cni : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Situation matrimoniale</p>
                  <p className="font-semibold text-gray-900">
                    {"situationMatrimoniale" in souscripteur
                      ? souscripteur.situationMatrimoniale === "celibataire"
                        ? "Célibataire"
                        : souscripteur.situationMatrimoniale === "marie"
                        ? "Marié(e)"
                        : souscripteur.situationMatrimoniale === "divorce"
                        ? "Divorcé(e)"
                        : "Veuf(ve)"
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Situation professionnelle</p>
                  <p className="font-semibold text-gray-900">
                    {"situationProfessionnelle" in souscripteur
                      ? souscripteur.situationProfessionnelle === "salarie"
                        ? "Salarié(e)"
                        : souscripteur.situationProfessionnelle === "independant"
                        ? "Indépendant(e)"
                        : souscripteur.situationProfessionnelle === "fonctionnaire"
                        ? "Fonctionnaire"
                        : "Retraité(e)"
                      : "N/A"}
                  </p>
                </div>
                {"employeur" in souscripteur && souscripteur.employeur && (
                  <div>
                    <p className="text-xs text-gray-500">Employeur</p>
                    <p className="font-semibold text-gray-900">{souscripteur.employeur}</p>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <div className="grid grid-cols-2 gap-2">
                    {"email" in souscripteur && (
                      <p className="text-sm text-gray-800">{souscripteur.email}</p>
                    )}
                    {"telephone" in souscripteur && (
                      <p className="text-sm text-gray-800">{souscripteur.telephone}</p>
                    )}
                  </div>
                  {"adresse" in souscripteur && (
                    <p className="text-sm text-gray-800 mt-1">{souscripteur.adresse}</p>
                  )}
                </div>
              </div>
            ) : (
              // Personne Morale
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Raison sociale</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {"raisonSociale" in souscripteur ? souscripteur.raisonSociale : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">RCCM</p>
                  <p className="font-semibold text-gray-900">
                    {"rccm" in souscripteur ? souscripteur.rccm : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">N° Contribuable</p>
                  <p className="font-semibold text-gray-900">
                    {"numeroContribuable" in souscripteur ? souscripteur.numeroContribuable : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Forme juridique</p>
                  <p className="font-semibold text-gray-900">
                    {"formeJuridique" in souscripteur ? souscripteur.formeJuridique : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Secteur d'activité</p>
                  <p className="font-semibold text-gray-900">
                    {"secteurActivite" in souscripteur ? souscripteur.secteurActivite : "N/A"}
                  </p>
                </div>
                {"nombreEmployes" in souscripteur && (
                  <div>
                    <p className="text-xs text-gray-500">Nombre d'employés</p>
                    <p className="font-semibold text-gray-900">{souscripteur.nombreEmployes}</p>
                  </div>
                )}
                {"capitalSocial" in souscripteur && (
                  <div>
                    <p className="text-xs text-gray-500">Capital social</p>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat("fr-FR").format(souscripteur.capitalSocial)} FCFA
                    </p>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Dirigeant</p>
                  {"nomDirigeant" in souscripteur && (
                    <p className="font-semibold text-gray-900">{souscripteur.nomDirigeant}</p>
                  )}
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <div className="grid grid-cols-2 gap-2">
                    {"email" in souscripteur && (
                      <p className="text-sm text-gray-800">{souscripteur.email}</p>
                    )}
                    {"telephone" in souscripteur && (
                      <p className="text-sm text-gray-800">{souscripteur.telephone}</p>
                    )}
                  </div>
                  {"adresse" in souscripteur && (
                    <p className="text-sm text-gray-800 mt-1">{souscripteur.adresse}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Détails souscription */}
        <section className="pdf-section mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Détails de la souscription</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-500">Date de début</p>
              <p className="font-semibold text-gray-900">
                {new Date(souscription.dateDebut).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Durée du financement</p>
              <p className="font-semibold text-gray-900">{souscription.duree} mois</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Montant total TTC</p>
              <p className="font-bold text-amber-700 text-lg">
                {new Intl.NumberFormat("fr-FR").format(souscription.montantTotal)} FCFA
              </p>
            </div>
          </div>
          {souscription.observations && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Observations</p>
              <p className="text-sm text-gray-800">{souscription.observations}</p>
            </div>
          )}
        </section>

        {/* Fournisseurs associés */}
        <section className="pdf-section mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Fournisseurs agréés ({associations.length})
            </h2>
          </div>
          <div className="space-y-3">
            {associations.map((assoc, index) => {
              const devisFournisseur = devis.find((d) => d.fournisseurId === assoc.fournisseurId);
              return (
                <div key={assoc.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{assoc.fournisseurId}</p>
                        <p className="text-xs text-gray-500">
                          {devisFournisseur
                            ? `Devis: ${devisFournisseur.reference}`
                            : "Devis en attente"}
                        </p>
                      </div>
                    </div>
                    {devisFournisseur && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Montant TTC</p>
                        <p className="font-bold text-amber-700">
                          {new Intl.NumberFormat("fr-FR").format(devisFournisseur.totalTTC)} F
                        </p>
                      </div>
                    )}
                  </div>
                  {devisFournisseur && devisFournisseur.articles.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">
                        Articles ({devisFournisseur.articles.length})
                      </p>
                      <div className="space-y-1">
                        {devisFournisseur.articles.slice(0, 3).map((art) => (
                          <p key={art.id} className="text-xs text-gray-700">
                            • {art.designation} ({art.quantite} × {new Intl.NumberFormat("fr-FR").format(art.prixUnitaire)} F)
                          </p>
                        ))}
                        {devisFournisseur.articles.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            + {devisFournisseur.articles.length - 3} autre(s) article(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Signatures */}
        <section className="pdf-section">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Signatures</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-gray-300 rounded-lg p-4 min-h-[120px]">
              <p className="text-xs text-gray-600 font-semibold mb-2">Le Souscripteur</p>
              <div className="border-b border-gray-200 mt-12 mb-2"></div>
              <p className="text-xs text-gray-500 text-center">Signature et date</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 min-h-[120px]">
              <p className="text-xs text-gray-600 font-semibold mb-2">AFG Bank</p>
              <div className="border-b border-gray-200 mt-12 mb-2"></div>
              <p className="text-xs text-gray-500 text-center">Signature et cachet</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 min-h-[120px]">
              <p className="text-xs text-gray-600 font-semibold mb-2">Le Fournisseur</p>
              <div className="border-b border-gray-200 mt-12 mb-2"></div>
              <p className="text-xs text-gray-500 text-center">Signature et cachet</p>
            </div>
          </div>
        </section>

        {/* Pied de page (visible uniquement à l'impression) */}
        <div className="pdf-footer mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>
            Document généré le {new Date().toLocaleDateString("fr-FR")} à{" "}
            {new Date().toLocaleTimeString("fr-FR")}
          </p>
          <p className="mt-1">Programme Vitalis - AFG Bank - {AFG_BANK.siege}</p>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .pdf-document {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 1cm !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .pdf-section {
            page-break-inside: avoid;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
