// @ts-nocheck
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Building2, Check, ChevronsUpDown, Search, X, CheckSquare, Square,
  Sparkles, ShieldCheck, Info, Tag
} from "lucide-react";
import { OFFICIAL_FOURNISSEURS, getPartnerLogo } from "@/lib/constants";
import { useVitalisDb } from "@/stores/vitalisDbStore";

// ── 7 Domaines Métier Officiels Vitalis FADES ─────────────────────
export interface DomaineFournisseur {
  id: string;
  nom: string;
  emoji: string;
  badgeColor: string;
  description: string;
}

export const DOMAINES_VITALIS: Record<string, DomaineFournisseur> = {
  education: {
    id: "education",
    nom: "Éducation & Librairie",
    emoji: "📚",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Fournitures scolaires, manuels officiels, papeterie & bureautique",
  },
  peinture: {
    id: "peinture",
    nom: "Peinture & Revêtements",
    emoji: "🎨",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Peinture bâtiment, carrosserie, revêtements & étanchéité",
  },
  automobile: {
    id: "automobile",
    nom: "Automobile & Mobilité",
    emoji: "🚗",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Véhicules neufs, utilitaires, deux-roues & pièces détachées",
  },
  logement: {
    id: "logement",
    nom: "Logement & Immobilier",
    emoji: "🏠",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Logements économiques et standing, aménagement foncier & BTP",
  },
  batiment: {
    id: "batiment",
    nom: "Bâtiment & Matériaux",
    emoji: "🏗️",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Matériaux de construction, gros œuvre, quincaillerie industrielle",
  },
  mobilier: {
    id: "mobilier",
    nom: "Mobilier & Aménagement",
    emoji: "🛋️",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Aménagement d'intérieur, meubles de maison et bureau, sanitaires",
  },
  electromenager: {
    id: "electromenager",
    nom: "Électroménager & Climatisation",
    emoji: "❄️",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    description: "Climatisation, réfrigérateurs, téléviseurs & électroménager",
  },
};

/**
 * Associe chaque fournisseur agréé à son domaine officiel strict
 */
export function getDomaineFournisseur(f: { code?: string; id?: string; nom?: string }): DomaineFournisseur {
  const code = (f.code || "").toUpperCase();
  const nom = (f.nom || "").toLowerCase();
  const id = (f.id || "").toUpperCase();

  if (code === "LDF" || nom.includes("librairie de france") || id.includes("LDF")) {
    return DOMAINES_VITALIS.education;
  }
  if (code === "DRO" || code.includes("DROCOLOR") || nom.includes("drocolor") || code === "SIPPEC" || nom.includes("sippec")) {
    return DOMAINES_VITALIS.peinture;
  }
  if (code === "ATC" || nom.includes("comafrique") || code === "RYMCO" || nom.includes("rimco") || code === "SOCIDA" || nom.includes("socida")) {
    return DOMAINES_VITALIS.automobile;
  }
  if (code === "ORIBAT" || nom.includes("oribat") || code === "INOVIM" || nom.includes("inoovim") || code === "KAYDAN" || nom.includes("kaydan")) {
    return DOMAINES_VITALIS.logement;
  }
  if (code === "BERNABE" || nom.includes("bernabé") || nom.includes("bernabe") || code === "SODISMAD" || nom.includes("sodis-mad") || nom.includes("sodismad")) {
    return DOMAINES_VITALIS.batiment;
  }
  if (code === "TECHNIBAT" || nom.includes("technibat")) {
    return DOMAINES_VITALIS.mobilier;
  }
  if (code === "SOCIAM" || nom.includes("sociam") || code === "LG" || nom.includes("lg")) {
    return DOMAINES_VITALIS.electromenager;
  }

  return DOMAINES_VITALIS.education;
}

interface FournisseursMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  presetFournisseurId?: string; // Si boutique, fournisseur pré-coché mais sélection libre
}

