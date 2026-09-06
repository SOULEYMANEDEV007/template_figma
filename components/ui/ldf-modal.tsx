"use client";
// components/ui/ldf-modal.tsx — Modales et confirmations LDF
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import React, { useEffect } from "react";

// ─── Modal de base ────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function LDFModal({ open, onClose, title, description, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={cn(
        "relative w-full bg-white rounded-2xl shadow-2xl fade-in overflow-hidden",
        SIZE_CLASSES[size],
        className,
      )}>
        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div>
              {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
              {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Modal de confirmation ────────────────────────────────
type ConfirmVariant = "danger" | "warning" | "success" | "info";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
}

const CONFIRM_ICONS = {
  danger:  { Icon: XCircle,       color: "text-red-500",    bg: "bg-red-50"    },
  warning: { Icon: AlertTriangle,  color: "text-cyan-500",  bg: "bg-cyan-50"  },
  success: { Icon: CheckCircle2,   color: "text-emerald-500",bg: "bg-emerald-50"},
  info:    { Icon: Info,           color: "text-blue-500",   bg: "bg-blue-50"   },
};

const CONFIRM_BTN = {
  danger:  "bg-red-600 hover:bg-red-700 text-white",
  warning: "gradient-primary text-white",
  success: "gradient-green text-white",
  info:    "bg-blue-600 hover:bg-blue-700 text-white",
};

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Confirmer", cancelLabel = "Annuler",
  variant = "warning", loading,
}: ConfirmModalProps) {
  const { Icon, color, bg } = CONFIRM_ICONS[variant];
  return (
    <LDFModal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", bg)}>
          <Icon className={cn("w-7 h-7", color)} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn("flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50", CONFIRM_BTN[variant])}
          >
            {loading ? "En cours..." : confirmLabel}
          </button>
        </div>
      </div>
    </LDFModal>
  );
}

// ─── Toast helper (utilise sonner via import dans les pages) ─────────────────
export function MotifsRejetModal({
  open, onClose, onSubmit, loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (motif: string) => void;
  loading?: boolean;
}) {
  const [motif, setMotif] = React.useState("");
  return (
    <LDFModal open={open} onClose={onClose} title="Motif de rejet" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Veuillez indiquer le motif du rejet du dossier.</p>
        <textarea
          rows={4}
          placeholder="Ex : Informations bancaires incomplètes, ratio d'endettement dépassé..."
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="ldf-input resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-ldf-outline text-sm py-2.5">Annuler</button>
          <button
            onClick={() => { if (motif.trim()) { onSubmit(motif); setMotif(""); } }}
            disabled={!motif.trim() || loading}
            className="flex-1 btn-ldf-danger text-sm py-2.5 disabled:opacity-50"
          >
            {loading ? "En cours..." : "Rejeter le dossier"}
          </button>
        </div>
      </div>
    </LDFModal>
  );
}
