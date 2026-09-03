"use client";
// components/ui/ldf-timeline.tsx — Timeline verticale du processus souscription
import type { HistoriqueEvenement } from "@/types/ldf";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

interface TimelineProps {
  events: HistoriqueEvenement[];
}

const ETAPE_ICONS: Record<string, string> = {
  souscription_creee:    "📝",
  souscription_envoyee:  "📤",
  devis_cree:            "📄",
  devis_envoye:          "📨",
  dossier_recu:          "📥",
  dossier_valide:        "✅",
  dossier_rejete:        "❌",
  informations_demandees:"❓",
  paiement_effectue:     "💳",
  paiement_encaisse:     "🏦",
  articles_servis:       "📦",
};

export function LDFTimeline({ events }: TimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((ev, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <div key={ev.id} className="relative flex gap-4">
            {/* Ligne verticale */}
            {!isLast && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-100 z-0" />
            )}

            {/* Dot */}
            <div className="relative z-10 flex-shrink-0">
              {ev.statut === "complete" && (
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                </div>
              )}
              {ev.statut === "en_cours" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg,#f6c90e,#f0a500)" }}>
                  <Clock className="w-4 h-4 text-amber-900" strokeWidth={2.5} />
                </div>
              )}
              {ev.statut === "en_attente" && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                  <Circle className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
              {ev.statut === "rejete" && (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-4.5 h-4.5 text-red-500" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{ETAPE_ICONS[ev.etape] ?? "📌"}</span>
                  <h4 className={`text-sm font-semibold ${
                    ev.statut === "complete" ? "text-gray-800" :
                    ev.statut === "en_cours" ? "text-amber-700" :
                    ev.statut === "rejete" ? "text-red-700" : "text-gray-400"
                  }`}>
                    {ev.titre}
                  </h4>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1 ml-6 sm:ml-0">
                  <span>{ev.date}</span>
                  <span>·</span>
                  <span>{ev.heure}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 ml-6 leading-relaxed">{ev.description}</p>
              <p className="text-xs text-gray-400 ml-6 mt-1 font-medium">{ev.utilisateur}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline de progression (étapes visuelles) ───────────────────────────────
export interface ProcessStep {
  id: string;
  label: string;
  statut: "complete" | "current" | "pending" | "rejected";
  date?: string;
}

interface ProgressTimelineProps {
  steps: ProcessStep[];
  vertical?: boolean;
}

export function ProcessTimeline({ steps, vertical = false }: ProgressTimelineProps) {
  if (vertical) {
    return (
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              step.statut === "complete" ? "bg-emerald-500 text-white" :
              step.statut === "current"  ? "bg-amber-400 text-amber-900" :
              step.statut === "rejected" ? "bg-red-400 text-white" :
              "bg-gray-100 text-gray-400 border-2 border-gray-200"
            }`}>
              {step.statut === "complete" ? "✓" :
               step.statut === "rejected" ? "✗" :
               step.statut === "current"  ? "●" : idx + 1}
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${
                step.statut === "complete" ? "text-gray-800" :
                step.statut === "current"  ? "text-amber-700" :
                step.statut === "rejected" ? "text-red-600" : "text-gray-400"
              }`}>{step.label}</span>
              {step.date && <span className="text-xs text-gray-400 ml-2">{step.date}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
              step.statut === "complete" ? "bg-emerald-500 text-white" :
              step.statut === "current"  ? "bg-amber-400 text-amber-900" :
              step.statut === "rejected" ? "bg-red-400 text-white" :
              "bg-gray-100 text-gray-400 border-2 border-gray-200"
            }`}>
              {step.statut === "complete" ? "✓" :
               step.statut === "rejected" ? "✗" :
               step.statut === "current"  ? "●" : idx + 1}
            </div>
            <span className={`text-xs font-medium text-center leading-tight ${
              step.statut === "complete" ? "text-emerald-700" :
              step.statut === "current"  ? "text-amber-700 font-semibold" :
              step.statut === "rejected" ? "text-red-600" : "text-gray-400"
            }`}>{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-0.5 w-8 flex-shrink-0 mb-4 ${
              step.statut === "complete" ? "bg-emerald-300" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
