// @ts-nocheck
"use client";

import { ConfirmModal, LDFModal } from "@/components/ui/ldf-modal";
import {
    AD_PLACEMENTS_META,
    MAX_VIDEO_SIZE_BYTES,
    MAX_VIDEO_SIZE_MB,
    OFFICIAL_FOURNISSEURS,
    getPartnerLogo,
    type AdPlacement,
    type SupplierVideoAd,
} from "@/lib/constants";
import {
    resolveAdVideoUrl,
    saveAdVideoFile,
    useAdsStore,
} from "@/stores/adsStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import {
    ArrowDown,
    ArrowUp,
    BadgeCheck,
    Check,
    CheckCircle2,
    ChevronDown,
    Edit,
    Film,
    Lock,
    Megaphone,
    MonitorPlay,
    PauseCircle,
    PlayCircle,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    Sparkles,
    Store,
    Trash2,
    Upload,
    Users,
    Video,
    X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const PLACEMENT_ICONS: Record<AdPlacement, any> = {
    splash: Sparkles,
    login: Lock,
    client: Users,
    fournisseur: Store,
};

/** Sous-composant lecteur d'aperçu gérant à la fois /videos/ads/... et idb://... */
function AdminAdVideoPreview({ videoSrc }: { videoSrc: string }) {
    const [playableUrl, setPlayableUrl] = useState<string | null>(
        videoSrc?.startsWith("idb://") ? null : videoSrc
    );

    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        if (!videoSrc) {
            setPlayableUrl(null);
            return;
        }

        if (!videoSrc.startsWith("idb://")) {
            setPlayableUrl(videoSrc);
            return;
        }

        resolveAdVideoUrl(videoSrc).then((url) => {
            if (cancelled) {
                if (url) URL.revokeObjectURL(url);
                return;
            }
            objectUrl = url;
            setPlayableUrl(url);
        });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [videoSrc]);

    if (!playableUrl) {
        return (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/60 text-xs gap-2">
                <Film className="w-6 h-6 text-orange-400" />
                <span>Aperçu vidéo indisponible</span>
            </div>
        );
    }

    return (
        <video
            src={playableUrl}
            controls
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover bg-slate-950"
        />
    );
}

const DEFAULT_PLACEMENTS: AdPlacement[] = ["splash", "login", "client", "fournisseur"];

