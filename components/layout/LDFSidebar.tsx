// @ts-nocheck
"use client";
import { getRoleLabel, useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { LDFUserRole } from "@/types/ldf";
import { cn } from "@/lib/utils";
import { IMAGES, ICONS } from "@/lib/constants";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Navigation par rôle ──────────────────────────────────────────────────────
interface SubNavItem {
  name: string;
  href?: string;
  disabled?: boolean;
  badge?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
  children?: SubNavItem[];
}

const BANQUES_SUB_ITEMS: SubNavItem[] = [
  { name: "AFG Bank CI", href: "/dashboard/admin/banques", disabled: false },
  { name: "BNI", disabled: true, badge: "Bientôt" },
  { name: "Société Générale", disabled: true, badge: "Bientôt" },
  { name: "NSIA Banque", disabled: true, badge: "Bientôt" },
];

function getNav(role: LDFUserRole, unreadCount: number): { main: NavItem[]; bottom: NavItem[] } {
  const common: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: ICONS.dashboard, exact: true },
  ];

  if (role === "admin") {
    return {
      main: [
        ...common,
        { name: "Souscriptions", href: "/dashboard/souscriptions", icon: ICONS.souscriptions },
        { name: "Devis", href: "/dashboard/devis", icon: ICONS.documentation },
        { name: "Dossiers", href: "/dashboard/dossiers", icon: ICONS.shield },
        { name: "Paiements", href: "/dashboard/paiements", icon: ICONS.paiements },
        { name: "Articles servis", href: "/dashboard/articles", icon: ICONS.articles },
        { name: "Notifications", href: "/dashboard/notifications", icon: ICONS.notifications, badge: unreadCount },
        { name: "Rapports", href: "/dashboard/rapports", icon: ICONS.rapports },
      ],
      bottom: [
        { name: "Fournisseurs", href: "/dashboard/admin/fournisseurs", icon: ICONS.fournisseur },
        { name: "Banques", href: "/dashboard/admin/banques", icon: ICONS.banque, children: BANQUES_SUB_ITEMS },
        { name: "Utilisateurs", href: "/dashboard/admin/utilisateurs", icon: ICONS.users },
        { name: "Paramètres", href: "/dashboard/parametres", icon: ICONS.settings },
      ],
    };
  }

  if (role === "owner") {
    return {
      main: [
        ...common,
        { name: "Souscriptions", href: "/dashboard/souscriptions", icon: ICONS.souscriptions },
        { name: "Devis", href: "/dashboard/devis", icon: ICONS.documentation },
        { name: "Dossiers", href: "/dashboard/dossiers", icon: ICONS.shield },
        { name: "Paiements", href: "/dashboard/paiements", icon: ICONS.paiements },
        { name: "Articles servis", href: "/dashboard/articles", icon: ICONS.articles },
        { name: "Notifications", href: "/dashboard/notifications", icon: ICONS.notifications, badge: unreadCount },
        { name: "Rapports", href: "/dashboard/rapports", icon: ICONS.rapports },
      ],
      bottom: [
        { name: "Fournisseurs", href: "/dashboard/admin/fournisseurs", icon: ICONS.fournisseur },
        { name: "Banques", href: "/dashboard/admin/banques", icon: ICONS.banque, children: BANQUES_SUB_ITEMS },
        { name: "Paramètres", href: "/dashboard/parametres", icon: ICONS.settings },
      ],
    };
  }

  if (role === "banque") {
    return {
      main: [
        ...common,
        { name: "Souscripteurs", href: "/dashboard/banque/souscripteurs", icon: ICONS.users },
        { name: "Dossiers", href: "/dashboard/banque/dossiers", icon: ICONS.shield },
        { name: "Paiements", href: "/dashboard/paiements", icon: ICONS.paiements },
        { name: "Notifications", href: "/dashboard/notifications", icon: ICONS.notifications, badge: unreadCount },
        { name: "Rapports", href: "/dashboard/rapports", icon: ICONS.rapports },
      ],
      bottom: [
        { name: "Paramètres", href: "/dashboard/parametres", icon: ICONS.settings },
      ],
    };
  }

  if (role === "souscripteur") {
    return {
      main: [
        { name: "Mes souscriptions", href: "/dashboard/souscripteur", icon: ICONS.dashboard, exact: true },
        { name: "Nouvelle demande", href: "/dashboard/souscripteur/demande", icon: ICONS.articles },
        { name: "Notifications", href: "/dashboard/notifications", icon: ICONS.notifications, badge: unreadCount },
        { name: "Paramètres", href: "/dashboard/parametres", icon: ICONS.settings },
      ],
      bottom: [],
    };
  }

  // fournisseur
  return {
    main: [
      ...common,
      { name: "Souscriptions", href: "/dashboard/souscriptions", icon: ICONS.souscriptions },
      { name: "Souscription client", href: "/dashboard/souscriptions/creer", icon: ICONS.articles },
      { name: "Devis", href: "/dashboard/devis", icon: ICONS.documentation },
      { name: "Feedbacks banque", href: "/dashboard/fournisseur/feedbacks", icon: ICONS.shield },
      { name: "Paiements", href: "/dashboard/paiements", icon: ICONS.paiements },
      { name: "Notifications", href: "/dashboard/notifications", icon: ICONS.notifications, badge: unreadCount },
    ],
    bottom: [
      { name: "Paramètres", href: "/dashboard/parametres", icon: ICONS.settings },
    ],
  };
}

