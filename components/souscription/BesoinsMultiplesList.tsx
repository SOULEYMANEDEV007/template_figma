// @ts-nocheck
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  Package, Plus, Trash2, Building2, CheckCircle2,
  AlertCircle, Store, ShieldCheck, Sparkles, Layers,
  ChevronDown, HelpCircle, Info
} from "lucide-react";
import {
  NATURES_BESOIN,
  getCategoriesParNature,
  getFournisseursRecommandesParBesoin,
} from "@/lib/constants/besoins";
import { OFFICIAL_FOURNISSEURS, getPartnerLogo } from "@/lib/constants";
import { useVitalisDb } from "@/stores/vitalisDbStore";

export interface LigneBesoinItem {
  id: string;
  nature: string;
  categorie: string;
  produitRecherche: string;
  montantEstime: number | string;
  fournisseurId: string;
  fournisseurNom: string;
}

interface BesoinsMultiplesListProps {
  besoins: LigneBesoinItem[];
  onChange: (besoins: LigneBesoinItem[]) => void;
  isBoutique?: boolean;
  currentFournisseurId?: string;
  currentFournisseurNom?: string;
}

export function BesoinsMultiplesList({
  besoins,
  onChange,
  isBoutique = false,
  currentFournisseurId,
  currentFournisseurNom,
}: BesoinsMultiplesListProps) {
  const { fournisseurs: storeFournisseurs } = useVitalisDb();

  // Liste consolidée des fournisseurs actifs
  const allFournisseurs = useMemo(() => {
    const list = storeFournisseurs && storeFournisseurs.length >= 8
      ? storeFournisseurs
      : OFFICIAL_FOURNISSEURS;
    return list.filter((f: any) => f.statut === "actif");
  }, [storeFournisseurs]);

  // Ajouter une nouvelle ligne de besoin
  const handleAddBesoin = () => {
    const newId = `BSN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLigne: LigneBesoinItem = {
      id: newId,
      nature: "",
      categorie: "",
      produitRecherche: "",
      montantEstime: "",
      fournisseurId: "",
      fournisseurNom: "",
    };
    onChange([...besoins, newLigne]);
  };

  // Supprimer une ligne de besoin
  const handleRemoveBesoin = (id: string) => {
    if (besoins.length <= 1) return;
    onChange(besoins.filter(b => b.id !== id));
  };

  // Mettre à jour un champ d'une ligne
  const handleUpdateField = (id: string, field: keyof LigneBesoinItem, value: any) => {
    const updated = besoins.map(item => {
      if (item.id !== id) return item;

      // Si la nature change, on réinitialise la catégorie et le fournisseur
      if (field === "nature") {
        return {
          ...item,
          nature: value,
          categorie: "",
          fournisseurId: "",
          fournisseurNom: "",
        };
      }

      // Si la catégorie change, on vérifie si le fournisseur actuel est toujours cohérent
      if (field === "categorie") {
        return {
          ...item,
          categorie: value,
        };
      }

      return {
        ...item,
        [field]: value,
      };
    });

    onChange(updated);
  };

  // Choisir un fournisseur pour une ligne
  const handleSelectFournisseur = (ligneId: string, fId: string, fNom: string) => {
    const updated = besoins.map(item => {
      if (item.id !== ligneId) return item;
      return {
        ...item,
        fournisseurId: fId,
        fournisseurNom: fNom,
      };
    });
    onChange(updated);
  };

  // Récupérer les fournisseurs recommandés pour une ligne
  const getRecommandesForLigne = (nature: string, categorie: string) => {
    if (!nature) return allFournisseurs;

    const recommendedCodes = getFournisseursRecommandesParBesoin(nature, categorie);
    if (!recommendedCodes || recommendedCodes.length === 0) {
      return allFournisseurs;
    }

    const recMatches = allFournisseurs.filter((f: any) => {
      const code = (f.code || "").toUpperCase();
      const nom = (f.nom || "").toUpperCase();
      return recommendedCodes.some(rc => {
        const cUpper = rc.toUpperCase();
        return code.includes(cUpper) || nom.includes(cUpper) || cUpper.includes(code);
      });
    });

    return recMatches.length > 0 ? recMatches : allFournisseurs;
  };

  // Synthèse consolidée
  const stats = useMemo(() => {
    const totalMontant = besoins.reduce((sum, b) => {
      const val = typeof b.montantEstime === "string"
        ? parseFloat(b.montantEstime.replace(/\s/g, "")) || 0
        : Number(b.montantEstime) || 0;
      return sum + val;
    }, 0);

    const distinctFournisseursMap = new Map<string, string>();
    besoins.forEach(b => {
      if (b.fournisseurId && b.fournisseurNom) {
        distinctFournisseursMap.set(b.fournisseurId, b.fournisseurNom);
      }
    });

    return {
      totalMontant,
      nbBesoins: besoins.length,
      distinctFournisseurs: Array.from(distinctFournisseursMap.entries()).map(([id, nom]) => ({ id, nom })),
    };
  }, [besoins]);

  const fmtCFA = (val: number) => new Intl.NumberFormat("fr-FR").format(val) + " FCFA";

  return (
    <div className="space-y-6">
      {/* ── Cartes de chaque besoin ── */}
      <div className="space-y-5">
        {besoins.map((besoin, index) => {
          const categoriesDisponibles = getCategoriesParNature(besoin.nature);
          const recommandations = getRecommandesForLigne(besoin.nature, besoin.categorie);
          const hasSelectedFournisseur = Boolean(besoin.fournisseurId);

          return (
            <div
              key={besoin.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                hasSelectedFournisseur
                  ? "border-orange-200 bg-white ring-1 ring-orange-500/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* En-tête de la carte besoin */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 via-slate-50 to-orange-50/40 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0B2447]">
                        Besoin d'équipement / d'achat n°{index + 1}
                      </span>
                      {hasSelectedFournisseur && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3" /> Fournisseur assigné
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {besoin.nature || "Sélectionnez le secteur d'activité du besoin ci-dessous"}
                    </p>
                  </div>
                </div>

                {besoins.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBesoin(besoin.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                    title="Supprimer ce besoin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Retirer</span>
                  </button>
                )}
              </div>

              {/* Corps de la carte : Champs du besoin */}
              <div className="p-5 space-y-4">
                {/* Ligne 1 : Nature & Catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      1. Domaine / Nature du besoin <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={besoin.nature}
                        onChange={e => handleUpdateField(besoin.id, "nature", e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all cursor-pointer"
                      >
                        <option value="">Sélectionnez le domaine d'achat...</option>
                        {NATURES_BESOIN.map(grp => (
                          <optgroup key={grp.groupe} label={grp.groupe}>
                            {grp.options.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      2. Catégorie de produits / matériels <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={besoin.categorie}
                        onChange={e => handleUpdateField(besoin.id, "categorie", e.target.value)}
                        disabled={!besoin.nature || categoriesDisponibles.length === 0}
                        className={`w-full pl-3.5 pr-8 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all cursor-pointer ${
                          !besoin.nature ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""
                        }`}
                      >
                        <option value="">
                          {!besoin.nature
                            ? "Choisissez d'abord un domaine"
                            : categoriesDisponibles.length === 0
                            ? "Toutes catégories confondues"
                            : "Précisez la catégorie..."}
                        </option>
                        {categoriesDisponibles.map(c => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Ligne 2 : Description des articles & Montant estimatif */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      3. Articles ou équipements recherchés <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Livres scolaires de 6ème, 3 paquets de cahiers, 1 calculatrice..."
                      value={besoin.produitRecherche}
                      onChange={e => handleUpdateField(besoin.id, "produitRecherche", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      4. Budget estimatif (FCFA)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex : 250 000"
                        value={besoin.montantEstime}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, "");
                          handleUpdateField(besoin.id, "montantEstime", raw ? Number(raw).toLocaleString("fr-FR") : "");
                        }}
                        className="w-full pl-3.5 pr-14 py-2.5 text-xs font-bold font-mono text-[#0B2447] border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                        FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ligne 3 : Choix du Fournisseur Agréé Recommandé */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      5. Fournisseur agréé sélectionné pour ce besoin <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {recommandations.length} fournisseur{recommandations.length > 1 ? "s" : ""} disponible{recommandations.length > 1 ? "s" : ""} dans ce secteur
                    </span>
                  </div>

                  {/* Grille de tuiles interactives des fournisseurs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {recommandations.map((f: any) => {
                      const isSelected = besoin.fournisseurId === f.id;
                      const logoSrc = f.logo || getPartnerLogo(f.nom, f.id);

                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSelectFournisseur(besoin.id, f.id, f.nom)}
                          className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? "bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                          }`}
                        >
                          {/* Logo Fournisseur */}
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200/80 p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Image
                              src={logoSrc}
                              alt={f.nom}
                              width={36}
                              height={36}
                              className="object-contain max-h-8 max-w-8"
                            />
                          </div>

                          {/* Infos Fournisseur */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {f.nom}
                              </p>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0 ml-1" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              {f.secteurActivite || "Fournisseur agréé Vitalis"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!besoin.fournisseurId && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      Veuillez cliquer sur le fournisseur de votre choix pour valider cette ligne de besoin.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bouton pour ajouter une autre ligne de besoin ── */}
      <button
        type="button"
        onClick={handleAddBesoin}
        className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/30 hover:bg-orange-50/60 text-orange-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-2xs"
      >
        <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
          <Plus className="w-4 h-4" />
        </div>
        <span>Ajouter un autre besoin / fournisseur (Électroménager, Peinture, Matériaux, BTP...)</span>
      </button>

      {/* ── Panneau de Synthèse consolidé (Fiche unique → N Devis) ── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] rounded-2xl p-5 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                Synthèse du Dossier de Souscription
              </p>
              <p className="text-[11px] text-slate-300">
                1 fiche d'adhésion unique · {stats.nbBesoins} besoin{stats.nbBesoins > 1 ? "s" : ""} enregistré{stats.nbBesoins > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Budget total estimatif
            </span>
            <span className="text-base font-extrabold text-orange-400 font-mono">
              {stats.totalMontant > 0 ? fmtCFA(stats.totalMontant) : "À chiffrer par les devis"}
            </span>
          </div>
        </div>

        {/* Fournisseurs distincts rattachés */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Demandes de devis fournisseurs à générer ({stats.distinctFournisseurs.length}) :
            </span>
            <span className="text-[10px] text-orange-300 italic">
              1 devis chiffré par fournisseur
            </span>
          </div>

          {stats.distinctFournisseurs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.distinctFournisseurs.map(f => {
                const logoSrc = getPartnerLogo(f.nom, f.id);
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white backdrop-blur-xs"
                  >
                    <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center flex-shrink-0">
                      <Image src={logoSrc} alt={f.nom} width={18} height={18} className="object-contain" />
                    </div>
                    <span className="font-semibold text-xs">{f.nom}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Devis requis
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              Aucun fournisseur assigné pour le moment. Veuillez sélectionner un fournisseur agréé pour chaque besoin ci-dessus.
            </p>
          )}
        </div>

        {/* Note métier de traçabilité */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Règle de consolidation Vitalis :</strong> Vos demandes de devis seront transmises directement à chaque fournisseur sélectionné. Une fois tous vos devis établis et chiffrés, votre <strong>Dossier unique</strong> sera constitué et prêt pour analyse et financement auprès d'<strong>AFG Bank</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