export function FournisseursMultiSelect({
  selectedIds = [],
  onChange,
  label = "Sélection des fournisseurs agréés Vitalis",
  required = false,
  disabled = false,
  presetFournisseurId,
}: FournisseursMultiSelectProps) {
  const { fournisseurs: dbFournisseurs } = useVitalisDb();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDomaine, setFilterDomaine] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fournisseurs officiels actifs
  const allFournisseurs = useMemo(() => {
    const list = (dbFournisseurs && dbFournisseurs.length >= 8) ? dbFournisseurs : OFFICIAL_FOURNISSEURS;
    return list.filter(f => f.statut === "actif").map(f => {
      if (f.id === "FOUR-DRO-002" || f.nom?.toLowerCase().includes("drocolor")) {
        return {
          ...f,
          secteurActivite: "Peinture bâtiment & carrosserie, revêtements & étanchéité",
        };
      }
      return f;
    });
  }, [dbFournisseurs]);

  // Regroupement par domaine
  const fournisseursParDomaine = useMemo(() => {
    const map = new Map<string, typeof allFournisseurs>();
    Object.keys(DOMAINES_VITALIS).forEach(dKey => map.set(dKey, []));

    allFournisseurs.forEach(f => {
      const domaine = getDomaineFournisseur(f);
      if (!map.has(domaine.id)) map.set(domaine.id, []);
      map.get(domaine.id)!.push(f);
    });

    return map;
  }, [allFournisseurs]);

  // Filtrage par texte et domaine
  const filteredFournisseurs = useMemo(() => {
    return allFournisseurs.filter(f => {
      const domaine = getDomaineFournisseur(f);
      const matchDomaine = filterDomaine === "all" || domaine.id === filterDomaine;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        f.nom.toLowerCase().includes(q) ||
        (f.secteurActivite && f.secteurActivite.toLowerCase().includes(q)) ||
        (f.raisonSociale && f.raisonSociale.toLowerCase().includes(q)) ||
        domaine.nom.toLowerCase().includes(q);

      return matchDomaine && matchSearch;
    });
  }, [allFournisseurs, search, filterDomaine]);

  // Fournisseurs actuellement sélectionnés
  const selectedFournisseursList = useMemo(() => {
    return allFournisseurs.filter(f => selectedIds.includes(f.id));
  }, [allFournisseurs, selectedIds]);

  // Nombre de secteurs différents sélectionnés
  const secteursDistincts = useMemo(() => {
    const set = new Set(selectedFournisseursList.map(f => getDomaineFournisseur(f).id));
    return set.size;
  }, [selectedFournisseursList]);

  // Fermer quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOne = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedIds.filter(x => x !== id));
  };

  const selectAllFiltered = () => {
    if (disabled) return;
    const idsToAdd = filteredFournisseurs.map(f => f.id);
    const set = new Set([...selectedIds, ...idsToAdd]);
    onChange(Array.from(set));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {/* ── Label & Compteur ── */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
        {selectedIds.length > 0 && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
            {selectedIds.length} fournisseur{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""} ({secteursDistincts} secteur{secteursDistincts > 1 ? "s" : ""})
          </span>
        )}
      </div>

      {/* ── CHAMP SELECT DÉCLENCHEUR (Select Box avec Chips) ── */}
      <div
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full min-h-[48px] px-3 py-2 border rounded-xl bg-white text-left transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs
          ${isOpen
            ? "border-orange-500 ring-2 ring-orange-400/30"
            : selectedIds.length > 0
              ? "border-orange-300 hover:border-orange-400"
              : "border-gray-200 hover:border-gray-300"
          }
          ${disabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
          {selectedFournisseursList.length === 0 ? (
            <span className="text-xs sm:text-sm text-gray-400">
              Cliquer pour sélectionner un ou plusieurs fournisseurs agréés...
            </span>
          ) : (
            selectedFournisseursList.map(f => {
              const dom = getDomaineFournisseur(f);
              const logoSrc = f.logo || getPartnerLogo(f.nom, f.id);
              const isPreset = presetFournisseurId === f.id;

              return (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-orange-50/80 border border-orange-200 text-xs text-orange-950 font-medium group transition-colors hover:bg-orange-100"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="w-5 h-5 rounded bg-white border border-gray-100 p-0.5 flex items-center justify-center flex-shrink-0">
                    {logoSrc ? (
                      <Image
                        src={logoSrc}
                        alt={f.nom}
                        width={16}
                        height={16}
                        className="object-contain max-h-full max-w-full"
                      />
                    ) : (
                      <Building2 className="w-3 h-3 text-gray-400" />
                    )}
                  </span>
                  <span className="font-semibold text-gray-900">{f.nom}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded border hidden sm:inline-block ${dom.badgeColor}`}>
                    {dom.emoji} {dom.nom.split("&")[0].trim()}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={e => removeOne(f.id, e)}
                      title={`Retirer ${f.nom}`}
                      className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-orange-600 hover:text-white hover:bg-orange-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
          {selectedIds.length > 0 && !disabled && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                clearAll();
              }}
              title="Tout vider"
              className="p-1 hover:text-red-500 rounded text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronsUpDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* ── DROPDOWN POPUP FLOTTANT ── */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[460px] flex flex-col">
          {/* Barre de recherche & filtres par domaine */}
          <div className="p-3 bg-gray-50/80 border-b border-gray-100 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher un fournisseur, un domaine, une spécialité..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pilules de filtrage par domaine */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setFilterDomaine("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterDomaine === "all"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Tous les domaines ({allFournisseurs.length})
              </button>
              {Object.values(DOMAINES_VITALIS).map(dom => {
                const count = (fournisseursParDomaine.get(dom.id) || []).length;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setFilterDomaine(dom.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
                      filterDomaine === dom.id
                        ? "bg-gray-900 text-white shadow-xs"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <span>{dom.emoji}</span>
                    <span>{dom.nom.split("&")[0].trim()}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Boutons d'action rapide */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
              <span className="text-[11px] text-gray-500">
                {filteredFournisseurs.length} partenaire{filteredFournisseurs.length > 1 ? "s" : ""} affiché{filteredFournisseurs.length > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] hover:underline"
                >
                  Tout cocher
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-gray-500 hover:text-red-600 font-semibold text-[11px] hover:underline"
                >
                  Tout décocher
                </button>
              </div>
            </div>
          </div>

          {/* Liste déroulante des fournisseurs */}
          <div className="overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
            {filteredFournisseurs.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                Aucun fournisseur ne correspond à votre recherche.
              </div>
            ) : (
              filteredFournisseurs.map(f => {
                const isSelected = selectedIds.includes(f.id);
                const dom = getDomaineFournisseur(f);
                const logoSrc = f.logo || getPartnerLogo(f.nom, f.id);

                return (
                  <div
                    key={f.id}
                    onClick={() => toggleOne(f.id)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 select-none ${
                      isSelected
                        ? "bg-orange-50/70 border border-orange-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {/* Checkbox visuelle */}
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-orange-500 border-orange-500 text-white shadow-xs"
                        : "border-gray-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    {/* Logo officiel */}
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={f.nom}
                          width={32}
                          height={32}
                          className="object-contain max-h-full max-w-full"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Détails du fournisseur */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold ${isSelected ? "text-orange-900" : "text-gray-900"}`}>
                          {f.nom}
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 border border-emerald-200 rounded font-medium">
                          Agréé
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${dom.badgeColor}`}>
                          {dom.emoji} {dom.nom}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {f.secteurActivite || f.raisonSociale}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {f.ville}{f.quartier ? ` · ${f.quartier}` : ""}
                      </p>
                    </div>

                    {/* Indicateur de sélection */}
                    {isSelected && (
                      <span className="text-xs font-bold text-orange-600 flex-shrink-0 px-2 py-0.5 rounded-full bg-orange-100/80">
                        Sélectionné
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pied du popover */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Terminer ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* ── BANDEAU INFORMATIF WORKFLOW MULTI-FOURNISSEURS VITALIS ── */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-semibold text-blue-950">
              Règle du Programme Vitalis : {selectedIds.length} sous-devis chiffrés consolidés
            </p>
            <p className="text-[11px] text-blue-800">
              Chaque fournisseur sélectionné ({selectedIds.length} au total, dans {secteursDistincts} secteur{secteursDistincts > 1 ? "s" : ""}) émettra son propre devis pour ses articles.
              Tous ces devis seront réunis en <strong>un dossier consolidé unique</strong> transmis à AFG Bank pour l'accord de financement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
