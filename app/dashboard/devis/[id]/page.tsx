// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { ArrowLeft, Building2, CheckCircle2, Download, Eye, FileText, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { downloadPDFFromHTML } from "@/lib/pdf/generator";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function DevisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const { getDevisById } = useVitalisDb();
  
  const [showSend, setShowSend] = useState(false);
  const [statut, setStatut] = useState<string | null>(null);

  const devis = getDevisById(id);
  if (!devis) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
      <FileText className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Devis introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  const currentStatut = statut ?? devis.statut;

  const handleSend = () => {
    setStatut("envoye");
    setShowSend(false);
    toast.success(`Devis ${devis.reference} envoyé à ${devis.banqueNom}`);
  };

  const handleExportPDF = async () => {
    try {
      const toastId = toast.loading("Génération du PDF en cours...");
      await downloadPDFFromHTML("devis-pdf-content", `Devis-${devis.reference}`);
      toast.success("PDF généré avec succès", { id: toastId });
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(error);
    }
  };

  return (
    <div className="space-y-5 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{devis.reference}</h1>
              <StatusBadge statut={currentStatut} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Souscription {devis.souscriptionRef} · {devis.fournisseurNom}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(currentStatut === "brouillon" || currentStatut === "envoye") && (user?.role !== "banque") && (
            <button onClick={() => setShowSend(true)} className="btn-ldf-secondary text-sm py-2 px-4">
              <Send className="w-3.5 h-3.5" /> Envoyer à la banque
            </button>
          )}
          <Link href={`/dashboard/souscriptions/${devis.souscriptionId}`} className="btn-ldf-outline text-sm py-2 px-4">
            <Eye className="w-3.5 h-3.5" /> Souscription
          </Link>
          <button onClick={handleExportPDF} className="btn-ldf-outline text-sm py-2 px-4">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Preview devis */}
      <div id="devis-pdf-content" className="section-card bg-white flex flex-col">
        
        {/* Branding PDF (En-tête horizontal type papier à en-tête) - CACHÉ dans l'app, VISIBLE sur le PDF */}
        <div className="pdf-only items-center justify-between p-8 border-b-2 border-[#0B2447]/10 bg-white">
          <div className="flex-1">
            <img src="/logos/logo-fades.PNG" alt="FADES" className="h-16 object-contain" crossOrigin="anonymous" />
          </div>
          
          <div className="flex-1 flex flex-col items-center border-l border-r border-gray-200 px-4">
            <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.2em] uppercase mb-2">Programme</p>
            <img src="/logos/new_logo-viflo.JPG" alt="Vitalis" className="h-12 object-contain mix-blend-multiply rounded-xl" crossOrigin="anonymous" />
          </div>
          
          <div className="flex-1 flex flex-col items-end pl-4">
            <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.2em] uppercase mb-2 mr-2">Financement</p>
            <div className="h-12 px-3 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm">
              <img src="/logos/logo-afg-bank_atlantic.png" alt="AFG Bank" className="h-8 object-contain" crossOrigin="anonymous" />
            </div>
          </div>
        </div>

        {/* Contenu principal du devis */}
        <div className="flex-1 bg-white">
          {/* Détails du devis */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">DEVIS COMMERCIAL</h2>
                <p className="font-mono text-amber-700 font-bold mt-1 text-lg">{devis.reference}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Date d&apos;émission</p>
                <p className="text-sm font-bold text-gray-700">{new Date(devis.dateCreation).toLocaleDateString("fr-FR")}</p>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mt-2">Date d&apos;expiration</p>
                <p className="text-sm font-bold text-gray-700">{new Date(devis.dateExpiration).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 p-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Émetteur / Fournisseur</h3>
              </div>
              <p className="font-bold text-gray-900 text-lg">{devis.fournisseurNom}</p>
              <p className="text-sm text-gray-500 mt-0.5">Réf. fournisseur : <span className="font-mono">{devis.fournisseurId}</span></p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destinataire / Souscripteur</h3>
              </div>
              <p className="font-bold text-gray-900 text-lg">{devis.souscripteurNom}</p>
              <p className="text-sm text-gray-500 mt-0.5">Banque partenaire : <span className="font-semibold">{devis.banqueNom}</span></p>
            </div>
          </div>

          {/* Tableau articles */}
          <div className="overflow-x-auto">
            <table className="ldf-table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Désignation</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Réf.</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Qté</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Prix U.</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Remise</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devis.articles.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-800">{a.designation}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{a.reference}</td>
                    <td className="py-3 px-4 text-right font-medium">{a.quantite}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap text-gray-700">{fmtCFA(a.prixUnitaire)}</td>
                    <td className="py-3 px-4 text-right text-gray-500">{a.remise > 0 ? `${a.remise}%` : "—"}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">{fmtCFA(a.montantHT)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="p-6 flex justify-end bg-gray-50/30">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Total HT</span>
                <span className="font-bold text-gray-900">{fmtCFA(devis.totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">TVA (18%)</span>
                <span className="font-bold text-gray-900">{fmtCFA(devis.tva)}</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t-2 border-gray-200 pt-3 mt-3">
                <span className="text-gray-900">NET À PAYER TTC</span>
                <span className="text-amber-600">{fmtCFA(devis.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          {devis.conditions && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Conditions de vente</p>
              <p className="text-sm text-gray-600 leading-relaxed">{devis.conditions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal envoi */}
      <ConfirmModal
        open={showSend}
        onClose={() => setShowSend(false)}
        onConfirm={handleSend}
        title="Envoyer le devis à la banque"
        message={`Le devis ${devis.reference} sera transmis à ${devis.banqueNom} pour validation. Cette action est irréversible.`}
        confirmLabel="Envoyer"
        variant="info"
      />
    </div>
  );
}
