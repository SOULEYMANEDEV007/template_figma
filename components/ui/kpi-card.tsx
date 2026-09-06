"use client";
// components/ui/kpi-card.tsx — Carte KPI réutilisable
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label?: string };
  variant?: "yellow" | "green" | "blue" | "red" | "gray";
  className?: string;
  loading?: boolean;
}

const VARIANT_STYLES = {
  yellow: {
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    border: "border-l-cyan-400",
    gradient: "from-cyan-50/50 to-transparent",
  },
  green: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-l-emerald-400",
    gradient: "from-emerald-50/50 to-transparent",
  },
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-l-blue-400",
    gradient: "from-blue-50/50 to-transparent",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-l-red-400",
    gradient: "from-red-50/50 to-transparent",
  },
  gray: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    border: "border-l-gray-300",
    gradient: "from-gray-50/50 to-transparent",
  },
};

export function KPICard({
  title, value, subtitle, icon: Icon, trend, variant = "yellow", className, loading,
}: KPICardProps) {
  const styles = VARIANT_STYLES[variant];

  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-100 border-l-4 p-5 shadow-sm animate-pulse", styles.border, className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-28 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className={cn("w-11 h-11 rounded-xl", styles.iconBg)} />
        </div>
      </div>
    );
  }

  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 border-l-4 p-5 shadow-sm hover:shadow-md transition-all duration-200",
        `bg-gradient-to-br ${styles.gradient}`,
        styles.border,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              isPositive ? "text-emerald-600" : "text-red-600",
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? "+" : ""}{trend.value}%{trend.label ? ` ${trend.label}` : " ce mois"}</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", styles.iconBg)}>
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
