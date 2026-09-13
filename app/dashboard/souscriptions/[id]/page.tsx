// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { LDFTimeline, ProcessTimeline } from "@/components/ui/ldf-timeline";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import {
  ArrowLeft, Building2, CheckCircle2, CreditCard, Download,
  FileText, MapPin, Package, Phone, Plus, User, Printer,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function SouscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const { getSouscriptionById, getDevisBySouscription, getDossierBySouscription, getHistoriqueBySouscription } = useVitalisDb();
  
  const [showConfirm, setShowConfirm] = useState(false);

  const sub = getSouscriptionById(id);
  const devis = sub ? getDevisBySouscription(sub.id)[0] : null;
  const dossier = sub ? getDossierBySouscription(sub.id) : null;
  const historique = sub ? getHistoriqueBySouscription(sub.id) : [];

  if (!sub) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <FileText className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Souscription introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  // Statuts "positifs" successifs du workflow VITALIS
  const statutsAvancés = ["accepte", "finance", "fournisseur_paye", "commande_en_preparation", "livre", "cloture"];
  const isApres = (statut: string, ref: string) => {
    const ordre = ["en_preparation","pret_pour_depot","depose_banque","en_analyse_bancaire","accepte","finance","fournisseur_paye","commande_en_preparation","livre","cloture"];
    return ordre.indexOf(statut) >= ordre.indexOf(ref);
  };

  const processSteps = [
    { id: "sub",      label: "Souscription créée",       statut: "complete" as const,    date: sub.dateCreation },
    { id: "devis",    label: "Devis fournisseur(s)",      statut: devis ? "complete" as const : "pending" as const },
    { id: "depot",    label: "Dépôt AFG Bank",            statut: isApres(sub.statut, "depose_banque") ? "complete" as const : sub.statut === "pret_pour_depot" ? "current" as const : "pending" as const },
    { id: "banque",   label: "Analyse bancaire",          statut: isApres(sub.statut, "accepte") ? "complete" as const : sub.statut === "refuse" ? "rejected" as const : sub.statut === "en_analyse_bancaire" ? "current" as const : "pending" as const },
    { id: "paiement", label: "Financement & Paiement",    statut: isApres(sub.statut, "fournisseur_paye") ? "complete" as const : sub.statut === "finance" ? "current" as const : "pending" as const },
    { id: "livraison","label": "Commande & Livraison",    statut: sub.statut === "cloture" || sub.statut === "livre" ? "complete" as const : sub.statut === "commande_en_preparation" ? "current" as const : "pending" as const },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{sub.reference}</h1>
              <StatusBadge statut={sub.statut} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Créée le {new Date(sub.dateCreation).toLocaleDateString("fr-FR")} · Dernière MAJ le {new Date(sub.dateMiseAJour).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!devis && (user?.role === "fournisseur" || user?.role === "admin") && (
            <Link href={`/dashboard/devis/nouveau?souscriptionId=${sub.id}`} className="btn-ldf-secondary text-sm py-2 px-4">
              <Plus className="w-3.5 h-3.5" /> Créer un devis
            </Link>
          )}
          {devis && (
            <Link href={`/dashboard/devis/${sub.devisId}`} className="btn-ldf-outline text-sm py-2 px-4">
              <FileText className="w-3.5 h-3.5" /> Voir le devis
            </Link>
          )}
          {dossier && (
            <Link href={`/dashboard/dossiers/${sub.dossierId}`} className="btn-ldf-outline text-sm py-2 px-4">
              <CheckCircle2 className="w-3.5 h-3.5" /> Voir le dossier
            </Link>
          )}
          <button 
            onClick={() => {
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`
                <html><head><title>Fiche de Souscription Vitalis - ${sub.reference}</title>
                <style>
                  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1f2937; line-height: 1.6; }
                  h1 { color: #ea580c; border-bottom: 3px solid #ea580c; padding-bottom: 10px; text-align: center; }
                  h2 { color: #ea580c; margin-top: 24px; font-size: 16px; border-bottom: 1px solid #fed7aa; padding-bottom: 4px;}
                  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
                  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #f3f4f6; }
                  th { background: #fff7ed; color: #c2410c; width: 40%; }
                  .signature-box { margin-top: 50px; border: 2px dashed #d1d5db; padding: 20px; height: 120px; text-align: center; }
                  .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center; }
                  @media print { body { margin: 20px; } }
                </style>
                </head><body>
                <h1>Fiche de Souscription VITALIS</h1>
                
                <h2>1. Informations Générales</h2>
                <table>
                  <tr><th>Référence Dossier</th><td><strong>${sub.reference}</strong></td></tr>
                  <tr><th>Date de Souscription</th><td>${new Date(sub.dateCreation).toLocaleDateString('fr-FR')}</td></tr>
                  <tr><th>Banque Financeuse</th><td><strong>${sub.banqueNom}</strong></td></tr>
                </table>

                <h2>2. Identité du Souscripteur</h2>
                <table>
                  <tr><th>Nom / Prénom</th><td>${sub.souscripteurNom} ${sub.souscripteurPrenom || ''}</td></tr>
                  <tr><th>Type de Souscripteur</th><td>${sub.typeSouscripteur === 'physique' ? 'Personne Physique' : 'Personne Morale'}</td></tr>
                  ${sub.souscripteurEntreprise ? `<tr><th>Entreprise</th><td>${sub.souscripteurEntreprise}</td></tr>` : ''}
                  <tr><th>Téléphone</th><td>${sub.souscripteurTelephone || 'Non renseigné'}</td></tr>
                  <tr><th>Email</th><td>${sub.souscripteurEmail || 'Non renseigné'}</td></tr>
                </table>

                <h2>3. Fournisseurs Agréés</h2>
                <ul>
                  ${sub.fournisseurs.map(f => `<li><strong>${f.fournisseurNom}</strong></li>`).join('')}
                </ul>

                <h2>4. Engagement du Souscripteur</h2>
                <p style="font-size: 13px; text-align: justify;">
                  Je soussigné(e), <strong>${sub.souscripteurNom} ${sub.souscripteurPrenom || ''}</strong>, reconnais avoir pris connaissance des conditions générales du programme de financement VITALIS géré en partenariat avec AFG Bank. Je certifie l'exactitude des informations fournies et m'engage à fournir toutes les pièces justificatives complémentaires qui pourraient m'être demandées pour l'étude de ce dossier.
                </p>

                <div class="signature-box">
                  <p style="font-weight: bold; color: #4b5563; margin-top: 0;">Signature du Client</p>
                  <p style="font-size: 12px; color: #9ca3af;">(Précédée de la mention "Lu et approuvé")</p>
                </div>

                <div class="footer">
                  <p>Programme Vitalis — AFG Bank · Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                </div>
                </body></html>
              `);
              w.document.close();
              w.focus();
              setTimeout(() => w.print(), 500);
            }} 
            className="btn-ldf-outline text-sm py-2 px-4"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer pour émargement
          </button>
        </div>
      </div>

      {/* ── Timeline processus ── */}
      <div className="section-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Progression du dossier</h3>
        <ProcessTimeline steps={processSteps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Souscripteur */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Informations souscripteur</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              {[
                { label: "Nom complet",  value: `${sub.souscripteurPrenom} ${sub.souscripteurNom}` },
                { label: "Téléphone",    value: sub.souscripteurTelephone, icon: Phone },
                { label: "Email",        value: sub.souscripteurEmail },
                { label: "Banque",       value: sub.banqueNom },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fournisseur */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Fournisseur</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">Nom</p><p className="text-sm font-medium text-gray-800">{sub.fournisseurNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Banque partenaire</p><p className="text-sm font-medium text-gray-800">{sub.banqueNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Durée souscription</p><p className="text-sm font-medium text-gray-800">{sub.duree} mois</p></div>
              {sub.observations && (
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Observations</p><p className="text-sm text-gray-600">{sub.observations}</p></div>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Articles ({devis?.articles?.length || 0})</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="ldf-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Référence</th>
                    <th>Qté</th>
                    <th>Prix unitaire</th>
                    <th>Remise</th>
                    <th>Montant HT</th>
                  </tr>
                </thead>
                <tbody>
                  {(devis?.articles || []).map(a => (
                    <tr key={a.id}>
                      <td className="font-medium text-gray-800">{a.designation}</td>
                      <td className="font-mono text-xs text-gray-500">{a.reference}</td>
                      <td>{a.quantite}</td>
                      <td>{fmtCFA(a.prixUnitaire)}</td>
                      <td>{a.remise && a.remise > 0 ? `${a.remise}%` : "—"}</td>
                      <td className="font-semibold text-gray-800">{fmtCFA(a.montantHT)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50/50">
                    <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-700">{fmtCFA(sub.montantTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Décision banque */}
          {dossier && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Décision bancaire</h3>
                </div>
                <StatusBadge statut={dossier.statut} />
              </div>
              <div className="section-card-body space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{dossier.banqueNom}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Date réception</p><p className="text-sm font-medium text-gray-800">{new Date(dossier.dateReception).toLocaleDateString("fr-FR")}</p></div>
                </div>
                {dossier.commentaireBanque && (
                  <div className={`p-3 rounded-lg text-sm ${dossier.statut === "valide" ? "bg-emerald-50 text-emerald-800" : dossier.statut === "rejete" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
                    {dossier.commentaireBanque}
                  </div>
                )}
                {dossier.motifRejet && (
                  <div className="p-3 rounded-lg bg-red-50 text-sm text-red-800">
                    <strong>Motif du rejet :</strong> {dossier.motifRejet}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paiement */}
          {sub.paiementId && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Paiement</h3>
                </div>
                <Link href={`/dashboard/paiements/${sub.paiementId}`} className="text-xs text-amber-600 hover:text-amber-700">
                  Voir le détail →
                </Link>
              </div>
              <div className="section-card-body">
                <p className="text-sm text-gray-600">Référence : <span className="font-mono font-semibold text-amber-700">{sub.paiementId}</span></p>
                <p className="text-xl font-bold text-gray-900 mt-1">{fmtCFA(sub.montantTotal)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite — Timeline ── */}
        <div className="space-y-5">
          {/* Récapitulatif */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Récapitulatif</h3>
            </div>
            <div className="section-card-body space-y-3">
              {[
                { label: "Montant total",  value: fmtCFA(sub.montantTotal), highlight: true },
                { label: "Durée",          value: `${sub.duree} mois` },
                { label: "Banque",         value: sub.banqueNom },
                { label: "Fournisseur",    value: sub.fournisseurNom },
                { label: "Statut",         value: null, badge: sub.statut },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-gray-500">{r.label}</span>
                  {r.badge ? <StatusBadge statut={r.badge} size="sm" /> :
                    <span className={`text-sm font-semibold ${r.highlight ? "text-amber-700" : "text-gray-800"}`}>{r.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Historique */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Historique</h3>
            </div>
            <div className="section-card-body">
              {historique.length > 0 ? (
                <LDFTimeline events={historique} />
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Aucun historique disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
