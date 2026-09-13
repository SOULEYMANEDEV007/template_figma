// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockSouscriptions } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { Info, Printer, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

// Explication du processus de financement
const ETAPES = [
  { num: "01", label: "Souscription créée",      color: "bg-cyan-400",    desc: "Vous initiez votre demande en choisissant vos fournisseurs" },
  { num: "02", label: "Devis envoyé",            color: "bg-blue-400",    desc: "Le fournisseur prépare un devis avec les articles" },
  { num: "03", label: "Banque valide",           color: "bg-emerald-400", desc: "La banque examine et valide votre dossier" },
  { num: "04", label: "Paiement effectué",       color: "bg-green-400",   desc: "La banque procède au paiement du fournisseur" },
  { num: "05", label: "Articles livrés ✓",      color: "bg-teal-400",    desc: "Vous récupérez vos articles en magasin" },
];

export default function DashboardSouscripteur() {
  const { user } = useLDFAuthStore();

  const mesSouscriptions = useMemo(() => {
    if (!user || user.role !== "souscripteur") return [];
    return mockSouscriptions.filter(s => s.souscripteurEmail === user.email);
  }, [user]);

  const stats = useMemo(() => ({
    total:     mesSouscriptions.length,
    enAttente: mesSouscriptions.filter(s => s.statut === "soumise" || s.statut === "en_attente").length,
    validees:  mesSouscriptions.filter(s => s.statut === "validee" || s.statut === "payee").length,
    servies:   mesSouscriptions.filter(s => s.statut === "servie").length,
  }), [mesSouscriptions]);

  return (
    <div className="space-y-5 fade-in">
      {/* Note importante + PDF conditions */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-900 mb-1">📢 Note importante — Conditions d'éligibilité</h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              Bienvenue sur votre espace Viflo. Avant d'initier une demande de financement pour vos achats, assurez-vous de prendre connaissance de toutes les conditions requises par <strong>AFG Bank</strong>.
            </p>
            <p className="text-xs text-orange-700 mt-2">
              📄 <strong>Consulter ou Imprimer :</strong> Cliquez sur le bouton ci-contre pour lire le document récapitulatif des conditions de souscription au Programme Vitalis.
            </p>
          </div>
          <button
            onClick={() => {
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`
                <html><head><title>Conditions Vitalis — AFG Bank</title>
                <style>
                  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1f2937; line-height: 1.6; }
                  .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px; }
                  .header-logos img { height: 40px; object-fit: contain; mix-blend-mode: multiply; }
                  h1 { color: #ff6b35; padding-bottom: 10px; font-size: 24px; }
                  h2 { color: #ea580c; margin-top: 24px; font-size: 15px; }
                  .badge { display: inline-block; background: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                  th { background: #ff6b35; color: white; padding: 8px 12px; text-align: left; }
                  td { padding: 7px 12px; border-bottom: 1px solid #f3f4f6; }
                  tr:nth-child(even) td { background: #fff7ed; }
                  .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
                  @media print { body { margin: 20px; } }
                </style>
                </head><body>
                
                <div class="header-logos">
                  <img src="${window.location.origin}/logos/logo-fades.PNG" alt="FADES" />
                  <img src="${window.location.origin}/logos/new_logo-viflo.JPG" alt="VIFLO" style="height: 50px;" />
                  <img src="${window.location.origin}/logos/LOGO-AFG-Bank.jpg" alt="AFG Bank" />
                </div>

                <h1>📋 Conditions de Souscription — Programme VITALIS</h1>
                <p><span class="badge">AFG Bank · Banque Financeuse Unique</span> &nbsp; <span class="badge">Durée : 36 mois</span></p>
                <p>Ce document résume les conditions à remplir pour bénéficier du programme Vitalis financé par <strong>AFG Bank</strong>.</p>

                <h2>1. Conditions pour les Personnes Physiques</h2>
                <table>
                  <tr><th>Critère</th><th>Détail</th></tr>
                  <tr><td>Situation professionnelle</td><td>Salarié ou Fonctionnaire (en activité)</td></tr>
                  <tr><td>Pièce d'identité</td><td>CNI valide (Carte Nationale d'Identité ivoirienne)</td></tr>
                  <tr><td>Situation matrimoniale</td><td>Attestation de mariage requise si marié(e)</td></tr>
                  <tr><td>Compte bancaire</td><td>Compte ouvert à AFG Bank ou domiciliation de salaire</td></tr>
                  <tr><td>Localisation</td><td>Résider en Côte d'Ivoire (Abidjan ou intérieur)</td></tr>
                </table>

                <h2>2. Conditions pour les Personnes Morales</h2>
                <table>
                  <tr><th>Critère</th><th>Détail</th></tr>
                  <tr><td>Forme juridique</td><td>SARL, SA, SAS, EURL, GIE, Association légalement constituée</td></tr>
                  <tr><td>RCCM</td><td>Registre du Commerce et du Crédit Mobilier valide</td></tr>
                  <tr><td>Compte Contribuable</td><td>Numéro de compte contribuable actif</td></tr>
                  <tr><td>Siège social</td><td>Domicilié en Côte d'Ivoire</td></tr>
                  <tr><td>Dirigeant</td><td>Identité du Directeur Général requise</td></tr>
                </table>

                <h2>3. Modalités de livraison</h2>
                <table>
                  <tr><th>Zone</th><th>Délai</th></tr>
                  <tr><td>Grand Abidjan</td><td>7 jours ouvrés</td></tr>
                  <tr><td>Hors Abidjan (Intérieur)</td><td>15 jours ouvrés</td></tr>
                </table>

                <h2>4. Fournisseurs partenaires (Agrés)</h2>
                <table>
                  <tr><th>Fournisseur</th><th>Domaine</th></tr>
                  <tr><td>Librairie de France Groupe</td><td>Fournitures scolaires & bureautiques</td></tr>
                  <tr><td>Drocolor</td><td>Matériel informatique & électronique</td></tr>
                  <tr><td>SMART TECHNOLOGIE</td><td>Informatique & solutions digitales</td></tr>
                  <tr><td>NASKO</td><td>Meubles & équipements de bureau</td></tr>
                  <tr><td>CARREFOUR</td><td>Grande distribution multi-produits</td></tr>
                </table>

                <div class="footer">
                  <p>Document établi dans le cadre du Programme Vitalis — AFG Bank · Tous droits réservés · ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                </body></html>
              `);
              w.document.close();
              w.focus();
              setTimeout(() => w.print(), 400);
            }}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md cursor-pointer"
            title="Consulter et Imprimer les conditions"
          >
            <Printer className="w-5 h-5" />
            <span className="text-[10px] font-bold whitespace-nowrap">Conditions PDF</span>
          </button>
        </div>
      </div>

      {/* Bouton action rapide : Nouvelle Demande (Désactivé temporairement) */}
      {/* 
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white flex flex-col md:flex-row items-center justify-between shadow-lg gap-4">
        <div>
          <p className="font-semibold text-base">Initier une demande de financement</p>
          <p className="text-orange-100 text-xs mt-1">Sélectionnez vos fournisseurs et soumettez votre dossier directement à AFG Bank.</p>
        </div>
        <Link
          href="/dashboard/souscripteur/demande"
          className="flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 shadow"
        >
          <Package className="w-4 h-4" /> Nouvelle Demande
        </Link>
      </div>
      */}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",      value: stats.total,     border: "border-l-amber-400",   text: "text-amber-700" },
          { label: "En attente", value: stats.enAttente, border: "border-l-orange-400",  text: "text-orange-700" },
          { label: "Validées",   value: stats.validees,  border: "border-l-emerald-400", text: "text-emerald-700" },
          { label: "Servies",    value: stats.servies,   border: "border-l-teal-400",    text: "text-teal-700" },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${k.border}`}>
            <p className={`text-2xl font-bold ${k.text}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Processus */}
      <div className="section-card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">ℹ️ Comment fonctionne le financement ?</h2>
        <div className="flex flex-wrap gap-3">
          {ETAPES.map((e, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className={`w-6 h-6 rounded-full ${e.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{e.num}</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">{e.label}</p>
                <p className="text-[10px] text-gray-400">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mes souscriptions */}
      {mesSouscriptions.length === 0 ? (
        <div className="section-card p-16 text-center text-gray-400">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium">Aucune souscription en cours</p>
          <p className="text-xs mt-1">Vous serez notifié dès qu&apos;une souscription sera créée pour vous.</p>
        </div>
      ) : (
        <div className="section-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Mes souscriptions</h2>
          </div>
          <div className="space-y-2">
            {mesSouscriptions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/souscriptions/${s.id}`}>
                    <p className="text-xs font-semibold text-amber-700 font-mono hover:underline">{s.reference}</p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{s.fournisseurNom} — {s.duree} mois</p>
                  <p className="text-xs text-gray-400">{s.montantTotal > 0 ? fmtCFA(s.montantTotal) : "Montant à définir"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge statut={s.statut} size="sm" />
                  <Link href={`/dashboard/souscriptions/${s.id}`} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-cyan-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
