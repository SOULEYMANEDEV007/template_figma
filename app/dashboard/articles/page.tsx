// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Package, CheckCircle2, Clock, Search, Filter, Printer,
  Eye, Truck, Calendar, MapPin, User, ChevronRight, X, Sparkles, Building2,
  FileCheck, ShieldCheck, AlertCircle, Phone
} from "lucide-react";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore, emitInAppNotification } from "@/stores/ldfAuth";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { IMAGES } from "@/lib/constants/images";
import { toast } from "sonner";

const fmtCFA = (v: any) => {
  const num = typeof v === "number" ? v : Number(v);
  return new Intl.NumberFormat("fr-FR").format(isNaN(num) ? 0 : num) + " FCFA";
};

export default function ArticlesServisPage() {
  const { user } = useLDFAuthStore();
  const {
    paiements = [],
    souscriptions = [],
    devis = [],
    dossiers = [],
    syncMissingPaiements,
    getSouscriptionById,
    getDevisBySouscription,
    getDossierBySouscription,
    updateSouscription,
    updateDossier,
    updatePaiement,
    addHistorique,
  } = useVitalisDb();

  const [activeTab, setActiveTab] = useState<"servis" | "attente" | "tous">("servis");
  const [search, setSearch] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Synchronisation au montage des paiements et souscriptions
  useEffect(() => {
    if (syncMissingPaiements) {
      syncMissingPaiements();
    }
  }, [syncMissingPaiements]);

  // Construction d'une liste unifiée et enrichie de toutes les commandes et articles
  const allDeliveryItems = useMemo(() => {
    const items: any[] = [];
    const seenSubIds = new Set<string>();

    // 1. Depuis les paiements
    (paiements || []).forEach((p: any) => {
      const sub = p.souscriptionId
        ? (getSouscriptionById(p.souscriptionId) || souscriptions.find(s => s.id === p.souscriptionId))
        : null;
      if (sub) seenSubIds.add(sub.id);

      const dev = sub
        ? (getDevisBySouscription(sub.id)[0] || devis.find(d => d.souscriptionId === sub.id))
        : devis.find(d => d.id === p.repartitionFournisseurs?.[0]?.devisId);

      const dos = sub
        ? (getDossierBySouscription(sub.id) || dossiers.find(d => d.souscriptionId === sub.id))
        : null;

      const isServi =
        p.statut === "servi" ||
        ["livre", "servie", "cloture"].includes(sub?.statut) ||
        ["livre", "servie", "cloture"].includes(dos?.statut);

      const isPret =
        !isServi &&
        (p.statut === "encaisse" ||
          p.statut === "fournisseur_paye" ||
          p.statut === "termine" ||
          ["fournisseur_paye", "commande_en_preparation"].includes(sub?.statut));

      const subDevisList = sub
        ? devis.filter(d => d.souscriptionId === sub.id)
        : (dev ? [dev] : []);

      const devisArticles = subDevisList.flatMap(d => d.articles || []);

      const matchProduit = sub?.observations?.match(/Produit:\s*([^|\n]+)/)?.[1]?.trim();
      const matchBesoin = sub?.observations?.match(/Besoin:\s*([^|\n]+)/)?.[1]?.trim();
      const besoinClient = matchProduit || matchBesoin || sub?.observations?.split("\n")[0] || "Articles selon devis validé";

      const articles = devisArticles.length > 0
        ? devisArticles
        : [
          {
            id: `ART-${sub?.id || p.id}`,
            designation: besoinClient,
            quantite: 1,
            prixUnitaire: p.montantTotal || p.montant || sub?.montantTotal || 0,
            montantHT: p.montantTotal || p.montant || sub?.montantTotal || 0,
          },
        ];

      const montant = p.montantTotal || p.montant || dev?.totalTTC || sub?.montantTotal || 0;
      const fournisseurNom =
        p.repartitionFournisseurs?.[0]?.fournisseurNom ||
        p.fournisseurNom ||
        dev?.fournisseurNom ||
        sub?.fournisseurNom ||
        "Librairie de France Groupe";

      const souscripteurNom =
        p.souscripteurNom ||
        (sub ? `${sub.souscripteurPrenom || ""} ${sub.souscripteurNom || ""}`.trim() : "Souscripteur Vitalis");

      // Infos de livraison structurées
      const modeLivraison = sub?.detailsLivraison?.mode || (sub?.observations?.toLowerCase().includes("domicile") ? "domicile" : "point_relais");
      const relaisNom =
        sub?.detailsLivraison?.pointRelaisNom ||
        sub?.pointRelaisNom ||
        (sub?.observations?.match(/(?:Point Relais|Relais):\s*([^\]|\n]+)/)?.[1]) ||
        (modeLivraison === "point_relais" ? "Point Relais Vitalis Cocody / Plateau" : "Livraison directe à domicile");

      const destinataireNom = sub?.detailsLivraison?.destinataireNom || souscripteurNom;
      const destinataireTelephone = sub?.detailsLivraison?.destinataireTelephone || sub?.souscripteurTelephone || "07 00 00 00 00";
      const adresseLieu = sub?.detailsLivraison?.adresse || sub?.adresseLivraison || (sub?.commune ? `${sub?.commune}, ${sub?.ville || "Abidjan"}` : "Abidjan");

      items.push({
        id: p.id,
        reference: p.reference,
        paiementId: p.id,
        souscriptionId: sub?.id || p.souscriptionId,
        souscriptionRef: p.souscriptionRef || sub?.reference || "VF-2026",
        dossierId: dos?.id || p.dossierId,
        dossierRef: dos?.reference || p.dossierRef || "DOS-2026",
        souscripteurId: sub?.souscripteurId || p.souscripteurId,
        souscripteurNom,
        souscripteurTelephone: sub?.souscripteurTelephone || destinataireTelephone,
        typeSouscripteur: sub?.typeSouscripteur || "physique",
        fournisseurId: p.fournisseurId || dev?.fournisseurId || sub?.fournisseurId,
        fournisseurNom,
        banqueNom: p.banqueNom || sub?.banqueNom || "AFG Bank",
        articles,
        nombreArticles: articles.reduce((acc: number, a: any) => acc + (a.quantite || 1), 0),
        montant,
        modeLivraison,
        relaisNom,
        destinataireNom,
        destinataireTelephone,
        adresseLieu,
        isServi,
        isPret,
        statut: isServi ? "servi" : (isPret ? "pret_retrait" : "en_cours"),
        dateService: p.dateTransfert || sub?.dateMiseAJour || p.dateMiseAJour || p.dateCreation,
        dateCreation: p.dateCreation || sub?.dateCreation,
      });
    });

    // 2. Inclure les souscriptions livrées ou en préparation non encore dans les paiements
    (souscriptions || []).forEach((s: any) => {
      if (seenSubIds.has(s.id)) return;
      if (!["livre", "servie", "cloture", "fournisseur_paye", "commande_en_preparation"].includes(s.statut)) return;

      const dev = getDevisBySouscription(s.id)[0] || devis.find(d => d.souscriptionId === s.id);
      const dos = getDossierBySouscription(s.id) || dossiers.find(d => d.souscriptionId === s.id);
      const isServi = ["livre", "servie", "cloture"].includes(s.statut);
      const isPret = ["fournisseur_paye", "commande_en_preparation"].includes(s.statut);

      const subDevisList = devis.filter(d => d.souscriptionId === s.id);
      const devisArticles = subDevisList.flatMap(d => d.articles || []);

      const matchProduit = s.observations?.match(/Produit:\s*([^|\n]+)/)?.[1]?.trim();
      const matchBesoin = s.observations?.match(/Besoin:\s*([^|\n]+)/)?.[1]?.trim();
      const besoinClient = matchProduit || matchBesoin || s.observations?.split("\n")[0] || "Articles selon devis validé";

      const articles = devisArticles.length > 0
        ? devisArticles
        : [
          {
            id: `ART-${s.id}`,
            designation: besoinClient,
            quantite: 1,
            prixUnitaire: s.montantTotal || 0,
            montantHT: s.montantTotal || 0,
          },
        ];

      const souscripteurNom = `${s.souscripteurPrenom || ""} ${s.souscripteurNom || ""}`.trim() || "Souscripteur Vitalis";
      const fournisseurNom = dev?.fournisseurNom || s.fournisseurNom || "Librairie de France Groupe";
      const modeLivraison = s.detailsLivraison?.mode || (s.observations?.toLowerCase().includes("domicile") ? "domicile" : "point_relais");
      const relaisNom =
        s.detailsLivraison?.pointRelaisNom ||
        s.pointRelaisNom ||
        (s.observations?.match(/(?:Point Relais|Relais):\s*([^\]|\n]+)/)?.[1]) ||
        (modeLivraison === "point_relais" ? "Point Relais Vitalis" : "Livraison directe à domicile");

      items.push({
        id: `DELIV-${s.id}`,
        reference: s.reference.replace("VF-", "PAY-"),
        paiementId: null,
        souscriptionId: s.id,
        souscriptionRef: s.reference,
        dossierId: dos?.id,
        dossierRef: dos?.reference,
        souscripteurId: s.souscripteurId,
        souscripteurNom,
        souscripteurTelephone: s.souscripteurTelephone,
        typeSouscripteur: s.typeSouscripteur || "physique",
        fournisseurId: dev?.fournisseurId || s.fournisseurId,
        fournisseurNom,
        banqueNom: s.banqueNom || "AFG Bank",
        articles,
        nombreArticles: articles.reduce((acc: number, a: any) => acc + (a.quantite || 1), 0),
        montant: s.montantTotal || dev?.totalTTC || 0,
        modeLivraison,
        relaisNom,
        destinataireNom: s.detailsLivraison?.destinataireNom || souscripteurNom,
        destinataireTelephone: s.detailsLivraison?.destinataireTelephone || s.souscripteurTelephone || "",
        adresseLieu: s.detailsLivraison?.adresse || s.adresseLivraison || (s.commune ? `${s.commune}, ${s.ville || "Abidjan"}` : "Abidjan"),
        isServi,
        isPret,
        statut: isServi ? "servi" : (isPret ? "pret_retrait" : "en_cours"),
        dateService: s.dateMiseAJour || s.dateCreation,
        dateCreation: s.dateCreation,
      });
    });

    return items;
  }, [paiements, souscriptions, devis, dossiers, getSouscriptionById, getDevisBySouscription, getDossierBySouscription]);

  // Filtrage selon le rôle utilisateur
  const roleFilteredItems = useMemo(() => {
    return allDeliveryItems.filter(item => {
      if (user?.role === "admin") return true;
      if (user?.role === "banque") return true; // AFG Bank finance l'ensemble
      if (user?.role === "fournisseur") {
        if (user.organisationId && item.fournisseurId === user.organisationId) return true;
        if (user.firstName && item.fournisseurNom.toLowerCase().includes(user.firstName.toLowerCase())) return true;
        return item.fournisseurNom.toLowerCase().includes("france") || item.fournisseurNom.toLowerCase().includes("drocolor");
      }
      if (user?.role === "souscripteur") {
        if (item.souscripteurId === user.id) return true;
        if (user.lastName && item.souscripteurNom.toLowerCase().includes(user.lastName.toLowerCase())) return true;
        return true;
      }
      return true;
    });
  }, [allDeliveryItems, user]);

  // Filtrage selon onglet actif et recherche
  const filtered = useMemo(() => {
    return roleFilteredItems.filter(item => {
      // Onglet
      if (activeTab === "servis" && !item.isServi) return false;
      if (activeTab === "attente" && !item.isPret) return false;

      // Filtre Fournisseur
      if (filterFournisseur && !item.fournisseurNom.toLowerCase().includes(filterFournisseur.toLowerCase())) {
        return false;
      }

      // Recherche textuelle
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchRef = item.reference?.toLowerCase().includes(q) || item.souscriptionRef?.toLowerCase().includes(q) || item.dossierRef?.toLowerCase().includes(q);
        const matchNom = item.souscripteurNom?.toLowerCase().includes(q) || item.destinataireNom?.toLowerCase().includes(q);
        const matchFrn = item.fournisseurNom?.toLowerCase().includes(q);
        const matchRelais = item.relaisNom?.toLowerCase().includes(q) || item.adresseLieu?.toLowerCase().includes(q);
        const matchArticle = item.articles?.some((a: any) => a.designation?.toLowerCase().includes(q));
        if (!matchRef && !matchNom && !matchFrn && !matchRelais && !matchArticle) return false;
      }

      return true;
    });
  }, [roleFilteredItems, activeTab, filterFournisseur, search]);

  // KPIs
  const totalServisCount = roleFilteredItems.filter(i => i.isServi).length;
  const totalServisMontant = roleFilteredItems.filter(i => i.isServi).reduce((acc, i) => acc + i.montant, 0);
  const totalArticlesPhysiques = roleFilteredItems.filter(i => i.isServi).reduce((acc, i) => acc + i.nombreArticles, 0);
  const totalEnAttente = roleFilteredItems.filter(i => i.isPret).length;

  // Liste unique des fournisseurs pour le filtre
  const fournisseursList = useMemo(() => {
    const setF = new Set<string>();
    roleFilteredItems.forEach(i => {
      if (i.fournisseurNom) setF.add(i.fournisseurNom);
    });
    return Array.from(setF);
  }, [roleFilteredItems]);

  // Confirmation directe de remise de commande (Fournisseur / Admin)
  const handleConfirmerRemise = (item: any) => {
    if (item.souscriptionId) {
      updateSouscription(item.souscriptionId, { statut: "livre" });
      addHistorique({
        souscriptionId: item.souscriptionId,
        action: "articles_livres",
        description: `Articles remis en main propre au souscripteur contre émargement officiel.`,
        auteur: `${user?.firstName || "Fournisseur"} ${user?.lastName || ""}`,
        date: new Date().toISOString(),
      });
    }
    if (item.dossierId) {
      updateDossier(item.dossierId, { statut: "livre" });
    }
    if (item.paiementId) {
      updatePaiement(item.paiementId, { statut: "servi" });
    }

    emitInAppNotification({
      titre: `Articles servis : ${item.souscriptionRef}`,
      message: `Tous les articles ont été remis à ${item.souscripteurNom} contre fiche d'émargement. Dossier clôturé avec succès.`,
      categorie: "dossier",
      reference: item.souscriptionRef,
      lien: `/dashboard/articles`,
      roles: ["fournisseur", "banque", "admin", "souscripteur"],
    });

    toast.success(`Livraison confirmée pour ${item.souscripteurNom} ! Articles servis ✓`);
  };

  // Impression officielle du Bon d'Émargement / Décharge VITALIS
  const handlePrintEmargement = (item: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Bon d'Émargement & Décharge - ${item.souscriptionRef}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 850px; margin: 25px auto; color: #1e293b; line-height: 1.5; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
        .header img { height: 42px; object-fit: contain; mix-blend-mode: multiply; }
        h1 { color: #059669; font-size: 18px; text-align: center; margin: 15px 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .subtitle { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 20px; }
        .badge { display: inline-block; padding: 4px 10px; background: #ecfdf5; color: #047857; font-weight: bold; border-radius: 9999px; border: 1px solid #a7f3d0; font-size: 11px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
        .info-card h3 { margin: 0 0 8px 0; font-size: 12px; color: #334155; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
        th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; color: #334155; font-weight: bold; }
        .attestation { background: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 8px; font-size: 11px; margin-top: 20px; text-align: justify; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; }
        .sig-box { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 12px; min-height: 110px; text-align: center; }
        .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; }
        @media print { body { margin: 10px; } .no-print { display: none; } }
      </style>
      </head><body>
      <div class="header">
        <img src="${window.location.origin}${IMAGES.logos.fades}" alt="FADES" />
        <img src="${window.location.origin}${IMAGES.logos.vifloNew}" alt="ViFlo" style="height: 48px;" />
        <img src="${window.location.origin}${IMAGES.logos.afgBank}" alt="AFG Bank" />
      </div>

      <h1>Bon d'Émargement et Décharge Officielle</h1>
      <p class="subtitle">Programme National VITALIS · Financement Sécurisé AFG Bank · Clôture de Financement & Remise des Biens</p>

      <div class="info-grid">
        <div class="info-card">
          <h3>Informations Dossier & Financement</h3>
          <p><strong>Réf. Souscription :</strong> <span style="font-family: monospace; color: #047857;">${item.souscriptionRef}</span></p>
          <p><strong>Réf. Paiement AFG :</strong> <span style="font-family: monospace;">${item.reference}</span></p>
          <p><strong>Banque Émettrice :</strong> ${item.banqueNom}</p>
          <p><strong>Fournisseur Distributeur :</strong> <strong>${item.fournisseurNom}</strong></p>
        </div>
        <div class="info-card">
          <h3>Bénéficiaire & Lieu de Remise</h3>
          <p><strong>Souscripteur :</strong> ${item.souscripteurNom}</p>
          <p><strong>Téléphone direct :</strong> ${item.destinataireTelephone}</p>
          <p><strong>Mode de Remise :</strong> ${item.modeLivraison === "point_relais" ? "Point Relais Vitalis" : "Livraison directe à domicile"}</p>
          <p><strong>Point Relais / Adresse :</strong> <strong>${item.relaisNom}</strong></p>
        </div>
      </div>

      <h3>Détail des Articles Remis au Bénéficiaire</h3>
      <table>
        <thead>
          <tr>
            <th>Désignation de l'Article</th>
            <th style="text-align: center;">Qté</th>
            <th style="text-align: right;">Prix Unitaire</th>
            <th style="text-align: right;">Montant Total</th>
          </tr>
        </thead>
        <tbody>
          ${(item.articles || []).map((a: any) => `
            <tr>
              <td><strong>${a.designation}</strong></td>
              <td style="text-align: center;">${a.quantite || 1}</td>
              <td style="text-align: right;">${fmtCFA(a.prixUnitaire)}</td>
              <td style="text-align: right; font-weight: bold;">${fmtCFA(a.montantHT || (a.quantite || 1) * a.prixUnitaire)}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="background: #ecfdf5; font-size: 13px; font-weight: bold; color: #065f46;">
            <td colspan="3" style="text-align: right;">VALEUR TOTALE DU COLIS FINANCÉ (TTC) :</td>
            <td style="text-align: right;">${fmtCFA(item.montant)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="attestation">
        <strong>ATTESTATION SUR L'HONNEUR & DÉCHARGE FORMELLE :</strong><br/>
        Je soussigné(e), <strong>${item.souscripteurNom}</strong>, atteste par la présente avoir réceptionné en bon état l'intégralité des articles et matériels listés ci-dessus, financés par AFG Bank dans le cadre du Programme Vitalis. La présente signature vaut quitus de réception définitive et confirme la conformité de la commande.
      </div>

      <div class="signatures">
        <div class="sig-box">
          <p style="font-weight: bold; margin: 0; color: #1e293b; font-size: 12px;">Cadre 1 : Signature du Souscripteur</p>
          <p style="font-size: 10px; color: #64748b; margin: 4px 0 35px 0;">(Mention manuscrite "Reçu conforme et en parfait état")</p>
          <p style="font-size: 11px; color: #475569;">Fait le : ${new Date().toLocaleDateString("fr-FR")}</p>
        </div>
        <div class="sig-box" style="border-color: #059669; background: #f0fdf4;">
          <p style="font-weight: bold; margin: 0; color: #065f46; font-size: 12px;">Cadre 2 : Visa du Fournisseur / Point Relais</p>
          <p style="font-size: 10px; color: #64748b; margin: 4px 0 35px 0;">(Cachet, Date de remise et Signature du responsable)</p>
          <p style="font-size: 11px; color: #047857;">Remis le : ${new Date(item.dateService).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      <div class="footer">
        <p>Document officiel établi sous convention AFG Bank Atlantic, FADES et Plateforme ViFlo · Fiche d'émargement originale à archiver</p>
      </div>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* ── En-tête de la page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Articles servis & Livraisons</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalServisCount} livraison{totalServisCount > 1 ? "s" : ""} confirmée{totalServisCount > 1 ? "s" : ""} contre émargement · Suivi de mise à disposition des commandes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/dossiers"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" /> Voir les dossiers
          </Link>
          <Link
            href="/dashboard/paiements"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-600" /> Voir les règlements AFG
          </Link>
        </div>
      </div>

      {/* ── 4 KPIs Clés ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Livraisons confirmées</p>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-teal-700 mt-1">{totalServisCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Articles servis et émargés</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-emerald-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Montant total servi</p>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1">{fmtCFA(totalServisMontant)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Financement délivré aux clients</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-blue-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Articles physiques remis</p>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{totalArticlesPhysiques}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Unités distribuées en magasin / relais</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-amber-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">En attente de retrait</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{totalEnAttente}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Commandes payées prêtes au relais</p>
        </div>
      </div>

      {/* ── Filtres, Onglets et Recherche ── */}
      <div className="section-card p-4 space-y-3">
        {/* Onglets */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("servis")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "servis"
                ? "bg-teal-50 text-teal-700 border border-teal-200 shadow-xs"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Articles servis ({totalServisCount})
          </button>
          <button
            onClick={() => setActiveTab("attente")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "attente"
                ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-xs"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            En attente de remise / retrait ({totalEnAttente})
          </button>
          <button
            onClick={() => setActiveTab("tous")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "tous"
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Toutes les expéditions ({roleFilteredItems.length})
          </button>
        </div>

        {/* Barre de recherche et sélecteur de fournisseur */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, client, article, fournisseur ou point relais..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {fournisseursList.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterFournisseur}
                onChange={e => setFilterFournisseur(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 font-medium"
              >
                <option value="">Tous les fournisseurs</option>
                {fournisseursList.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Table des articles servis ── */}
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Réf. Commande / Paiement</th>
                <th>Bénéficiaire (Souscripteur)</th>
                <th>Articles & Équipements</th>
                <th>Fournisseur Agréé</th>
                <th>Lieu de Remise</th>
                <th className="text-right">Montant Servi</th>
                <th>Date Service</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Package className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Aucun article dans cette vue</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      {activeTab === "attente"
                        ? "Aucune commande en attente de retrait. Les articles sont remis dès confirmation du virement AFG Bank."
                        : "Aucune livraison enregistrée avec ces filtres."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Références */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-teal-700">
                          {item.reference}
                        </span>
                        <Link
                          href={`/dashboard/souscriptions/${item.souscriptionId}`}
                          className="text-[11px] text-gray-500 hover:text-amber-600 font-mono"
                          title="Voir la souscription"
                        >
                          {item.souscriptionRef}
                        </Link>
                      </div>
                    </td>

                    {/* Souscripteur */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800">{item.souscripteurNom}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-gray-400" />
                        {item.destinataireTelephone}
                      </p>
                    </td>

                    {/* Articles remis */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.nombreArticles} article{item.nombreArticles > 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-gray-700 font-medium truncate block max-w-[180px]" title={item.articles.map((a: any) => `${a.quantite || 1}x ${a.designation}`).join(", ")}>
                          {item.articles[0]?.designation || "Fournitures"}
                        </span>
                        {item.articles.length > 1 && (
                          <span className="text-[10px] text-gray-400">
                            +{item.articles.length - 1} autre(s)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fournisseur */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 block truncate max-w-[150px]">
                        {item.fournisseurNom}
                      </span>
                    </td>

                    {/* Point Relais / Domicile */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-600 truncate block" title={item.relaisNom}>
                          {item.relaisNom}
                        </span>
                      </div>
                    </td>

                    {/* Montant */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                        {fmtCFA(item.montant)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {item.dateService ? new Date(item.dateService).toLocaleDateString("fr-FR") : "—"}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.isServi ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Servi & Émargé</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Prêt au relais</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Consulter le détail des articles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handlePrintEmargement(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                          title="Imprimer le bon d'émargement et décharge officiel VITALIS"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Bon d'émargement</span>
                        </button>

                        {!item.isServi && (user?.role === "fournisseur" || user?.role === "admin") && (
                          <button
                            onClick={() => handleConfirmerRemise(item)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                            title="Confirmer la remise des articles au souscripteur"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Remettre</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Détail & Liste des Articles ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto fade-in">
            {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Détail des articles remis</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedItem.reference} · {selectedItem.souscriptionRef}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenu modal */}
            <div className="p-5 space-y-4">
              {/* Infos clés */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Souscripteur</p>
                  <p className="text-xs font-bold text-gray-800">{selectedItem.souscripteurNom}</p>
                  <p className="text-[10px] text-gray-500">{selectedItem.destinataireTelephone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Fournisseur</p>
                  <p className="text-xs font-bold text-gray-800">{selectedItem.fournisseurNom}</p>
                  <p className="text-[10px] text-gray-500">{selectedItem.banqueNom}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Lieu de retrait</p>
                  <p className="text-xs font-bold text-gray-800">{selectedItem.relaisNom}</p>
                  <p className="text-[10px] text-gray-500">{selectedItem.adresseLieu}</p>
                </div>
              </div>

              {/* Table des articles */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Composition du colis ({selectedItem.nombreArticles} article{selectedItem.nombreArticles > 1 ? "s" : ""})
                </h4>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Désignation</th>
                        <th className="py-2.5 px-3 text-center">Quantité</th>
                        <th className="py-2.5 px-3 text-right">Prix U.</th>
                        <th className="py-2.5 px-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedItem.articles.map((a: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-medium text-gray-800">{a.designation}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-teal-700">{a.quantite || 1}</td>
                          <td className="py-2.5 px-3 text-right text-gray-600">{fmtCFA(a.prixUnitaire)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">{fmtCFA(a.montantHT || (a.quantite || 1) * a.prixUnitaire)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-teal-50/60 font-bold border-t border-teal-100 text-teal-900">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right">Total TTC :</td>
                        <td className="py-2.5 px-3 text-right text-sm">{fmtCFA(selectedItem.montant)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Statut d'émargement */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Décharge d'émargement conforme</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Tous les articles listés sont délivrés au titre de la convention VITALIS approuvée par AFG Bank Atlantic.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <Link
                href={`/dashboard/souscriptions/${selectedItem.souscriptionId}`}
                className="text-xs font-semibold text-gray-600 hover:text-amber-600 transition-colors"
              >
                Ouvrir la souscription →
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handlePrintEmargement(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer le bon d'émargement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
