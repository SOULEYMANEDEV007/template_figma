"use client";
// components/ui/ldf-badge.tsx — Badges statuts LDF
import { cn } from "@/lib/utils";
import type {
  DevisStatut, DossierStatut, PaiementStatut, SouscriptionStatut,
} from "@/types/ldf";

type AnyStatut =
  | SouscriptionStatut | DevisStatut | DossierStatut | PaiementStatut
  | "active" | "inactive" | "actif" | "inactif"
  | "valide" | "rejete" | "informations_demandees"
  | "recu" | "en_cours_traitement";

const STATUT_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  brouillon:               { label: "Brouillon",          className: "bg-gray-100 text-gray-600",     dot: "bg-gray-400"    },
  soumise:                 { label: "Soumise",             className: "bg-blue-50 text-blue-700",      dot: "bg-blue-500"    },
  en_attente:              { label: "En attente",          className: "bg-amber-50 text-amber-700",    dot: "bg-amber-500"   },
  validee:                 { label: "Validée",             className: "bg-emerald-50 text-emerald-700",dot: "bg-emerald-500" },
  rejetee:                 { label: "Rejetée",             className: "bg-red-50 text-red-700",        dot: "bg-red-500"     },
  payee:                   { label: "Payée",               className: "bg-green-50 text-green-700",    dot: "bg-green-500"   },
  servie:                  { label: "Servie",              className: "bg-teal-50 text-teal-800",      dot: "bg-teal-600"    },
  envoye:                  { label: "Envoyé",              className: "bg-indigo-50 text-indigo-700",  dot: "bg-indigo-500"  },
  en_attente_validation:   { label: "Validation en attente",className: "bg-amber-50 text-amber-700",  dot: "bg-amber-500"   },
  valide:                  { label: "Validé",              className: "bg-emerald-50 text-emerald-700",dot: "bg-emerald-500" },
  refuse:                  { label: "Refusé",              className: "bg-red-50 text-red-700",        dot: "bg-red-500"     },
  expire:                  { label: "Expiré",              className: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"    },
  recu:                    { label: "Reçu",                className: "bg-sky-50 text-sky-700",        dot: "bg-sky-500"     },
  en_cours_traitement:     { label: "En traitement",       className: "bg-amber-50 text-amber-700",    dot: "bg-amber-500"   },
  rejete:                  { label: "Rejeté",              className: "bg-red-50 text-red-700",        dot: "bg-red-500"     },
  informations_demandees:  { label: "Infos demandées",     className: "bg-orange-50 text-orange-700",  dot: "bg-orange-500"  },
  en_cours:                { label: "En cours",            className: "bg-amber-50 text-amber-700",    dot: "bg-amber-500"   },
  encaisse:                { label: "Encaissé",            className: "bg-green-50 text-green-700",    dot: "bg-green-500"   },
  active:                  { label: "Active",              className: "bg-emerald-50 text-emerald-700",dot: "bg-emerald-500" },
  inactive:                { label: "Inactive",            className: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"    },
  actif:                   { label: "Actif",               className: "bg-emerald-50 text-emerald-700",dot: "bg-emerald-500" },
  inactif:                 { label: "Inactif",             className: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"    },
};

interface StatusBadgeProps {
  statut: AnyStatut | string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ statut, size = "md", showDot = true, className }: StatusBadgeProps) {
  const config = STATUT_CONFIG[statut] ?? { label: statut, className: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        config.className,
        className,
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dot)} />
      )}
      {config.label}
    </span>
  );
}

// Role badge
export function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; className: string }> = {
    admin:       { label: "Administrateur", className: "bg-purple-50 text-purple-700" },
    banque:      { label: "Banque",         className: "bg-blue-50 text-blue-700"     },
    fournisseur: { label: "Fournisseur",    className: "bg-amber-50 text-amber-700"   },
  };
  const c = config[role] ?? { label: role, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", c.className)}>
      {c.label}
    </span>
  );
}
