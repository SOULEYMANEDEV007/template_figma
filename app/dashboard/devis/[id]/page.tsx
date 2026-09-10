// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { ArrowLeft, Building2, CheckCircle2, Download, Eye, FileText, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
          <button onClick={() => toast.info("Export PDF simulé")} className="btn-ldf-outline text-sm py-2 px-4">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Preview devis */}
      <div className="section-card">
        {/* En-tête du devis */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900">DEVIS</h2>
              <p className="font-mono text-amber-700 font-semibold">{devis.reference}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Date d&apos;émission</p>
              <p className="text-sm font-medium text-gray-700">{new Date(devis.dateCreation).toLocaleDateString("fr-FR")}</p>
              <p className="text-xs text-gray-400 mt-1">Date d&apos;expiration</p>
              <p className="text-sm font-medium text-gray-700">{new Date(devis.dateExpiration).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fournisseur</h3>
            </div>
            <p className="font-semibold text-gray-900">{devis.fournisseurNom}</p>
            <p className="text-sm text-gray-500 mt-0.5">Réf. fournisseur : {devis.fournisseurId}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinataire / Banque</h3>
            </div>
            <p className="font-semibold text-gray-900">{devis.souscripteurNom}</p>
            <p className="text-sm text-gray-500 mt-0.5">Banque : {devis.banqueNom}</p>
          </div>
        </div>

        {/* Tableau articles */}
        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Réf.</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Remise</th>
                <th>Montant HT</th>
              </tr>
            </thead>
            <tbody>
              {devis.articles.map((a, i) => (
                <tr key={i}>
                  <td className="font-medium text-gray-800">{a.designation}</td>
                  <td className="font-mono text-xs text-gray-500">{a.reference}</td>
                  <td>{a.quantite}</td>
                  <td className="whitespace-nowrap">{fmtCFA(a.prixUnitaire)}</td>
                  <td>{a.remise > 0 ? `${a.remise}%` : "—"}</td>
                  <td className="font-semibold text-gray-800 whitespace-nowrap">{fmtCFA(a.montantHT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="p-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total HT</span>
              <span className="font-medium text-gray-800">{fmtCFA(devis.totalHT)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">TVA</span>
              <span className="font-medium text-gray-800">{fmtCFA(devis.tva)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2">
              <span className="text-gray-900">Total TTC</span>
              <span className="text-amber-700">{fmtCFA(devis.totalTTC)}</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        {devis.conditions && (
          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Conditions</p>
            <p className="text-sm text-gray-600">{devis.conditions}</p>
          </div>
        )}
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
