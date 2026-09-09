"use client";
import { PDFSouscription } from "@/components/vitalis/PDFSouscription";
import { mockSouscriptionsVitalis } from "@/lib/vitalisData";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function SouscriptionPDFPage() {
  const params = useParams();
  const router = useRouter();
  const souscriptionId = params.id as string;

  const souscription = mockSouscriptionsVitalis.find((s) => s.id === souscriptionId);

  if (!souscription) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-600 mb-4">Souscription introuvable</p>
        <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <PDFSouscription souscription={souscription} />
    </div>
  );
}
