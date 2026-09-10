// @ts-nocheck
"use client";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { BookOpen, CheckCircle2, CreditCard, Download, FileText, Info, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const fmtCFA = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

export default function DashboardFournisseur() {
  const { user } = useLDFAuthStore();
  const { souscriptions, devis, dossiers, paiements, getStatsFournisseur } = useVitalisDb();

  // ID du fournisseur connecté (ou LDF par défaut pour la démo)
  const fournisseurId = user?.organisationId || "FOUR-LDF-001";
  const stats = getStatsFournisseur(fournisseurId);

  // Mes souscriptions (les souscriptions où ce fournisseur est impliqué)
  const mesSouscriptions = useMemo(() => {
    return souscriptions
      .filter(s => s.fournisseurs.some(f => f.fournisseurId === fournisseurId))
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
      .slice(0, 8);
  }, [souscriptions, fournisseurId]);

  // Mes devis
  const mesDevis = useMemo(() =>
    devis.filter(d => d.fournisseurId === fournisseurId), [devis, fournisseurId]);

  // Paiements reçus
  const mesPaiements = useMemo(() =>
    paiements.filter(p => p.repartitionFournisseurs.some(r => r.fournisseurId === fournisseurId)), [paiements, fournisseurId]);

  // Graphique statut de mes devis
  const devisParStatut = [
    { statut: "Validés",        valeur: mesDevis.filter(d => d.statut === 'valide').length, couleur: "#22c55e" },
    { statut: "En attente",     valeur: mesDevis.filter(d => d.statut === 'en_attente_validation' || d.statut === 'envoye').length, couleur: "#ff8c42" },
    { statut: "Brouillons",     valeur: mesDevis.filter(d => d.statut === 'brouillon').length, couleur: "#94a3b8" },
  ].filter(d => d.valeur > 0);

  const montantPaiementsRecus = mesPaiements
    .filter(p => p.statut === 'termine')
    .reduce((acc, p) => {
      const maPart = p.repartitionFournisseurs
        .filter(r => r.fournisseurId === fournisseurId)
        .reduce((s, r) => s + r.montant, 0);
      return acc + maPart;
    }, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Note importante + PDF conditions */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-900 mb-1">📢 Note importante — Programme Vitalis</h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              En tant que fournisseur agréé Vitalis, vous créez les souscriptions pour vos clients et soumettez les devis.
              Une fois les dossiers validés par <strong>AFG Bank</strong>, vous recevrez les bons de commande et pourrez procéder à la livraison.
            </p>
            <p className="text-xs text-orange-700 mt-2">
              📄 <strong>Document à remettre au client :</strong> imprimez et transmettez le document ci-dessous
              contenant toutes les conditions d'éligibilité à la souscription Vitalis avant toute inscription.
            </p>
          </div>
          {/* Bouton impression conditions Vitalis */}
          <button
            onClick={() => {
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`
                <html><head><title>Conditions Vitalis — AFG Bank</title>
                <style>
                  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1f2937; line-height: 1.6; }
                  h1 { color: #ff6b35; border-bottom: 3px solid #ff6b35; padding-bottom: 10px; }
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
                <h1>📋 Conditions de Souscription — Programme VITALIS</h1>
                <p><span class="badge">AFG Bank · Banque Financeuse Unique</span> &nbsp; <span class="badge">Durée : 36 mois</span></p>
                <p>Ce document résume les conditions à remplir pour bénéficier du programme Vitalis financé par <strong>AFG Bank</strong>. Il doit être remis au client avant son inscription.</p>

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

                <h2>3. Conditions de livraison</h2>
                <table>
                  <tr><th>Zone</th><th>Délai</th></tr>
                  <tr><td>Grand Abidjan</td><td>7 jours ouvrés</td></tr>
                  <tr><td>Hors Abidjan (Intérieur)</td><td>15 jours ouvrés</td></tr>
                  <tr><td>Validité du devis</td><td>30 jours ouvrés</td></tr>
                </table>

                <h2>4. Fournisseurs agréés Vitalis</h2>
                <table>
                  <tr><th>Fournisseur</th><th>Domaine</th></tr>
                  <tr><td>Librairie de France Groupe</td><td>Fournitures scolaires & bureautiques</td></tr>
                  <tr><td>Drocolor</td><td>Matériel informatique & électronique</td></tr>
                  <tr><td>SMART TECHNOLOGIE</td><td>Informatique & solutions digitales</td></tr>
                  <tr><td>NASKO</td><td>Meubles & équipements de bureau</td></tr>
                  <tr><td>CARREFOUR</td><td>Grande distribution multi-produits</td></tr>
                </table>

                <h2>5. Modalités de paiement</h2>
                <p>Le paiement est effectué directement par <strong>AFG Bank</strong> aux fournisseurs, simultanément au déboursement du prêt au client. Le remboursement se fait sur <strong>36 mois</strong> par prélèvement automatique.</p>

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
            title="Imprimer les conditions Vitalis à remettre au client"
          >
            <Printer className="w-5 h-5" />
            <span className="text-[10px] font-bold whitespace-nowrap">Conditions PDF</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Mes souscriptions"  value={stats.mesSouscriptions}   icon={FileText}     variant="yellow" subtitle={fmtCFA(stats.montantTotal)} />
        <KPICard title="Mes devis"          value={stats.mesDevis}           icon={BookOpen}     variant="blue"   subtitle={`${mesDevis.filter(d => d.statut === 'valide').length} validés`} />
        <KPICard title="Dossiers validés"   value={stats.mesDossiersValides} icon={CheckCircle2} variant="green"  subtitle="Financements AFG accordés" />
        <KPICard title="Paiements reçus"    value={mesPaiements.filter(p => p.statut === 'termine').length} icon={CreditCard} variant="gray" subtitle={fmtCFA(montantPaiementsRecus)} />
      </div>

      {/* Bouton action rapide */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white flex items-center justify-between shadow-lg">
        <div>
          <p className="font-semibold text-base">Créer une nouvelle souscription</p>
          <p className="text-orange-100 text-xs mt-0.5">Remplissez les informations client et soumettez le dossier à AFG Bank</p>
        </div>
        <Link
          href="/dashboard/souscriptions/creer"
          className="flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 shadow"
        >
          <Plus className="w-4 h-4" /> Nouvelle souscription
        </Link>
      </div>

      {/* Graphique + Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Mes devis par statut</h2>
          {devisParStatut.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={devisParStatut} dataKey="valeur" nameKey="statut" cx="50%" cy="50%" outerRadius={70}>
                  {devisParStatut.map((entry, i) => <Cell key={i} fill={entry.couleur} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <BookOpen className="w-8 h-8 mb-2" />
              <p className="text-xs">Aucun devis encore</p>
            </div>
          )}
          {/* AFG Bank label */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
            <span className="text-xs text-gray-600">Banque : <strong className="text-orange-600">AFG Bank</strong></span>
          </div>
        </div>

        <div className="section-card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Mes dernières souscriptions</h2>
            <Link href="/dashboard/souscriptions" className="text-xs text-orange-600 hover:underline">Voir tout →</Link>
          </div>
          {mesSouscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Aucune souscription pour le moment</p>
              <Link href="/dashboard/souscriptions/creer" className="text-xs text-orange-500 hover:underline mt-1 inline-block">Créer la première →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mesSouscriptions.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <Link href={`/dashboard/souscriptions/${s.id}`}>
                      <p className="text-xs font-bold text-[#ff6b35] font-mono hover:underline">{s.reference}</p>
                    </Link>
                    <p className="text-xs text-gray-500 truncate">
                      {s.souscripteurPrenom} {s.souscripteurNom}
                      {s.typeSouscripteur === 'morale' && s.souscripteurEntreprise && ` (${s.souscripteurEntreprise})`}
                      {' — '}{s.banqueNom}
                    </p>
                    <p className="text-xs text-gray-400">{fmtCFA(s.montantTotal)} · {new Date(s.dateCreation).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <StatusBadge statut={s.statut} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
