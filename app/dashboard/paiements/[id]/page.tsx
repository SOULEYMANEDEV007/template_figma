// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { ConfirmModal } from "@/components/ui/ldf-modal";
import { getPaiementById, getSouscriptionById } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { ArrowLeft, Building2, CheckCircle2, CreditCard, FileText, Package } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { PaiementStatut } from "@/types/ldf";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function PaiementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { user } = useLDFAuthStore();

  const [statut, setStatut]           = useState<PaiementStatut | null>(null);
  const [showEncaisser, setShowEncaisser] = useState(false);
  const [showServir, setShowServir]   = useState(false);
  const [loading, setLoading]         = useState(false);

  const paiement   = getPaiementById(id);
  const sub        = paiement ? getSouscriptionById(paiement.souscriptionId) : null;
  if (!paiement) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <CreditCard className="w-12 h-12 text-gray-200" />
      <p className="text-sm">Paiement introuvable</p>
      <button onClick={() => router.back()} className="btn-ldf-outline text-sm py-2">← Retour</button>
    </div>
  );

  const currentStatut = statut ?? paiement.statut;

  const handleEncaisser = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStatut("encaisse");
    setShowEncaisser(false);
    setLoading(false);
    toast.success(`Paiement ${paiement.reference} encaissé !`);
  };

  const handleServir = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStatut("servi");
    setShowServir(false);
    setLoading(false);
    toast.success(`Articles servis — souscription ${paiement.souscriptionRef}`);
  };

  // Timeline des étapes du paiement
  const steps = [
    { id: "init",     label: "Paiement initié",   date: paiement.datePaiement, done: true },
    { id: "encaisse", label: "Paiement encaissé",  date: paiement.dateEncaissement, done: currentStatut === "encaisse" || currentStatut === "servi" },
    { id: "servi",    label: "Articles servis",    date: paiement.dateService,      done: currentStatut === "servi" },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{paiement.reference}</h1>
              <StatusBadge statut={currentStatut} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{paiement.souscriptionRef} · {paiement.banqueNom}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentStatut === "en_cours" && (user?.role === "admin" || user?.role === "banque") && (
            <button onClick={() => setShowEncaisser(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Encaisser
            </button>
          )}
          {currentStatut === "encaisse" && (user?.role === "admin" || user?.role === "fournisseur") && (
            <button onClick={() => setShowServir(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-sm">
              <Package className="w-4 h-4" /> Marquer comme servi
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Détails */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Détails du paiement</h3>
              </div>
            </div>
            <div className="section-card-body grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">Souscripteur</p><p className="text-sm font-medium text-gray-800">{paiement.souscripteurPrenom} {paiement.souscripteurNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Fournisseur</p><p className="text-sm font-medium text-gray-800">{paiement.fournisseurNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Banque</p><p className="text-sm font-medium text-gray-800">{paiement.banqueNom}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Devis</p>
                <Link href={`/dashboard/devis/${paiement.devisId}`} className="text-sm font-mono font-medium text-amber-700 hover:underline">{paiement.devisRef}</Link>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Montant</p>
                <p className="text-3xl font-bold text-gray-900">{fmtCFA(paiement.montant)}</p>
              </div>
            </div>
          </div>

          {/* Dates clés */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Dates clés</h3>
            </div>
            <div className="section-card-body grid grid-cols-3 gap-4">
              {[
                { label: "Date paiement",     value: paiement.datePaiement,       always: true  },
                { label: "Date encaissement", value: paiement.dateEncaissement,   always: false },
                { label: "Date de service",   value: paiement.dateService,        always: false },
              ].map(d => (
                <div key={d.label} className={`p-3 rounded-xl ${d.value ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                  <p className={`text-sm font-semibold ${d.value ? "text-gray-800" : "text-gray-300"}`}>
                    {d.value ? new Date(d.value).toLocaleDateString("fr-FR") : "En attente"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Souscription liée */}
          {sub && (
            <div className="section-card">
              <div className="section-card-header">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Souscription liée</h3>
                </div>
                <Link href={`/dashboard/souscriptions/${sub.id}`} className="text-xs text-amber-600">Voir →</Link>
              </div>
              <div className="section-card-body grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400 mb-0.5">Référence</p><p className="font-mono text-xs font-bold text-amber-700">{sub.reference}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Statut</p><StatusBadge statut={sub.statut} size="sm" /></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Articles</p><p className="text-sm font-medium text-gray-800">{sub.articles?.length || 0} article{(sub.articles?.length || 0) > 1 ? "s" : ""}</p></div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite — Timeline */}
        <div className="space-y-5">
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-sm font-semibold text-gray-800">Suivi</h3>
            </div>
            <div className="section-card-body">
              <div className="space-y-4">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-3 relative">
                    {i < steps.length - 1 && (
                      <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${s.done ? "bg-emerald-200" : "bg-gray-100"}`} />
                    )}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${s.done ? "bg-emerald-500" : "bg-gray-100 border-2 border-gray-200"}`}>
                      {s.done
                        ? <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                        : <span className="w-2 h-2 rounded-full bg-gray-300" />
                      }
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${s.done ? "text-gray-800" : "text-gray-400"}`}>{s.label}</p>
                      {s.date
                        ? <p className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString("fr-FR")}</p>
                        : <p className="text-xs text-gray-300 italic">En attente</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Récap */}
          <div className="section-card">
            <div className="section-card-header"><h3 className="text-sm font-semibold text-gray-800">Récapitulatif</h3></div>
            <div className="section-card-body space-y-3">
              {[
                { label: "Montant",    value: fmtCFA(paiement.montant), highlight: true },
                { label: "Banque",     value: paiement.banqueNom },
                { label: "Fournisseur",value: paiement.fournisseurNom },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-gray-500">{r.label}</span>
                  <span className={`text-sm font-semibold ${r.highlight ? "text-amber-700" : "text-gray-800"}`}>{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Statut</span>
                <StatusBadge statut={currentStatut} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ConfirmModal
        open={showEncaisser}
        onClose={() => setShowEncaisser(false)}
        onConfirm={handleEncaisser}
        title="Confirmer l'encaissement"
        message={`Vous allez confirmer l'encaissement du paiement ${paiement.reference} d'un montant de ${fmtCFA(paiement.montant)}.`}
        confirmLabel="Encaisser"
        variant="success"
        loading={loading}
      />

      <ConfirmModal
        open={showServir}
        onClose={() => setShowServir(false)}
        onConfirm={handleServir}
        title="Confirmer le service des articles"
        message={`Vous confirmez que tous les articles de la souscription ${paiement.souscriptionRef} ont été livrés au souscripteur.`}
        confirmLabel="Confirmer la livraison"
        variant="success"
        loading={loading}
      />
    </div>
  );
}
