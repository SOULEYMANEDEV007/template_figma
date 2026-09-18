import React from "react";
import {
  // Navigation & Vues
  LayoutDashboard,
  FileText,
  Folder,
  CreditCard,
  Building2,
  Store,
  Users,
  User,
  Package,
  FileBarChart2,
  Settings,
  Bell,
  BookOpen,
  Activity,
  Wallet,

  // Actions
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Printer,
  Send,
  Search,
  Save,
  RotateCw,
  LogOut,
  Menu,
  X,
  Check,
  CheckCheck,

  // Flèches & Direction
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,

  // Statuts & États
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  Loader2,
  Info,
  TrendingUp,
  TrendingDown,

  // Métier & Sécurité
  Lock,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  Calendar,
  ShoppingCart,
  DollarSign,

  // Type Lucide
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/**
 * Registre centralisé des icônes de l'application.
 * 
 * Avantage : Si vous décidez de changer l'icône de la banque ou du panier,
 * changez la référence ici une seule fois, tout le projet reflétera la mise à jour.
 * 
 * @example
 * // 1. Utilisation directe comme composant React :
 * <ICONS.bank className="w-5 h-5 text-blue-600" />
 * 
 * // 2. Via le composant AppIcon typé :
 * <AppIcon name="bank" size={20} className="text-blue-600" />
 */
export const ICONS = {
  // --- Navigation & Modules ---
  dashboard: LayoutDashboard,
  souscriptions: FileText,
  devis: FileText,
  dossiers: Folder,
  paiements: CreditCard,
  banque: Building2,
  fournisseur: Store,
  users: Users,
  user: User,
  articles: Package,
  rapports: FileBarChart2,
  settings: Settings,
  notifications: Bell,
  documentation: BookOpen,
  activity: Activity,
  wallet: Wallet,

  // --- Actions ---
  add: Plus,
  edit: Edit,
  delete: Trash2,
  download: Download,
  view: Eye,
  viewOff: EyeOff,
  print: Printer,
  send: Send,
  search: Search,
  save: Save,
  refresh: RotateCw,
  logout: LogOut,
  menu: Menu,
  close: X,
  check: Check,
  checkAll: CheckCheck,

  // --- Navigation directionnelle ---
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,

  // --- Statuts & Retours utilisateur ---
  success: CheckCircle2,
  successAlt: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  alert: AlertCircle,
  pending: Clock,
  loading: Loader2,
  info: Info,
  trendUp: TrendingUp,
  trendDown: TrendingDown,

  // --- Sécurité, Contact & Formulaires ---
  lock: Lock,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  shield: ShieldCheck,
  sparkles: Sparkles,
  calendar: Calendar,
  cart: ShoppingCart,
  money: DollarSign,
  bank: Building2,
  package: Package,
} as const;

/**
 * Nom des icônes disponibles avec autocomplétion TypeScript stricte
 */
export type IconName = keyof typeof ICONS;

export interface AppIconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

/**
 * Composant partagé d'icône avec autocomplétion
 */
export function AppIcon({ name, className, size = 18, ...props }: AppIconProps) {
  const IconComponent = ICONS[name] as LucideIcon | undefined;

  if (!IconComponent) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[AppIcon] L'icône "${name}" n'a pas été trouvée dans le registre central.`);
    }
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
}