// ─── Item de navigation ───────────────────────────────────────────────────────
function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children?.some(c => c.href && (item.exact ? pathname === c.href : pathname.startsWith(c.href)));
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) || isChildActive;

  // Par défaut ouvert si actif ou toujours ouvert pour l'onglet Banques
  const [isOpen, setIsOpen] = useState(true);

  if (hasChildren && !collapsed) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={cn(
            "ldf-sidebar-item group relative w-full text-left flex items-center justify-between cursor-pointer",
            isActive && "active",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate text-sm">{item.name}</span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/50 transition-transform duration-200 flex-shrink-0",
              isOpen ? "rotate-180" : ""
            )}
          />
        </button>

        {isOpen && (
          <div className="pl-6 pr-1 py-1 space-y-1">
            {item.children?.map((child, idx) => {
              if (child.disabled) {
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-white/35 cursor-not-allowed select-none bg-white/[0.02]"
                    title="Banque bientôt disponible en Phase 2"
                  >
                    <span className="truncate">{child.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/5">
                      {child.badge || "Bientôt"}
                    </span>
                  </div>
                );
              }

              const isSubActive = child.href ? (item.exact ? pathname === child.href : pathname.startsWith(child.href)) : false;

              return (
                <Link
                  key={idx}
                  href={child.href || "#"}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isSubActive
                      ? "bg-white/15 text-white font-semibold shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <span className="truncate">{child.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        "ldf-sidebar-item group relative",
        isActive && "active",
        collapsed && "justify-center px-2",
      )}
    >
      <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed ? "" : "mr-0")} />

      {!collapsed && (
        <span className="flex-1 truncate text-sm">{item.name}</span>
      )}

      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <span className={cn(
          "flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
          "bg-cyan-400 text-cyan-900",
          collapsed && "absolute -top-1 -right-1",
        )}>
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}

      {/* Tooltip quand collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md
                        whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100
                        transition-opacity z-50 shadow-lg">
          {item.name}
          {item.badge && item.badge > 0 ? ` (${item.badge})` : ""}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </Link>
  );
}

// ─── Sidebar principale ───────────────────────────────────────────────────────
export default function LDFSidebar() {
  const pathname = usePathname();
  const { user, logout, isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setMobileSidebarOpen } = useLDFAuthStore();
  const { getUnreadNotifications } = useVitalisDb();

  if (!user) return null;

  const unreadCount = getUnreadNotifications(user.id).length;
  const { main, bottom } = getNav(user.role, unreadCount);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* ── Logo ViFlo ── */}
      <div className={cn(
        "flex items-center border-b border-white/8 flex-shrink-0",
        isSidebarCollapsed && !mobile ? "justify-center px-3 py-4" : "px-4 py-4 gap-3",
      )}>
        <div className="w-15 h-15 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-white p-1 shadow-sm">
          <Image
            src={IMAGES.logos.vifloText}
            alt="ViFlo"
            width={50}
            height={50}
            className="object-contain w-full h-full"
          />
        </div>
        {(!isSidebarCollapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-none tracking-tight truncate">
              ViFlo<span className="text-[11px] font-semibold text-[#FF9E44] ml-0.5" style={{ fontSize: "11px", color: "#FFFFFF" }}>by</span><span className="text-[11px] font-semibold text-[#FF9E44] ml-0.5" style={{ fontSize: "11px", color: "#FF9E44" }}>FADES</span>
            </p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(190,215,255,0.55)" }}>Donnons vie à vos projets</p>
          </div>
        )}
        {mobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "rgba(190,215,255,0.6)" }}
          >
            <ICONS.close className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation principale ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {main.map((item) => (
          <NavLink key={item.href} item={item} collapsed={isSidebarCollapsed && !mobile} pathname={pathname} />
        ))}

        {/* Séparateur */}
        {bottom.length > 0 && (
          <div className="border-t my-2" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
        )}
        {bottom.map((item) => (
          <NavLink key={item.href} item={item} collapsed={isSidebarCollapsed && !mobile} pathname={pathname} />
        ))}
      </nav>

      {/* ── Profil utilisateur ── */}
      {(() => {
        const displayName = user.role === "admin" || (user.prenom === "Administrateur" && (!user.nom || user.nom === "Admin"))
          ? "Administrateur"
          : user.role === "owner"
            ? "Propriétaire"
            : [user.prenom, user.nom].filter(Boolean).join(" ");

        const initials = user.role === "admin" || (user.prenom === "Administrateur" && (!user.nom || user.nom === "Admin"))
          ? "A"
          : user.role === "owner"
            ? "P"
            : `${user.prenom?.[0] || user.nom?.[0] || 'U'}${user.nom?.[0] || ''}`;

        return (
          <div className={cn(
            "p-3 flex-shrink-0",
            isSidebarCollapsed && !mobile ? "flex flex-col items-center gap-2" : "",
          )} style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {!isSidebarCollapsed || mobile ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #FF7B2E, #FFB300)" }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(190,215,255,0.55)" }}>{getRoleLabel(user.role)}</p>
                </div>
                <button
                  onClick={logout}
                  title="Déconnexion"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ color: "rgba(190,215,255,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(190,215,255,0.4)")}
                >
                  <ICONS.logout className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #FF7B2E, #FFB300)" }}>
                  {initials}
                </div>
                <button
                  onClick={logout}
                  title="Déconnexion"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "rgba(190,215,255,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(190,215,255,0.4)")}
                >
                  <ICONS.logout className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className={cn(
        "ldf-sidebar fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-64",
      )}>
        <SidebarContent />

        {/* Bouton collapse */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md
                     flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg
                     transition-all duration-200 z-10"
        >
          {isSidebarCollapsed
            ? <ICONS.chevronRight className="w-3.5 h-3.5" />
            : <ICONS.chevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* ── Mobile overlay ── */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="ldf-sidebar fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden slide-in">
            <SidebarContent mobile />
          </aside>
        </>
      )}
    </>
  );
}
