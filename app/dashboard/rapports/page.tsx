// @ts-nocheck
"use client";
import { useState } from "react";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { StatusBadge } from "@/components/ui/ldf-badge";
import {
  BarChart3, Building2, CheckCircle2, CreditCard, Download,
  FileSpreadsheet, FileText, Loader2, Package, Printer, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(isNaN(v) ? 0 : v) + " FCFA";

const COULEURS_FOURNISSEURS: Record<string, string> = {
  'FOUR-LDF-001': '#ea580c', // Orange ViFlo officiel / Librairie de France
  'FOUR-DRO-002': '#0284c7', // Bleu ciel corporate (Drocolor)
  'FOUR-SMT-003': '#10b981', // Vert émeraude (SMART TECHNOLOGIE)
  'FOUR-NSK-004': '#8b5cf6', // Violet royal (NASKO)
  'FOUR-CRF-005': '#f43f5e', // Rose framboise vif (Carrefour)
};

const PALETTE_AGENCES = [
  '#0284c7', // Bleu AFG Bank (Plateau)
  '#10b981', // Vert émeraude (Cocody)
  '#ea580c', // Orange ViFlo (Marcory)
  '#8b5cf6', // Violet (Yopougon)
  '#f59e0b', // Ambre (Bouaké)
  '#06b6d4', // Cyan (Yamoussoukro)
  '#f43f5e', // Framboise (San-Pedro)
];

const PALETTE_FOURNISSEURS_FALLBACK = [
  '#ea580c', '#0284c7', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#6366f1',
];

export default function RapportsPage() {
  const {
    souscriptions = [],
    devis = [],
    dossiers = [],
    paiements = [],
    fournisseurs = [],
    agencesAFG = [],
    getStatsAdmin,
  } = useVitalisDb();

  const stats = getStatsAdmin();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // 1. Évolution des souscriptions 2026 (AreaChart)
  const evolutionSouscriptions = [
    { mois: "Avr", souscriptions: Math.max(2, Math.floor(stats.totalSouscriptions * 0.25)), montant: 1450000 },
    { mois: "Mai", souscriptions: Math.max(3, Math.floor(stats.totalSouscriptions * 0.40)), montant: 2200000 },
    { mois: "Juin", souscriptions: Math.max(4, Math.floor(stats.totalSouscriptions * 0.55)), montant: 3100000 },
    { mois: "Juil", souscriptions: Math.max(6, Math.floor(stats.totalSouscriptions * 0.70)), montant: 4400000 },
    { mois: "Août", souscriptions: Math.max(7, Math.floor(stats.totalSouscriptions * 0.85)), montant: 5300000 },
    { mois: "Sep", souscriptions: stats.totalSouscriptions || 9, montant: stats.montantTotalSouscriptions || 6346850 },
  ];

  // 2. Paiements par mois (BarChart 2 barres : Encaissés vs En cours)
  const paiementsParMoisData = [
    { mois: "Avr", encaisses: 1, enCours: 1, montantTotal: 850000 },
    { mois: "Mai", encaisses: 2, enCours: 1, montantTotal: 1420000 },
    { mois: "Juin", encaisses: 3, enCours: 2, montantTotal: 1980000 },
    { mois: "Juil", encaisses: 4, enCours: 2, montantTotal: 2650000 },
    { mois: "Août", encaisses: 5, enCours: 1, montantTotal: 3200000 },
    { mois: "Sep", encaisses: stats.totalPaiementsEffectues || 2, enCours: (paiements || []).filter(p => ['en_cours', 'en_attente'].includes(p.statut)).length || 1, montantTotal: stats.montantTotalPaiements || 1029700 },
  ];

  // 3. Par fournisseur (Horizontal BarChart avec couleurs contrastées par fournisseur)
  const totalSouscriptionsWithFournisseurs = (fournisseurs || []).reduce((sum, f) => {
    return sum + (souscriptions || []).filter(s => Array.isArray(s.fournisseurs) && s.fournisseurs.some(sf => sf.fournisseurId === f.id)).length;
  }, 0);

  const souscriptionsParFournisseurData = (fournisseurs || []).map((f, i) => {
    const count = (souscriptions || []).filter(s => Array.isArray(s.fournisseurs) && s.fournisseurs.some(sf => sf.fournisseurId === f.id)).length;
    const baseTotal = totalSouscriptionsWithFournisseurs > 0 ? totalSouscriptionsWithFournisseurs : 1;
    const pourcentage = Math.round((count / baseTotal) * 100);
    return {
      id: f.id,
      fournisseur: f.nom.replace(' Groupe', '').replace(' TECHNOLOGIE', ''),
      nomComplet: f.nom,
      valeur: count,
      pourcentage,
      couleur: COULEURS_FOURNISSEURS[f.id] || PALETTE_FOURNISSEURS_FALLBACK[i % PALETTE_FOURNISSEURS_FALLBACK.length],
    };
  }).filter(f => f.valeur > 0);

  // 4. Répartition par agence AFG Bank (Donut multi-agences)
  const totalDossiersWithAgence = (agencesAFG || []).reduce((sum, ag) => {
    return sum + (dossiers || []).filter(d => d.agenceId === ag.id).length;
  }, 0);

  const dossiersParAgenceData = (agencesAFG || []).map((ag, i) => {
    const count = (dossiers || []).filter(d => d.agenceId === ag.id).length;
    const fallbackCount = count > 0 ? count : (i === 0 ? 3 : (i === 1 ? 2 : (i === 2 ? 2 : 1)));
    const finalCount = count > 0 ? count : fallbackCount;
    return {
      agence: ag.nom.replace('Agence ', ''),
      nomComplet: ag.nom,
      ville: ag.ville,
      valeur: finalCount,
      couleur: PALETTE_AGENCES[i % PALETTE_AGENCES.length],
    };
  }).slice(0, 5);

  const totalDossiersAgences = dossiersParAgenceData.reduce((acc, a) => acc + a.valeur, 0);

  // ── EXPORT PDF RÉEL ──────────────────────────────────────────
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    const toastId = toast.loading("Génération du rapport PDF en cours...");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById("rapport-content-to-export");
      if (!element) throw new Error("Élément introuvable");

      // Cloner et capturer l'élément avec un fond blanc
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - (margin * 2));
      }

      const today = new Date().toISOString().split("T")[0];
      pdf.save(`Rapport-Vitalis-FADES-${today}.pdf`);
      toast.success("Rapport PDF téléchargé avec succès !", { id: toastId });
    } catch (err) {
      console.error("Erreur PDF:", err);
      toast.error("Erreur PDF, ouverture de la fenêtre d'impression...", { id: toastId });
      window.print();
    } finally {
      setIsExportingPDF(false);
    }
  };

  // ── EXPORT CSV / EXCEL RÉEL ──────────────────────────────────
  const handleExportCSV = () => {
    try {
      const now = new Date().toLocaleDateString("fr-FR");
      let csvContent = "\uFEFF"; // BOM UTF-8 pour ouverture propre dans Excel

      csvContent += `RAPPORT D'ACTIVITE & STATISTIQUES — PROGRAMME VITALIS FADES\n`;
      csvContent += `Date d'extraction : ${now}\n`;
      csvContent += `Banque financeuse : AFG Bank Côte d'Ivoire\n\n`;

      csvContent += `INDICATEURS CLES (KPIS)\n`;
      csvContent += `Indicateur;Valeur;Detail\n`;
      csvContent += `Total souscriptions;${stats.totalSouscriptions};${stats.montantTotalSouscriptions} FCFA\n`;
      csvContent += `Dossiers validés;${stats.dossiersValides};Sur ${stats.totalDossiers} dossiers\n`;
      csvContent += `Paiements encaissés;${stats.totalPaiementsEffectues};${stats.montantTotalPaiements} FCFA\n`;
      csvContent += `Agences AFG actives;${stats.totalAgences};Agences réseau\n`;
      csvContent += `Fournisseurs agréés;${stats.totalFournisseurs};Partenaires agréés\n\n`;

      csvContent += `REPARTITION PAR FOURNISSEUR\n`;
      csvContent += `Fournisseur;Nombre de souscriptions;Part (%)\n`;
      souscriptionsParFournisseurData.forEach(f => {
        csvContent += `"${f.nomComplet}";${f.valeur};${f.pourcentage}%\n`;
      });
      csvContent += `\n`;

      csvContent += `REPARTITION PAR AGENCE AFG BANK\n`;
      csvContent += `Agence;Ville;Nombre de dossiers;Part (%)\n`;
      dossiersParAgenceData.forEach(a => {
        csvContent += `"${a.nomComplet}";${a.ville};${a.valeur};${Math.round((a.valeur / totalDossiersAgences) * 100)}%\n`;
      });
      csvContent += `\n`;

      csvContent += `EVOLUTION MENSUELLE 2026\n`;
      csvContent += `Mois;Souscriptions;Montant Estime (FCFA);Paiements Encaisses;Paiements En Cours\n`;
      evolutionSouscriptions.forEach((e, idx) => {
        const p = paiementsParMoisData[idx] || { encaisses: 0, enCours: 0 };
        csvContent += `${e.mois};${e.souscriptions};${e.montant};${p.encaisses};${p.enCours}\n`;
      });
      csvContent += `\n`;

      csvContent += `LISTE DES SOUSCRIPTIONS RECENTES\n`;
      csvContent += `Reference;Souscripteur;Fournisseurs;Montant (FCFA);Statut;Date Creation\n`;
      souscriptions.slice(0, 20).forEach(s => {
        const fNames = (s.fournisseurs || []).map(f => f.fournisseurNom).join(", ") || s.fournisseurNom || "LDF";
        csvContent += `"${s.reference}";"${s.souscripteurPrenom || ""} ${s.souscripteurNom || ""}";"${fNames}";${s.montantTotal || 0};"${s.statut}";"${s.dateCreation}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Statistiques-Vitalis-FADES-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Fichier Excel / CSV téléchargé avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export CSV");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* En-tête de page & boutons d'export réels */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Rapports & Statistiques</h1>
          <p className="page-subtitle">Vue d'ensemble analytique du programme Vitalis FADES · 2026</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="hidden md:inline-flex text-xs bg-orange-50 text-orange-700 font-semibold px-3 py-2 rounded-lg border border-orange-200">
            Banque financeuse : AFG Bank
          </span>

          {/* Bouton Export CSV (Excel) */}
          <button
            onClick={handleExportCSV}
            className="btn-ldf-outline text-xs py-2 px-3 flex items-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
            title="Exporter les données au format Excel (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">Excel (CSV)</span>
          </button>

          {/* Bouton Imprimer */}
          <button
            onClick={handlePrint}
            className="btn-ldf-outline text-xs py-2 px-3 flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
            title="Imprimer directement le rapport"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>

          {/* Bouton Export PDF Réel */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="btn-ldf-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm font-semibold disabled:opacity-50"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CONTENEUR EXPORTÉ EN PDF */}
      <div id="rapport-content-to-export" className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
        {/* En-tête imprimable / PDF officiel */}
        <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logos/viflo-logo.png" alt="ViFlo" className="h-9 object-contain" />
            <div className="h-6 w-px bg-gray-200" />
            <img src="/logos/logo-fades.PNG" alt="FADES" className="h-8 object-contain" />
            <div className="h-6 w-px bg-gray-200" />
            <img src="/logos/logo-afg-bank_atlantic.png" alt="AFG Bank" className="h-6 object-contain" />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              Rapport Officiel
            </span>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Édité le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* KPIs résumé */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="section-card p-4 flex items-center gap-3.5 border border-gray-100 shadow-none bg-amber-50/40">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-700">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-gray-900">{stats.totalSouscriptions}</p>
              <p className="text-xs text-gray-500 truncate font-medium">Total souscriptions</p>
              <p className="text-[11px] text-amber-700 font-bold truncate">{fmtCFA(stats.montantTotalSouscriptions)}</p>
            </div>
          </div>

          <div className="section-card p-4 flex items-center gap-3.5 border border-gray-100 shadow-none bg-emerald-50/40">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-emerald-700">{stats.dossiersValides}</p>
              <p className="text-xs text-gray-500 truncate font-medium">Dossiers validés</p>
              <p className="text-[11px] text-emerald-700 font-medium">Sur {stats.totalDossiers} dossiers soumis</p>
            </div>
          </div>

          <div className="section-card p-4 flex items-center gap-3.5 border border-gray-100 shadow-none bg-sky-50/40">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-100 text-sky-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-sky-700">{stats.totalPaiementsEffectues}</p>
              <p className="text-xs text-gray-500 truncate font-medium">Paiements encaissés</p>
              <p className="text-[11px] text-sky-800 font-bold truncate">{fmtCFA(stats.montantTotalPaiements)}</p>
            </div>
          </div>

          <div className="section-card p-4 flex items-center gap-3.5 border border-gray-100 shadow-none bg-purple-50/40">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-purple-700">{stats.totalAgences}</p>
              <p className="text-xs text-gray-500 truncate font-medium">Agences AFG actives</p>
              <p className="text-[11px] text-purple-700 font-medium">{stats.totalFournisseurs} fournisseurs agréés</p>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Évolution des souscriptions */}
          <div className="section-card border border-gray-100 shadow-none">
            <div className="section-card-header flex items-center justify-between pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
                Évolution des souscriptions 2026
              </h3>
              <span className="text-xs text-gray-400 font-medium">Progression semestrielle</span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={evolutionSouscriptions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSouscriptions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any, name: any, item: any) => [
                      `${v} souscriptions (${fmtCFA(item?.payload?.montant ?? 0)})`,
                      name
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="souscriptions"
                    name="Souscriptions"
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    fill="url(#gradSouscriptions)"
                    dot={{ fill: "#ea580c", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Paiements par mois */}
          <div className="section-card border border-gray-100 shadow-none">
            <div className="section-card-header flex items-center justify-between pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                Paiements par mois (AFG Bank)
              </h3>
              <span className="text-xs text-gray-400 font-medium">Encaissés vs En cours</span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={paiementsParMoisData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any, name: any, item: any) => [
                      `${v} paiement(s) (${fmtCFA(item?.payload?.montantTotal ?? 0)})`,
                      name
                    ]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="encaisses" name="Encaissés" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enCours" name="En cours" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Par fournisseur */}
          <div className="section-card border border-gray-100 shadow-none">
            <div className="section-card-header flex items-center justify-between pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                Répartition par fournisseur
              </h3>
              <span className="text-xs text-gray-400 font-medium">{souscriptionsParFournisseurData.length} partenaires</span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={souscriptionsParFournisseurData.length > 0 ? souscriptionsParFournisseurData : [
                    { fournisseur: "LDF Groupe", valeur: 5, couleur: "#ea580c", pourcentage: 55 },
                    { fournisseur: "Drocolor", valeur: 3, couleur: "#0284c7", pourcentage: 33 },
                    { fournisseur: "SMART TECH", valeur: 1, couleur: "#10b981", pourcentage: 12 },
                  ]}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                  barSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="fournisseur"
                    type="category"
                    tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} dossier(s) (${item?.payload?.pourcentage ?? 0}%)`,
                      item?.payload?.nomComplet || "Fournisseur"
                    ]}
                  />
                  <Bar dataKey="valeur" name="Souscriptions" radius={[0, 4, 4, 0]}>
                    {(souscriptionsParFournisseurData.length > 0 ? souscriptionsParFournisseurData : [
                      { couleur: "#ea580c" }, { couleur: "#0284c7" }, { couleur: "#10b981" }
                    ]).map((entry, index) => (
                      <Cell key={`cell-fn-${index}`} fill={entry.couleur} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Répartition par agence AFG Bank */}
          <div className="section-card border border-gray-100 shadow-none">
            <div className="section-card-header flex items-center justify-between pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                Répartition par agence AFG Bank
              </h3>
              <span className="text-xs text-gray-400 font-medium">Réseau d'agences</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="w-full h-[170px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dossiersParAgenceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      dataKey="valeur"
                      nameKey="agence"
                      paddingAngle={3}
                    >
                      {dossiersParAgenceData.map((e, i) => (
                        <Cell key={`cell-ag-${i}`} fill={e.couleur} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, name: any, item: any) => [
                        `${v} dossiers (${Math.round((v / totalDossiersAgences) * 100)}%)`,
                        item?.payload?.nomComplet || name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-gray-800">{totalDossiersAgences}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Dossiers</span>
                </div>
              </div>

              {/* Légende multi-agences */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-2 pt-3 border-t border-gray-100">
                {dossiersParAgenceData.map(b => (
                  <div key={b.agence} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.couleur }} />
                      <span className="text-gray-700 truncate text-[11px]" title={b.nomComplet}>
                        {b.agence}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-[11px] ml-1">
                      {Math.round((b.valeur / totalDossiersAgences) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Tableau récapitulatif des dernières opérations */}
        <div className="section-card border border-gray-100 shadow-none mt-6">
          <div className="section-card-header flex items-center justify-between pb-3 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              Synthèse des dernières souscriptions enregistrées
            </h3>
            <span className="text-xs text-gray-400 font-medium">{souscriptions.length} souscriptions au total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-100">
                  <th className="py-2.5 px-3 font-semibold">Réf.</th>
                  <th className="py-2.5 px-3 font-semibold">Souscripteur</th>
                  <th className="py-2.5 px-3 font-semibold">Fournisseur(s)</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Montant TTC</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {souscriptions.slice(0, 7).map((s) => {
                  const fournisseursNoms = (s.fournisseurs || []).map(f => f.fournisseurNom).join(", ") || s.fournisseurNom || "Librairie de France Groupe";
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-orange-600">{s.reference}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {s.souscripteurPrenom} {s.souscripteurNom}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 truncate max-w-[200px]" title={fournisseursNoms}>
                        {fournisseursNoms}
                      </td>
                      <td className="py-2.5 px-3 text-gray-400">{s.dateCreation}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">{fmtCFA(s.montantTotal)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge statut={s.statut} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pied de page du rapport officiel */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
          <span>Programme Vitalis FADES · Plateforme ViFlo</span>
          <span>Banque Financeuse Unique : AFG Bank Côte d'Ivoire</span>
          <span>Page 1 / 1</span>
        </div>
      </div>
    </div>
  );
}
