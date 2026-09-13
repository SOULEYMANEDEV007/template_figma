// @ts-nocheck
"use client";
/**
 * ESPACE FOURNISSEUR — Tableau de bord logistique VITALIS
 *
 * Ce tableau de bord est la vue centrale du fournisseur :
 * - Dossiers acceptés par la banque dont il fait partie → Commandes à traiter
 * - Gestion du cycle de vie : Commande reçue → En préparation → Disponible → Expédiée → Livrée
 * - Synchronisation automatique du statut de la souscription globale
 */

import { StatusBadge } from "@/components/ui/ldf-badge";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  AlertCircle, Box, CheckCircle2, ChevronRight, Clock,
  Package, Truck, Eye, MapPin,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

// Workflow des commandes fournisseur — Page 17 du cahier des charges
const COMMANDE_WORKFLOW = [
  { statut: "fournisseur_paye",        label: "Commande reçue",       icon: Package,      couleur: "text-sky-600 bg-sky-50"     },
  { statut: "commande_en_preparation", label: "En préparation",       icon: Box,          couleur: "text-cyan-600 bg-cyan-50"   },
  { statut: "livre",                   label: "Livré",                icon: CheckCircle2, couleur: "text-emerald-600 bg-emerald-50" },
] as const;

type CommandeStatut = "fournisseur_paye" | "commande_en_preparation" | "livre";

