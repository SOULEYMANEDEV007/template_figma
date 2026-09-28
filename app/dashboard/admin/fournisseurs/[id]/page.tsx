// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, ShieldCheck, Mail, Phone, MapPin, Calendar,
  FileText, CheckCircle2, Clock, CreditCard, ExternalLink, Eye,
  Users, FileCheck, Layers, ChevronRight, Briefcase, Hash, Globe,
  CheckCircle, PauseCircle, XCircle, AlertCircle, ShoppingBag
} from "lucide-react";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { VFournisseur } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { getPartnerLogo } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { toast } from "sonner";

const fmtCFA = (v?: number) => {
  const num = typeof v === "number" && !isNaN(v) ? v : 0;
  return new Intl.NumberFormat("fr-FR").format(num) + " FCFA";
};

export default function AdminFournisseurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";

  const {
    fournisseurs = [],
    souscriptions = [],
    devis = [],
    dossiers = [],
    paiements = [],
    updateFournisseur,
  } = useVitalisDb();

  const [activeTab, setActiveTab] = useState<"general" | "souscriptions" | "devis" | "paiements">("general");

  // Recherche du fournisseur
  const fournisseur = useMemo(() => {
    return fournisseurs.find(
      f => f.id === id || f.code?.toLowerCase() === id?.toLowerCase()
    );
  }, [fournisseurs, id]);

  // Si le fournisseur n'existe pas
  if (!fournisseur) {
    return (
      <div className="section-card py-20 text-center max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Fournisseur introuvable</h2>
        <p className="text-sm text-gray-500 mb-6">
          Le fournisseur demandé avec l'identifiant <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{id}</code> n'existe pas ou a été retiré.
        </p>
        <Link
          href="/dashboard/admin/fournisseurs"
          className="btn-ldf-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux fournisseurs
        </Link>
      </div>
    );
  }

  const normNom = (fournisseur.nom || "").toLowerCase().trim();
  const normCode = (fournisseur.code || "").toLowerCase().trim();

  // 1. Souscriptions directement liées
  const linkedSouscriptions = useMemo(() => {
    return (souscriptions || []).filter(s =>
      Array.isArray(s.fournisseurs) && s.fournisseurs.some(sf =>
        sf.fournisseurId === fournisseur.id ||
        (sf.fournisseurNom && sf.fournisseurNom.toLowerCase().trim() === normNom) ||
        (normCode && sf.fournisseurNom && sf.fournisseurNom.toLowerCase().includes(normCode))
      )
    );
  }, [souscriptions, fournisseur, normNom, normCode]);

  // 2. Devis chiffrés pour ce fournisseur
  const linkedDevis = useMemo(() => {
    return (devis || []).filter(d =>
      d.fournisseurId === fournisseur.id ||
      (d.fournisseurNom && d.fournisseurNom.toLowerCase().trim() === normNom) ||
      (normCode && d.fournisseurNom && d.fournisseurNom.toLowerCase().includes(normCode))
    );
  }, [devis, fournisseur, normNom, normCode]);

  // 3. Dossiers consolidés
  const linkedDossiers = useMemo(() => {
    const linkedSousIds = new Set(linkedSouscriptions.map(s => s.id));
    const linkedDevIds = new Set(linkedDevis.map(d => d.id));

    return (dossiers || []).filter(d => {
      if (d.souscriptionId && linkedSousIds.has(d.souscriptionId)) return true;
      if (Array.isArray(d.devisIds) && d.devisIds.some(devId => linkedDevIds.has(devId))) return true;
      if (d.fournisseurNom && (d.fournisseurNom.toLowerCase().trim() === normNom || (normCode && d.fournisseurNom.toLowerCase().includes(normCode)))) return true;
      if (d.fournisseursNoms && (d.fournisseursNoms.toLowerCase().includes(normNom) || (normCode && d.fournisseursNoms.toLowerCase().includes(normCode)))) return true;
      return false;
    });
  }, [dossiers, linkedSouscriptions, linkedDevis, normNom, normCode]);

  // 4. Paiements AFG Bank émis
  const linkedPaiements = useMemo(() => {
    return (paiements || []).filter(p => {
      if (p.fournisseurId === fournisseur.id) return true;
      if (p.fournisseurNom && p.fournisseurNom.toLowerCase().trim() === normNom) return true;
      if (Array.isArray(p.repartitionFournisseurs) && p.repartitionFournisseurs.some(rf =>
        rf.fournisseurId === fournisseur.id ||
        (rf.fournisseurNom && rf.fournisseurNom.toLowerCase().trim() === normNom)
      )) return true;
      return false;
    });
  }, [paiements, fournisseur, normNom]);

  // Métriques financières calculées
  const totalChiffre = useMemo(() => {
    const fromDevis = linkedDevis.reduce((sum, d) => sum + (Number(d.totalTTC) || 0), 0);
    if (fromDevis > 0) return fromDevis;
    const fromSous = linkedSouscriptions.reduce((sum, s) => sum + (Number(s.montantTotal) || 0), 0);
    if (fromSous > 0) return fromSous;
    return typeof fournisseur.montantTotal === "number" ? fournisseur.montantTotal : 0;
  }, [linkedDevis, linkedSouscriptions, fournisseur]);

  const totalPayeAFG = useMemo(() => {
    return linkedPaiements.reduce((sum, p) => {
      if (Array.isArray(p.repartitionFournisseurs)) {
        const item = p.repartitionFournisseurs.find(rf =>
          rf.fournisseurId === fournisseur.id || (rf.fournisseurNom && rf.fournisseurNom.toLowerCase().trim() === normNom)
        );
        if (item) return sum + (Number(item.montant) || 0);
      }
      return sum + (Number(p.montantTotal || p.montant) || 0);
    }, 0);
  }, [linkedPaiements, fournisseur, normNom]);

  const devisValidCount = linkedDevis.filter(d => d.statut === "valide").length;
  const logoSrc = fournisseur.logo || getPartnerLogo(fournisseur.nom, fournisseur.id);

  const handleStatutChange = (newStatut: VFournisseur["statut"]) => {
    updateFournisseur(fournisseur.id, { statut: newStatut });
    toast.success(`Statut mis à jour : ${newStatut}`);
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* ── Fil d'Ariane & Bouton Retour ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/dashboard" className="hover:text-orange-600 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/dashboard/admin/fournisseurs" className="hover:text-orange-600 transition-colors">Fournisseurs Agréés</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800">{fournisseur.nom}</span>
        </div>

        <Link
          href="/dashboard/admin/fournisseurs"
          className="btn-ldf-outline text-xs py-1.5 px-3 self-start sm:self-auto flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à la liste
        </Link>
      </div>

      {/* ── Fiche En-tête Partenaire ── */}
      <div className="section-card p-6 bg-gradient-to-r from-white via-white to-orange-50/30 border border-gray-100 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Logo officiel du fournisseur */}
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 p-2 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={fournisseur.nom}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="w-10 h-10 text-orange-600" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{fournisseur.nom}</h1>
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  {fournisseur.code}
                </span>
                <StatusBadge statut={fournisseur.statut} size="sm" />
                {fournisseur.agreVitalis && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Partenaire Agréé VITALIS
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-orange-600 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                {fournisseur.secteurActivite || "Secteur d'activité officiel"}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {fournisseur.ville} {fournisseur.quartier ? `(${fournisseur.quartier})` : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${fournisseur.email}`} className="text-blue-600 hover:underline">{fournisseur.email}</a>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`tel:${fournisseur.telephone}`} className="text-gray-700 font-mono hover:underline">{fournisseur.telephone}</a>
                </span>
              </div>
            </div>
          </div>

          {/* Badge mode et actions rapides */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch md:self-center">
            {isOwner && (
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 text-center justify-center">
                <Eye className="w-3.5 h-3.5 text-amber-600" /> Mode Superviseur ViFlo (Lecture Seule)
              </span>
            )}

            {isAdmin && (
              <div className="flex items-center gap-2">
                {fournisseur.statut === "actif" ? (
                  <button
                    onClick={() => handleStatutChange("suspendu")}
                    className="btn-ldf-outline text-xs py-2 px-3 text-yellow-700 border-yellow-300 hover:bg-yellow-50 flex items-center gap-1.5"
                  >
                    <PauseCircle className="w-3.5 h-3.5" /> Suspendre
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatutChange("actif")}
                    className="btn-ldf-primary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Activer le fournisseur
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cartes KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Souscriptions liées */}
        <div className="section-card p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Souscriptions</p>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {linkedSouscriptions.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Dossiers de financement associés</p>
        </div>

        {/* KPI 2 : Volume Financé */}
        <div className="section-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume Chiffré</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-blue-700 mt-2 truncate" title={fmtCFA(totalChiffre)}>
            {fmtCFA(totalChiffre)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Valeur totale des commandes</p>
        </div>

        {/* KPI 3 : Devis Émis */}
        <div className="section-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Devis ViFlo</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {linkedDevis.length}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {devisValidCount} validé{devisValidCount > 1 ? "s" : ""} (validité 60 jours)
          </p>
        </div>

        {/* KPI 4 : Paiements AFG reçus */}
        <div className="section-card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Règlements AFG</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-purple-700 mt-2 truncate" title={fmtCFA(totalPayeAFG)}>
            {fmtCFA(totalPayeAFG)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{linkedPaiements.length} virement{linkedPaiements.length > 1 ? "s" : ""} émis</p>
        </div>
      </div>

      {/* ── Onglets de Navigation ── */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "general"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" /> Fiche Fournisseur & Juridique
        </button>

        <button
          onClick={() => setActiveTab("souscriptions")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "souscriptions"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Souscriptions & Dossiers
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            {linkedSouscriptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("devis")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "devis"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          Devis Émis
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            {linkedDevis.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("paiements")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "paiements"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Paiements AFG Bank
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            {linkedPaiements.length}
          </span>
        </button>
      </div>

      {/* ── Contenu de l'onglet Actif ── */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bloc 1 : Identité & Légalité */}
          <div className="section-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-4 h-4 text-orange-600" />
              Identité de l'Entreprise & Registre Commercial
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Raison Sociale</p>
                <p className="text-gray-800 font-semibold text-sm mt-0.5">{fournisseur.raisonSociale || fournisseur.nom}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Code Partenaire ViFlo</p>
                <p className="text-gray-800 font-mono font-bold mt-0.5">{fournisseur.code}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Directeur Général / Gérant</p>
                <p className="text-gray-800 font-medium mt-0.5">{fournisseur.nomDirecteur || "M. le Représentant Légal"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Forme Juridique</p>
                <p className="text-gray-800 font-medium mt-0.5">{fournisseur.situationJuridique || "SARL"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">N° RCCM</p>
                <p className="text-gray-800 font-mono font-semibold mt-0.5">{fournisseur.rccm || "CI-ABJ-2015-B-12345"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Compte Contribuable (DFE)</p>
                <p className="text-gray-800 font-mono font-semibold mt-0.5">{fournisseur.compteContribuable || "CC-0192837-A"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Effectif Salariés</p>
                <p className="text-gray-800 font-medium mt-0.5">{fournisseur.nombreEmployes || "50+"} employés</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Domaine d'Agrément Officiel</p>
                <p className="text-orange-700 font-semibold mt-0.5">{fournisseur.secteurActivite}</p>
              </div>
            </div>
          </div>

          {/* Bloc 2 : Partenariat AFG Bank CI & Convention Vitalis */}
          <div className="section-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Convention AFG Bank CI & Programme Vitalis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Banque Partenaire Unique</p>
                <p className="text-blue-700 font-bold text-sm mt-0.5">AFG Bank CI (Atlantic Financial Group)</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">N° Contrat Partenariat AFG</p>
                <p className="text-gray-800 font-mono font-semibold mt-0.5">{fournisseur.numeroContratAFG || `AFG-VIFLO-${fournisseur.code}-2024`}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Durée de la Convention</p>
                <p className="text-gray-800 font-medium mt-0.5">{fournisseur.dureePartenariatAFG || 24} mois renouvelable</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Date d'Agrément Initial</p>
                <p className="text-gray-800 font-medium mt-0.5">{fournisseur.dateAgrement || fournisseur.dateAgrementVitalis || "15 Janvier 2024"}</p>
              </div>

              <div className="col-span-1 sm:col-span-2 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Modalité de Paiement Direct Fournisseur
                </p>
                <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                  En conformité avec le cahier des charges Vitalis FADES, dès accord de crédit par le comité AFG Bank,
                  la banque règle directement 100% de la quote-part du devis sur le compte bancaire de {fournisseur.nom},
                  permettant la libération immédiate des articles pour les bénéficiaires.
                </p>
              </div>
            </div>
          </div>

          {/* Bloc 3 : Coordonnées, Siège & Contacts Commerciaux */}
          <div className="section-card p-6 space-y-4 lg:col-span-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-4 h-4 text-blue-600" />
              Siège Social, Showrooms & Coordonnées de Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Adresse Siège</p>
                <p className="text-gray-800 font-semibold mt-0.5">{fournisseur.adresse || "Abidjan, Côte d'Ivoire"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Ville & Région</p>
                <p className="text-gray-800 font-semibold mt-0.5">{fournisseur.ville}, {fournisseur.region || "District d'Abidjan"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Téléphone Standard</p>
                <p className="text-gray-800 font-mono font-medium mt-0.5">{fournisseur.telephone}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Email Officiel</p>
                <p className="text-blue-600 font-medium mt-0.5 truncate">{fournisseur.email}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Contact Commercial Dédié ViFlo</p>
                <p className="text-gray-800 font-medium mt-0.5">{fournisseur.nomDirecteur || "Direction Commerciale"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Ligne Commerciale Directe</p>
                <p className="text-gray-800 font-mono font-medium mt-0.5">{fournisseur.telephoneCommercial || fournisseur.telephone}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-gray-400 font-medium">Email Pôle Financement / Devis</p>
                <p className="text-blue-600 font-medium mt-0.5">{fournisseur.emailCommercial || fournisseur.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet Souscriptions & Dossiers ── */}
      {activeTab === "souscriptions" && (
        <div className="section-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Dossiers & Souscriptions associant {fournisseur.nom} ({linkedSouscriptions.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500">
                  <th className="text-left px-4 py-3">Réf. Souscription</th>
                  <th className="text-left px-4 py-3">Souscripteur</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Montant Global</th>
                  <th className="text-left px-4 py-3">Statut Dossier</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {linkedSouscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      Aucune souscription enregistrée pour ce fournisseur pour le moment.
                    </td>
                  </tr>
                ) : (
                  linkedSouscriptions.map(s => {
                    const relatedDossier = (dossiers || []).find(d => d.souscriptionId === s.id);
                    const targetDossierId = relatedDossier?.id || s.id;

                    return (
                      <tr key={s.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">
                          {s.reference || s.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">
                            {s.souscripteurPrenom} {s.souscripteurNom}
                          </p>
                          {s.souscripteurEntreprise && (
                            <p className="text-xs text-gray-400">{s.souscripteurEntreprise}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize font-medium">
                            {s.typeSouscripteur === "morale" ? "Personne Morale" : "Particulier"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {s.dateCreation ? new Date(s.dateCreation).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {fmtCFA(s.montantTotal)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge statut={s.statut} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/dossiers/${targetDossierId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> Consulter dossier
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Onglet Devis Émis ── */}
      {activeTab === "devis" && (
        <div className="section-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Devis ViFlo émis par {fournisseur.nom} ({linkedDevis.length})
            </h2>
            <span className="text-xs text-gray-500 font-medium">Validité officielle des devis : 60 jours</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500">
                  <th className="text-left px-4 py-3">Réf. Devis</th>
                  <th className="text-left px-4 py-3">Bénéficiaire</th>
                  <th className="text-left px-4 py-3">Date Émission</th>
                  <th className="text-left px-4 py-3">Validité</th>
                  <th className="text-left px-4 py-3">Articles</th>
                  <th className="text-left px-4 py-3">Montant TTC</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {linkedDevis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                      Aucun devis n'a encore été chiffré par ce fournisseur.
                    </td>
                  </tr>
                ) : (
                  linkedDevis.map(d => (
                    <tr key={d.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">
                        {d.reference || d.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {d.souscripteurNom} {d.souscripteurPrenom || ""}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {d.dateCreation ? new Date(d.dateCreation).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                        {d.validiteDevis || "60 jours"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {Array.isArray(d.articles) ? `${d.articles.length} article(s)` : "1 article"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {fmtCFA(d.totalTTC || d.totalHT)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge statut={d.statut} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/devis/${d.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir devis
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Onglet Règlements AFG Bank ── */}
      {activeTab === "paiements" && (
        <div className="section-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Règlements & Décaissements AFG Bank vers {fournisseur.nom} ({linkedPaiements.length})
            </h2>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              Total décaissé : {fmtCFA(totalPayeAFG)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500">
                  <th className="text-left px-4 py-3">Réf. Virement</th>
                  <th className="text-left px-4 py-3">Dossier Associé</th>
                  <th className="text-left px-4 py-3">Date Décaissement</th>
                  <th className="text-left px-4 py-3">Émetteur</th>
                  <th className="text-left px-4 py-3">Montant Versé</th>
                  <th className="text-left px-4 py-3">Statut Renseignement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {linkedPaiements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Aucun règlement AFG Bank versé pour ce fournisseur pour l'instant.
                    </td>
                  </tr>
                ) : (
                  linkedPaiements.map(p => {
                    return (
                      <tr key={p.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">
                          {p.reference || p.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {p.dossierRef || p.souscriptionRef || "Dossier AFG"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {p.dateTransfert || p.dateValidationAFG || p.dateCreation
                            ? new Date(p.dateTransfert || p.dateValidationAFG || p.dateCreation).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-blue-700">
                          AFG Bank Atlantic
                        </td>
                        <td className="px-4 py-3 font-bold text-purple-700">
                          {fmtCFA(p.montantTotal || p.montant)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge statut={p.statut} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