export default function AdminPublicitesPage() {
    const { user } = useLDFAuthStore();
    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";

    const { fournisseurs = [] } = useVitalisDb();
    const {
        campaigns = [],
        addCampaign,
        updateCampaign,
        toggleCampaignStatus,
        moveCampaign,
        deleteCampaign,
        resetDemoCampaigns,
    } = useAdsStore();

    // Liste consolidée des fournisseurs agréés actifs
    const eligibleSuppliers = useMemo(() => {
        const base = fournisseurs.length >= 10 ? fournisseurs : OFFICIAL_FOURNISSEURS;
        return base.filter(
            (f) =>
                (f.statut === "actif" || f.statut === "agree") &&
                f.id !== "FOUR-COM-003" &&
                f.code !== "COMAF"
        );
    }, [fournisseurs]);

    // Filtres barre d'outils
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "actif" | "pause">("");
    const [placementFilter, setPlacementFilter] = useState<"" | AdPlacement>("");
    const [placementDropdownOpen, setPlacementDropdownOpen] = useState(false);
    const placementDropdownRef = useRef<HTMLDivElement | null>(null);

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState<SupplierVideoAd | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SupplierVideoAd | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Formulaire + Sélecteur fournisseur riche
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const supplierDropdownRef = useRef<HTMLDivElement | null>(null);
    const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
    const [supplierQuery, setSupplierQuery] = useState("");

    const [fournisseurId, setFournisseurId] = useState("");
    const [slogan, setSlogan] = useState("");
    const [emplacements, setEmplacements] = useState<AdPlacement[]>(DEFAULT_PLACEMENTS);
    const [statut, setStatut] = useState<"actif" | "pause">("actif");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Fermeture automatique des menus déroulants personnalisés au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                placementDropdownRef.current &&
                !placementDropdownRef.current.contains(e.target as Node)
            ) {
                setPlacementDropdownOpen(false);
            }
            if (
                supplierDropdownRef.current &&
                !supplierDropdownRef.current.contains(e.target as Node)
            ) {
                setSupplierDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        };
    }, [filePreviewUrl]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((ad) => {
            const q = search.trim().toLowerCase();
            const matchSearch =
                !q ||
                ad.nom.toLowerCase().includes(q) ||
                ad.secteur.toLowerCase().includes(q) ||
                ad.slogan.toLowerCase().includes(q);
            const matchStatus = !statusFilter || ad.statut === statusFilter;
            const matchPlacement =
                !placementFilter || (ad.emplacements || []).includes(placementFilter);
            return matchSearch && matchStatus && matchPlacement;
        });
    }, [campaigns, search, statusFilter, placementFilter]);

    const selectedSupplier = useMemo(() => {
        return (
            eligibleSuppliers.find((f) => f.id === fournisseurId) ||
            OFFICIAL_FOURNISSEURS.find((f) => f.id === fournisseurId) ||
            eligibleSuppliers[0]
        );
    }, [eligibleSuppliers, fournisseurId]);

    const searchedSuppliers = useMemo(() => {
        const q = supplierQuery.trim().toLowerCase();
        if (!q) return eligibleSuppliers;
        return eligibleSuppliers.filter(
            (f) =>
                f.nom.toLowerCase().includes(q) ||
                (f.secteurActivite || "").toLowerCase().includes(q) ||
                (f.code || "").toLowerCase().includes(q)
        );
    }, [eligibleSuppliers, supplierQuery]);

    // KPIs
    const activeCount = campaigns.filter((c) => c.statut === "actif").length;
    const pausedCount = campaigns.length - activeCount;
    const coveredSuppliersCount = new Set(campaigns.map((c) => c.fournisseurId)).size;

    const openCreateModal = () => {
        setEditingAd(null);
        setFournisseurId(eligibleSuppliers[0]?.id || "");
        setSlogan("");
        setEmplacements(DEFAULT_PLACEMENTS);
        setStatut("actif");
        setSelectedFile(null);
        setSupplierQuery("");
        setSupplierDropdownOpen(false);
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
        setFileError(null);
        setShowModal(true);
    };

    const openEditModal = (ad: SupplierVideoAd) => {
        setEditingAd(ad);
        setFournisseurId(ad.fournisseurId);
        setSlogan(ad.slogan);
        setEmplacements(ad.emplacements?.length ? ad.emplacements : DEFAULT_PLACEMENTS);
        setStatut(ad.statut || "actif");
        setSelectedFile(null);
        setSupplierQuery("");
        setSupplierDropdownOpen(false);
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
        setFileError(null);
        setShowModal(true);
    };

    const handleFileChange = (file: File | undefined) => {
        setFileError(null);
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            const msg = "Format invalide : veuillez choisir une vidéo .mp4 ou .webm.";
            setFileError(msg);
            toast.error(msg);
            return;
        }

        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            const msg = `Cette vidéo pèse ${sizeMb} Mo. La limite du prototype est fixée à ${MAX_VIDEO_SIZE_MB} Mo.`;
            setFileError(msg);
            setSelectedFile(null);
            toast.error("Vidéo trop volumineuse", { description: msg });
            return;
        }

        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setSelectedFile(file);
        setFilePreviewUrl(URL.createObjectURL(file));
    };

    const togglePlacement = (val: AdPlacement) => {
        setEmplacements((prev) =>
            prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        const supplier =
            eligibleSuppliers.find((f) => f.id === fournisseurId) ||
            OFFICIAL_FOURNISSEURS.find((f) => f.id === fournisseurId);

        if (!supplier) {
            toast.error("Veuillez sélectionner un fournisseur agréé.");
            return;
        }
        if (emplacements.length === 0) {
            toast.error("Cochez au moins une zone de diffusion.");
            return;
        }
        if (!editingAd && !selectedFile) {
            toast.error("Veuillez importer le fichier vidéo de la publicité.");
            return;
        }

        setSaving(true);
        try {
            const adId = editingAd?.id || `AD-${supplier.code || "FRN"}-${Date.now()}`;
            let videoSrc = editingAd?.videoSrc || "";
            let tailleMo = editingAd?.tailleMo;

            if (selectedFile) {
                const saved = await saveAdVideoFile(adId, selectedFile);
                videoSrc = saved.videoSrc;
                tailleMo = saved.tailleMo;
            }

            const payload: SupplierVideoAd = {
                id: adId,
                fournisseurId: supplier.id,
                code: supplier.code || supplier.nom.slice(0, 6).toUpperCase(),
                nom: supplier.nom,
                secteur: supplier.secteurActivite || "Fournisseur agréé ViFlo",
                slogan:
                    slogan.trim() ||
                    `Découvrez les offres ${supplier.nom} financées via le programme Vitalis.`,
                logo:
                    supplier.logo && !supplier.logo.includes(".jfif")
                        ? supplier.logo
                        : getPartnerLogo(supplier.nom, supplier.id),
                videoSrc,
                statut,
                emplacements,
                tailleMo,
                dateCreation: editingAd?.dateCreation || new Date().toISOString().slice(0, 10),
                isDefault: editingAd?.isDefault ?? false,
            };

            if (editingAd) {
                updateCampaign(editingAd.id, payload);
                toast.success(`Publicité ${supplier.nom} mise à jour !`);
            } else {
                addCampaign(payload);
                toast.success(`Publicité ${supplier.nom} publiée avec succès !`);
            }
            setShowModal(false);
        } catch (err: any) {
            toast.error(err?.message || "Erreur lors de l'enregistrement de la vidéo.");
        } finally {
            setSaving(false);
        }
    };

    const activePlacementLabel =
        AD_PLACEMENTS_META.find((p) => p.value === placementFilter)?.label ||
        "Toutes les zones";

    return (
        <div className="space-y-6">
            {/* ─── En-tête ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Régie Publicitaire Fournisseurs
                        </h1>
                        {isOwner && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                Mode Supervision · Lecture seule
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez les spots vidéo diffusés sur le Splash Screen, la page Connexion et les espaces utilisateurs.
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowResetConfirm(true)}
                            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                        >
                            <RotateCcw className="w-4 h-4 text-gray-500" />
                            Réinitialiser démo
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#FF7B2E] hover:from-[#E64A00] hover:to-[#FF5E00] text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-orange-500/20 transition cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Nouvelle publicité
                        </button>
                    </div>
                )}
            </div>

            {/* ─── KPIs ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Spots enregistrés",
                        value: campaigns.length,
                        sub: "Campagnes vidéo configurées",
                        icon: Film,
                        color: "text-blue-600 bg-blue-50",
                    },
                    {
                        label: "En diffusion active",
                        value: activeCount,
                        sub: `${pausedCount} en pause`,
                        icon: PlayCircle,
                        color: "text-emerald-600 bg-emerald-50",
                    },
                    {
                        label: "Partenaires couverts",
                        value: `${coveredSuppliersCount} / ${eligibleSuppliers.length}`,
                        sub: "Fournisseurs agréés ViFlo",
                        icon: ShieldCheck,
                        color: "text-orange-600 bg-orange-50",
                    },
                    {
                        label: "Limite par vidéo",
                        value: `${MAX_VIDEO_SIZE_MB} Mo`,
                        sub: "Formats MP4 & WebM (Prototype)",
                        icon: Megaphone,
                        color: "text-purple-600 bg-purple-50",
                    },
                ].map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
                            <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
                            <p className="text-[11px] text-gray-400">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Barre d'outils moderne (Recherche + Pilules Statut + Menu Zones stylisé) ─── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Recherche */}
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un fournisseur, secteur ou slogan..."
                        className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#FF5E00] focus:ring-4 focus:ring-orange-500/10 transition"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Pilules segmentées Statut */}
                <div className="inline-flex items-center p-1 rounded-xl bg-gray-100/80 border border-gray-200/60 self-start lg:self-auto">
                    {[
                        { value: "", label: `Tous (${campaigns.length})` },
                        { value: "actif", label: `Actifs (${activeCount})` },
                        { value: "pause", label: `En pause (${pausedCount})` },
                    ].map((tab) => {
                        const active = statusFilter === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setStatusFilter(tab.value as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${active
                                    ? "bg-white text-[#0B2447] shadow-xs"
                                    : "text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Menu déroulant personnalisé Zones d'affichage */}
                <div ref={placementDropdownRef} className="relative min-w-[215px]">
                    <button
                        type="button"
                        onClick={() => setPlacementDropdownOpen((o) => !o)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 text-sm font-medium text-gray-700 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                        <span className="flex items-center gap-2 truncate">
                            <MonitorPlay className="w-4 h-4 text-[#FF5E00] flex-shrink-0" />
                            <span className="truncate">{activePlacementLabel}</span>
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${placementDropdownOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {placementDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-gray-100 shadow-xl p-1.5 z-40">
                            <button
                                type="button"
                                onClick={() => {
                                    setPlacementFilter("");
                                    setPlacementDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${placementFilter === ""
                                    ? "bg-orange-50 text-[#FF5E00]"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <span>Toutes les zones de diffusion</span>
                                {placementFilter === "" && <Check className="w-4 h-4 text-[#FF5E00]" />}
                            </button>

                            <div className="my-1 h-px bg-gray-100" />

                            {AD_PLACEMENTS_META.map((p) => {
                                const PIcon = PLACEMENT_ICONS[p.value] || MonitorPlay;
                                const isSelected = placementFilter === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => {
                                            setPlacementFilter(p.value);
                                            setPlacementDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition cursor-pointer ${isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected
                                                    ? "bg-[#FF5E00] text-white"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                <PIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-xs font-semibold truncate ${isSelected ? "text-[#FF5E00]" : "text-gray-800"
                                                        }`}
                                                >
                                                    {p.label}
                                                </p>
                                                <p className="text-[10px] text-gray-400 truncate">
                                                    {p.description}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-[#FF5E00] flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Grille des spots publicitaires ─── */}
            {filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                    <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">Aucune publicité trouvée</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Ajoutez un spot vidéo d'un fournisseur agréé pour lancer la diffusion.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {filteredCampaigns.map((ad, idx) => {
                        const isActive = ad.statut === "actif";
                        return (
                            <div
                                key={ad.id}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                            >
                                <div className="relative aspect-video bg-slate-950">
                                    <AdminAdVideoPreview videoSrc={ad.videoSrc} />
                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow ${isActive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                                }`}
                                        >
                                            {isActive ? "● Actif" : "❚❚ En pause"}
                                        </span>
                                        {ad.tailleMo && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/65 text-white backdrop-blur-sm">
                                                {ad.tailleMo} Mo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                                                <Image
                                                    src={ad.logo || getPartnerLogo(ad.nom, ad.fournisseurId)}
                                                    alt={ad.nom}
                                                    width={36}
                                                    height={36}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">
                                                    {ad.nom}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">{ad.secteur}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-600 mt-2.5 line-clamp-2 italic">
                                            « {ad.slogan} »
                                        </p>

                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {(ad.emplacements || DEFAULT_PLACEMENTS).map((pl) => {
                                                const meta = AD_PLACEMENTS_META.find((m) => m.value === pl);
                                                return (
                                                    <span
                                                        key={pl}
                                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200"
                                                    >
                                                        {meta?.label || pl}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveCampaign(ad.id, "up")}
                                                    disabled={idx === 0}
                                                    title="Monter dans l'ordre de diffusion"
                                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-35 cursor-pointer"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveCampaign(ad.id, "down")}
                                                    disabled={idx === filteredCampaigns.length - 1}
                                                    title="Descendre dans l'ordre de diffusion"
                                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-35 cursor-pointer"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        toggleCampaignStatus(ad.id);
                                                        toast.success(
                                                            isActive
                                                                ? `Spot ${ad.nom} mis en pause.`
                                                                : `Spot ${ad.nom} réactivé !`
                                                        );
                                                    }}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${isActive
                                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        }`}
                                                >
                                                    {isActive ? (
                                                        <>
                                                            <PauseCircle className="w-3.5 h-3.5" /> Pause
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlayCircle className="w-3.5 h-3.5" /> Activer
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(ad)}
                                                    title="Modifier"
                                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(ad)}
                                                    title="Supprimer"
                                                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── MODALE PREMIUM AJOUT / MODIFICATION ─── */}
            <LDFModal open={showModal} onClose={() => setShowModal(false)} size="lg">
                {/* En-tête immersif Bleu ViFlo */}
                <div className="-mx-6 -mt-5 mb-6 px-6 py-5 bg-gradient-to-r from-[#0B2447] via-[#133566] to-[#1a4580] text-white flex items-center justify-between relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#FF5E00]/25 blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3.5 relative z-10">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF7B2E] to-[#FF5E00] flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                                    {editingAd
                                        ? `Modifier le spot · ${editingAd.nom}`
                                        : "Nouvelle publicité fournisseur"}
                                </h2>
                                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-orange-200">
                                    Max {MAX_VIDEO_SIZE_MB} Mo
                                </span>
                            </div>
                            <p className="text-xs text-white/75 mt-0.5">
                                Associez un fournisseur agréé ViFlo à son spot vidéo promotionnel.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="relative z-10 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    {/* 1. SÉLECTEUR FOURNISSEUR AGRÉÉ AVEC LOGOS & RECHERCHE */}
                    <div ref={supplierDropdownRef} className="space-y-1.5 relative">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                            <span>1. Fournisseur agréé *</span>
                            <span className="text-[11px] font-medium text-gray-400 normal-case">
                                {eligibleSuppliers.length} partenaires disponibles
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={() => setSupplierDropdownOpen((o) => !o)}
                            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${supplierDropdownOpen
                                ? "border-[#FF5E00] ring-4 ring-orange-500/10 bg-white"
                                : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-white"
                                }`}
                        >
                            {selectedSupplier ? (
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <Image
                                            src={
                                                selectedSupplier.logo && !selectedSupplier.logo.includes(".jfif")
                                                    ? selectedSupplier.logo
                                                    : getPartnerLogo(selectedSupplier.nom, selectedSupplier.id)
                                            }
                                            alt={selectedSupplier.nom}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {selectedSupplier.nom}
                                            </p>
                                            <BadgeCheck className="w-4 h-4 text-[#FF5E00] flex-shrink-0" />
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {selectedSupplier.secteurActivite}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">
                                    Sélectionner un fournisseur...
                                </span>
                            )}

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600">
                                    Changer
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform ${supplierDropdownOpen ? "rotate-180 text-[#FF5E00]" : ""
                                        }`}
                                />
                            </div>
                        </button>

                        {/* Menu déroulant riche avec barre de recherche + logos */}
                        {supplierDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1.5 rounded-2xl bg-white border border-gray-200 shadow-2xl z-50 overflow-hidden">
                                <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            autoFocus
                                            value={supplierQuery}
                                            onChange={(e) => setSupplierQuery(e.target.value)}
                                            placeholder="Rechercher un fournisseur (ex: SOCIDA, LG, Kaydan...)"
                                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#FF5E00]"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                                    {searchedSuppliers.length === 0 ? (
                                        <p className="text-xs text-center text-gray-400 py-6">
                                            Aucun fournisseur ne correspond à « {supplierQuery} »
                                        </p>
                                    ) : (
                                        searchedSuppliers.map((f) => {
                                            const isSelected = f.id === fournisseurId;
                                            const logoUrl =
                                                f.logo && !f.logo.includes(".jfif")
                                                    ? f.logo
                                                    : getPartnerLogo(f.nom, f.id);
                                            return (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFournisseurId(f.id);
                                                        setSupplierDropdownOpen(false);
                                                        setSupplierQuery("");
                                                    }}
                                                    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${isSelected
                                                        ? "bg-orange-50/90 border border-orange-200"
                                                        : "hover:bg-gray-50 border border-transparent"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center flex-shrink-0">
                                                            <Image
                                                                src={logoUrl}
                                                                alt={f.nom}
                                                                width={32}
                                                                height={32}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p
                                                                className={`text-xs font-bold truncate ${isSelected ? "text-[#FF5E00]" : "text-gray-900"
                                                                    }`}
                                                            >
                                                                {f.nom}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 truncate">
                                                                {f.secteurActivite}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <span className="w-5 h-5 rounded-full bg-[#FF5E00] text-white flex items-center justify-center flex-shrink-0">
                                                            <Check className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. SLOGAN & STATUT INITIAL */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                2. Slogan promotionnel
                            </label>
                            <div className="relative">
                                <Sparkles className="w-4 h-4 text-[#FF5E00] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={slogan}
                                    onChange={(e) => setSlogan(e.target.value)}
                                    placeholder="Ex : Financez vos équipements avec Vitalis..."
                                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#FF5E00] focus:ring-4 focus:ring-orange-500/10 transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Statut initial
                            </label>
                            <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 border border-gray-200 h-[42px]">
                                <button
                                    type="button"
                                    onClick={() => setStatut("actif")}
                                    className={`rounded-lg text-xs font-bold transition cursor-pointer ${statut === "actif"
                                        ? "bg-emerald-500 text-white shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    ● Actif
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatut("pause")}
                                    className={`rounded-lg text-xs font-bold transition cursor-pointer ${statut === "pause"
                                        ? "bg-amber-500 text-white shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    ❚❚ Pause
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. ZONE UPLOAD STUDIO VIDÉO */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                3. Spot vidéo {editingAd ? "(optionnel si inchangé)" : "*"}
                            </label>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5E00] border border-orange-200">
                                Limite : {MAX_VIDEO_SIZE_MB} Mo
                            </span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={(e) => handleFileChange(e.target.files?.[0])}
                            className="hidden"
                        />

                        {!filePreviewUrl ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleFileChange(e.dataTransfer.files?.[0]);
                                }}
                                className={`group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${fileError
                                    ? "border-red-300 bg-red-50/50"
                                    : "border-gray-200 hover:border-[#FF5E00] bg-gradient-to-b from-gray-50/60 to-orange-50/20"
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-orange-100/80 group-hover:bg-[#FF5E00] text-[#FF5E00] group-hover:text-white flex items-center justify-center mx-auto mb-2.5 transition-colors shadow-2xs">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-bold text-gray-800">
                                    Cliquez pour parcourir ou glissez votre vidéo ici
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500">
                                        MP4 / WebM
                                    </span>
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500">
                                        Format 16:9 conseillé
                                    </span>
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500">
                                        ≤ {MAX_VIDEO_SIZE_MB} Mo
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 flex flex-col sm:flex-row items-center gap-3.5">
                                <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-950 border border-gray-200 flex-shrink-0">
                                    <video
                                        src={filePreviewUrl}
                                        controls
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 w-full space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <p className="text-xs font-bold text-gray-900 truncate">
                                            {selectedFile?.name}
                                        </p>
                                    </div>
                                    {selectedFile && (
                                        <div>
                                            <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                                                <span>Poids vérifié</span>
                                                <span className="font-bold text-emerald-700">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo / {MAX_VIDEO_SIZE_MB} Mo
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            (selectedFile.size / MAX_VIDEO_SIZE_BYTES) * 100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-semibold text-[#FF5E00] hover:underline cursor-pointer"
                                    >
                                        Remplacer par un autre fichier vidéo
                                    </button>
                                </div>
                            </div>
                        )}

                        {fileError && (
                            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                                {fileError}
                            </p>
                        )}
                    </div>

                    {/* 4. CARTES INTERACTIVES DES ZONES D'AFFICHAGE */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            4. Zones d'affichage sur la plateforme *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {AD_PLACEMENTS_META.map((item) => {
                                const checked = emplacements.includes(item.value);
                                const PIcon = PLACEMENT_ICONS[item.value] || MonitorPlay;
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => togglePlacement(item.value)}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${checked
                                            ? "border-[#FF5E00] bg-orange-50/60 shadow-2xs"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${checked
                                                    ? "bg-[#FF5E00] text-white shadow-sm"
                                                    : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                <PIcon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">
                                                    {item.label}
                                                </p>
                                                <p className="text-[11px] text-gray-500 truncate">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition ${checked
                                                ? "bg-[#FF5E00] border-[#FF5E00] text-white"
                                                : "border-gray-300 bg-white"
                                                }`}
                                        >
                                            {checked && <Check className="w-3 h-3" />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pied de modale */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#FF7B2E] hover:from-[#E64A00] hover:to-[#FF5E00] text-white text-sm font-bold shadow-md shadow-orange-500/25 disabled:opacity-50 cursor-pointer"
                        >
                            {saving
                                ? "Publication..."
                                : editingAd
                                    ? "Enregistrer les modifications"
                                    : "Publier la publicité"}
                        </button>
                    </div>
                </form>
            </LDFModal>

            {/* ─── Confirmation Suppression ─── */}
            <ConfirmModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    await deleteCampaign(deleteTarget.id);
                    toast.success(`Publicité ${deleteTarget.nom} supprimée.`);
                    setDeleteTarget(null);
                }}
                title="Supprimer cette publicité ?"
                message={`Le spot vidéo de « ${deleteTarget?.nom || ""} » sera retiré de tous les écrans de diffusion.`}
                confirmLabel="Supprimer"
                variant="danger"
            />

            {/* ─── Confirmation Réinitialisation Démo ─── */}
            <ConfirmModal
                open={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={async () => {
                    await resetDemoCampaigns();
                    toast.success("Les 4 publicités de démonstration initiales ont été restaurées !");
                    setShowResetConfirm(false);
                }}
                title="Réinitialiser les publicités de démo ?"
                message="Les vidéos ajoutées pendant vos tests seront effacées et les 4 spots officiels par défaut (LDF, Bernabé, Oribat, SODIS-MAD) seront remis à neuf."
                confirmLabel="Réinitialiser"
                variant="warning"
            />
        </div>
    );
}