export default function FournisseurCommandesPage() {
  const { user } = useLDFAuthStore();
  const { souscriptions, devis, dossiers, updateSouscription, updateDossier, addHistorique } = useVitalisDb();
  const [filterStatut, setFilterStatut] = useState<"" | CommandeStatut>("");
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const fournisseurId = user?.organisationId;

  // Commandes = Souscriptions pour lesquelles ce fournisseur a un devis ET
  // dont le statut est dans la phase logistique (après paiement fournisseur)
  const mesCommandes = useMemo(() => {
    if (!fournisseurId) return souscriptions;
    return souscriptions.filter(s =>
      s.fournisseurs.some(f => f.fournisseurId === fournisseurId) &&
      ["fournisseur_paye", "commande_en_preparation", "livre", "accepte", "finance"].includes(s.statut)
    );
  }, [souscriptions, fournisseurId]);

  const filtered = useMemo(() => {
    if (!filterStatut) return mesCommandes;
    return mesCommandes.filter(s => s.statut === filterStatut);
  }, [mesCommandes, filterStatut]);

  // KPIs
  const kpis = {
    recues:          mesCommandes.filter(s => s.statut === "fournisseur_paye").length,
    enPreparation:   mesCommandes.filter(s => s.statut === "commande_en_preparation").length,
    livrees:         mesCommandes.filter(s => s.statut === "livre").length,
    montantTotal:    mesCommandes.reduce((acc, s) => {
      const monDevis = devis.find(d => d.fournisseurId === fournisseurId && d.souscriptionId === s.id);
      return acc + (monDevis?.totalTTC ?? 0);
    }, 0),
  };

  const handleAvancer = (souscriptionId: string, currentStatut: string) => {
    const next: Record<string, CommandeStatut> = {
      "accepte":                 "fournisseur_paye",
      "finance":                 "fournisseur_paye",
      "fournisseur_paye":        "commande_en_preparation",
      "commande_en_preparation": "livre",
    };
    const newStatut = next[currentStatut];
    if (!newStatut) return;

    setActionTarget(souscriptionId);
    setTimeout(() => {
      updateSouscription(souscriptionId, { statut: newStatut });
      // Synchroniser le dossier lié
      const dossier = dossiers.find(d => d.souscriptionId === souscriptionId);
      if (dossier) updateDossier(dossier.id, { statut: newStatut });
      addHistorique({
        souscriptionId,
        action: `commande_${newStatut}`,
        description: `Commande — Statut mis à jour : ${newStatut.replace(/_/g, " ")}`,
        date: new Date().toISOString(),
      });
      const messages: Record<string, string> = {
        fournisseur_paye:        "✅ Commande confirmée — paiement reçu",
        commande_en_preparation: "📦 Commande en cours de préparation",
        livre:                   "🚚 Commande marquée comme livrée !",
      };
      toast.success(messages[newStatut] ?? `Statut → ${newStatut}`);
      setActionTarget(null);
    }, 600);
  };

  const nextLabel: Record<string, string> = {
    "accepte":                 "Confirmer paiement reçu",
    "finance":                 "Confirmer paiement reçu",
    "fournisseur_paye":        "Démarrer la préparation",
    "commande_en_preparation": "Marquer comme livré",
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Commandes — Logistique VITALIS</h1>
          <p className="page-subtitle">
            {mesCommandes.length} commande{mesCommandes.length > 1 ? "s" : ""} · Programme AFG Bank
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Commandes reçues",      value: kpis.recues,          icon: Package,      color: "bg-sky-50 text-sky-600"       },
          { label: "En préparation",         value: kpis.enPreparation,   icon: Box,          color: "bg-cyan-50 text-cyan-600"     },
          { label: "Livrées",               value: kpis.livrees,          icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600"},
          { label: "Chiffre d'affaires",     value: fmtCFA(kpis.montantTotal), icon: AlertCircle, color: "bg-orange-50 text-orange-600", isStr: true },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="section-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className={`font-bold text-gray-900 ${k.isStr ? "text-sm" : "text-xl"}`}>{k.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtre par statut */}
      <div className="section-card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Filtrer :</span>
          {[
            { value: "",                      label: "Toutes" },
            { value: "fournisseur_paye",       label: "Commandes reçues" },
            { value: "commande_en_preparation",label: "En préparation" },
            { value: "livre",                  label: "Livrées" },
          ].map(f => (
            <button key={f.value}
              onClick={() => setFilterStatut(f.value as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filterStatut === f.value
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des commandes */}
      {filtered.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium">Aucune commande dans cette catégorie</p>
          <p className="text-xs mt-1">Les commandes apparaissent quand AFG Bank a accepté le dossier et payé le fournisseur.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const monDevis = devis.find(d => d.fournisseurId === fournisseurId && d.souscriptionId === s.id);
            const dossier = dossiers.find(d => d.souscriptionId === s.id);
            const isProcessing = actionTarget === s.id;
            const canAvancer = nextLabel[s.statut] !== undefined;

            return (
              <div key={s.id} className="section-card hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-orange-600">{s.reference}</span>
                        <StatusBadge statut={s.statut} size="sm" />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Créée le {new Date(s.dateCreation).toLocaleDateString("fr-FR")}
                        {s.dateValidation && ` · Acceptée le ${new Date(s.dateValidation).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {monDevis ? fmtCFA(monDevis.totalTTC) : fmtCFA(s.montantTotal)}
                    </p>
                  </div>

                  {/* Infos client & livraison */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Client</p>
                      <p className="text-sm font-medium text-gray-800">
                        {s.souscripteurPrenom} {s.souscripteurNom}
                      </p>
                      {s.souscripteurEntreprise && (
                        <p className="text-xs text-gray-400 truncate">{s.souscripteurEntreprise}</p>
                      )}
                    </div>
                    {monDevis && (
                      <div>
                        <p className="text-xs text-gray-400">Articles ({monDevis.articles.length})</p>
                        <p className="text-sm text-gray-700 truncate">
                          {monDevis.articles[0]?.designation}{monDevis.articles.length > 1 ? ` +${monDevis.articles.length - 1}` : ""}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Délai livraison
                      </p>
                      <p className="text-sm text-gray-700">
                        {monDevis?.delaiLivraisonAbidjan ?? "7 jours ouvrés"} (Abidjan)
                      </p>
                    </div>
                  </div>

                  {/* Lieu de livraison si disponible */}
                  {monDevis?.lieuLivraison && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-4 text-xs text-blue-700">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>
                        <strong>Livraison :</strong> {monDevis.lieuLivraison.adressePrecise},{" "}
                        {monDevis.lieuLivraison.ville} ({monDevis.lieuLivraison.region}) ·{" "}
                        Contact : {monDevis.lieuLivraison.contactDestinataire}
                      </span>
                    </div>
                  )}

                  {/* Actions logistiques */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {canAvancer && (
                      <button
                        onClick={() => handleAvancer(s.id, s.statut)}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all
                          ${isProcessing
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : s.statut === "commande_en_preparation"
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-orange-500 text-white hover:bg-orange-600"}`}
                      >
                        {isProcessing ? (
                          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        ) : s.statut === "commande_en_preparation" ? (
                          <Truck className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {nextLabel[s.statut]}
                      </button>
                    )}
                    {monDevis && (
                      <Link
                        href={`/dashboard/devis/${monDevis.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" /> Voir le devis
                      </Link>
                    )}
                    {dossier && (
                      <Link
                        href={`/dashboard/dossiers/${dossier.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" /> Dossier
                      </Link>
                    )}
                    {s.statut === "livre" && (
                      <span className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> Livraison confirmée
                      </span>
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
