"use client";
import { getRoleLabel, useLDFAuthStore } from "@/stores/ldfAuth";
import type { LDFUserRole } from "@/types/ldf";
import { cn } from "@/lib/utils";
import {
  BarChart3, Bell, BookOpen, Building2, ChevronLeft, ChevronRight,
  CreditCard, FileText, Home, LogOut, Package, Settings, ShieldCheck,
  Users, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Navigation par rôle ──────────────────────────────────────────────────────
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
}

function getNav(role: LDFUserRole, unreadCount: number): { main: NavItem[]; bottom: NavItem[] } {
  const common: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home, exact: true },
  ];

  if (role === "admin") {
    return {
      main: [
        ...common,
        { name: "Souscriptions",   href: "/dashboard/souscriptions", icon: FileText },
        { name: "Devis",           href: "/dashboard/devis",          icon: BookOpen },
        { name: "Dossiers",        href: "/dashboard/dossiers",       icon: ShieldCheck },
        { name: "Paiements",       href: "/dashboard/paiements",      icon: CreditCard },
        { name: "Articles servis", href: "/dashboard/articles",       icon: Package },
        { name: "Notifications",   href: "/dashboard/notifications",  icon: Bell, badge: unreadCount },
        { name: "Rapports",        href: "/dashboard/rapports",       icon: BarChart3 },
      ],
      bottom: [
        { name: "Fournisseurs",    href: "/dashboard/admin/fournisseurs", icon: Building2 },
        { name: "Banques",         href: "/dashboard/admin/banques",      icon: Building2 },
        { name: "Utilisateurs",    href: "/dashboard/admin/utilisateurs", icon: Users },
        { name: "Paramètres",      href: "/dashboard/parametres",         icon: Settings },
      ],
    };
  }

  if (role === "banque") {
    return {
      main: [
        ...common,
        { name: "Souscripteurs",   href: "/dashboard/banque/souscripteurs", icon: Users },
        { name: "Dossiers",        href: "/dashboard/banque/dossiers",       icon: ShieldCheck },
        { name: "Paiements",       href: "/dashboard/paiements",             icon: CreditCard },
        { name: "Notifications",   href: "/dashboard/notifications",         icon: Bell, badge: unreadCount },
        { name: "Rapports",        href: "/dashboard/rapports",              icon: BarChart3 },
      ],
      bottom: [
        { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
      ],
    };
  }

  if (role === "souscripteur") {
    return {
      main: [
        { name: "Mes souscriptions", href: "/dashboard/souscripteur", icon: Home, exact: true },
        { name: "Notifications",     href: "/dashboard/notifications", icon: Bell, badge: unreadCount },
        { name: "Paramètres",         href: "/dashboard/parametres",    icon: Settings },
      ],
      bottom: [],
    };
  }

  // fournisseur
  return {
    main: [
      ...common,
      { name: "Souscriptions",    href: "/dashboard/souscriptions",        icon: FileText },
      { name: "Devis",            href: "/dashboard/devis",                 icon: BookOpen },
      { name: "Feedbacks banque", href: "/dashboard/fournisseur/feedbacks", icon: ShieldCheck },
      { name: "Paiements",        href: "/dashboard/paiements",             icon: CreditCard },
      { name: "Articles servis",  href: "/dashboard/articles",              icon: Package },
      { name: "Notifications",    href: "/dashboard/notifications",         icon: Bell, badge: unreadCount },
    ],
    bottom: [
      { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
    ],
  };
}

// ─── Item de navigation ───────────────────────────────────────────────────────
function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

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
  const { user, logout, isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setMobileSidebarOpen, unreadCount } =
    useLDFAuthStore();

  if (!user) return null;

  const { main, bottom } = getNav(user.role, unreadCount);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* ── Logo ViFlow ── */}
      <div className={cn(
        "flex items-center border-b border-white/10 flex-shrink-0",
        isSidebarCollapsed && !mobile ? "justify-center px-3 py-4" : "px-4 py-4 gap-3",
      )}>
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          <Image
            src="/images/viflow_logo.png"
            alt="ViFlow"
            width={40}
            height={40}
            className="object-contain"
            onError={() => {}}
          />
        </div>
        {(!isSidebarCollapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-none truncate">
              Vi<span className="text-gradient-vf">Flo</span>
            </p>
            <p className="text-xs text-cyan-300/80 mt-0.5 truncate">Financements Vitalis</p>
          </div>
        )}
        {mobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
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
          <div className="border-t border-white/10 my-2" />
        )}
        {bottom.map((item) => (
          <NavLink key={item.href} item={item} collapsed={isSidebarCollapsed && !mobile} pathname={pathname} />
        ))}
      </nav>

      {/* ── Profil utilisateur ── */}
      <div className={cn(
        "border-t border-white/10 p-3 flex-shrink-0",
        isSidebarCollapsed && !mobile ? "flex flex-col items-center gap-2" : "",
      )}>
        {!isSidebarCollapsed || mobile ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}>
              {user.prenom?.[0] || user.nom?.[0] || 'U'}{user.nom?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.prenom} {user.nom}</p>
              <p className="text-orange-200/80 text-xs truncate">{getRoleLabel(user.role)}</p>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}>
              {user.prenom?.[0] || user.nom?.[0] || 'U'}{user.nom?.[0] || ''}
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
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
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />}
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
