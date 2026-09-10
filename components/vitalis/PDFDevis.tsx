// @ts-nocheck
"use client";
import { downloadPDFFromHTML } from "@/lib/pdf/generator";
import { AFG_BANK } from "@/lib/vitalisData";
import type { DevisVitalis, Fournisseur, Souscription } from "@/types/vitalis";
import { Building2, Calendar, FileText, Package, Printer, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================
// PROPS
// ============================================================
interface PDFDevisProps {
  devis: DevisVitalis;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function PDFDevis({ devis }: PDFDevisProps) {
  // ─── États ────────────────────────────────────────────────
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [souscription, setSouscription] = useState<Souscription | null>(null);
  const [agence, setAgence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ─── Chargement données ───────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const { 
          fournisseursOps,
          souscriptionsOps,
          agencesAFGOps 
        } = await import("@/lib/database/operations");
        
        // Charger fournisseur
        const f = await fournisseursOps.getById(devis.fournisseurId);
        setFournisseur(f || null);

        // Charger souscription
        const s = await souscriptionsOps.getById(devis.souscriptionId);
        setSouscription(s || null);

        // Charger agence si souscription existe
        if (s) {
          const ag = await agencesAFGOps.getById(s.agenceBanqueId);
          setAgence(ag);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement données PDF devis:", error);
        toast.error("Erreur lors du chargement des données");
        setLoading(false);
      }
    }
    
    loadData();
  }, [devis]);

  // ─── Handler téléchargement PDF ───────────────────────────
  const handleTelecharger = async () => {
    try {
      toast.loading("Génération du PDF...");
      
      await downloadPDFFromHTML(
        "pdf-devis",
        `Devis_${devis.numero}.pdf`
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
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  if (!fournisseur || !souscription) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Données introuvables</p>
      </div>
    );
  }

  // ─── Calculs montants ─────────────────────────────────────
  const montantHT = devis.articles.reduce(
    (sum, art) => sum + art.prixUnitaire * art.quantite,
    0
  );
  const montantRemise = (montantHT * devis.remisePourcentage) / 100;
  const montantApresRemise = montantHT - montantRemise;
  const montantTVA = (montantApresRemise * 18) / 100;
  const montantTTC = montantApresRemise + montantTVA;

  return (
    <>
      {/* Bouton téléchargement (masqué à l'impression) */}
      <div className="no-print mb-6 flex justify-end">
        <button onClick={handleTelecharger} className="btn-ldf-primary bg-green-600 hover:bg-green-700">
          <Printer className="w-4 h-4" /> Télécharger PDF
        </button>
      </div>

      {/* Document PDF */}
      <div id="pdf-devis" className="pdf-document bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="pdf-header mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Devis Vitalis</h1>
                  <p className="text-sm text-green-600 font-medium">Programme AFG Bank</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">N° Devis</p>
              <p className="text-xl font-bold text-gray-900">{devis.numero}</p>
              <p className="text-xs text-gray-500 mt-1">
                Date : {new Date(devis.dateCreation).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-xs text-gray-500">
                Validité : {new Date(devis.dateValidite).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Fournisseur */}
          <section className="pdf-section">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Fournisseur</h2>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-bold text-green-900 mb-2">{fournisseur.nom}</p>
              <p className="text-sm text-green-800">{fournisseur.adresse}</p>
              <p className="text-sm text-green-800 mt-2">{fournisseur.telephone}</p>
              <p className="text-sm text-green-800">{fournisseur.email}</p>
              {fournisseur.rccm && (
                <p className="text-xs text-green-700 mt-2">RCCM: {fournisseur.rccm}</p>
              )}
            </div>
          </section>

          {/* Souscription */}
          <section className="pdf-section">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">Souscription</h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-bold text-amber-900 mb-2">{souscription.reference}</p>
              <p className="text-sm text-amber-800">Durée: {souscription.dureeRemboursement} mois</p>
              <p className="text-sm text-amber-800 mt-2">
                Date début: {new Date(souscription.dateDebut).toLocaleDateString("fr-FR")}
              </p>
              {agence && (
                <p className="text-xs text-amber-700 mt-2">Agence: {agence.nom}</p>
              )}
            </div>
          </section>
        </div>

        {/* Articles */}
        <section className="pdf-section mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Articles commandés</h2>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Article</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Qté</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">P.U. HT</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devis.articles.map((article, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{article.designation}</p>
                      {article.reference && (
                        <p className="text-xs text-gray-500">Réf: {article.reference}</p>
                      )}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">{article.quantite}</td>
                    <td className="text-right px-4 py-3 text-gray-700">
                      {article.prixUnitaire.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="text-right px-4 py-3 font-medium text-gray-900">
                      {(article.prixUnitaire * article.quantite).toLocaleString("fr-FR")} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totaux */}
        <section className="pdf-section mb-8">
          <div className="max-w-md ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Montant HT</span>
                <span className="font-medium">{montantHT.toLocaleString("fr-FR")} FCFA</span>
              </div>
              
              {devis.remisePourcentage > 0 && (
                <>
                  <div className="flex justify-between text-green-700">
                    <span>Remise ({devis.remisePourcentage}%)</span>
                    <span className="font-medium">-{montantRemise.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Montant après remise</span>
                    <span className="font-medium">{montantApresRemise.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-gray-700">
                <span>TVA (18%)</span>
                <span className="font-medium">{montantTVA.toLocaleString("fr-FR")} FCFA</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                <span>Total TTC</span>
                <span className="text-green-600">{montantTTC.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Conditions de livraison */}
        <section className="pdf-section mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Conditions de livraison</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <span className="font-semibold">Délai :</span> {devis.delaiLivraison} jours ouvrés
            </p>
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Conditions Vitalis :</span> Livraison coordonnée avec AFG Bank
            </p>
            {devis.observations && (
              <p className="text-sm text-blue-800 mt-2 italic">{devis.observations}</p>
            )}
          </div>
        </section>

        {/* Signatures */}
        <section className="pdf-section mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Signatures</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-gray-300 rounded-lg p-4 h-32">
              <p className="text-sm font-semibold text-gray-700 mb-2">Le Fournisseur</p>
              <p className="text-xs text-gray-500">{fournisseur.nom}</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 h-32">
              <p className="text-sm font-semibold text-gray-700 mb-2">AFG Bank</p>
              <p className="text-xs text-gray-500">Pour validation</p>
            </div>
          </div>
        </section>

        {/* Pied de page */}
        <div className="pdf-footer pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Document généré le {new Date().toLocaleString("fr-FR")}</p>
          <p className="mt-1">{AFG_BANK.nom} - {AFG_BANK.telephone} - {AFG_BANK.email}</p>
        </div>
      </div>
    </>
  );
}
