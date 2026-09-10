// @ts-nocheck
"use client";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { Bell, BookOpen, CheckCheck, CreditCard, FileText, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { NotificationCategorie } from "@/types/ldf";

const CAT_CONFIG: Record<NotificationCategorie, { label: string; icon: typeof Bell; bg: string; text: string; border: string }> = {
  souscription: { label: "Souscription", icon: FileText,    bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  devis:        { label: "Devis",        icon: BookOpen,    bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  dossier:      { label: "Dossier",      icon: CheckCheck,  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  paiement:     { label: "Paiement",     icon: CreditCard,  bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200"   },
  systeme:      { label: "Système",      icon: Settings,    bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-200"    },
};

type TabKey = "toutes" | "non_lues" | NotificationCategorie;

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useLDFAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>("toutes");

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "toutes",       label: "Toutes",       count: notifications.length },
    { key: "non_lues",     label: "Non lues",     count: unreadCount > 0 ? unreadCount : undefined },
    { key: "souscription", label: "Souscriptions" },
    { key: "devis",        label: "Devis"         },
    { key: "dossier",      label: "Dossiers"      },
    { key: "paiement",     label: "Paiements"     },
  ];

  const displayed = useMemo(() => {
    if (activeTab === "toutes")   return notifications;
    if (activeTab === "non_lues") return notifications.filter(n => !n.estLue);
    return notifications.filter(n => n.categorie === activeTab);
  }, [notifications, activeTab]);

  return (
    <div className="space-y-5 fade-in">
      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
              activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={cn(
                "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                activeTab === t.key ? "bg-amber-400 text-amber-900" : "bg-gray-200 text-gray-600"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {displayed.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium">Aucune notification</p>
          <p className="text-xs mt-1">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="section-card divide-y divide-gray-50">
          {displayed.map(n => {
            const cfg = CAT_CONFIG[n.categorie];
            const Icon = cfg.icon;
            return (
              <div key={n.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50",
                  !n.estLue && "bg-amber-50/40"
                )}>
                {/* Icône */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                  <Icon className={cn("w-5 h-5", cfg.text)} />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div>
                      <p className={cn("text-sm leading-snug", !n.estLue ? "font-semibold text-gray-900" : "text-gray-700")}>
                        {n.titre}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{n.date} à {n.heure}</span>
                      {!n.estLue && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {n.reference && (
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold font-mono", cfg.bg, cfg.text, `border ${cfg.border}`)}>
                        {n.reference}
                      </span>
                    )}
                    {n.lien && (
                      <Link href={n.lien} onClick={() => markNotificationRead(n.id)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                        Voir le détail →
                      </Link>
                    )}
                    {!n.estLue && (
                      <button onClick={() => markNotificationRead(n.id)}
                        className="text-xs text-gray-400 hover:text-gray-600">
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
