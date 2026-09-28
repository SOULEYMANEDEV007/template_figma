// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, User, ShieldCheck,
  CheckCircle2, TrendingUp, CreditCard, FileText, ChevronRight, Eye,
  AlertCircle, Clock, Calendar, CheckCircle, XCircle, Landmark, Award,
  Users, Check, ExternalLink, Briefcase
} from "lucide-react";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import type { VAgenceAFG } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { IMAGES } from "@/lib/constants/images";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { toast } from "sonner";

const fmtCFA = (v?: number) => {
  const num = typeof v === "number" && !isNaN(v) ? v : 0;
  return new Intl.NumberFormat("fr-FR").format(num) + " FCFA";
};

export default function AdminBanqueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";

  const {
    agencesAFG = [],
    dossiers = [],
    souscriptions = [],
    paiements = [],
    fournisseurs = [],
    updateAgenceAFG,
  } = useVitalisDb();

  const [activeTab, setActiveTab] = useState<"general" | "dossiers" | "paiements" | "repartition">("general");

  // Recherche de l'agence AFG
  const agence = useMemo(() => {
    return agencesAFG.find(
      a => a.id === id || a.code === id || a.code?.replace("AFG-", "") === id
    );
  }, [agencesAFG, id]);

  // Si l'agence n'existe pas
  if (!agence) {
    return (
      <div className="section-card py-20 text-center max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Agence AFG Bank introuvable</h2>
        <p className="text-sm text-gray-500 mb-6">
          L'agence demandée avec l'identifiant <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{id}</code> n'a pas été trouvée dans le réseau.
        </p>
        <Link
          href="/dashboard/admin/banques"
          className="btn-ldf-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux agences AFG Bank
        </Link>
      </div>
    );
  }

  // 1. Dossiers instruits rattachés à cette agence
  const agenceDossiers = useMemo(() => {
    const matchingSousIds = new Set(
      souscriptions
        .filter(s => s.agenceId === agence.id || s.agenceId === agence.code)
        .map(s => s.id)
    );

    return (dossiers || []).filter(d =>
      d.agenceId === agence.id ||
      d.agenceId === agence.code ||
      (d.souscriptionId && matchingSousIds.has(d.souscriptionId))
    );
  }, [dossiers, souscriptions, agence]);

  // 2. Dossiers validés / financés
  const dossiersFinances = useMemo(() => {
    return agenceDossiers.filter(d =>
      ["valide", "accepte", "finance", "fournisseur_paye", "commande_en_preparation", "livre", "servie", "cloture"].includes(d.statut)
    );
  }, [agenceDossiers]);

  // 3. Montant total financé / accordé
  const montantTotalFinance = useMemo(() => {
    return dossiersFinances.reduce(
      (sum, d) => sum + (d.montantFinance || d.montantAccorde || d.montantTotal || d.montant || 0),
      0
    );
  }, [dossiersFinances]);

  // 4. Montant total demandé en instruction
  const montantTotalDemande = useMemo(() => {
    return agenceDossiers.reduce(
      (sum, d) => sum + (d.montantTotal || d.montant || 0),
      0
    );
  }, [agenceDossiers]);

  // 5. Taux d'accord
  const tauxAccord = agenceDossiers.length > 0
    ? Math.round((dossiersFinances.length / agenceDossiers.length) * 100)
    : 100;

  // 6. Règlements / Paiements ordonnancés par cette agence
  const agencePaiements = useMemo(() => {
    const agenceDossierIds = new Set(agenceDossiers.map(d => d.id));
    return (paiements || []).filter(p =>
      p.banqueId === agence.id ||
      (p.dossierId && agenceDossierIds.has(p.dossierId))
    );
  }, [paiements, agence, agenceDossiers]);

  // 7. Ventilation financière par fournisseur agréé
  const repartitionFournisseurs = useMemo(() => {
    const map: Record<string, { nom: string; count: number; montant: number }> = {};

    agenceDossiers.forEach(d => {
      const frnNom = d.fournisseurNom || d.fournisseursNoms || "Fournisseur Agréé";
      const montant = d.montantFinance || d.montantAccorde || d.montantTotal || 0;
      if (!map[frnNom]) {
        map[frnNom] = { nom: frnNom, count: 0, montant: 0 };
      }
      map[frnNom].count += 1;
      map[frnNom].montant += montant;
    });

    return Object.values(map).sort((a, b) => b.montant - a.montant);
  }, [agenceDossiers]);

  const handleToggleStatut = () => {
    const nextStatut = agence.statut === "actif" ? "inactif" : "actif";
    updateAgenceAFG(agence.id, { statut: nextStatut });
    toast.success(`Statut de ${agence.nom} mis à jour : ${nextStatut}`);
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* ── Fil d'Ariane & Bouton Retour ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/dashboard/admin/banques" className="hover:text-blue-600 transition-colors">Agences AFG Bank CI</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800">{agence.nom}</span>
        </div>

        <Link
          href="/dashboard/admin/banques"
          className="btn-ldf-outline text-xs py-1.5 px-3 self-start sm:self-auto flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au réseau d'agences
        </Link>
      </div>

      {/* ── Fiche En-tête Agence AFG Bank ── */}
      <div className="section-card p-6 bg-gradient-to-r from-white via-white to-blue-50/40 border border-gray-100 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Logo AFG Bank */}
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 p-2 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <Image
                src={IMAGES.logos.afgBank}
                alt="AFG Bank"
                width={70}
                height={70}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{agence.nom}</h1>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                  {agence.code}
                </span>
                <StatusBadge statut={agence.statut} size="sm" />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100/70 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" /> Pôle Crédit Vitalis FADES
                </span>
              </div>

              <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                Guichet d'instruction et de décaissement AFG Bank Atlantic · Côte d'Ivoire
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Responsable : {agence.responsable || "Non assigné"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {agence.ville} ({agence.adresse || agence.ville})
                </span>
                {agence.telephone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <a href={`tel:${agence.telephone}`} className="text-gray-700 font-mono hover:underline">{agence.telephone}</a>
                  </span>
                )}
                {agence.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <a href={`mailto:${agence.email}`} className="text-blue-600 hover:underline">{agence.email}</a>
                  </span>
                )}
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
              <button
                onClick={handleToggleStatut}
                className={`text-xs py-2 px-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  agence.statut === "actif"
                    ? "btn-ldf-outline text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                    : "btn-ldf-primary"
                }`}
              >
                {agence.statut === "actif" ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Désactiver l'agence
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Réactiver l'agence
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Cartes KPIs Financiers ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Dossiers Instruits */}
        <div className="section-card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dossiers Instruits</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {agenceDossiers.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Dossiers déposés à ce guichet</p>
        </div>

        {/* KPI 2 : Montant Financement Accordé */}
        <div className="section-card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Crédits Accordés</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-2 truncate" title={fmtCFA(montantTotalFinance)}>
            {fmtCFA(montantTotalFinance)}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {dossiersFinances.length} dossier{dossiersFinances.length > 1 ? "s" : ""} financé{dossiersFinances.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* KPI 3 : Taux d'accord */}
        <div className="section-card p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Taux d'Accord</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2">
            {tauxAccord}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Ratio d'acceptation du comité</p>
        </div>

        {/* KPI 4 : Décaissements Ordonnancés */}
        <div className="section-card p-5 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paiements Fournisseurs</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">
            {agencePaiements.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Virements directs émis</p>
        </div>
      </div>

      {/* ── Onglets de Navigation ── */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "general"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" /> Fiche Agence & Missions
        </button>

        <button
          onClick={() => setActiveTab("dossiers")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "dossiers"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          Dossiers de Financement
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            {agenceDossiers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("repartition")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "repartition"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Répartition Fournisseurs
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            {repartitionFournisseurs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("paiements")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "paiements"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Virements & Règlements
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            {agencePaiements.length}
          </span>
        </button>
      </div>

      {/* ── Contenu Onglet Fiche Agence ── */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bloc 1 : Coordonnées & Responsable */}
          <div className="section-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-4 h-4 text-blue-600" />
              Direction de l'Agence & Coordonnées Officielles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Nom de l'Agence</p>
                <p className="text-gray-800 font-semibold text-sm mt-0.5">{agence.nom}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Code Guichet AFG</p>
                <p className="text-blue-700 font-mono font-bold mt-0.5">{agence.code}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Responsable / Chef d'Agence</p>
                <p className="text-gray-800 font-semibold mt-0.5">{agence.responsable || "Non assigné"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Statut Opérationnel</p>
                <div className="mt-0.5">
                  <StatusBadge statut={agence.statut} size="sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Ville</p>
                <p className="text-gray-800 font-medium mt-0.5">{agence.ville}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Adresse Physique</p>
                <p className="text-gray-800 font-medium mt-0.5">{agence.adresse || agence.ville}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Ligne Téléphonique</p>
                <p className="text-gray-800 font-mono font-medium mt-0.5">{agence.telephone || "+225 27 20 00 00 00"}</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Adresse Email Officielle</p>
                <p className="text-blue-600 font-medium mt-0.5 truncate">{agence.email || "agence@afgbank.ci"}</p>
              </div>
            </div>
          </div>

          {/* Bloc 2 : Rôle Vitalis FADES & Protocole */}
          <div className="section-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Missions & Rôle dans le Programme Vitalis FADES
            </h2>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <FileText className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">1. Réception & Instruction des Dossiers Physiques</p>
                  <p className="text-blue-800/80 text-[11px] mt-0.5">
                    L'agence reçoit les souscripteurs pour le dépôt de leur fiche de souscription ViFlo avec les devis fournisseurs et pièces justificatives (CNI, attestation de travail, bulletins de salaire).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">2. Décision de Crédit & Signature de Convention</p>
                  <p className="text-emerald-800/80 text-[11px] mt-0.5">
                    Le comité de crédit de l'agence analyse la solvabilité, valide le financement à taux préférentiel et contractualise avec le souscripteur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <CreditCard className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900">3. Décaissement Direct aux Fournisseurs Agréés</p>
                  <p className="text-purple-800/80 text-[11px] mt-0.5">
                    Conformément aux règles du programme, l'agence ordonnance le virement direct des montants validés sur les comptes des fournisseurs agréés (LDF, Drocolor, RIMCO, etc.).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Contenu Onglet Dossiers ── */}
      {activeTab === "dossiers" && (
        <div className="section-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Dossiers de Financement Instruits à {agence.nom} ({agenceDossiers.length})
            </h2>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
              Total demandé : {fmtCFA(montantTotalDemande)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500">
                  <th className="text-left px-4 py-3">Réf. Dossier</th>
                  <th className="text-left px-4 py-3">Souscripteur</th>
                  <th className="text-left px-4 py-3">Fournisseurs Liés</th>
                  <th className="text-left px-4 py-3">Date Réception</th>
                  <th className="text-left px-4 py-3">Montant Dossier</th>
                  <th className="text-left px-4 py-3">Statut Banque</th>
                  <th className="text-right px-4 py-3">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agenceDossiers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      Aucun dossier de financement déposé dans cette agence pour le moment.
                    </td>
                  </tr>
                ) : (
                  agenceDossiers.map(d => (
                    <tr key={d.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">
                        {d.reference || d.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {d.souscripteurPrenom} {d.souscripteurNom}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{d.typeSouscripteur || "Particulier"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate" title={d.fournisseursNoms || d.fournisseurNom}>
                        {d.fournisseursNoms || d.fournisseurNom || "Fournisseurs agréés"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {d.dateReception || d.dateCreation ? new Date(d.dateReception || d.dateCreation).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {fmtCFA(d.montantTotal || d.montantAccorde || d.montant)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge statut={d.statut} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/dossiers/${d.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir dossier
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

      {/* ── Contenu Onglet Répartition Fournisseurs ── */}
      {activeTab === "repartition" && (
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Financements Accordés par Fournisseur Agréé
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ventilation des montants de crédit instruits par {agence.nom} pour chaque partenaire agréé
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Total : {fmtCFA(montantTotalFinance)}
            </span>
          </div>

          {repartitionFournisseurs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Aucune donnée de financement ventilée pour cette agence.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repartitionFournisseurs.map((item, idx) => {
                const percent = montantTotalFinance > 0 ? Math.round((item.montant / montantTotalFinance) * 100) : 0;

                return (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.nom}</p>
                          <p className="text-xs text-gray-500">{item.count} dossier{item.count > 1 ? "s" : ""} associé{item.count > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-700">{fmtCFA(item.montant)}</p>
                        <p className="text-xs text-gray-400">{percent}% du total</p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Contenu Onglet Règlements Émis ── */}
      {activeTab === "paiements" && (
        <div className="section-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Virements & Décaissements Ordonnancés par {agence.nom} ({agencePaiements.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500">
                  <th className="text-left px-4 py-3">Réf. Virement</th>
                  <th className="text-left px-4 py-3">Dossier Lié</th>
                  <th className="text-left px-4 py-3">Souscripteur</th>
                  <th className="text-left px-4 py-3">Montant Décaissé</th>
                  <th className="text-left px-4 py-3">Date Virement</th>
                  <th className="text-left px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agencePaiements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Aucun virement n'a encore été ordonnancé par cette agence.
                    </td>
                  </tr>
                ) : (
                  agencePaiements.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">
                        {p.reference || p.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {p.dossierRef || p.souscriptionRef || "Dossier AFG"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {p.souscripteurNom || "Souscripteur"}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {fmtCFA(p.montantTotal || p.montant)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {p.dateTransfert || p.dateValidationAFG || p.dateCreation
                          ? new Date(p.dateTransfert || p.dateValidationAFG || p.dateCreation).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge statut={p.statut} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
