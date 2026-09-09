"use client";
import { getFilteredNotifications, useLDFAuthStore } from "@/stores/ldfAuth";
import { mockSouscriptions, mockDevis, mockDossiers, mockPaiements } from "@/lib/ldfData";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/ui/ldf-badge";

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  souscriptions: "Souscriptions",
  devis: "Devis",
  dossiers: "Dossiers",
  paiements: "Paiements",
  articles: "Articles servis",
  notifications: "Notifications",
  rapports: "Rapports",
  parametres: "Paramètres",
  admin: "Administration",
  fournisseurs: "Fournisseurs",
  banques: "Banques",
  utilisateurs: "Utilisateurs",
  banque: "Banque",
  souscripteurs: "Souscripteurs",
  fournisseur: "Fournisseur",
  feedbacks: "Feedbacks",
  creer: "Nouvelle souscription",
  nouveau: "Nouveau devis",
};

function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400">
      {parts.map((part, i) => {
        const label = ROUTE_LABELS[part] ?? (part.startsWith("SUB-") || part.startsWith("DEV-") || part.startsWith("DOS-") || part.startsWith("PAY-") ? part : null);
        if (!label) return null;
        const isLast = i === parts.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span>/</span>}
            <span className={isLast ? "text-gray-600 font-medium" : ""}>{label}</span>
          </span>
        );
      })}
    </nav>
  );
}

// ─── Page title ───────────────────────────────────────────────────────────────
function usePageTitle() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return ROUTE_LABELS[last] ?? "ViFlow";
}

// ─── Recherche globale ────────────────────────────────────────────────────────
type SearchResult = { id: string; type: string; titre: string; description: string; statut?: string; href: string };

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    const res: SearchResult[] = [];

    mockSouscriptions.filter(s =>
      s.reference.toLowerCase().includes(q) ||
      `${s.souscripteurNom} ${s.souscripteurPrenom}`.toLowerCase().includes(q) ||
      s.fournisseurNom.toLowerCase().includes(q)
    ).slice(0, 4).forEach(s => res.push({
      id: s.id, type: "Souscription", titre: s.reference,
      description: `${s.souscripteurPrenom} ${s.souscripteurNom} — ${s.fournisseurNom}`,
      statut: s.statut, href: `/dashboard/souscriptions/${s.id}`,
    }));

    mockDevis.filter(d =>
      d.reference.toLowerCase().includes(q) || d.souscripteurNom.toLowerCase().includes(q)
    ).slice(0, 3).forEach(d => res.push({
      id: d.id, type: "Devis", titre: d.reference,
      description: `${d.souscripteurNom} — ${d.fournisseurNom}`,
      statut: d.statut, href: `/dashboard/devis/${d.id}`,
    }));

    mockDossiers.filter(d =>
      d.reference.toLowerCase().includes(q) || d.souscripteurNom.toLowerCase().includes(q)
    ).slice(0, 3).forEach(d => res.push({
      id: d.id, type: "Dossier", titre: d.reference,
      description: `${d.souscripteurPrenom} ${d.souscripteurNom} — ${d.banqueNom}`,
      statut: d.statut, href: `/dashboard/dossiers/${d.id}`,
    }));

    mockPaiements.filter(p =>
      p.reference.toLowerCase().includes(q) || p.souscripteurNom.toLowerCase().includes(q)
    ).slice(0, 3).forEach(p => res.push({
      id: p.id, type: "Paiement", titre: p.reference,
      description: `${p.souscripteurPrenom} ${p.souscripteurNom} — ${(p.montant).toLocaleString("fr-FR")} FCFA`,
      statut: p.statut, href: `/dashboard/paiements/${p.id}`,
    }));

    setResults(res.slice(0, 10));
  }, [query]);

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-500 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-400">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setOpen(false); setQuery(""); }} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden fade-in">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Rechercher une souscription, un devis, un dossier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Résultats */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.href}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">{r.type}</span>
                      <span className="text-sm font-medium text-gray-800 truncate">{r.titre}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{r.description}</p>
                  </div>
                  {r.statut && <StatusBadge statut={r.statut} size="sm" />}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">Aucun résultat pour « {query} »</div>
        )}
        {!query && (
          <div className="py-8 text-center text-sm text-gray-400">
            Tapez pour rechercher dans les souscriptions, devis, dossiers...
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dropdown notifications ───────────────────────────────────────────────────
function NotificationsDropdown() {
  const { user, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, setNotifications } = useLDFAuthStore();
  const [open, setOpen] = useState(false);

  // Charger les notifs filtrées par rôle à l'ouverture
  useEffect(() => {
    if (user?.role) {
      const filtered = getFilteredNotifications(user.role);
      setNotifications(filtered);
    }
  }, [user?.role, setNotifications]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = notifications.slice(0, 6);

  const CAT_COLORS: Record<string, string> = {
    souscription: "bg-cyan-100 text-cyan-700",
    devis: "bg-blue-100 text-blue-700",
    dossier: "bg-emerald-100 text-emerald-700",
    paiement: "bg-green-100 text-green-700",
    systeme: "bg-gray-100 text-gray-600",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 fade-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllNotificationsRead} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                Tout marquer lu
              </button>
            )}
          </div>

          <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {recent.length === 0
              ? <li className="py-8 text-center text-sm text-gray-400">Aucune notification</li>
              : recent.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.lien ?? "/dashboard/notifications"}
                    onClick={() => { markNotificationRead(n.id); setOpen(false); }}
                    className={cn("flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors", !n.estLue && "bg-cyan-50/50")}
                  >
                    <span className={cn("mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0", CAT_COLORS[n.categorie] ?? "bg-gray-100 text-gray-600")}>
                      {n.categorie.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs leading-snug", !n.estLue ? "font-semibold text-gray-900" : "text-gray-700")}>{n.titre}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{n.date}</p>
                    </div>
                    {!n.estLue && <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />}
                  </Link>
                </li>
              ))}
          </ul>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
              Voir toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dropdown profil ──────────────────────────────────────────────────────────
function ProfileDropdown() {
  const { user, logout } = useLDFAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}>
          {user.prenom?.[0] || user.nom?.[0] || 'U'}{user.nom?.[0] || ''}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-800 leading-none">{user.prenom} {user.nom}</p>
          <p className="text-xs text-gray-500 leading-none mt-0.5">{user.organisationName ?? "ViFlow"}</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 fade-in overflow-hidden py-1">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user.prenom} {user.nom}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link href="/dashboard/parametres" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 text-gray-400" /> Paramètres
          </Link>
          <Link href="/dashboard/profil" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <User className="w-4 h-4 text-gray-400" /> Mon profil
          </Link>
          <div className="border-t border-gray-100 mt-1">
            <button onClick={() => { logout(); setOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Header principal ─────────────────────────────────────────────────────────
export default function LDFHeader() {
  const { toggleMobileSidebar, user, setNotifications } = useLDFAuthStore();
  const title = usePageTitle();

  // Initialiser les notifications filtrées par rôle
  useEffect(() => {
    if (user?.role) {
      setNotifications(getFilteredNotifications(user.role));
    }
  }, [user?.role, setNotifications]);

  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shadow-sm">
      {/* Mobile menu */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title + breadcrumb */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
        <Breadcrumb />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <GlobalSearch />
        <NotificationsDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
