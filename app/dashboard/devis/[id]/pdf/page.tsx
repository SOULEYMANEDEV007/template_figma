"use client";
import { PDFDevis } from "@/components/vitalis/PDFDevis";
import { useDevisById } from "@/hooks/useVitalisData";
import { AlertCircle, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

// ============================================================
// COMPOSANT PAGE
// ============================================================
export default function DevisPDFPage({ params }: { params: { id: string } }) {
  const { data: devis, loading, error } = useDevisById(params.id);

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───────────────────────────────────────────────
  if (error || !devis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Devis introuvable</h1>
          <p className="text-gray-600 mb-6">
            Le devis demandé n'existe pas ou a été supprimé.
          </p>
          <Link href="/dashboard/devis" className="btn-ldf-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux devis
          </Link>
        </div>
      </div>
    );
  }

  // ─── Rendu ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <Link
            href={`/dashboard/devis/${devis.id}`}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au devis
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Devis {devis.numero}</h1>
              <p className="text-gray-600">Document prêt à télécharger</p>
            </div>
          </div>
        </div>

        {/* Composant PDF */}
        <PDFDevis devis={devis} />
      </div>
    </div>
  );
}
