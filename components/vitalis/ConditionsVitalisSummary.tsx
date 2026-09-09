// components/vitalis/ConditionsVitalisSummary.tsx
// Composant résumé des conditions Vitalis pour affichage rapide

import { AFG_BANK } from "@/lib/vitalisData";
import { VITALIS_CONFIG } from "@/types/vitalis";
import { AlertCircle, CheckCircle, Clock, FileText, Info, Printer } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ConditionsVitalisSummaryProps {
  variant?: "compact" | "full";
  showPrintButton?: boolean;
}

export default function ConditionsVitalisSummary({
  variant = "full",
  showPrintButton = true,
}: ConditionsVitalisSummaryProps) {
  const handlePrint = () => {
    toast.info("Ouverture de la page des conditions...");
    window.open("/dashboard/conditions-vitalis", "_blank");
  };

  if (variant === "compact") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 text-sm mb-1">
              Conditions Programme Vitalis
            </h3>
            <p className="text-xs text-amber-800">
              Financement AFG Bank sur {VITALIS_CONFIG.DUREE_PAR_DEFAUT} mois
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-white rounded-lg p-2">
            <p className="text-gray-500">Montant min.</p>
            <p className="font-semibold text-gray-900">500 000 FCFA</p>
          </div>
          <div className="bg-white rounded-lg p-2">
            <p className="text-gray-500">Taux annuel</p>
            <p className="font-semibold text-gray-900">6,5%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/conditions-vitalis"
            className="flex-1 text-center text-xs font-medium text-amber-700 hover:text-amber-800 py-2 px-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
          >
            Voir les conditions complètes
          </Link>
          {showPrintButton && (
            <button
              onClick={handlePrint}
              className="p-2 text-amber-600 hover:bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
              title="Imprimer les conditions"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Programme Vitalis</h3>
              <p className="text-sm text-gray-600">Conditions du financement AFG Bank</p>
            </div>
          </div>
          {showPrintButton && (
            <button
              onClick={handlePrint}
              className="btn-ldf-outline text-sm py-2 px-4"
            >
              <Printer className="w-4 h-4" /> Imprimer
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-medium text-gray-600">Durée standard</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{VITALIS_CONFIG.DUREE_PAR_DEFAUT} mois</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-medium text-gray-600">Taux d'intérêt</p>
            </div>
            <p className="text-lg font-bold text-gray-900">6,5% / an</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-medium text-gray-600">Frais dossier</p>
            </div>
            <p className="text-lg font-bold text-gray-900">1%</p>
          </div>
        </div>
      </div>

      {/* Points clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Éligibilité */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-gray-900 text-sm">Qui peut souscrire ?</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Personnes Physiques : Salariés ou Fonctionnaires</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Personnes Morales : Entreprises avec RCCM</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Compte bancaire AFG Bank obligatoire</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Résidence en Côte d'Ivoire</span>
            </li>
          </ul>
        </div>

        {/* Montants */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 text-sm">Montants finançables</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Minimum : 500 000 FCFA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Max. Personne Physique : 10 000 000 FCFA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Max. Personne Morale : 50 000 000 FCFA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Remboursement : 12 à 48 mois</span>
            </li>
          </ul>
        </div>

        {/* Délais */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900 text-sm">Délais de traitement</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Étude du dossier : 5 à 7 jours ouvrés</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Déblocage fonds : 48 heures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Livraison Abidjan : {VITALIS_CONFIG.DELAI_LIVRAISON_ABIDJAN}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Livraison Intérieur : {VITALIS_CONFIG.DELAI_LIVRAISON_INTERIEUR}</span>
            </li>
          </ul>
        </div>

        {/* Points importants */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-900 text-sm">Points importants</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Documents complets requis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Assurance emprunteur obligatoire</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Fournisseurs agréés uniquement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Remboursement anticipé sans pénalité</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Besoin d'informations ?</h4>
            <p className="text-sm text-gray-700 mb-2">
              Contactez {AFG_BANK.nom} pour toute question sur le programme Vitalis.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600">Téléphone :</span>{" "}
                <span className="font-medium text-gray-900">{AFG_BANK.telephone}</span>
              </div>
              <div>
                <span className="text-gray-600">Email :</span>{" "}
                <span className="font-medium text-gray-900">{AFG_BANK.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lien vers conditions complètes */}
      <Link
        href="/dashboard/conditions-vitalis"
        className="block text-center py-3 px-4 bg-white border-2 border-amber-300 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
      >
        📄 Consulter les conditions complètes du programme Vitalis
      </Link>
    </div>
  );
}
